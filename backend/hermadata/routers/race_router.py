from fastapi import APIRouter, Depends

from hermadata.dependancies import get_repository

from hermadata.repositories.race_repository import RaceModel, SQLRaceRepository

router = APIRouter(prefix="/race")


@router.get("", response_model=list[RaceModel])
def get_races(
    repo: SQLRaceRepository = Depends(get_repository(SQLRaceRepository)),
):
    races = repo.get_all()

    return races
