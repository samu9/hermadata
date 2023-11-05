from pydantic import BaseModel, ConfigDict, constr
from sqlalchemy import delete, insert, select
from hermadata.database.models import Race
from hermadata.repositories import BaseRepository
from sqlalchemy.orm import Session


class RaceModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str = constr(pattern=r"[A-Z]")
    name: str


class RaceQuery(BaseModel):
    code: str = constr(pattern=r"[A-Z]")


class SQLRaceRepository(BaseRepository):
    def __init__(self, session: Session) -> None:
        self.session = session

    def save(self, model: RaceModel):
        result = self.session.execute(insert(Race).values(**model.model_dump()))
        self.session.flush()
        return result

    def get_all(self, columns=[]) -> list[RaceModel]:
        select_result = self.session.execute(select(Race)).scalars().all()

        result = [RaceModel.model_validate(r) for r in select_result]

        return result

    def delete(self, id_: int = None, code: str = None):
        where = []
        if id_:
            where.append(Race.id == id_)
        if code:
            where.append(Race.code == code)

        result = self.session.execute(delete(Race).where(*where))
        return result
