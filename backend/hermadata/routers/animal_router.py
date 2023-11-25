from fastapi import APIRouter, Depends
from hermadata.dependancies import get_repository, get_session
from sqlalchemy.orm import Session
from hermadata.models import PaginationResult
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository

from hermadata.repositories.animal.models import (
    AnimalQueryModel,
    AnimalSearchModel,
    AnimalSearchResult,
    NewAnimalEntryModel,
)

router = APIRouter(prefix="/animal")


@router.post("")
def new_animal_entry(
    data: NewAnimalEntryModel, session: Session = Depends(get_session)
):
    repo = SQLAnimalRepository(session)

    animal_code = repo.insert_new_entry(data)

    return animal_code


@router.get("")
def get_animal_list():
    pass


@router.get("/search", response_model=PaginationResult[AnimalSearchResult])
def search_animals(
    query: AnimalSearchModel = Depends(),
    db_session: Session = Depends(get_session),
):
    repo = SQLAnimalRepository(db_session)

    result = repo.search(query)

    return result


@router.get("/{animal_id}")
def get_animal(
    animal_id: int,
    repo: SQLAnimalRepository = Depends(get_repository(SQLAnimalRepository)),
):
    animal_data = repo.get(AnimalQueryModel(id=animal_id))

    return animal_data
