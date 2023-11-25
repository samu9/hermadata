from datetime import date, datetime, timedelta
from hermadata.models import PaginationResult
from hermadata.repositories import BaseRepository
from sqlalchemy import func, insert, select, update
from sqlalchemy.orm import Session

from hermadata.database.models import Animal, Comune
from hermadata.repositories.animal.models import (
    AnimalModel,
    AnimalQueryModel,
    AnimalSearchModel,
    AnimalSearchResult,
    NewAnimalEntryModel,
    UpdateAnimalModel,
)


class AnimalRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__()


class SQLAnimalRepository(AnimalRepository):
    def __init__(self, session: Session) -> None:
        self.session = session

    def save(self, model: AnimalModel):
        data = model.model_dump()
        result = self.session.execute(insert(Animal).values(**data))
        self.session.commit()
        return result

    def insert_new_entry(self, data: NewAnimalEntryModel):
        code = self.generate_code(
            race_id=data.race_id,
            rescue_city_code=data.rescue_city_code,
            rescue_date=datetime.now().date(),
        )

        self.session.execute(
            insert(Animal).values(code=code, **data.model_dump())
        )
        self.session.commit()

        return code

    def get(self, query: AnimalQueryModel, columns=[]):
        where = []
        if query.id is not None:
            where.append(Animal.id == query.id)
        if query.code is not None:
            where.append(Animal.code == query.code)
        if query.rescue_date is not None:
            where.append(Animal.rescue_date == query.rescue_date)

        if query.rescue_city_code is not None:
            where.append(Animal.rescue_city_code == query.rescue_city_code)

        result = self.session.execute(select(Animal).where(*where))
        return result

    def search(self, query: AnimalSearchModel):
        """
        Return the minimum data set of a list of animals which match the search query.
        """

        where = []

        if query.code is not None:
            where.append(Animal.code.like(f"%{query.code}%"))
        if query.race_id is not None:
            where.append(Animal.race_id == query.race_id)
        if query.from_entry_date is not None:
            where.append(Animal.entry_date >= query.from_entry_date)
        if query.to_entry_date is not None:
            where.append(Animal.entry_date <= query.to_entry_date)
        if query.from_created_at is not None:
            where.append(Animal.created_at >= query.from_created_at)
        if query.to_created_at is not None:
            where.append(Animal.created_at <= query.to_created_at)
        if query.name is not None:
            where.append(Animal.name.like(f"{query.name}%"))

        total = self.session.execute(
            select(func.count("*")).select_from(Animal).where(*where)
        ).scalar_one()
        stmt = (
            select(
                Animal.code,
                Animal.name,
                Animal.race_id,
                Animal.entry_date,
                Animal.rescue_city_code,
                Comune.name,
                Comune.provincia,
            )
            .select_from(Animal)
            .join(Comune, Comune.id == Animal.rescue_city_code)
            .where(*where)
        )
        if query.from_index is not None:
            stmt.offset(query.from_index)
        if query.to_index is not None:
            stmt.limit(query.to_index - query.from_index or 0)

        result = self.session.execute(stmt).all()

        response = [
            AnimalSearchResult(
                code=code,
                name=name,
                race_id=race_id,
                entry_date=entry_date,
                rescue_city_code=rescue_city_code,
                rescue_city=rescue_city,
                rescue_province=rescue_province,
            )
            for code, name, race_id, entry_date, rescue_city_code, rescue_city, rescue_province in result
        ]

        return PaginationResult(items=response, total=total)

    def generate_code(
        self, race_id: str, rescue_city_code: str, rescue_date: date = None
    ):
        rescue_date = rescue_date or datetime.now().date()
        current_animals = self.session.execute(
            select(func.count("*"))
            .select_from(Animal)
            .where(
                Animal.race_id == race_id,
                Animal.rescue_city_code == rescue_city_code,
                Animal.created_at.between(
                    rescue_date, rescue_date + timedelta(1)
                ),
            )
        ).scalar_one()

        code = (
            race_id
            + rescue_city_code
            + rescue_date.strftime("%y%m%d")
            + str(current_animals).zfill(2)
        )

        return code

    def update(self, code: str, updates: UpdateAnimalModel):
        values = updates.model_dump(exclude_none=True)
        result = self.session.execute(
            update(Animal).where(Animal.code == code).values(**values)
        )

        self.session.commit()

        return result.rowcount

    def add_adoption(self):
        pass
