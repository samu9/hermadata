from fastapi import APIRouter, Depends

from hermadata.dependancies import get_session
from sqlalchemy.orm import Session

from hermadata.repositories.race import RaceModel, SQLRaceRepository

router = APIRouter(prefix="/race")


@router.get("", response_model=list[RaceModel])
def get_races(session: Session = Depends(get_session)):
    repo = SQLRaceRepository(session)

    races = repo.get_all()

    return races
