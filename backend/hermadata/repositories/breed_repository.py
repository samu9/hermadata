from pydantic import BaseModel, constr
from sqlalchemy import delete, insert, select
from hermadata.database.models import Breed, Race
from hermadata.repositories import BaseRepository
from sqlalchemy.orm import Session


class AddBreedModel(BaseModel):
    race_id: str = constr(max_length=1, min_length=1)
    name: str


class BreedModel(AddBreedModel):
    id: int
    name: str
    race_id: str


class SQLBreedRepository(BaseRepository):
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(self, data: AddBreedModel):
        result = self.session.execute(insert(Breed).values(**data.model_dump()))
        self.session.flush()

        new_breed = BreedModel(**data.model_dump(), id=result.lastrowid)
        return new_breed

    def get_all(self, race_id: str, columns=[]) -> list[BreedModel]:
        select_result = (
            self.session.execute(select(Breed).where(Breed.race_id == race_id))
            .scalars()
            .all()
        )

        result = [
            BreedModel.model_validate(r, from_attributes=True)
            for r in select_result
        ]

        return result

    def delete(self, id_: int = None):
        where = []
        if id_:
            where.append(Race.id == id_)

        result = self.session.execute(delete(Race).where(*where))
        return result
