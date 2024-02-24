from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import NoResultFound

from hermadata.dependancies import animal_repository_factory
from hermadata.models import PaginationResult
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository
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
    repo: SQLAnimalRepository = Depends(animal_repository_factory),
):
    animal_code = repo.new_animal(data)

    return animal_code


@router.get("")
def get_animal_list():
    pass


@router.get("/search", response_model=PaginationResult[AnimalSearchResult])
def search_animals(
    query: AnimalSearchModel = Depends(),
    repo: SQLAnimalRepository = Depends(animal_repository_factory),
):
    # Here `Depends`is used to use a pydantic model as query params.
    result = repo.search(query)

    return result


@router.get("/{animal_id}")
def get_animal(
    animal_id: int,
    repo: SQLAnimalRepository = Depends(animal_repository_factory),
):
    try:
        animal_data = repo.get(AnimalQueryModel(id=animal_id))
    except NoResultFound:
        raise HTTPException(status_code=404, detail="No animal found")

    return animal_data


@router.post("/{animal_id}")
def update_animal(
    animal_id: str,
    data: UpdateAnimalModel,
    repo: SQLAnimalRepository = Depends(animal_repository_factory),
):
    result = repo.update(animal_id, data)

    return result


@router.get("/{animal_id}/document", response_model=list[AnimalDocumentModel])
def get_animal_documents(
    animal_id: int,
    repo: SQLAnimalRepository = Depends(animal_repository_factory),
):
    docs = repo.get_documents(animal_id)

    return docs


@router.post("/{animal_id}/document", response_model=AnimalDocumentModel)
def upload_animal_document(
    animal_id: int,
    data: NewAnimalDocument,
    repo: SQLAnimalRepository = Depends(animal_repository_factory),
):
    result = repo.new_document(animal_id, data)
    return result


@router.post("/{animal_id}/exit")
def animal_exit(
    animal_id: int,
    data: AnimalExit,
    repo: SQLAnimalRepository = Depends(animal_repository_factory),
):
    repo.exit(animal_id, data)

    return True


@router.post("/{animal_id}/entry/complete")
def complete_entry(
    animal_id: int,
    data: CompleteEntryModel,
    repo: SQLAnimalRepository = Depends(animal_repository_factory),
):
    repo.complete_entry(animal_id, data)

    return True


@router.post("/{animal_id}/entry")
def add_entry(
    animal_id: int,
    data: NewEntryModel,
    repo: SQLAnimalRepository = Depends(animal_repository_factory),
):
    result = repo.add_entry(animal_id, data)

    return result
