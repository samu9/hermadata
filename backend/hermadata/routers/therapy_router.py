from typing import Annotated

from fastapi import APIRouter, Depends

from hermadata.initializations import get_current_user, get_therapy_repository
from hermadata.repositories.therapy_repository import (
    SQLTherapyRepository,
    TherapyCreate,
    TherapyRead,
)
from hermadata.services.user_service import TokenData

router = APIRouter(prefix="/animal/{animal_id}/therapies", tags=["therapy"])


@router.post("", response_model=TherapyRead, status_code=201)
def create_therapy(
    animal_id: int,
    data: TherapyCreate,
    repo: Annotated[SQLTherapyRepository, Depends(get_therapy_repository)],
    current_user: Annotated[TokenData, Depends(get_current_user)],
):
    data.user_id = current_user.user_id
    return repo.create(animal_id=animal_id, data=data)


@router.get("", response_model=list[TherapyRead])
def list_therapies(
    animal_id: int,
    repo: Annotated[SQLTherapyRepository, Depends(get_therapy_repository)],
    _: Annotated[TokenData, Depends(get_current_user)],
):
    return repo.get_by_animal(animal_id=animal_id)
