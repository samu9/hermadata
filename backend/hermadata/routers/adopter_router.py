from typing import Annotated

from fastapi import APIRouter, Depends

from hermadata.initializations import get_adopter_repository
from hermadata.models import PaginationResult
from hermadata.repositories.adopter_repository import (
    AdopterModel,
    AdopterSearchQuery,
    NewAdopter,
    SQLAdopterRepository,
)

router = APIRouter(prefix="/adopter")


@router.post("", response_model=AdopterModel)
def create_adopter(
    data: NewAdopter,
    repo: Annotated[SQLAdopterRepository, Depends(get_adopter_repository)],
):
    adopter = repo.create(data)
    return adopter


@router.get("", response_model=PaginationResult[AdopterModel])
def get_adopter(
    query: Annotated[AdopterSearchQuery, Depends()],
    repo: Annotated[SQLAdopterRepository, Depends(get_adopter_repository)],
):
    result = repo.search(query)

    return result


@router.get("/search", response_model=PaginationResult[AdopterModel])
def search_adopter(
    query: Annotated[AdopterSearchQuery, Depends()],
    repo: Annotated[SQLAdopterRepository, Depends(get_adopter_repository)],
):
    result = repo.search(query)

    return result
