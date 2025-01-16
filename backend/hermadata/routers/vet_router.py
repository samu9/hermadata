from fastapi import APIRouter, Depends

from hermadata.models import PaginationResult
from hermadata.repositories.vet_repository import (
    SQLVetRepository,
    VetModel,
    SearchVetQuery,
)
from hermadata.initializations import vet_repository

router = APIRouter(prefix="/vet")


@router.post("/", response_model=VetModel)
def create_vet(
    data: VetModel,
    repo: SQLVetRepository = Depends(vet_repository),
):
    vet = repo.create(data)
    return vet


@router.get("/search", response_model=PaginationResult[VetModel])
def search_vet(
    query: SearchVetQuery = Depends(),
    repo: SQLVetRepository = Depends(vet_repository),
):
    result = repo.search(query)

    return result
