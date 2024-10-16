from fastapi import APIRouter, Depends

from hermadata.dependancies import get_repository
from hermadata.models import PaginationResult
from hermadata.repositories.adopter_repository import (
    AdopterModel,
    AdopterSearchQuery,
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


@router.get("/", response_model=AdopterModel)
def get_adopter(
    query: AdopterSearchQuery = Depends(),
    repo: SQLAdopterRepository = Depends(get_repository(SQLAdopterRepository)),
):
    result = repo.search(query)

    return result


@router.get("/search", response_model=PaginationResult[AdopterModel])
def search_adopter(
    query: AdopterSearchQuery = Depends(),
    repo: SQLAdopterRepository = Depends(get_repository(SQLAdopterRepository)),
):
    result = repo.search(query)

    return result
