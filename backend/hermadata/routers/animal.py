from fastapi import APIRouter, Depends
from hermadata.dependancies import get_repository, get_session
from sqlalchemy.orm import Session
from hermadata.repositories.animal.animal import SQLAnimalRepository

from hermadata.repositories.animal.models import (
    AnimalModel,
    AnimalQueryModel,
    NewAnimalModel,
)

router = APIRouter(prefix="/animal")


@router.post("")
def create_new_animal(
    data: NewAnimalModel, session: Session = Depends(get_session)
):
    repo = SQLAnimalRepository(session)

    animal_code = repo.generate_code(
        race_id=data.race_id,
        origin_city_code=data.origin_city_code,
        rescue_date=data.rescue_date,
    )

    data = {**data.model_dump(), "code": animal_code}
    animal = AnimalModel.model_validate(data)

    repo.save(animal)

    return animal_code


@router.get("")
def get_animal_list():
    pass


@router.get("search")
def search_animals():
    pass


@router.get("{animal_id}")
def get_animal(
    animal_id: int,
    repo: SQLAnimalRepository = Depends(get_repository(SQLAnimalRepository)),
):
    animal_data = repo.get(AnimalQueryModel(id=animal_id))

    return animal_data
