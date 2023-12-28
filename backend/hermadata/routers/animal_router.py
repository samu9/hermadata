from typing import Annotated

from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile
from sqlalchemy.exc import NoResultFound

from hermadata.dependancies import animal_repository_factory
from hermadata.models import PaginationResult
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository
from hermadata.repositories.animal.models import (
    AnimalQueryModel,
    AnimalSearchModel,
    AnimalSearchResult,
    NewAnimalEntryModel,
    UpdateAnimalModel,
)

router = APIRouter(prefix="/animal")


@router.post("")
def new_animal_entry(
    data: NewAnimalEntryModel,
    repo: SQLAnimalRepository = Depends(animal_repository_factory),
):
    animal_code = repo.insert_new_entry(data)

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


@router.post("/{animal_id}/doc")
def upload_animal_document(
    animal_id: str,
    title: Annotated[str, Form()],
    doc: UploadFile,
    repo: SQLAnimalRepository = Depends(animal_repository_factory),
):
    return True
