from datetime import date
from pydantic import BaseModel
from sqlalchemy import insert, select
from hermadata.database.models import Adopter
from hermadata.repositories import BaseRepository
from sqlalchemy.orm import Session


class NewAdopter(BaseModel):
    name: str
    surname: str
    birth_date: date
    birth_city_code: str
    residence_city_code: str
    fiscal_code: str
    phone: str


class AdopterModel(NewAdopter):
    id: int


class AdopterQuery(BaseModel):
    name: str | None = None
    surname: str | None = None
    fiscal_code: str | None = None


class SQLAdopterRepository(BaseRepository):
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(self, data: NewAdopter) -> AdopterModel:
        dump = data.model_dump()
        result = self.session.execute(insert(Adopter).values(**dump))

        self.session.flush()

        adopter_id = result.lastrowid

        return AdopterModel(**dump, id=adopter_id)

    def search(self, query: AdopterQuery) -> list[AdopterModel]:
        where = []
        if query.fiscal_code is not None:
            where.append(Adopter.fiscal_code == query.fiscal_code)

        result = (
            self.session.execute(select(Adopter).where(*where)).scalars().all()
        )

        adopters = [
            AdopterModel.model_validate(r, from_attributes=True) for r in result
        ]

        return adopters
