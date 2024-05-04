from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import NoResultFound
from hermadata.constants import ApiErrorCode

from hermadata.dependancies import get_repository
from hermadata.models import ApiError, PaginationResult
from hermadata.repositories.animal.animal_repository import (
    ExistingChipCodeException,
    SQLAnimalRepository,
)
from hermadata.repositories.animal.models import (
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

router = APIRouter(prefix="/animal")


@router.post("")
def new_animal_entry(
    data: NewAnimalModel,
    repo: SQLAnimalRepository = Depends(get_repository(SQLAnimalRepository)),
) -> str:
    animal_code = repo.new_animal(data)

    return animal_code


@router.get("")
def get_animal_list():
    pass


@router.get("/search", response_model=PaginationResult[AnimalSearchResult])
def search_animals(
    query: AnimalSearchModel = Depends(),
    repo: SQLAnimalRepository = Depends(get_repository(SQLAnimalRepository)),
):
    # Here `Depends`is used to use a pydantic model as query params.
    result = repo.search(query)

    return result


@router.get("/{animal_id}")
def get_animal(
    animal_id: int,
    repo: SQLAnimalRepository = Depends(get_repository(SQLAnimalRepository)),
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
    repo: SQLAnimalRepository = Depends(get_repository(SQLAnimalRepository)),
) -> int | ApiError:
    try:
        result = repo.update(animal_id, data)
    except ExistingChipCodeException as e:
        return ApiError(
            code=ApiErrorCode.existing_chip_code,
            content={"animal_id": e.animal_id},
        )
    return result


@router.get("/{animal_id}/document", response_model=list[AnimalDocumentModel])
def get_animal_documents(
    animal_id: int,
    repo: SQLAnimalRepository = Depends(get_repository(SQLAnimalRepository)),
):
    docs = repo.get_documents(animal_id)

    return docs


@router.post("/{animal_id}/document", response_model=AnimalDocumentModel)
def upload_animal_document(
    animal_id: int,
    data: NewAnimalDocument,
    repo: SQLAnimalRepository = Depends(get_repository(SQLAnimalRepository)),
):
    result = repo.new_document(animal_id, data)
    return result


@router.post("/{animal_id}/exit")
def animal_exit(
    animal_id: int,
    data: AnimalExit,
    repo: SQLAnimalRepository = Depends(get_repository(SQLAnimalRepository)),
):
    repo.exit(animal_id, data)

    return True


@router.post("/{animal_id}/entry/complete")
def complete_entry(
    animal_id: int,
    data: CompleteEntryModel,
    repo: SQLAnimalRepository = Depends(get_repository(SQLAnimalRepository)),
):
    repo.complete_entry(animal_id, data)

    return True


@router.post("/{animal_id}/entry")
def add_entry(
    animal_id: int,
    data: NewEntryModel,
    repo: SQLAnimalRepository = Depends(get_repository(SQLAnimalRepository)),
):
    result = repo.add_entry(animal_id, data)

    return result


@router.get("/{animal_id}/warning")
def get_warnings(
    animal_id: int,
    repo: SQLAnimalRepository = Depends(get_repository(SQLAnimalRepository)),
):
    return
