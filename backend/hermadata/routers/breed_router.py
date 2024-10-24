from fastapi import APIRouter, Depends, Query
from pymysql import IntegrityError

from hermadata.dependancies import get_repository
from hermadata.repositories.breed_repository import (
    NewBreedModel,
    BreedModel,
    SQLBreedRepository,
)

router = APIRouter(prefix="/breed")


@router.get("", response_model=list[BreedModel])
def get_all(
    repo: SQLBreedRepository = Depends(
        get_repository(SQLBreedRepository), use_cache=False
    ),
    race_id: str = Query(),
):
    races = repo.get_all(race_id)

    return races


@router.post("", response_model=BreedModel)
def create_race(
    data: NewBreedModel,
    repo: SQLBreedRepository = Depends(get_repository(SQLBreedRepository)),
):
    try:
        breed_id = repo.create(data)
        repo.session.commit()
    except IntegrityError:
        return None
    return breed_id
