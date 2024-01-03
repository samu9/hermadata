from fastapi import APIRouter, Depends
from hermadata.dependancies import RepositoryFactory

from hermadata.repositories.adopter_repository import (
    AdopterModel,
    NewAdopter,
    SQLAdopterRepository,
)


router = APIRouter(prefix="/adopter")


@router.post("/", response_model=AdopterModel)
def create_adopter(
    data: NewAdopter,
    repo: SQLAdopterRepository = Depends(
        RepositoryFactory(SQLAdopterRepository)
    ),
):
    adopter = repo.create(data)
    return adopter
