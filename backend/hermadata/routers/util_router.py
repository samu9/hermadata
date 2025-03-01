from functools import cache
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from hermadata.constants import (
    ANIMAL_STAGE_LABELS,
    ENTRY_TYPE_LABELS,
    EXIT_TYPE_LABELS,
    FUR_LABELS,
    SIZE_LABELS,
)
from hermadata.initializations import animal_repository, city_repository
from hermadata.models import UtilElement
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository
from hermadata.repositories.animal.models import FurColorName
from hermadata.repositories.city_repository import (
    ComuneModel,
    ProvinciaModel,
    SQLCityRepository,
)

router = APIRouter(prefix="/util")


@router.get("/province", response_model=list[ProvinciaModel])
def get_province(repo: Annotated[SQLCityRepository, Depends(city_repository)]):
    province = repo.get_province()
    return province


@router.get("/comuni", response_model=list[ComuneModel])
def get_comuni(provincia: str, repo: Annotated[SQLCityRepository, Depends(city_repository)]):
    comuni = repo.get_comuni(provincia=provincia)
    return comuni


@router.get("/entry-types", response_model=list[UtilElement])
def get_entry_types():
    result = [UtilElement(id=k.value, label=v) for k, v in ENTRY_TYPE_LABELS.items()]
    return result


@router.get("/exit-types", response_model=list[UtilElement])
def get_exit_types():
    result = [UtilElement(id=k.value, label=v) for k, v in EXIT_TYPE_LABELS.items()]
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
    result = [UtilElement(id=k.value, label=v) for k, v in ANIMAL_STAGE_LABELS.items()]
    return result


@router.get("/fur-color", response_model=list[UtilElement])
def get_animal_fur_colors(repo: Annotated[SQLAnimalRepository, Depends(animal_repository)]):
    colors = repo.get_fur_colors()

    return colors


class NewFurColor(BaseModel):
    name: FurColorName


@router.post("/fur-color", response_model=UtilElement)
def add_fur_color(data: NewFurColor, repo: Annotated[SQLAnimalRepository, Depends(animal_repository)]):
    color = repo.add_fur_color(data.name)

    return color
