from fastapi import APIRouter, Depends

from hermadata.dependancies import get_repository
from hermadata.repositories.vet_repository import (
    SQLVetRepository,
    VetModel,
    VetQuery,
)


router = APIRouter(prefix="/vet")


@router.post("/", response_model=VetModel)
def create_vet(
    data: VetModel,
    repo: SQLVetRepository = Depends(get_repository(SQLVetRepository)),
):
    adopter = repo.create(data)
    return adopter


@router.get("/", response_model=list[VetModel])
def search_adopter(
    query: VetQuery = Depends(),
    repo: SQLVetRepository = Depends(get_repository(SQLVetRepository)),
):
    result = repo.search(query)

    return result
