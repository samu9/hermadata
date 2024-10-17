from fastapi import APIRouter, Depends


from hermadata.repositories.race_repository import RaceModel, SQLRaceRepository

router = APIRouter(prefix="/race")


@router.get("", response_model=list[RaceModel])
def get_races(
    repo: SQLRaceRepository = Depends(SQLRaceRepository),
):
    races = repo.get_all()

    return races
