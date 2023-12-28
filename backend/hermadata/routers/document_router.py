from fastapi import APIRouter, Depends, HTTPException, UploadFile

from hermadata.dependancies import document_repository_factory
from hermadata.repositories.document_repository import (
    DocKindModel,
    NewDocKindModel,
    NewDocument,
    SQLDocumentRepository,
    StorageType,
)
from sqlalchemy.exc import IntegrityError


router = APIRouter(prefix="/document")


@router.post("", response_model=int)
def new_document(
    doc: UploadFile,
    doc_repo: SQLDocumentRepository = Depends(document_repository_factory),
):
    result = doc_repo.new_document(
        NewDocument(
            data=doc.file.read(),
            filename=doc.filename,
            mimetype=doc.content_type,
            storage_service=StorageType.disk,
        )
    )

    return result


@router.get("/kind")
def get_document_kinds(
    doc_repo: SQLDocumentRepository = Depends(document_repository_factory),
):
    kinds = doc_repo.get_all_document_kinds()
    return kinds


@router.post("/kind", response_model=DocKindModel)
def create_new_kind(
    data: NewDocKindModel,
    doc_repo: SQLDocumentRepository = Depends(document_repository_factory),
):
    try:
        new_doc_kind = doc_repo.new_document_kind(data)
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail={
                "error_code": 1,
                "message": "this document kind already exists",
            },
        )
    return new_doc_kind
