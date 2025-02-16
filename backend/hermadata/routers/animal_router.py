from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.exc import NoResultFound

from hermadata.constants import EXCEL_MEDIA_TYPE, ApiErrorCode
from hermadata.initializations import (
    animal_repository,
    animal_service,
    document_repository,
)
from hermadata.models import ApiError, PaginationResult
from hermadata.repositories.animal.animal_repository import (
    ExistingChipCodeException,
    SQLAnimalRepository,
)
from hermadata.repositories.animal.models import (
    AnimalDaysQuery,
    AnimalDocumentModel,
    AnimalEntriesQuery,
    AnimalExit,
    AnimalExitsQuery,
    AnimalModel,
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
    repo: SQLAnimalRepository = Depends(animal_repository),
) -> str:
    animal_code = repo.new_animal(data)

    return animal_code


@router.get("")
def get_animal_list():
    pass


@router.get("/search", response_model=PaginationResult[AnimalSearchResult])
def search_animals(
    query: Annotated[AnimalSearchModel, Depends(use_cache=False)],
    repo: Annotated[SQLAnimalRepository, Depends(animal_repository)],
):
    # Here `Depends`is used to use a pydantic model as query params.
    result = repo.search(query)

    return result


@router.get("/{animal_id}", response_model=AnimalModel)
def get_animal(
    animal_id: int,
    repo: SQLAnimalRepository = Depends(animal_repository),
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
    service: Annotated[AnimalService, Depends(animal_service)],
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
    repo: SQLAnimalRepository = Depends(animal_repository),
):
    docs = repo.get_documents(animal_id)

    return docs


@router.post("/{animal_id}/document", response_model=AnimalDocumentModel)
def upload_animal_document(
    animal_id: int,
    data: NewAnimalDocument,
    animal_repo: SQLAnimalRepository = Depends(animal_repository),
    doc_repo: SQLDocumentRepository = Depends(document_repository),
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
    service: AnimalService = Depends(animal_service),
):
    service.exit(animal_id, data)

    return True


@router.post("/{animal_id}/entry/complete")
def complete_entry(
    animal_id: int,
    data: CompleteEntryModel,
    service: AnimalService = Depends(animal_service),
):
    service.complete_entry(animal_id, data)

    return True


@router.post("/{animal_id}/entry")
def add_entry(
    animal_id: int,
    data: NewEntryModel,
    repo: SQLAnimalRepository = Depends(animal_repository),
):
    result = repo.add_entry(animal_id, data)

    return result


@router.get("/{animal_id}/warning")
def get_warnings(
    animal_id: int,
    repo: SQLAnimalRepository = Depends(animal_repository),
):
    return


@router.get("/days/report")
def serve_animal_days_report(
    query: AnimalDaysQuery = Depends(),
    service: AnimalService = Depends(animal_service),
):
    filename, report = service.days_report(query)

    return Response(
        content=report,
        media_type=EXCEL_MEDIA_TYPE,
        headers={"X-filename": filename},
    )


@router.get("/entries/report")
def serve_animal_entries_report(
    query: AnimalEntriesQuery = Depends(),
    service: AnimalService = Depends(animal_service),
):
    filename, report = service.entries_report(query)

    return Response(
        content=report,
        media_type=EXCEL_MEDIA_TYPE,
        headers={"X-filename": filename},
    )


@router.get("/exits/report")
def serve_animal_exits_report(
    query: AnimalExitsQuery = Depends(),
    service: AnimalService = Depends(animal_service),
):
    filename, report = service.exits_report(query)

    return Response(
        content=report,
        media_type=EXCEL_MEDIA_TYPE,
        headers={"X-filename": filename},
    )
