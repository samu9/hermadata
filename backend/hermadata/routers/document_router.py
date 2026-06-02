from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    Response,
    UploadFile,
)
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError

from hermadata.constants import Permission
from hermadata.initializations import get_document_repository
from hermadata.permissions import require_permission
from hermadata.repositories.document_repository import (
    DocKindModel,
    NewDocKindModel,
    NewDocument,
    SQLDocumentRepository,
)
from hermadata.services.user_service import TokenData
from hermadata.settings import settings

router = APIRouter(prefix="/document")


class DocumentUrlResponse(BaseModel):
    url: str


@router.post("", response_model=int)
def new_document(
    doc: UploadFile,
    doc_repo: Annotated[
        SQLDocumentRepository, Depends(get_document_repository)
    ],
):
    result = doc_repo.new_document(
        NewDocument(
            data=doc.file.read(),
            filename=doc.filename,
            mimetype=doc.content_type,
            is_uploaded=True,
        )
    )

    return result


@router.get("/kind", response_model=list[DocKindModel])
def get_document_kinds(
    doc_repo: Annotated[
        SQLDocumentRepository, Depends(get_document_repository)
    ],
):
    kinds = doc_repo.get_document_kinds()
    return kinds


@router.post("/kind", response_model=DocKindModel)
def create_new_kind(
    data: NewDocKindModel,
    doc_repo: Annotated[
        SQLDocumentRepository, Depends(get_document_repository)
    ],
):
    try:
        new_doc_kind = doc_repo.new_document_kind(data)
    except IntegrityError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error_code": 1,
                "message": "this document kind already exists",
            },
        ) from e
    return new_doc_kind


@router.get("/{document_id}/stream", response_class=Response)
def stream_document(
    document_id: int,
    doc_repo: Annotated[
        SQLDocumentRepository, Depends(get_document_repository)
    ],
):
    """Unauthenticated byte-streaming endpoint for disk storage (dev only).

    Production traffic always hits S3 presigned URLs directly. This endpoint
    is the target URL returned by serve_document when running on disk storage.
    """
    data, content_type, filename = doc_repo.get_data(document_id)
    return Response(
        content=data, media_type=content_type, headers={"filename": filename}
    )


@router.get("/{document_id}", response_model=DocumentUrlResponse)
def serve_document(
    document_id: int,
    request: Request,
    doc_repo: Annotated[
        SQLDocumentRepository, Depends(get_document_repository)
    ],
    current_user: Annotated[
        TokenData, Depends(require_permission(Permission.DOWNLOAD_DOCUMENT))
    ],
):
    doc = doc_repo.get_document_download_data(document_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.document_kind_id is not None and not current_user.is_superuser:
        if not doc_repo.can_view_document(
            doc.document_kind_id, current_user.user_id, current_user.role
        ):
            raise HTTPException(
                status_code=403,
                detail="Insufficient permissions to view this document",
            )

    storage_backend = doc_repo.storage[doc.storage_service]
    presigned_url = storage_backend.get_presigned_url(
        key=doc.key,
        filename=doc.filename,
        mimetype=doc.mimetype,
        expires_in=settings.storage.s3.presigned_url_expires_in
        if settings.storage.s3
        else 600,
    )
    if presigned_url is not None:
        return DocumentUrlResponse(url=presigned_url)

    stream_url = str(request.base_url) + f"document/{document_id}/stream"
    return DocumentUrlResponse(url=stream_url)
