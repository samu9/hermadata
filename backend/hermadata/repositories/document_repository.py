from uuid import uuid4

from pydantic import BaseModel, constr
from sqlalchemy import insert, or_, select
from sqlalchemy.orm import Session

from hermadata.constants import DocKindCode, StorageType
from hermadata.database.models import (
    AnimalDocument,
    Document,
    DocumentKind,
    DocumentPermission,
    UserRole,
)
from hermadata.repositories import SQLBaseRepository
from hermadata.storage.base import StorageInterface


class DocumentDownloadData(BaseModel):
    key: str
    storage_service: StorageType
    filename: str
    title: str | None
    mimetype: str
    document_kind_id: int | None


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
            insert(DocumentKind).values(
                name=data.name, code=data.code, uploadable=True, rendered=False
            )
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
        select_result = (
            self.session.execute(select(DocumentKind).where(*where))
            .scalars()
            .all()
        )

        result = [
            DocKindModel.model_validate(r, from_attributes=True)
            for r in select_result
        ]

        return result

    def get_document_kind_by_code(self, code: str) -> DocKindModel:
        kind = self.session.execute(
            select(DocumentKind).where(DocumentKind.code == code)
        ).scalar_one()
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

    def get_document_download_data(
        self, document_id: int
    ) -> DocumentDownloadData | None:
        """Fetch document metadata needed for serving/redirecting a download.

        Returns None if the document does not exist or is not yet uploaded.
        Uses an outer join so documents not linked to an animal_document still resolve.
        """
        row = self.session.execute(
            select(
                Document.key,
                Document.storage_service,
                Document.filename,
                Document.mimetype,
                AnimalDocument.document_kind_id,
                AnimalDocument.title,
            )
            .outerjoin(
                AnimalDocument, AnimalDocument.document_id == Document.id
            )
            .where(Document.id == document_id)
        ).first()

        if row is None:
            return None

        key, storage_service, filename, mimetype, document_kind_id, title = row

        return DocumentDownloadData(
            key=key,
            storage_service=StorageType(storage_service),
            filename=filename,
            title=title,
            mimetype=mimetype,
            document_kind_id=document_kind_id,
        )

    def can_view_document(
        self, document_kind_id: int, user_id: int, role_name: str | None
    ) -> bool:
        """Return False if an explicit can_view=False restriction applies to this user.

        If no restriction row exists for this document kind / user / role, access is allowed.
        """
        user_role_conditions = [DocumentPermission.user_id == user_id]
        if role_name is not None:
            role_id_subq = (
                select(UserRole.id)
                .where(UserRole.name == role_name)
                .scalar_subquery()
            )
            user_role_conditions.append(
                DocumentPermission.role_id == role_id_subq
            )

        restricted = self.session.execute(
            select(DocumentPermission.id)
            .where(
                DocumentPermission.document_kind_id == document_kind_id,
                DocumentPermission.can_view == False,  # noqa: E712
                or_(*user_role_conditions),
            )
            .limit(1)
        ).scalar()

        return restricted is None
