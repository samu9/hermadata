from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.exc import NoResultFound

from hermadata.constants import EXCEL_MEDIA_TYPE, ApiErrorCode, Permission
from hermadata.initializations import (
    get_animal_repository,
    get_animal_service,
    get_current_user,
    get_document_repository,
)
from hermadata.models import ApiError, PaginationResult
from hermadata.permissions import check_permission, require_permission
from hermadata.repositories.animal.animal_repository import (
    ExistingChipCodeException,
    SQLAnimalRepository,
)
from hermadata.repositories.animal.models import (
    AnimalDaysQuery,
    AnimalDocumentModel,
    AnimalEntriesQuery,
    AnimalEntryModel,
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
    UpdateAnimalEntryModel,
    UpdateAnimalModel,
)
from hermadata.repositories.document_repository import SQLDocumentRepository
from hermadata.services.animal_service import AnimalService
from hermadata.services.user_service import TokenData

router = APIRouter(prefix="/animal")


@router.post("")
def new_animal_entry(
    data: NewAnimalModel,
    repo: Annotated[SQLAnimalRepository, Depends(get_animal_repository)],
    current_user: Annotated[
        TokenData, Depends(require_permission(Permission.CREATE_ANIMAL))
    ],
) -> str:
    animal_code = repo.new_animal(data)

    return animal_code


@router.get("")
def get_animal_list():
    pass


@router.get("/search", response_model=PaginationResult[AnimalSearchResult])
def search_animals(
    query: Annotated[AnimalSearchModel, Depends(use_cache=False)],
    repo: Annotated[SQLAnimalRepository, Depends(get_animal_repository)],
    current_user: Annotated[TokenData, Depends(get_current_user)],
):
    if (
        query.present
        and check_permission(current_user, Permission.BROWSE_PRESENT_ANIMALS)
        is False
    ):
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions to browse present animals",
        )
    if (
        query.not_present
        and check_permission(
            current_user, Permission.BROWSE_NOT_PRESENT_ANIMALS
        )
        is False
    ):
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions to browse non-present animals",
        )
    # Here `Depends`is used to use a pydantic model as query params.
    result = repo.search(query)

    return result


@router.get("/days/report")
def serve_animal_days_report(
    query: Annotated[AnimalDaysQuery, Depends()],
    service: Annotated[AnimalService, Depends(get_animal_service)],
):
    filename, report = service.days_report(query)

    return Response(
        content=report,
        media_type=EXCEL_MEDIA_TYPE,
        headers={"X-filename": filename},
    )


@router.get("/entries/report")
def serve_animal_entries_report(
    query: Annotated[AnimalEntriesQuery, Depends()],
    service: Annotated[AnimalService, Depends(get_animal_service)],
):
    filename, report = service.entries_report(query)

    return Response(
        content=report,
        media_type=EXCEL_MEDIA_TYPE,
        headers={"X-filename": filename},
    )


@router.get("/exits/report")
def serve_animal_exits_report(
    query: Annotated[AnimalExitsQuery, Depends()],
    service: Annotated[AnimalService, Depends(get_animal_service)],
):
    filename, report = service.exits_report(query)

    return Response(
        content=report,
        media_type=EXCEL_MEDIA_TYPE,
        headers={"X-filename": filename},
    )


@router.get("/{animal_id}", response_model=AnimalModel)
def get_animal(
    animal_id: int,
    repo: Annotated[SQLAnimalRepository, Depends(get_animal_repository)],
):
    try:
        animal_data = repo.get(AnimalQueryModel(id=animal_id))
    except NoResultFound as e:
        raise HTTPException(status_code=404, detail="No animal found") from e

    return animal_data


@router.post("/{animal_id}", response_model=int | ApiError)
def update_animal(
    animal_id: int,
    data: UpdateAnimalModel,
    service: Annotated[AnimalService, Depends(get_animal_service)],
    current_user: Annotated[
        TokenData, Depends(require_permission(Permission.EDIT_ANIMAL))
    ],
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
    repo: Annotated[SQLAnimalRepository, Depends(get_animal_repository)],
):
    docs = repo.get_documents(animal_id)

    return docs


@router.post("/{animal_id}/document", response_model=AnimalDocumentModel)
def upload_animal_document(
    animal_id: int,
    data: NewAnimalDocument,
    animal_repo: Annotated[
        SQLAnimalRepository, Depends(get_animal_repository)
    ],
    doc_repo: Annotated[
        SQLDocumentRepository, Depends(get_document_repository)
    ],
    current_user: Annotated[
        TokenData, Depends(require_permission(Permission.UPLOAD_DOCUMENT))
    ],
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
    service: Annotated[AnimalService, Depends(get_animal_service)],
    current_user: Annotated[
        TokenData, Depends(require_permission(Permission.MAKE_ADOPTION))
    ],
):
    service.exit(animal_id, data)

    return True


@router.post("/{animal_id}/entry/complete")
def complete_entry(
    animal_id: int,
    data: CompleteEntryModel,
    service: Annotated[AnimalService, Depends(get_animal_service)],
):
    service.complete_entry(animal_id, data)

    return True


@router.post("/{animal_id}/entry")
def add_entry(
    animal_id: int,
    data: NewEntryModel,
    repo: Annotated[SQLAnimalRepository, Depends(get_animal_repository)],
):
    result = repo.add_entry(animal_id, data)

    return result


@router.get("/{animal_id}/entries", response_model=list[AnimalEntryModel])
def get_animal_entries(
    animal_id: int,
    repo: Annotated[SQLAnimalRepository, Depends(get_animal_repository)],
):
    result = repo.get_animal_entries(animal_id)

    return result


@router.put("/{animal_id}/entries/{entry_id}")
def update_animal_entry(
    animal_id: int,
    entry_id: int,
    data: UpdateAnimalEntryModel,
    repo: Annotated[SQLAnimalRepository, Depends(get_animal_repository)],
):
    """Update an animal entry"""
    try:
        # Verify the entry belongs to the animal
        entries = repo.get_animal_entries(animal_id)
        if not any(entry.id == entry_id for entry in entries):
            raise HTTPException(
                status_code=404,
                detail=f"Entry {entry_id} not found for animal {animal_id}",
            )

        updated_rows = repo.update_animal_entry(entry_id, data)
        if updated_rows == 0:
            raise HTTPException(
                status_code=404, detail=f"Entry {entry_id} not found"
            )

        return {
            "message": "Entry updated successfully",
            "updated_rows": updated_rows,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("/{animal_id}/warning")
def get_warnings(
    animal_id: int,
    repo: Annotated[SQLAnimalRepository, Depends(get_animal_repository)],
):
    return


# TODO: Add animal image upload endpoints here
# See TODO_ANIMAL_IMAGE_UPLOAD.md for implementation details
# @router.post("/{animal_id}/image", response_model=int)
# @router.put("/{animal_id}/image", response_model=None)
