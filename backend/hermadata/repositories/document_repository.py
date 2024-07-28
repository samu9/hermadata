from enum import Enum
from uuid import uuid4
from pydantic import BaseModel, Field

from sqlalchemy import insert, select
from hermadata.constants import DocKindCode
from hermadata.database.models import Document, DocumentKind
from hermadata.repositories import SQLBaseRepository
from sqlalchemy.orm import Session

from hermadata.storage.base import StorageInterface


class StorageType(Enum):
    disk = "dd"
    aws_s3 = "s3"


class NewDocument(BaseModel):
    storage_service: StorageType
    filename: str
    data: bytes
    mimetype: str


class DocKindModel(BaseModel):
    id: int
    code: str
    name: str


class NewDocKindModel(BaseModel):
    code: str = Field(length=2)
    name: str


class DocumentModel(BaseModel):
    filename: str


StorageMap = dict[StorageType, StorageInterface]


class SQLDocumentRepository(SQLBaseRepository):
    def __init__(self, session: Session, storage: StorageMap = {}) -> None:
        super().__init__()
        self.storage = storage
        self.document_kind_ids: dict[DocKindCode, int] = {}

        with self(session):
            self._init_document_kind_ids_map()

    def _init_document_kind_ids_map(self):
        data = self.get_document_kinds()
        for d in data:
            if d.code in DocKindCode:
                self.document_kind_ids[DocKindCode(d.code)] = d.id

    def new_document_kind(self, data: NewDocKindModel):
        result = self.session.execute(
            insert(DocumentKind).values(name=data.name)
        )
        self.session.flush()
        new_kind = DocKindModel(id=result.lastrowid, name=data.name)
        return new_kind

    def get_document_kinds(self, uploadable: bool = False):
        select_result = (
            self.session.execute(
                select(DocumentKind).where(
                    DocumentKind.uploadable == uploadable
                )
            )
            .scalars()
            .all()
        )

        result = [
            DocKindModel.model_validate(r, from_attributes=True)
            for r in select_result
        ]

        return result

    def get_document_kind_id_by_code(self, code: DocKindCode):
        kind_id = self.session.execute(
            select(DocumentKind.id).where(DocumentKind.code == code)
        ).scalar_one()
        return DocKindModel.model_validate(kind_id)

    def new_document(self, data: NewDocument) -> int:
        key = str(uuid4())
        doc = Document(
            storage_service=data.storage_service.value,
            key=key,
            filename=data.filename,
            mimetype=data.mimetype,
        )
        self.session.add(doc)
        self.session.flush()
        doc_id = doc.id
        self.storage[data.storage_service].store_file(key, data.data)

        return doc_id

    def get_data(self, document_id: int):
        key, storage_service, content_type = self.session.execute(
            select(
                Document.key, Document.storage_service, Document.mimetype
            ).where(Document.id == document_id)
        ).one()
        storage_service = StorageType(storage_service)

        if storage_service not in self.storage:
            raise Exception("storage not handled")

        data = self.storage[storage_service].retrieve_file(key)

        return data, content_type
