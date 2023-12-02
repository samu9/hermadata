from fastapi import APIRouter, Depends, Query
from pymysql import IntegrityError
from sqlalchemy.orm import Session

from hermadata.dependancies import get_session
from hermadata.repositories.breed_repository import (
    AddBreedModel,
    BreedModel,
    SQLBreedRepository,
)

router = APIRouter(prefix="/breed")


@router.get("", response_model=list[BreedModel])
def get_all(session: Session = Depends(get_session), race_id: str = Query()):
    repo = SQLBreedRepository(session)

    races = repo.get_all(race_id)

    return races


@router.post("", response_model=BreedModel)
def create_race(data: AddBreedModel, session: Session = Depends(get_session)):
    repo = SQLBreedRepository(session)
    try:
        breed_id = repo.create(data)
        session.commit()
    except IntegrityError:
        return None
    return breed_id
