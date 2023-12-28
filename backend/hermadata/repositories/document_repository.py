from enum import Enum
from uuid import UUID, uuid4
from pydantic import BaseModel

from sqlalchemy import insert, select
from hermadata.database.models import Document, DocumentKind
from hermadata.repositories import BaseRepository
from sqlalchemy.orm import Session

from hermadata.storage.base import StorageInterface


class StorageType(Enum):
    disk = "dd"
    aws_s3 = "s3"


class NewDocument(BaseModel):
    doc_kind_id: int
    storage_service: StorageType
    filename: str
    data: bytes
    mimetype: str


class DocKindModel(BaseModel):
    id: int
    name: str


class NewDocKindModel(BaseModel):
    name: str


class DocumentModel(BaseModel):
    filename: str


StorageMap = dict[StorageType, StorageInterface]


class SQLDocumentRepository(BaseRepository):
    def __init__(self, session: Session, storage: StorageMap = {}) -> None:
        self.session = session
        self.storage = storage

    def new_document_kind(self, data: NewDocKindModel):
        result = self.session.execute(
            insert(DocumentKind).values(name=data.name)
        )
        self.session.commit()
        new_kind = DocKindModel(id=result.lastrowid, name=data.name)
        return new_kind

    def get_all_document_kinds(self):
        select_result = (
            self.session.execute(select(DocumentKind)).scalars().all()
        )

        result = [
            DocKindModel.model_validate(r, from_attributes=True)
            for r in select_result
        ]

        return result

    def new_document(self, data: NewDocument) -> UUID:
        key = str(uuid4())
        doc = Document(
            kind_id=data.doc_kind_id,
            storage_service=data.storage_service.value,
            key=key,
            filename=data.filename,
            mimetype=data.mimetype,
        )
        self.session.add(doc)
        self.session.commit()

        self.storage[data.storage_service].store_file(key, data.data)

        return key
