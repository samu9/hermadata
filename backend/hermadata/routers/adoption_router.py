from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from hermadata.repositories.adoption_repository import (
    AdoptionModel,
    ExistingAdoptionException,
    NewAdoption,
    SQLAdopionRepository,
)

router = APIRouter(prefix="/adoption")


@router.post("", response_model=AdoptionModel)
def new_animal_adoption(data: NewAdoption, repo: Annotated[SQLAdopionRepository, Depends(SQLAdopionRepository)]):
    try:
        result = repo.create(data)
    except ExistingAdoptionException as e:
        raise HTTPException(status_code=400, detail={}) from e

    return result
