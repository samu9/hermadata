from datetime import date
from hermadata.repositories import BaseRepository
from pydantic import BaseModel, constr
from sqlalchemy import insert
from sqlalchemy.orm import Session

from hermadata.database.models import Animal


class AnimalModel(BaseModel):
    code: str
    name: str
    race: str
    breed: str
    name: str = constr(max_length=100)
    birth_date: date | None
    sex: int
    origin_city_code: str = constr(pattern=r"[A-Z]\d{3}")


class AnimalRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__()


class SQLAnimalRepository(AnimalRepository):
    def __init__(self, session: Session) -> None:
        self.session = session

    def save(self, model: AnimalModel):
        result = self.session.execute(insert(Animal).values(**model.model_dump()))
        self.session.commit()
        return result
