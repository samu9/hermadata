from uuid import uuid4

from pydantic import BaseModel, constr
from sqlalchemy import insert, select
from sqlalchemy.orm import Session

from hermadata.constants import DocKindCode, StorageType
from hermadata.database.models import Document, DocumentKind
from hermadata.repositories import SQLBaseRepository
from hermadata.storage.base import StorageInterface


class NewDocument(BaseModel):
    storage_service: StorageType | None = None
    filename: str
    data: bytes
    mimetype: str
    is_uploaded: bool


class DocKindModel(BaseModel):
    id: int
    code: str
    name: str
    uploadable: bool


class NewDocKindModel(BaseModel):
    code: str = constr(max_length=2)
    name: str


class DocumentModel(BaseModel):
    filename: str


StorageMap = dict[StorageType, StorageInterface]


class SQLDocumentRepository(SQLBaseRepository):
    document_kind_ids = {}

    def __init__(
        self,
        session: Session,
        selected_storage: StorageType,
        storage: StorageMap,
    ):
        self.session = session
        self.storage = storage
        self.selected_storage = selected_storage
        self._init_document_kind_ids_map()

    def _init_document_kind_ids_map(self):
        data = self.get_document_kinds()
        for d in data:
            if d.code in DocKindCode:
                self.document_kind_ids[DocKindCode(d.code)] = d.id

    def new_document_kind(self, data: NewDocKindModel):
        result = self.session.execute(
            insert(DocumentKind).values(name=data.name, code=data.code, uploadable=True, rendered=False)
        )
        self.session.flush()
        new_kind = DocKindModel(
            id=result.lastrowid,
            name=data.name,
            uploadable=True,
            code=data.code,
        )
        return new_kind

    def get_document_kinds(self, uploadable: bool = None):
        where = {}
        if uploadable is not None:
            where[DocumentKind.uploadable] = uploadable
        select_result = self.session.execute(select(DocumentKind).where(*where)).scalars().all()

        result = [DocKindModel.model_validate(r, from_attributes=True) for r in select_result]

        return result

    def get_document_kind_by_code(self, code: str) -> DocKindModel:
        kind = self.session.execute(select(DocumentKind).where(DocumentKind.code == code)).scalar_one()
        return DocKindModel.model_validate(kind, from_attributes=True)

    def new_document(self, data: NewDocument) -> int:
        key = str(uuid4())
        doc = Document(
            storage_service=self.selected_storage.value,
            key=key,
            filename=data.filename,
            mimetype=data.mimetype,
            is_uploaded=data.is_uploaded,
        )
        self.session.add(doc)
        self.session.flush()
        doc_id = doc.id
        self.storage[self.selected_storage].store_file(key, data.data)

        return doc_id

    def get_data(self, document_id: int):
        key, storage_service, content_type, filename = self.session.execute(
            select(
                Document.key,
                Document.storage_service,
                Document.mimetype,
                Document.filename,
            ).where(Document.id == document_id)
        ).one()
        storage_service = StorageType(storage_service)

        if storage_service not in self.storage:
            raise Exception("storage not handled")

        data = self.storage[storage_service].retrieve_file(key)

        return data, content_type, filename
