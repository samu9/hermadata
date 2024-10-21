from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import select

from hermadata.constants import DocKindCode, EntryType
from hermadata.database.models import (
    Animal,
    AnimalDocument,
    AnimalEntry,
    DocumentKind,
)
from hermadata.repositories.animal.models import (
    CompleteEntryModel,
    NewAnimalModel,
    UpdateAnimalModel,
)
from sqlalchemy.orm import Session, sessionmaker
from fastapi.encoders import jsonable_encoder


def test_create_animal(app: TestClient, db_session: Session):
    request_body = jsonable_encoder(
        NewAnimalModel(
            race_id="C",
            rescue_city_code="H501",
            entry_type=EntryType.confiscation.value,
        ).model_dump()
    )

    result = app.post("/animal/", json=request_body)

    animal_code = result.content.decode(encoding="utf-8").replace('"', "")

    assert isinstance(animal_code, str)

    animal_id = db_session.execute(
        select(Animal.id).where(Animal.code == animal_code)
    ).scalar_one()

    assert animal_id


def test_update_animal(app: TestClient, make_animal, DBSessionMaker):
    animal_id = make_animal(
        NewAnimalModel(
            race_id="C",
            rescue_city_code="H501",
            entry_type=EntryType.confiscation.value,
        )
    )

    update_data = jsonable_encoder(
        UpdateAnimalModel(
            name="Test", chip_code="123.123.123.123.123"
        ).model_dump()
    )
    result = app.post(f"/animal/{animal_id}", json=update_data)

    affected = int(result.content.decode())
    assert affected == 1

    with DBSessionMaker() as db_session:
        animal = db_session.execute(
            select(Animal).where(Animal.id == animal_id)
        ).scalar_one()

    assert animal.name == "Test"
    assert animal.chip_code == "123.123.123.123.123"
    assert animal.chip_code_set


def test_complete_entry(
    app: TestClient, make_animal, DBSessionMaker: sessionmaker
):
    animal_id = make_animal()

    entry_date = (datetime.now() + timedelta(days=1)).date()
    data = jsonable_encoder(
        CompleteEntryModel(entry_date=entry_date).model_dump()
    )

    result = app.post(f"/animal/{animal_id}/entry/complete", json=data)

    assert result.status_code == 200
    with DBSessionMaker() as s:
        e: AnimalEntry = s.execute(
            select(AnimalEntry).where(AnimalEntry.animal_id == animal_id)
        ).scalar_one()

        assert e.entry_date == entry_date

        doc_kind: AnimalDocument = s.execute(
            select(DocumentKind.code)
            .select_from(AnimalDocument)
            .join(
                DocumentKind, AnimalDocument.document_kind_id == DocumentKind.id
            )
            .where(AnimalDocument.animal_id == animal_id)
        ).scalar()

        assert doc_kind == DocKindCode.comunicazione_ingresso.value
