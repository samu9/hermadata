from datetime import date
from pydantic import BaseModel
from sqlalchemy import insert
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


class SQLAdopterRepository(BaseRepository):
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(self, data: NewAdopter) -> AdopterModel:
        dump = data.model_dump()
        result = self.session.execute(insert(Adopter).values(**dump))

        self.session.flush()

        adopter_id = result.lastrowid

        return AdopterModel(**dump, id=adopter_id)
