from functools import cache
from fastapi import APIRouter, Depends
from hermadata.constants import ANIMAL_STAGE_LABELS, ENTRY_TYPE_LABELS
from hermadata.dependancies import RepositoryFactory
from hermadata.models import UtilElement
from hermadata.repositories.city_repository import (
    ComuneModel,
    ProvinciaModel,
    SQLCityRepository,
)


router = APIRouter(prefix="/util")


@router.get("/province", response_model=list[ProvinciaModel])
def get_province(
    repo: SQLCityRepository = Depends(RepositoryFactory(SQLCityRepository)),
):
    province = repo.get_province()
    return province


@router.get("/comuni", response_model=list[ComuneModel])
def get_comuni(
    provincia: str,
    repo: SQLCityRepository = Depends(RepositoryFactory(SQLCityRepository)),
):
    comuni = repo.get_comuni(provincia=provincia)
    return comuni


@router.get("/entry-types", response_model=list[UtilElement])
def get_entry_types():
    result = [
        UtilElement(id=k.value, label=v) for k, v in ENTRY_TYPE_LABELS.items()
    ]
    return result


@router.get("/animal-stages", response_model=list[UtilElement])
@cache
def get_animal_stages():
    result = [
        UtilElement(id=k.value, label=v) for k, v in ANIMAL_STAGE_LABELS.items()
    ]
    return result
