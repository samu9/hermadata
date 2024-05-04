from fastapi import APIRouter, Depends, HTTPException
from hermadata.dependancies import get_repository
from hermadata.repositories.adoption_repository import (
    AdoptionModel,
    ExistingAdoptionException,
    NewAdoption,
    SQLAdopionRepository,
)


router = APIRouter(prefix="/adoption")


@router.post("", response_model=AdoptionModel)
def new_animal_adoption(
    data: NewAdoption,
    repo: SQLAdopionRepository = Depends(get_repository(SQLAdopionRepository)),
):
    try:
        result = repo.create(data)
    except ExistingAdoptionException:
        raise HTTPException(status_code=400, detail={})

    return result
