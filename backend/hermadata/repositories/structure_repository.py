from pydantic import BaseModel, ConfigDict

from hermadata.constants import StructureType
from hermadata.database.models import Structure
from hermadata.repositories import SQLBaseRepository
from sqlalchemy import select


class StructureModel(BaseModel):
    id: int
    name: str
    city_id: str | None = None
    address: str | None = None
    structure_type: StructureType

    model_config = ConfigDict(from_attributes=True)


class SQLStructureRepository(SQLBaseRepository):
    def get_all(self) -> list[StructureModel]:
        results = (
            self.session.execute(
                select(Structure).order_by(Structure.name)
            )
            .scalars()
            .all()
        )
        return [StructureModel.model_validate(r) for r in results]

    def get_by_id(self, structure_id: int) -> StructureModel | None:
        result = self.session.execute(
            select(Structure).where(Structure.id == structure_id)
        ).scalar_one_or_none()
        if result is None:
            return None
        return StructureModel.model_validate(result)
