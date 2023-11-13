from datetime import date
from hermadata.repositories import BaseRepository
from pydantic import BaseModel, Field, constr
from sqlalchemy import func, insert, select
from sqlalchemy.orm import Session

from hermadata.database.models import Animal, Breed, Race


class NewAnimalModel(BaseModel):
    race: str
    origin_city_code: str = Field(pattern=r"[A-Z]\d{3}")
    finding_date: date


class AnimalModel(BaseModel):
    code: str
    race: str
    origin_city_code: str = Field(pattern=r"[A-Z]\d{3}")
    finding_date: date
    breed: str = None
    name: str = None
    birth_date: date = None
    sex: int = None


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
        race_id = self.session.execute(select(Race.id).where(Race.code == model.race)).scalar_one()
        breed_id = None
        if model.breed:
            breed_id = self.session.execute(select(Breed.id).where(Breed.code == model.breed)).scalar_one()
        data = model.model_dump()
        data.pop("breed")
        data.pop("race")
        data["race_id"] = race_id
        data["breed_id"] = breed_id
        result = self.session.execute(insert(Animal).values(**data))
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
            .select_from(Animal)
            .join(Race, Race.id == Animal.race_id)
            .where(
                Race.code == race_code,
                Animal.origin_city_code == origin_city_code,
                Animal.finding_date == finding_date,
            )
        ).scalar_one()

        code = race_code + origin_city_code + finding_date.strftime("%y%m%d") + str(current_animals).zfill(2)

        return code
