from fastapi import APIRouter, Depends, HTTPException
from hermadata.dependancies import get_session
from sqlalchemy.orm import Session
from hermadata.models import PaginationResult
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository
from sqlalchemy.exc import NoResultFound
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
    db_session: Session = Depends(get_session),
):
    repo = SQLAnimalRepository(db_session)
    try:
        animal_data = repo.get(AnimalQueryModel(id=animal_id))
    except NoResultFound:
        raise HTTPException(status_code=404, detail="No animal found")

    return animal_data


@router.post("/{animal_id}")
def update_animal(
    animal_id: str,
    data: UpdateAnimalModel,
    db_session: Session = Depends(get_session),
):
    repo = SQLAnimalRepository(db_session)

    result = repo.update(animal_id, data)

    return result
