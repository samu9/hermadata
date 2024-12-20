from fastapi import APIRouter, Depends

from hermadata.models import PaginationResult
from hermadata.repositories.adopter_repository import (
    AdopterModel,
    AdopterSearchQuery,
    NewAdopter,
    SQLAdopterRepository,
)
from hermadata.initializations import adopter_repository

router = APIRouter(prefix="/adopter")


@router.post("/", response_model=AdopterModel)
def create_adopter(
    data: NewAdopter,
    repo: SQLAdopterRepository = Depends(adopter_repository),
):
    adopter = repo.create(data)
    return adopter


@router.get("/", response_model=AdopterModel)
def get_adopter(
    query: AdopterSearchQuery = Depends(),
    repo: SQLAdopterRepository = Depends(adopter_repository),
):
    result = repo.search(query)

    return result


@router.get("/search", response_model=PaginationResult[AdopterModel])
def search_adopter(
    query: AdopterSearchQuery = Depends(),
    repo: SQLAdopterRepository = Depends(adopter_repository),
):
    result = repo.search(query)

    return result
