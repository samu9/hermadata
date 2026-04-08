from datetime import date, datetime, timedelta
from typing import Callable

import pytest
from fastapi.encoders import jsonable_encoder
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from hermadata.constants import EntryType, ExitType
from hermadata.database.models import Adoption
from hermadata.repositories.animal.models import (
    AnimalExit,
    CompleteEntryModel,
    NewAdoption,
    NewAnimalModel,
)
from hermadata.services.animal_service import AnimalService


def _prepare_adopted_animal(
    make_animal,
    make_adopter,
    animal_service: AnimalService,
    complete_animal_data,
) -> tuple[int, int]:
    """Helper: create an animal that has been fully exited via adoption."""
    animal_id = make_animal()
    adopter_id = make_adopter()
    animal_service.complete_entry(
        animal_id,
        CompleteEntryModel(
            entry_date=datetime.now().date() - timedelta(days=3)
        ),
    )
    complete_animal_data(animal_id)
    animal_service.animal_repository.exit(
        animal_id,
        AnimalExit(
            adopter_id=adopter_id,
            exit_date=datetime.now().date(),
            exit_type=ExitType.adoption,
            location_address="Via Roma 1",
            location_city_code="H501",
        ),
    )
    return animal_id, adopter_id


def test_new_adoption_creates_record(
    app: TestClient,
    make_animal,
    make_adopter,
    animal_service: AnimalService,
    db_session: Session,
):
    """POST /adoption returns 200 and creates an Adoption row."""
    animal_id = make_animal()
    adopter_id = make_adopter()

    animal_service.complete_entry(
        animal_id,
        CompleteEntryModel(entry_date=datetime.now().date()),
    )

    payload = jsonable_encoder(
        NewAdoption(
            animal_id=animal_id,
            adopter_id=adopter_id,
            location_address="Via Roma 1",
            location_city_code="H501",
        ).model_dump()
    )

    result = app.post("/adoption", json=payload)

    assert result.status_code == 200
    body = result.json()
    assert body["animal_id"] == animal_id
    assert body["adopter_id"] == adopter_id
    assert "id" in body

    adoption = db_session.execute(
        select(Adoption).where(Adoption.animal_id == animal_id)
    ).scalar_one()
    assert adoption.adopter_id == adopter_id
    assert adoption.location_city_code == "H501"


def test_new_adoption_address_uppercased(
    app: TestClient,
    make_animal,
    make_adopter,
    animal_service: AnimalService,
    db_session: Session,
):
    """location_address is stored in upper case."""
    animal_id = make_animal()
    adopter_id = make_adopter()
    animal_service.complete_entry(
        animal_id,
        CompleteEntryModel(entry_date=datetime.now().date()),
    )

    payload = jsonable_encoder(
        NewAdoption(
            animal_id=animal_id,
            adopter_id=adopter_id,
            location_address="via lowercase",
            location_city_code="H501",
        ).model_dump()
    )

    result = app.post("/adoption", json=payload)

    assert result.status_code == 200
    adoption = db_session.execute(
        select(Adoption).where(Adoption.animal_id == animal_id)
    ).scalar_one()
    assert adoption.location_address == "VIA LOWERCASE"


def test_new_adoption_without_optional_fields(
    app: TestClient,
    make_animal,
    make_adopter,
    animal_service: AnimalService,
    db_session: Session,
):
    """POST /adoption succeeds when optional address fields are omitted."""
    animal_id = make_animal()
    adopter_id = make_adopter()
    animal_service.complete_entry(
        animal_id,
        CompleteEntryModel(entry_date=datetime.now().date()),
    )

    payload = jsonable_encoder(
        NewAdoption(animal_id=animal_id, adopter_id=adopter_id).model_dump()
    )

    result = app.post("/adoption", json=payload)

    assert result.status_code == 200


def test_new_adoption_duplicate_returns_400(
    app: TestClient,
    make_animal,
    make_adopter,
    animal_service: AnimalService,
):
    """A second active adoption for the same animal returns 400."""
    animal_id = make_animal()
    adopter_id = make_adopter()
    animal_service.complete_entry(
        animal_id,
        CompleteEntryModel(entry_date=datetime.now().date()),
    )

    payload = jsonable_encoder(
        NewAdoption(
            animal_id=animal_id,
            adopter_id=adopter_id,
            location_address="Via Roma 1",
            location_city_code="H501",
        ).model_dump()
    )

    first = app.post("/adoption", json=payload)
    assert first.status_code == 200

    second = app.post("/adoption", json=payload)
    assert second.status_code == 400
