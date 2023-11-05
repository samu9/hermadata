from fastapi import APIRouter, Depends
from hermadata.dependancies import get_session
from sqlalchemy.orm import Session
from hermadata.repositories.city import ComuneModel, ProvinciaModel, SQLCityRepository


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
