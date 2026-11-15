from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends

from hermadata.constants import Permission
from hermadata.initializations import get_health_activity_repository
from hermadata.permissions import require_permission
from hermadata.repositories.health_activity_repository import (
    HealthActivityRead,
    HealthActivityWrite,
    SQLHealthActivityRepository,
)

router = APIRouter(
    prefix="/animal/{animal_id}/health-activities", tags=["health-activities"]
)
Repository = Annotated[
    SQLHealthActivityRepository, Depends(get_health_activity_repository)
]


@router.get(
    "",
    response_model=list[HealthActivityRead],
    dependencies=[
        Depends(require_permission(Permission.BROWSE_HEALTH_ACTIVITY))
    ],
)
def list_activities(
    animal_id: int,
    repo: Repository,
    description: str | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
):
    return repo.list_activities(animal_id, description, from_date, to_date)


@router.post(
    "",
    response_model=HealthActivityRead,
    status_code=201,
    dependencies=[
        Depends(require_permission(Permission.CREATE_HEALTH_ACTIVITY))
    ],
)
def create_activity(
    animal_id: int,
    data: HealthActivityWrite,
    repo: Repository,
):
    return repo.create(animal_id, data)


@router.put(
    "/{activity_id}",
    response_model=HealthActivityRead,
    dependencies=[
        Depends(require_permission(Permission.EDIT_HEALTH_ACTIVITY))
    ],
)
def update_activity(
    animal_id: int,
    activity_id: int,
    data: HealthActivityWrite,
    repo: Repository,
):
    return repo.update(animal_id, activity_id, data)


@router.delete(
    "/{activity_id}",
    status_code=204,
    dependencies=[
        Depends(require_permission(Permission.DELETE_HEALTH_ACTIVITY))
    ],
)
def delete_activity(animal_id: int, activity_id: int, repo: Repository):
    repo.delete(animal_id, activity_id)
