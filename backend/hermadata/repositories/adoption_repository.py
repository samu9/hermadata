from datetime import datetime
from pydantic import BaseModel
from sqlalchemy import select, update
from hermadata.constants import ExitType
from hermadata.database.models import Adoption, Animal
from hermadata.repositories import BaseRepository
from sqlalchemy.orm import Session


class ExistingAdoptionException(Exception):
    pass


class NewAdoption(BaseModel):
    animal_id: int
    adopter_id: int
    completed: bool | None = None


class AdoptionModel(BaseModel):
    id: int
    adopter_id: int
    animal_id: int


class SQLAdopionRepository(BaseRepository):
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(self, data: NewAdoption) -> int:

        existing_adoption = self.session.execute(
            select(Adoption.id).where(Adoption.animal_id == data.animal_id)
        ).first()

        if existing_adoption:
            raise ExistingAdoptionException

        adoption = Adoption(
            animal_id=data.animal_id,
            adopter_id=data.adopter_id,
            completed_at=datetime.utcnow() if data.completed else None,
        )
        self.session.add(adoption)
        self.session.flush()
        result = AdoptionModel.model_validate(adoption, from_attributes=True)
        if data.completed:
            self.session.execute(
                update(Animal)
                .values(
                    exit_date=adoption.completed_at, exit_type=ExitType.adoption
                )
                .where(Animal.id == data.animal_id)
            )
        self.session.commit()

        return result

    def complete(self, adoption_id: int):
        adoption = self.session.execute(
            select(Adoption).where(Adoption.id == adoption_id)
        ).scalar_one()
        self.session.execute(
            update(Adoption)
            .values(completed_at=datetime.utcnow())
            .where(Adoption.id == adoption_id)
        )
        self.session.execute(
            update(Animal)
            .values(
                exit_date=adoption.completed_at, exit_type=ExitType.adoption
            )
            .where(Animal.id == adoption.animal_id)
        )
        self.session.commit()
