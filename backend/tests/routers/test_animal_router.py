from datetime import date, datetime, timedelta

import pytest
from fastapi.encoders import jsonable_encoder
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from hermadata.constants import DocKindCode, EntryType, ExitType
from hermadata.database.models import (
    Adoption,
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
    NewEntryModel,
    NewAnimalLogModel,
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

    animal_id = db_session.execute(
        select(Animal.id).where(Animal.code == animal_code)
    ).scalar_one()

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

    update_data = jsonable_encoder(
        UpdateAnimalModel(name="Test", chip_code=chip_code).model_dump()
    )

    result = app.post(f"/animal/{animal_id}", json=update_data)

    affected = int(result.content.decode())
    assert affected == 1

    animal = db_session.execute(
        select(Animal).where(Animal.id == animal_id)
    ).scalar_one()

    assert animal.name == "Test"
    assert animal.chip_code == chip_code
    assert animal.chip_code_set


def test_complete_entry(app: TestClient, make_animal, db_session: Session):
    animal_id = make_animal()

    entry_date = (datetime.now() + timedelta(days=1)).date()
    data = jsonable_encoder(
        CompleteEntryModel(entry_date=entry_date).model_dump()
    )

    result = app.post(f"/animal/{animal_id}/entry/complete", json=data)

    assert result.status_code == 200

    e: AnimalEntry = db_session.execute(
        select(AnimalEntry).where(AnimalEntry.animal_id == animal_id)
    ).scalar_one()

    assert e.entry_date == entry_date


def test_exit(
    app: TestClient,
    make_animal,
    complete_animal_data,
    animal_service: AnimalService,
    make_adopter,
    db_session: Session,
):
    animal_id = make_animal()
    adopter_id = make_adopter()

    animal_service.complete_entry(
        animal_id,
        data=CompleteEntryModel(
            entry_date=datetime.now().date() - timedelta(days=3)
        ),
    )

    complete_animal_data(animal_id)

    update_data = jsonable_encoder(
        AnimalExit(
            adopter_id=adopter_id,
            exit_date=datetime.now().date(),
            exit_type=ExitType.adoption,
            notes="Test",
            location_address="Via prova",
            location_city_code="H501",
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

    assert {DocKindCode.adozione, DocKindCode.variazione}.issubset(
        {DocKindCode(k.code) for d, k in documents}
    )

    adoption = db_session.execute(
        select(Adoption).where(Adoption.animal_id == animal_id)
    ).scalar_one()

    assert adoption.location_address == "VIA PROVA"
    assert adoption.location_city_code == "H501"


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


def test_get_animal(app: TestClient, make_animal):
    animal_id = make_animal()

    result = app.get(f"/animal/{animal_id}")

    assert result.status_code == 200
    data = result.json()
    assert data["race_id"] == "C"
    assert data["rescue_city_code"] == "H501"


def test_get_animal_not_found(app: TestClient):
    result = app.get("/animal/999999")
    assert result.status_code == 404


def test_search_animals(app: TestClient, make_animal):
    make_animal()

    result = app.get("/animal/search")

    assert result.status_code == 200
    data = result.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1


def test_search_animals_by_race(app: TestClient, make_animal):
    make_animal(NewAnimalModel(race_id="C", rescue_city_code="H501", entry_type=EntryType.rescue))

    result = app.get("/animal/search", params={"race_id": "C"})

    assert result.status_code == 200
    data = result.json()
    assert data["total"] >= 1
    assert all(a["race_id"] == "C" for a in data["items"])


def test_delete_animal(app: TestClient, make_animal, db_session: Session):
    animal_id = make_animal()

    result = app.delete(f"/animal/{animal_id}")

    assert result.status_code == 204

    animal = db_session.execute(
        select(Animal).where(Animal.id == animal_id)
    ).scalar_one()

    assert animal.deleted_at is not None


def test_get_animal_documents(app: TestClient, make_animal):
    animal_id = make_animal()

    result = app.get(f"/animal/{animal_id}/document")

    assert result.status_code == 200
    assert isinstance(result.json(), list)


def test_get_animal_entries(
    app: TestClient, make_animal, animal_service: AnimalService
):
    animal_id = make_animal()

    animal_service.complete_entry(
        animal_id, CompleteEntryModel(entry_date=datetime.now().date())
    )

    result = app.get(f"/animal/{animal_id}/entries")

    assert result.status_code == 200
    entries = result.json()
    assert len(entries) >= 1
    assert entries[0]["animal_id"] == animal_id


def test_add_animal_log(app: TestClient, make_animal):
    animal_id = make_animal()

    data = jsonable_encoder(
        NewAnimalLogModel(
            event="CS",
            data={"note": "Castrazione eseguita"},
        ).model_dump()
    )

    result = app.post(f"/animal/{animal_id}/logs", json=data)

    assert result.status_code == 200
    log = result.json()
    assert log["animal_id"] == animal_id
    assert log["event"] == "CS"


def test_get_animal_logs(app: TestClient, make_animal):
    animal_id = make_animal()

    result = app.get(f"/animal/{animal_id}/logs")

    assert result.status_code == 200
    assert isinstance(result.json(), list)


def test_check_animal_exit(
    app: TestClient, make_animal, complete_animal_data
):
    animal_id = make_animal()

    result = app.get(f"/animal/{animal_id}/exit-check")

    assert result.status_code == 200
    data = result.json()
    assert "can_exit" in data


def test_add_animal_entry(
    app: TestClient,
    make_animal,
    animal_service: AnimalService,
    complete_animal_data,
):
    animal_id = make_animal()

    animal_service.complete_entry(
        animal_id,
        CompleteEntryModel(entry_date=date(2024, 1, 1)),
    )
    complete_animal_data(animal_id)

    animal_service.animal_repository.exit(
        animal_id,
        AnimalExit(exit_date=date(2024, 1, 10), exit_type=ExitType.return_),
    )

    data = jsonable_encoder(
        NewEntryModel(
            rescue_city_code="H501",
            entry_type=EntryType.rescue,
        ).model_dump()
    )

    result = app.post(f"/animal/{animal_id}/entry", json=data)

    assert result.status_code == 200


@pytest.mark.parametrize(
    "entry_type",
    [EntryType.rescue, EntryType.confiscation, EntryType.private_surrender],
)
def test_create_animal_various_entry_types(
    app: TestClient, db_session: Session, entry_type: EntryType
):
    request_body = jsonable_encoder(
        NewAnimalModel(
            race_id="C",
            rescue_city_code="H501",
            entry_type=entry_type.value,
        ).model_dump()
    )

    result = app.post("/animal/", json=request_body)

    assert result.status_code == 200
    animal_code = result.content.decode(encoding="utf-8").replace('"', "")
    assert isinstance(animal_code, str)
    assert len(animal_code) > 0



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


def test_update_animal(app: TestClient, make_animal, db_session):
    animal_id = make_animal(
        NewAnimalModel(
            race_id="C",
            rescue_city_code="H501",
            entry_type=EntryType.confiscation.value,
        )
    )
    chip_code = random_chip_code()

    update_data = jsonable_encoder(
        UpdateAnimalModel(name="Test", chip_code=chip_code).model_dump()
    )

    result = app.post(f"/animal/{animal_id}", json=update_data)

    affected = int(result.content.decode())
    assert affected == 1

    animal = db_session.execute(
        select(Animal).where(Animal.id == animal_id)
    ).scalar_one()

    assert animal.name == "Test"
    assert animal.chip_code == chip_code
    assert animal.chip_code_set


def test_complete_entry(app: TestClient, make_animal, db_session: Session):
    animal_id = make_animal()

    entry_date = (datetime.now() + timedelta(days=1)).date()
    data = jsonable_encoder(
        CompleteEntryModel(entry_date=entry_date).model_dump()
    )

    result = app.post(f"/animal/{animal_id}/entry/complete", json=data)

    assert result.status_code == 200

    e: AnimalEntry = db_session.execute(
        select(AnimalEntry).where(AnimalEntry.animal_id == animal_id)
    ).scalar_one()

    assert e.entry_date == entry_date


def test_exit(
    app: TestClient,
    make_animal,
    complete_animal_data,
    animal_service: AnimalService,
    make_adopter,
    db_session: Session,
):
    animal_id = make_animal()
    adopter_id = make_adopter()

    animal_service.complete_entry(
        animal_id,
        data=CompleteEntryModel(
            entry_date=datetime.now().date() - timedelta(days=3)
        ),
    )

    complete_animal_data(animal_id)

    update_data = jsonable_encoder(
        AnimalExit(
            adopter_id=adopter_id,
            exit_date=datetime.now().date(),
            exit_type=ExitType.adoption,
            notes="Test",
            location_address="Via prova",
            location_city_code="H501",
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

    assert {DocKindCode.adozione, DocKindCode.variazione}.issubset(
        {DocKindCode(k.code) for d, k in documents}
    )

    adoption = db_session.execute(
        select(Adoption).where(Adoption.animal_id == animal_id)
    ).scalar_one()

    assert adoption.location_address == "VIA PROVA"
    assert adoption.location_city_code == "H501"


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
