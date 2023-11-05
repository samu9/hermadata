from datetime import date
from hermadata.repositories import BaseRepository
from pydantic import BaseModel, constr
from sqlalchemy import func, insert, select
from sqlalchemy.orm import Session

from hermadata.database.models import Animal, Race


class NewAnimalModel(BaseModel):
    code: str
    race: str
    origin_city_code: str = constr(pattern=r"[A-Z]\d{3}")
    finding_date: date


class AnimalModel(BaseModel):
    code: str
    race: str
    name: str | None
    breed: str | None
    name: str | None = constr(max_length=100)
    birth_date: date | None
    sex: int
    origin_city_code: str = constr(pattern=r"[A-Z]\d{3}")


class AnimalQueryModel(BaseModel):
    race_code: str | None
    origin_city_code: str | None
    finding_date: date | None


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

    def get(self, query: AnimalQueryModel, columns=[]):
        where = []
        if query.code is not None:
            where.append(Animal.code == query.code)
        if query.finding_date is not None:
            where.append(Animal.finding_date == query.finding_date)

        if query.origin_city_code is not None:
            where.append(Animal.origin_city_code == query.origin_city_code)

        result = self.session.execute(select(Animal).where(*where))
        return result

    def generate_code(self, race_code: str, origin_city_code: str, finding_date: date):
        current_animals = self.session.execute(
            select(func.count("*"))
            .join(Race, Race.id == Animal.race_id)
            .where(
                Race.code == race_code,
                Animal.origin_city_code == origin_city_code,
                Animal.finding_date == finding_date,
            )
        ).scalar_one()

        code = race_code + origin_city_code + finding_date.strftime("%y%m%d") + hex(current_animals)

        return code
