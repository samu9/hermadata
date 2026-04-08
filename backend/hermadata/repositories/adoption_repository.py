from datetime import datetime, timezone

from sqlalchemy import select

from hermadata.database.models import Adoption, Animal, AnimalEntry
from hermadata.repositories import SQLBaseRepository
from hermadata.repositories.animal.animal_repository import (
    ExistingAdoptionException,
)
from hermadata.repositories.animal.models import AdoptionModel, NewAdoption


class SQLAdopionRepository(SQLBaseRepository):
    def create(self, data: NewAdoption) -> AdoptionModel:
        existing_adoption = self.session.execute(
            select(Adoption.id).where(
                Adoption.animal_id == data.animal_id,
                Adoption.returned_at.is_(None),
            )
        ).first()

        if existing_adoption:
            raise ExistingAdoptionException

        current_entry_id = self.session.execute(
            select(AnimalEntry.id)
            .join(Animal, Animal.id == AnimalEntry.animal_id)
            .where(
                AnimalEntry.animal_id == data.animal_id,
                AnimalEntry.current.is_(True),
                AnimalEntry.exit_date.is_(None),
                Animal.deleted_at.is_(None),
            )
        ).scalar()

        if not current_entry_id:
            raise Exception(
                f"animal {data.animal_id} has no current"
                " entry with null exit date"
            )

        adoption = Adoption(
            animal_id=data.animal_id,
            adopter_id=data.adopter_id,
            animal_entry_id=current_entry_id,
            completed_at=datetime.now(tz=timezone.utc),
            location_address=data.location_address,
            location_city_code=data.location_city_code,
        )
        self.session.add(adoption)
        self.session.flush()

        return AdoptionModel.model_validate(adoption, from_attributes=True)
