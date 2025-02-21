from datetime import datetime, timedelta

from fastapi.encoders import jsonable_encoder
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from hermadata.constants import DocKindCode, EntryType, ExitType
from hermadata.database.models import (
    Animal,
    AnimalDocument,
    AnimalEntry,
    DocumentKind,
)
from hermadata.repositories.animal.models import (
    AnimalExit,
    CompleteEntryModel,
    NewAnimalDocument,
    NewAnimalModel,
    UpdateAnimalModel,
)
from hermadata.repositories.document_repository import (
    NewDocument,
    SQLDocumentRepository,
)
from hermadata.services.animal_service import AnimalService
from tests.utils import random_chip_code


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

    animal_id = db_session.execute(select(Animal.id).where(Animal.code == animal_code)).scalar_one()

    assert animal_id


def test_update_animal(app: TestClient, make_animal, db_session):
    animal_id = make_animal(
        NewAnimalModel(
            race_id="C",
            rescue_city_code="H501",
            entry_type=EntryType.confiscation.value,
        )
    )
    chip_code = random_chip_code()

    update_data = jsonable_encoder(UpdateAnimalModel(name="Test", chip_code=chip_code).model_dump())

    result = app.post(f"/animal/{animal_id}", json=update_data)

    affected = int(result.content.decode())
    assert affected == 1

    animal = db_session.execute(select(Animal).where(Animal.id == animal_id)).scalar_one()

    assert animal.name == "Test"
    assert animal.chip_code == chip_code
    assert animal.chip_code_set


def test_complete_entry(app: TestClient, make_animal, db_session: Session):
    animal_id = make_animal()

    entry_date = (datetime.now() + timedelta(days=1)).date()
    data = jsonable_encoder(CompleteEntryModel(entry_date=entry_date).model_dump())

    result = app.post(f"/animal/{animal_id}/entry/complete", json=data)

    assert result.status_code == 200

    e: AnimalEntry = db_session.execute(select(AnimalEntry).where(AnimalEntry.animal_id == animal_id)).scalar_one()

    assert e.entry_date == entry_date

    doc_kind: AnimalDocument = db_session.execute(
        select(DocumentKind.code)
        .select_from(AnimalDocument)
        .join(DocumentKind, AnimalDocument.document_kind_id == DocumentKind.id)
        .where(AnimalDocument.animal_id == animal_id)
    ).scalar()

    assert doc_kind == DocKindCode.comunicazione_ingresso.value


def test_exit(
    app: TestClient,
    make_animal,
    animal_service: AnimalService,
    make_adopter,
    db_session: Session,
):
    animal_id = make_animal()
    adopter_id = make_adopter()

    animal_service.complete_entry(
        animal_id,
        data=CompleteEntryModel(entry_date=datetime.now().date() - timedelta(days=3)),
    )
    animal_service.update(
        animal_id,
        data=UpdateAnimalModel(chip_code=random_chip_code(), name="Gino", notes="Test"),
    )
    update_data = jsonable_encoder(
        AnimalExit(
            adopter_id=adopter_id,
            exit_date=datetime.now().date(),
            exit_type=ExitType.adoption,
            notes="Test",
        ).model_dump()
    )

    result = app.post(f"/animal/{animal_id}/exit", json=update_data)

    assert result.status_code == 200

    documents = db_session.execute(
        select(AnimalDocument, DocumentKind)
        .join(
            DocumentKind,
            DocumentKind.id == AnimalDocument.document_kind_id,
        )
        .where(AnimalDocument.animal_id == animal_id)
    ).all()

    assert {DocKindCode.adozione, DocKindCode.variazione}.issubset({DocKindCode(k.code) for d, k in documents})


def test_new_animal_document(
    app: TestClient,
    make_animal,
    document_repository: SQLDocumentRepository,
    db_session: Session,
):
    animal_id = make_animal()

    document_id = document_repository.new_document(
        data=NewDocument(
            filename="test",
            data=bytes(),
            mimetype="application/pdf",
            is_uploaded=True,
        )
    )
    data = jsonable_encoder(
        NewAnimalDocument(
            document_kind_code=DocKindCode.documento_identita,
            document_id=document_id,
            title="Test",
        ).model_dump()
    )

    result = app.post(f"/animal/{animal_id}/document", json=data)

    assert result.status_code == 200

    animal_document, document_kind = db_session.execute(
        select(AnimalDocument, DocumentKind)
        .where(
            AnimalDocument.animal_id == animal_id,
            AnimalDocument.document_id == document_id,
        )
        .join(DocumentKind, AnimalDocument.document_kind_id == DocumentKind.id)
    ).one()

    assert animal_document.title == "Test"
    assert document_kind.code == DocKindCode.documento_identita.value
