from typing import Annotated

from fastapi import APIRouter, Depends

from hermadata.initializations import race_repository
from hermadata.repositories.race_repository import RaceModel, SQLRaceRepository

router = APIRouter(prefix="/race")


@router.get("", response_model=list[RaceModel])
def get_races(repo: Annotated[SQLRaceRepository, Depends(race_repository)]):
    races = repo.get_all()

    return races
