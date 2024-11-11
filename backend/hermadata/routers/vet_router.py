from fastapi import APIRouter, Depends

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
    adopter = repo.create(data)
    return adopter


@router.get("/search", response_model=list[VetModel])
def search_vet(
    query: SearchVetQuery = Depends(),
    repo: SQLVetRepository = Depends(vet_repository),
):
    result = repo.search(query)

    return result
