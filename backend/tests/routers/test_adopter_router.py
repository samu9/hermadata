import json

from fastapi.encoders import jsonable_encoder
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from hermadata.database.models import Adopter
from hermadata.models import PaginationResult
from hermadata.repositories.adopter_repository import (
    AdopterModel,
    IDDocumentType,
)
from hermadata.services.adopter_service import NewAdopterRequest


def test_new_adopter(
    app: TestClient,
    db_session: Session,
):
    data = NewAdopterRequest(
        name="Mario",
        surname="Rossi",
        fiscal_code="RSSMRA80A01H501U",
        document_type=IDDocumentType.identity_card,
        document_number="AA12345BB",
        residence_city_code="H501",
        phone="123456789",
    )

    json_data = jsonable_encoder(data.model_dump())
    response = app.post("/adopter/", json=json_data)

    assert response.status_code == 200

    content = json.loads(response.content)

    parsed = AdopterModel.model_validate(content)

    assert parsed.fiscal_code == data.fiscal_code.upper()

    stored = db_session.execute(
        select(Adopter).where(Adopter.id == parsed.id)
    ).scalar_one()

    assert stored.name == data.name.upper()
    assert stored.surname == data.surname.upper()


def test_search_adopter(
    app: TestClient,
    make_adopter,
    db_session: Session,
):
    adopter_id = make_adopter()

    response = app.get("/adopter/", params={})
    assert response.status_code == 200

    content = json.loads(response.content)

    parsed = PaginationResult[AdopterModel].model_validate(content)

    stored = db_session.execute(
        select(Adopter).where(Adopter.id == adopter_id)
    ).scalar_one()

    m = AdopterModel.model_validate(stored, from_attributes=True)

    assert m in parsed.items
