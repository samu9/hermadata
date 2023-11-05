from pydantic import BaseModel, ConfigDict, constr
from sqlalchemy import select
from sqlalchemy.orm import Session
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
    def __init__(self, session: Session) -> None:
        super().__init__(session)

    def get_province(self) -> list[ProvinciaModel]:
        query_result = (
            self.session.execute(select(Provincia).order_by(Provincia.name)).scalars().all()
        )
        result = [ProvinciaModel.model_validate(r) for r in query_result]

        return result

    def get_comuni(self, provincia: str) -> list[ComuneModel]:
        query_result = (
            self.session.execute(
                select(Comune).where(Comune.provincia == provincia).order_by(Comune.name)
            )
            .scalars()
            .all()
        )
        result = [ComuneModel.model_validate(r) for r in query_result]

        return result
