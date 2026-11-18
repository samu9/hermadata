from functools import cache
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select

from hermadata.constants import (
    ANIMAL_STAGE_LABELS,
    ENTRY_TYPE_LABELS,
    EXIT_TYPE_LABELS,
    EXIT_TYPE_RACES,
    FUR_LABELS,
    HEALTHCARE_STAGE_ENTRY_TYPES,
    SIZE_LABELS,
)
from hermadata.database.models import AnimalEventType
from hermadata.initializations import (
    get_animal_repository,
    get_city_repository,
)
from hermadata.models import (
    AnimalEventTypeModel,
    EntryTypeElement,
    ExitTypeElement,
    UtilElement,
)
from hermadata.permissions import require_superuser
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository
from hermadata.repositories.animal.models import FurColorName
from hermadata.repositories.city_repository import (
    ComuneModel,
    ProvinciaModel,
    SetComuneFavouriteModel,
    SQLCityRepository,
)
from hermadata.services.user_service import TokenData

router = APIRouter(prefix="/util")


@router.get("/events", response_model=list[AnimalEventTypeModel])
def get_animal_event_types(
    repo: Annotated[SQLAnimalRepository, Depends(get_animal_repository)],
):
    stmt = select(AnimalEventType)
    result = repo.session.execute(stmt).scalars().all()
    return result


@router.get("/province", response_model=list[ProvinciaModel])
def get_province(
    repo: Annotated[SQLCityRepository, Depends(get_city_repository)],
):
    province = repo.get_province()
    return province


@router.get("/comuni", response_model=list[ComuneModel])
def get_comuni(
    repo: Annotated[SQLCityRepository, Depends(get_city_repository)],
    provincia: str | None = None,
):
    comuni = repo.get_comuni(provincia=provincia)
    return comuni


@router.get("/comune/{code}", response_model=ComuneModel | None)
def get_comune(
    code: str,
    repo: Annotated[SQLCityRepository, Depends(get_city_repository)],
):
    return repo.get_comune(code)


@router.put("/comune/{code}/favourite", response_model=ComuneModel)
def set_comune_favourite(
    code: str,
    data: SetComuneFavouriteModel,
    current_user: Annotated[TokenData, Depends(require_superuser)],
    repo: Annotated[SQLCityRepository, Depends(get_city_repository)],
):
    """Mark or unmark a comune as favourite: favourite comuni are listed
    first in the comune pickers. Superuser only."""
    if not repo.city_exists(code):
        raise HTTPException(status_code=404, detail="Comune not found")
    repo.set_favourite(code, data.favourite)
    return repo.get_comune(code)


@router.get("/entry-types", response_model=list[EntryTypeElement])
def get_entry_types():
    result = [
        EntryTypeElement(
            id=k.value,
            label=v,
            healthcare_stage=k in HEALTHCARE_STAGE_ENTRY_TYPES,
        )
        for k, v in ENTRY_TYPE_LABELS.items()
    ]
    return result


@router.get("/exit-types", response_model=list[ExitTypeElement])
def get_exit_types(race_id: str | None = None):
    result = []
    for k, v in EXIT_TYPE_LABELS.items():
        races = EXIT_TYPE_RACES.get(k)
        if race_id and races is not None and race_id not in races:
            continue
        result.append(
            ExitTypeElement(
                id=k.value,
                label=v,
                race_ids=sorted(races) if races is not None else None,
            )
        )
    return result


@router.get("/animal-size", response_model=list[UtilElement])
def get_animal_sizes():
    result = [UtilElement(id=k.value, label=v) for k, v in SIZE_LABELS.items()]
    return result


@router.get("/animal-fur", response_model=list[UtilElement])
def get_animal_fur_types():
    result = [UtilElement(id=k.value, label=v) for k, v in FUR_LABELS.items()]
    return result


@router.get("/animal-stages", response_model=list[UtilElement])
@cache
def get_animal_stages():
    result = [
        UtilElement(id=k.value, label=v)
        for k, v in ANIMAL_STAGE_LABELS.items()
    ]
    return result


@router.get("/fur-color", response_model=list[UtilElement])
def get_animal_fur_colors(
    repo: Annotated[SQLAnimalRepository, Depends(get_animal_repository)],
):
    colors = repo.get_fur_colors()

    return colors


class NewFurColor(BaseModel):
    name: FurColorName


@router.post("/fur-color", response_model=UtilElement)
def add_fur_color(
    data: NewFurColor,
    repo: Annotated[SQLAnimalRepository, Depends(get_animal_repository)],
):
    color = repo.add_fur_color(data.name)

    return color
