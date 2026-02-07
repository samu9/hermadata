from pydantic import BaseModel, ConfigDict, constr
from sqlalchemy import select

from hermadata.database.models import Comune, Provincia
from hermadata.repositories import SQLBaseRepository


class ProvinciaModel(BaseModel):
    id: str = constr(pattern=r"[A-Z]{2}")
    name: str

    model_config = ConfigDict(from_attributes=True)


class ComuneModel(BaseModel):
    id: str = constr(pattern=r"[A-Z]\d{3}")
    name: str
    provincia: str = constr(pattern=r"[A-Z]{2}")

    model_config = ConfigDict(from_attributes=True)


class SQLCityRepository(SQLBaseRepository):
    def __init__(
        self,
        preferred_provinces: list[str] = None,
        preferred_cities: list[str] = None,
    ):
        self.preferred_provinces = preferred_provinces or []
        self.preferred_cities = preferred_cities or []

    def get_province(self) -> list[ProvinciaModel]:
        query_result = (
            self.session.execute(select(Provincia).order_by(Provincia.name))
            .scalars()
            .all()
        )
        result = sorted(
            [ProvinciaModel.model_validate(r) for r in query_result],
            key=lambda x: (x.id not in self.preferred_provinces, x.name),
        )

        return result

    def get_comuni(self, provincia: str) -> list[ComuneModel]:
        query_result = (
            self.session.execute(
                select(Comune)
                .where(Comune.provincia == provincia)
                .order_by(Comune.name)
            )
            .scalars()
            .all()
        )
        result = sorted(
            [ComuneModel.model_validate(r) for r in query_result],
            key=lambda x: (x.id not in self.preferred_cities, x.name),
        )

        return result

    def city_exists(self, city_code: str) -> bool:
        """Check if a city code exists in the database."""
        result = self.session.execute(
            select(Comune).where(Comune.id == city_code)
        ).first()
        return result is not None

    def get_comune(self, code: str) -> ComuneModel | None:
        result = self.session.execute(
            select(Comune).where(Comune.id == code)
        ).scalar_one_or_none()

        if result:
            return ComuneModel.model_validate(result)
        return None

