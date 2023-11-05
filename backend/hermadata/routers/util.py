from fastapi import APIRouter
from hermadata.dependancies import get_session

from hermadata.repositories.city import ProvinciaModel, SQLCityRepository


router = APIRouter(prefix="/util")


@router.get("/province", response_model=list[ProvinciaModel])
def get_province():
    with get_session() as s:
        repo = SQLCityRepository(s)

        province = repo.get_province()
    return province
