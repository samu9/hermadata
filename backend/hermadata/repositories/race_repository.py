from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import delete, insert, select

from hermadata.database.models import Race
from hermadata.repositories import SQLBaseRepository


class RaceModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(pattern=r"[A-Z]")
    name: str


class RaceQuery(BaseModel):
    id: str = Field(pattern=r"[A-Z]")


class SQLRaceRepository(SQLBaseRepository):
    def save(self, model: RaceModel):
        result = self.session.execute(
            insert(Race).values(**model.model_dump())
        )
        self.session.flush()
        return result

    def get_all(self) -> list[RaceModel]:
        select_result = self.session.execute(select(Race)).scalars().all()

        result = [RaceModel.model_validate(r) for r in select_result]

        return result

    def delete(self, id_: int = None):
        where = []
        if id_:
            where.append(Race.id == id_)

        result = self.session.execute(delete(Race).where(*where))
        return result
