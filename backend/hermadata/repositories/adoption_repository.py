import datetime
from pydantic import BaseModel
from sqlalchemy import select
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
        animal_entry_date = self.session.execute(
            select(Animal.entry_date).where(Animal.id == data.animal_id)
        ).one()
        existing_adoption = self.session.execute(
            select(Adoption.id).where(Adoption.animal_id == data.animal_id)
        ).first()

        if existing_adoption:
            raise ExistingAdoptionException

        adoption = Adoption(
            animal_id=data.animal_id,
            adopter_id=data.adopter_id,
            completed_at=datetime.now() if data.completed else None,
        )
        self.session.add(adoption)
        self.session.flush()
        result = AdoptionModel.model_validate(adoption, from_attributes=True)
        self.session.commit()

        return result
