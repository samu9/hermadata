import os
from sqlalchemy import select
from sqlalchemy.orm import Session

from hermadata.constants import DocKindCode
from hermadata.database.models import Document
from hermadata.repositories.document_repository import (
    NewDocument,
    SQLDocumentRepository,
    StorageType,
)
from hermadata.storage.disk_storage import DiskStorage


def test_init(db_session: Session):
    repo = SQLDocumentRepository(db_session, selected_storage=StorageType.disk)

    assert DocKindCode.documento_ingresso in repo.document_kind_ids


def test_get_kinds(document_repository: SQLDocumentRepository):
    kinds = document_repository.get_document_kinds()

    assert "Documento di ingresso" in [k.name for k in kinds]


def test_new_document(
    document_repository: SQLDocumentRepository,
    db_session: Session,
    disk_storage: DiskStorage,
):
    data = NewDocument(
        filename="test.pdf",
        mimetype="application/pdf",
        data=bytes(),
    )
    result = document_repository.new_document(data)

    doc_key = db_session.execute(
        select(Document.key).where(Document.id == result)
    ).scalar_one()
    assert os.path.exists(os.path.join(disk_storage.base_path, doc_key))
    os.remove(os.path.join(disk_storage.base_path, doc_key))
    assert result
