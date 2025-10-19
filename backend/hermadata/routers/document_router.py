from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile
from sqlalchemy.exc import IntegrityError

from hermadata.initializations import get_document_repository
from hermadata.repositories.document_repository import (
    DocKindModel,
    NewDocKindModel,
    NewDocument,
    SQLDocumentRepository,
)

router = APIRouter(prefix="/document")


@router.post("", response_model=int)
def new_document(doc: UploadFile, doc_repo: Annotated[SQLDocumentRepository, Depends(get_document_repository)]):
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
def get_document_kinds(doc_repo: Annotated[SQLDocumentRepository, Depends(get_document_repository)]):
    kinds = doc_repo.get_document_kinds()
    return kinds


@router.post("/kind", response_model=DocKindModel)
def create_new_kind(
    data: NewDocKindModel, doc_repo: Annotated[SQLDocumentRepository, Depends(get_document_repository)]
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


@router.get("/{document_id}", response_class=Response)
def serve_document(document_id: int, doc_repo: Annotated[SQLDocumentRepository, Depends(get_document_repository)]):
    data, content_type, filename = doc_repo.get_data(document_id)

    return Response(content=data, media_type=content_type, headers={"filename": filename})
