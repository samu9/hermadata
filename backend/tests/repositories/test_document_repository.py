import os
from sqlalchemy import select
from sqlalchemy.orm import Session

from hermadata.database.models import Document
from hermadata.repositories.document_repository import (
    NewDocument,
    SQLDocumentRepository,
    StorageType,
)
from hermadata.storage.disk_storage import DiskStorage


def test_get_kinds(db_session: Session):
    repo = SQLDocumentRepository(db_session)
    kinds = repo.get_all_document_kinds()

    assert len(kinds) == 7
    assert "Documento di ingresso" in [k.name for k in kinds]


def test_new_document(db_session: Session, disk_storage: DiskStorage):
    repo = SQLDocumentRepository(db_session, {StorageType.disk: disk_storage})
    data = NewDocument(
        storage_service=StorageType.disk,
        filename="test.pdf",
        mimetype="application/pdf",
        data=bytes(),
    )
    result = repo.new_document(data)

    doc_key = db_session.execute(
        select(Document.key).where(Document.id == result)
    ).scalar_one()
    assert os.path.exists(os.path.join(disk_storage.base_path, doc_key))
    os.remove(os.path.join(disk_storage.base_path, doc_key))
    assert result
