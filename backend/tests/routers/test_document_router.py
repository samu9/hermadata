import mimetypes
import os
from fastapi.encoders import jsonable_encoder
from fastapi.testclient import TestClient
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from hermadata.constants import DocKindCode
from hermadata.database.models import Document, DocumentKind
from hermadata.repositories.document_repository import (
    SQLDocumentRepository,
    NewDocument,
    NewDocKindModel,
    DocKindModel,
)


def test_new_document(app: TestClient, db_session: Session):
    filepath = "tests/test_document.txt"
    filename = os.path.basename(filepath)
    mimetype, _ = mimetypes.guess_type(filepath)
    with open(filepath, "rb") as fp:

        response = app.post("/document", files={"doc": fp})
    assert response.status_code == 200
    document_id = response.json()

    document: Document = db_session.execute(
        select(Document).where(Document.id == document_id)
    ).scalar_one()

    assert document.filename == filename
    assert document.mimetype == mimetype
    assert document.is_uploaded


def test_get_document_kinds(app: TestClient):
    response = app.get("/document/kind")
    assert response.status_code == 200
    doc_kinds = response.json()

    assert isinstance(doc_kinds, list)

    k = DocKindModel.model_validate(doc_kinds[0])

    assert k.id
    assert k.code


def test_create_new_kind(app: TestClient, db_session: Session):
    db_session.execute(delete(DocumentKind).where(DocumentKind.code == "XX"))
    new_kind = NewDocKindModel(name="new_kind", code="XX")

    response = app.post(
        "/document/kind", json=jsonable_encoder(new_kind.model_dump())
    )
    assert response.status_code == 200
    k = DocKindModel.model_validate(response.json())

    assert k.code == "XX"
    assert k.name == "new_kind"


def test_create_new_kind_integrity_error(app: TestClient):
    new_kind = NewDocKindModel(name="Test", code=DocKindCode.adozione)

    response = app.post(
        "/document/kind", json=jsonable_encoder(new_kind.model_dump())
    )
    assert response.status_code == 400
    assert response.json() == {
        "detail": {
            "error_code": 1,
            "message": "this document kind already exists",
        }
    }


def test_serve_document(
    app: TestClient, document_repository: SQLDocumentRepository
):
    document_id = document_repository.new_document(
        data=NewDocument(
            filename="test.txt",
            data=bytes("test".encode("utf-8")),
            mimetype="plain/text",
            is_uploaded=True,
        )
    )
    response = app.get(f"/document/{document_id}")
    assert response.status_code == 200
    assert response.content == b"test"
    assert response.headers["content-type"] == "plain/text"
    assert response.headers["filename"] == "test.txt"
