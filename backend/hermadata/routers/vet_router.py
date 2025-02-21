from typing import Annotated

from fastapi import APIRouter, Depends

from hermadata.initializations import vet_repository
from hermadata.models import PaginationResult
from hermadata.repositories.vet_repository import (
    SearchVetQuery,
    SQLVetRepository,
    VetModel,
)

router = APIRouter(prefix="/vet")


@router.post("/", response_model=VetModel)
def create_vet(
    data: VetModel,
    repo: Annotated[SQLVetRepository, Depends(vet_repository)],
):
    vet = repo.create(data)
    return vet


@router.get("/search", response_model=PaginationResult[VetModel])
def search_vet(
    query: Annotated[SearchVetQuery, Depends()],
    repo: Annotated[SQLVetRepository, Depends(vet_repository)],
):
    result = repo.search(query)

    return result
