from fastapi import APIRouter, Depends
from hermadata.dependancies import get_session
from sqlalchemy.orm import Session
from hermadata.models import UtilElement
from hermadata.repositories.city_repository import (
    ComuneModel,
    ProvinciaModel,
    SQLCityRepository,
)


router = APIRouter(prefix="/util")


@router.get("/province", response_model=list[ProvinciaModel])
def get_province(session: Session = Depends(get_session)):
    repo = SQLCityRepository(session)

    province = repo.get_province()
    return province


@router.get("/comuni", response_model=list[ComuneModel])
def get_comuni(provincia: str, session: Session = Depends(get_session)):
    repo = SQLCityRepository(session)

    comuni = repo.get_comuni(provincia=provincia)
    return comuni


@router.get("/entry-types", response_model=list[UtilElement])
def get_entry_types():
    return [
        {
            "id": "R",
            "label": "Recupero",
        },
        {
            "id": "C",
            "label": "Conferimento",
        },
        {
            "id": "S",
            "label": "Sequestro",
        },
    ]


@router.get("/animal-stages", response_model=list[UtilElement])
def get_animal_stages():
    return [
        {
            "id": "S",
            "label": "Sanitario",
        },
        {
            "id": "R",
            "label": "Rifugio",
        },
        {"id": "P", "label": "Preaffido"},
    ]
