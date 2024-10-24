from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.exc import NoResultFound

from hermadata.constants import ApiErrorCode
from hermadata.models import ApiError, PaginationResult
from hermadata.repositories.animal.animal_repository import (
    ExistingChipCodeException,
    SQLAnimalRepository,
)
from hermadata.repositories.animal.models import (
    AnimalDaysQuery,
    AnimalDocumentModel,
    AnimalExit,
    AnimalQueryModel,
    AnimalSearchModel,
    AnimalSearchResult,
    CompleteEntryModel,
    NewAnimalDocument,
    NewAnimalModel,
    NewEntryModel,
    UpdateAnimalModel,
)
from hermadata.repositories.document_repository import SQLDocumentRepository
from hermadata.services.animal_service import AnimalService

router = APIRouter(prefix="/animal")


@router.post("")
def new_animal_entry(
    data: NewAnimalModel,
    repo: SQLAnimalRepository = Depends(SQLAnimalRepository),
) -> str:
    animal_code = repo.new_animal(data)

    return animal_code


@router.get("")
def get_animal_list():
    pass


@router.get("/search", response_model=PaginationResult[AnimalSearchResult])
def search_animals(
    query: Annotated[AnimalSearchModel, Depends(use_cache=False)],
    repo: Annotated[SQLAnimalRepository, Depends(SQLAnimalRepository)],
):
    # Here `Depends`is used to use a pydantic model as query params.
    result = repo.search(query)

    return result


@router.get("/{animal_id}")
def get_animal(
    animal_id: int,
    repo: SQLAnimalRepository = Depends(SQLAnimalRepository),
):
    try:
        animal_data = repo.get(AnimalQueryModel(id=animal_id))
    except NoResultFound:
        raise HTTPException(status_code=404, detail="No animal found")

    return animal_data


@router.post("/{animal_id}", response_model=int | ApiError)
def update_animal(
    animal_id: int,
    data: UpdateAnimalModel,
    service: Annotated[AnimalService, Depends(AnimalService)],
) -> int | ApiError:
    try:
        result = service.update(animal_id, data)
    except ExistingChipCodeException as e:
        return ApiError(
            code=ApiErrorCode.existing_chip_code,
            content={"animal_id": e.animal_id},
        )
    return result


@router.get("/{animal_id}/document", response_model=list[AnimalDocumentModel])
def get_animal_documents(
    animal_id: int,
    repo: SQLAnimalRepository = Depends(SQLAnimalRepository),
):
    docs = repo.get_documents(animal_id)

    return docs


@router.post("/{animal_id}/document", response_model=AnimalDocumentModel)
def upload_animal_document(
    animal_id: int,
    data: NewAnimalDocument,
    animal_repo: SQLAnimalRepository = Depends(SQLAnimalRepository),
    doc_repo: SQLDocumentRepository = Depends(SQLDocumentRepository),
):
    doc_kind = doc_repo.get_document_kind_by_code(data.document_kind_code)

    if not doc_kind.uploadable:
        raise HTTPException(
            status_code=400,
            detail={"message": "This document kind cannot be uploaded"},
        )
    result = animal_repo.new_document(animal_id, data)
    return result


@router.post("/{animal_id}/exit")
def animal_exit(
    animal_id: int,
    data: AnimalExit,
    repo: SQLAnimalRepository = Depends(SQLAnimalRepository),
):
    repo.exit(animal_id, data)

    return True


@router.post("/{animal_id}/entry/complete")
def complete_entry(
    animal_id: int,
    data: CompleteEntryModel,
    service: AnimalService = Depends(AnimalService),
):
    service.complete_entry(animal_id, data)

    return True


@router.post("/{animal_id}/entry")
def add_entry(
    animal_id: int,
    data: NewEntryModel,
    repo: SQLAnimalRepository = Depends(SQLAnimalRepository),
):
    result = repo.add_entry(animal_id, data)

    return result


@router.get("/{animal_id}/warning")
def get_warnings(
    animal_id: int,
    repo: SQLAnimalRepository = Depends(SQLAnimalRepository),
):
    return


@router.get("/days/report")
def serve_animal_days_report(
    query: AnimalDaysQuery = Depends(),
    service: AnimalService = Depends(AnimalService),
):
    filename, report = service.animal_days_report(query)

    return Response(
        content=report,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel",
        headers={"X-filename": filename},
    )
