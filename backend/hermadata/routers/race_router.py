from fastapi import APIRouter, Depends


from hermadata.repositories.race_repository import RaceModel, SQLRaceRepository
from hermadata.initializations import race_repository

router = APIRouter(prefix="/race")


@router.get("", response_model=list[RaceModel])
def get_races(
    repo: SQLRaceRepository = Depends(race_repository),
):
    races = repo.get_all()

    return races
