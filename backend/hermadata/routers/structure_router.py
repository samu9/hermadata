from typing import Annotated

from fastapi import APIRouter, Depends

from hermadata.initializations import (
    get_current_user,
    get_structure_repository,
)
from hermadata.repositories.structure_repository import (
    SQLStructureRepository,
    StructureModel,
)
from hermadata.services.user_service import TokenData

router = APIRouter(prefix="/structure")


@router.get("", response_model=list[StructureModel])
def list_structures(
    repo: Annotated[SQLStructureRepository, Depends(get_structure_repository)],
    current_user: Annotated[TokenData, Depends(get_current_user)],
) -> list[StructureModel]:
    return repo.get_all()
