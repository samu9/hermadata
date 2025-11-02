from typing import Annotated

from fastapi import APIRouter, Depends

from hermadata.constants import Permission
from hermadata.initializations import get_vet_repository
from hermadata.models import PaginationResult
from hermadata.permissions import require_permission
from hermadata.repositories.vet_repository import (
    SearchVetQuery,
    SQLVetRepository,
    VetModel,
)
from hermadata.services.user_service import TokenData

router = APIRouter(prefix="/vet")


@router.post("", response_model=VetModel)
def create_vet(
    data: VetModel,
    repo: Annotated[SQLVetRepository, Depends(get_vet_repository)],
):
    vet = repo.create(data)
    return vet


@router.get("/search", response_model=PaginationResult[VetModel])
def search_vet(
    query: Annotated[SearchVetQuery, Depends()],
    repo: Annotated[SQLVetRepository, Depends(get_vet_repository)],
    current_user: Annotated[
        TokenData, Depends(require_permission(Permission.BROWSE_VETS))
    ],
):
    result = repo.search(query)

    return result
