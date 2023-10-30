from hermadata.repositories import BaseRepository
from pydantic import BaseModel
from sqlalchemy import insert
from sqlalchemy.orm import Session

from hermadata.database.models import Animal


class AnimalModel(BaseModel):
    name: str


class AnimalRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__()


class SQLAnimalRepository(AnimalRepository):
    def __init__(self, session: Session) -> None:
        self.session = session

    def save(self, model: AnimalModel):
        result = self.session.execute(stmt=insert(Animal).values(name=model.name))
        return result
