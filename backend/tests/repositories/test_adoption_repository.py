from datetime import date

import pytest
from hermadata.database.models import Adopter, Animal
from hermadata.repositories.adoption_repository import (
    SQLAdopionRepository,
)
from sqlalchemy.orm import Session

from hermadata.repositories.animal.models import NewAdoption


@pytest.skip(reason="no more used")
def test_create(db_session: Session, adoption_repository: SQLAdopionRepository):
    animal = Animal(
        code="1234567890123",
        race_id="C",
    )
    adopter = Adopter(
        name="A",
        surname="B",
        fiscal_code="123",
        birth_city_code="H501",
        birth_date=date(1900, 1, 1),
        residence_city_code="H501",
        phone="123",
    )
    db_session.add(animal)
    db_session.add(adopter)
    db_session.flush()

    result = adoption_repository.create(
        NewAdoption(animal_id=animal.id, adopter_id=adopter.id)
    )

    assert result
