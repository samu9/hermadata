import mimetypes
import os
from unittest.mock import MagicMock

from fastapi.encoders import jsonable_encoder
from fastapi.testclient import TestClient
from sqlalchemy import delete, insert, select
from sqlalchemy.orm import Session

from hermadata.constants import DocKindCode, Permission, StorageType
from hermadata.database.models import (
    Document,
    DocumentKind,
    DocumentPermission,
)
from hermadata.repositories.document_repository import (
    DocKindModel,
    NewDocKindModel,
    NewDocument,
    SQLDocumentRepository,
)
from hermadata.storage.disk_storage import DiskStorage
from hermadata.storage.s3_storage import S3Storage


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


def test_serve_document_disk(
    disk_storage: DiskStorage,
    db_session: Session,
    app: TestClient,
    document_repository: SQLDocumentRepository,
):
    """Disk-backed document: serve_document returns a stream URL; stream endpoint returns bytes."""
    document_id = document_repository.new_document(
        data=NewDocument(
            filename="test.txt",
            data=b"test",
            mimetype="plain/text",
            is_uploaded=True,
        )
    )
    key = db_session.execute(
        select(Document.key).where(Document.id == document_id)
    ).scalar_one()
    disk_storage.store_file(key, b"test")

    # Authenticated call returns JSON with stream URL
    response = app.get(f"/document/{document_id}")
    assert response.status_code == 200
    body = response.json()
    assert "url" in body
    assert f"/document/{document_id}/stream" in body["url"]

    # Unauthenticated stream endpoint returns bytes
    stream_response = app.get(f"/document/{document_id}/stream")
    assert stream_response.status_code == 200
    assert stream_response.content == b"test"
    assert stream_response.headers["content-type"] == "plain/text"
    assert stream_response.headers["filename"] == "test.txt"


def test_serve_document_not_found(app: TestClient):
    """Non-existent document returns 404."""
    response = app.get("/document/999999")
    assert response.status_code == 404


def test_serve_document_not_uploaded(
    db_session: Session,
    app: TestClient,
    document_repository: SQLDocumentRepository,
):
    """Document with is_uploaded=False returns 404."""
    document_id = document_repository.new_document(
        data=NewDocument(
            filename="not_uploaded.txt",
            data=b"data",
            mimetype="plain/text",
            is_uploaded=True,
        )
    )
    db_session.execute(
        Document.__table__.update()
        .where(Document.id == document_id)
        .values(is_uploaded=False)
    )

    response = app.get(f"/document/{document_id}")
    assert response.status_code == 404


def test_serve_document_dd_permission_denied(db_session: Session):
    """User without DD permission receives 403."""
    from hermadata.dependancies import get_db_session
    from hermadata.initializations import get_current_user
    from hermadata.main import build_app
    from hermadata.services.user_service import TokenData

    def get_db_session_override():
        yield db_session

    def get_current_user_no_dd():
        return TokenData(
            user_id=1,
            email="noperm@test.it",
            is_active=True,
            is_superuser=False,
            permissions=[
                p.value
                for p in Permission
                if p != Permission.DOWNLOAD_DOCUMENT
            ],
        )

    restricted_app = build_app()
    restricted_app.dependency_overrides[get_db_session] = get_db_session_override
    restricted_app.dependency_overrides[get_current_user] = get_current_user_no_dd

    client = TestClient(restricted_app, raise_server_exceptions=False)
    response = client.get("/document/1")
    assert response.status_code == 403


def test_serve_document_can_view_false(
    db_session: Session,
    document_repository: SQLDocumentRepository,
    make_animal,
):
    """document_permissions row with can_view=False blocks access for matching user."""
    from hermadata.database.models import Animal, AnimalDocument
    from hermadata.dependancies import get_db_session
    from hermadata.initializations import get_current_user
    from hermadata.main import build_app
    from hermadata.services.user_service import TokenData

    user_id = 42

    document_id = document_repository.new_document(
        data=NewDocument(
            filename="restricted.txt",
            data=b"secret",
            mimetype="plain/text",
            is_uploaded=True,
        )
    )

    doc_kind_id = db_session.execute(
        select(DocumentKind.id).limit(1)
    ).scalar_one()

    animal_id = make_animal()

    db_session.execute(
        insert(AnimalDocument).values(
            animal_id=animal_id,
            document_id=document_id,
            document_kind_id=doc_kind_id,
        )
    )

    db_session.execute(
        insert(DocumentPermission).values(
            user_id=user_id,
            document_kind_id=doc_kind_id,
            can_view=False,
            can_upload=True,
            can_delete=True,
        )
    )

    def get_db_session_override():
        yield db_session

    def get_current_user_restricted():
        return TokenData(
            user_id=user_id,
            email="restricted@test.it",
            is_active=True,
            is_superuser=False,
            permissions=[p.value for p in Permission],
        )

    restricted_app = build_app()
    restricted_app.dependency_overrides[get_db_session] = get_db_session_override
    restricted_app.dependency_overrides[get_current_user] = get_current_user_restricted

    client = TestClient(restricted_app, raise_server_exceptions=False)
    response = client.get(f"/document/{document_id}")
    assert response.status_code == 403


def test_serve_document_s3_presigned_url(
    db_session: Session,
    document_repository: SQLDocumentRepository,
):
    """S3-backed document returns JSON with presigned URL."""
    from hermadata.dependancies import get_db_session, get_storage_map
    from hermadata.initializations import get_current_user
    from hermadata.main import build_app
    from hermadata.services.user_service import TokenData

    presigned_url = "https://s3.example.com/bucket/key?X-Amz-Signature=abc"

    key = "fake-s3-key-uuid"
    db_session.execute(
        Document.__table__.insert().values(
            storage_service=StorageType.aws_s3.value,
            key=key,
            filename="report.pdf",
            mimetype="application/pdf",
            is_uploaded=True,
        )
    )
    document_id = db_session.execute(
        select(Document.id).where(Document.key == key)
    ).scalar_one()

    mock_s3 = MagicMock(spec=S3Storage)
    mock_s3.get_presigned_url.return_value = presigned_url

    mock_disk = MagicMock(spec=DiskStorage)
    mock_disk.get_presigned_url.return_value = None

    def get_storage_map_override():
        return {
            StorageType.disk: mock_disk,
            StorageType.aws_s3: mock_s3,
        }

    def get_db_session_override():
        yield db_session

    def get_current_user_override():
        return TokenData(
            user_id=1,
            email="test@test.it",
            is_active=True,
            is_superuser=True,
            permissions=[p.value for p in Permission],
        )

    s3_app = build_app()
    s3_app.dependency_overrides[get_db_session] = get_db_session_override
    s3_app.dependency_overrides[get_storage_map] = get_storage_map_override
    s3_app.dependency_overrides[get_current_user] = get_current_user_override

    client = TestClient(s3_app, raise_server_exceptions=False)
    response = client.get(f"/document/{document_id}")

    assert response.status_code == 200
    body = response.json()
    assert body["url"] == presigned_url

    mock_s3.get_presigned_url.assert_called_once_with(
        key=key,
        filename="report.pdf",
        mimetype="application/pdf",
        expires_in=600,
    )
