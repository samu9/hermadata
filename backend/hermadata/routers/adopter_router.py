from fastapi import APIRouter, Depends

from hermadata.dependancies import get_repository
from hermadata.repositories.adopter_repository import (
    AdopterModel,
    AdopterQuery,
    NewAdopter,
    SQLAdopterRepository,
)


router = APIRouter(prefix="/adopter")


@router.post("/", response_model=AdopterModel)
def create_adopter(
    data: NewAdopter,
    repo: SQLAdopterRepository = Depends(get_repository(SQLAdopterRepository)),
):
    adopter = repo.create(data)
    return adopter


@router.get("/", response_model=list[AdopterModel])
def search_adopter(
    query: AdopterQuery = Depends(),
    repo: SQLAdopterRepository = Depends(get_repository(SQLAdopterRepository)),
):
    result = repo.search(query)

    return result
