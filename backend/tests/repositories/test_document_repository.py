import os
from sqlalchemy.orm import Session

from hermadata.repositories.document_repository import (
    NewDocument,
    SQLDocumentRepository,
    StorageType,
)
from hermadata.storage.disk_storage import DiskStorage


def test_new_document(db_session: Session, disk_storage: DiskStorage):
    repo = SQLDocumentRepository(db_session, {StorageType.disk: disk_storage})
    data = NewDocument(
        doc_kind_id=1,
        storage_service=StorageType.disk,
        filename="test.pdf",
        mimetype="application/pdf",
        data=bytes(),
    )
    result = repo.new_document(data)

    assert os.path.exists(os.path.join(disk_storage.base_path, result))
    os.remove(os.path.join(disk_storage.base_path, result))
    assert result
