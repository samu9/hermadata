from fastapi import APIRouter, Depends, HTTPException

from hermadata.dependancies import document_repository_factory
from hermadata.repositories.document_repository import (
    DocKindModel,
    NewDocKindModel,
    SQLDocumentRepository,
)
from sqlalchemy.exc import IntegrityError


router = APIRouter(prefix="/document")


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
