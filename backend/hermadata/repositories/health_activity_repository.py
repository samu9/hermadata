from datetime import date, datetime
from typing import Annotated

from fastapi import HTTPException
from pydantic import BaseModel, ConfigDict, StringConstraints
from sqlalchemy import select

from hermadata.database.models import Animal, AnimalHealthActivity
from hermadata.repositories import SQLBaseRepository


class HealthActivityWrite(BaseModel):
    activity_date: date
    description: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1)
    ]


class HealthActivityRead(HealthActivityWrite):
    model_config = ConfigDict(from_attributes=True)

    id: int
    animal_id: int


class SQLHealthActivityRepository(SQLBaseRepository):
    def require_animal(self, animal_id: int):
        animal = self.session.scalar(
            select(Animal.id).where(
                Animal.id == animal_id, Animal.deleted_at.is_(None)
            )
        )
        if animal is None:
            raise HTTPException(404, "Animale non trovato")

    def get_activity(self, animal_id: int, activity_id: int):
        self.require_animal(animal_id)
        activity = self.session.scalar(
            select(AnimalHealthActivity).where(
                AnimalHealthActivity.id == activity_id,
                AnimalHealthActivity.animal_id == animal_id,
                AnimalHealthActivity.deleted_at.is_(None),
            )
        )
        if activity is None:
            raise HTTPException(404, "Attività sanitaria non trovata")
        return activity

    def list_activities(
        self,
        animal_id: int,
        description: str | None = None,
        from_date: date | None = None,
        to_date: date | None = None,
    ) -> list[HealthActivityRead]:
        self.require_animal(animal_id)
        if from_date and to_date and from_date > to_date:
            raise HTTPException(422, "Intervallo di date non valido")
        query = select(AnimalHealthActivity).where(
            AnimalHealthActivity.animal_id == animal_id,
            AnimalHealthActivity.deleted_at.is_(None),
        )
        if description and description.strip():
            query = query.where(
                AnimalHealthActivity.description.icontains(
                    description.strip(), autoescape=True
                )
            )
        if from_date:
            query = query.where(
                AnimalHealthActivity.activity_date >= from_date
            )
        if to_date:
            query = query.where(AnimalHealthActivity.activity_date <= to_date)
        rows = self.session.scalars(
            query.order_by(
                AnimalHealthActivity.activity_date.desc(),
                AnimalHealthActivity.id.desc(),
            )
        ).all()
        return [HealthActivityRead.model_validate(row) for row in rows]

    def create(self, animal_id: int, data: HealthActivityWrite):
        self.require_animal(animal_id)
        activity = AnimalHealthActivity(
            animal_id=animal_id, **data.model_dump()
        )
        self.session.add(activity)
        self.session.flush()
        return HealthActivityRead.model_validate(activity)

    def update(
        self, animal_id: int, activity_id: int, data: HealthActivityWrite
    ):
        activity = self.get_activity(animal_id, activity_id)
        activity.activity_date = data.activity_date
        activity.description = data.description
        self.session.flush()
        return HealthActivityRead.model_validate(activity)

    def delete(self, animal_id: int, activity_id: int):
        activity = self.get_activity(animal_id, activity_id)
        activity.deleted_at = datetime.utcnow()
        self.session.flush()
