from typing import Annotated

from fastapi import APIRouter, Depends

from hermadata.initializations import (
    get_adopter_repository,
    get_adopter_service,
)
from hermadata.models import PaginationResult
from hermadata.repositories.adopter_repository import (
    AdopterModel,
    AdopterSearchQuery,
    SQLAdopterRepository,
)
from hermadata.services.adopter_service import (
    AdopterService,
    NewAdopterRequest,
)

router = APIRouter(prefix="/adopter")


@router.post("", response_model=AdopterModel)
def create_adopter(
    data: NewAdopterRequest,
    service: Annotated[AdopterService, Depends(get_adopter_service)],
):
    adopter = service.create(data)
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
