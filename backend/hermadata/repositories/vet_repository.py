from pydantic import BaseModel, constr
from sqlalchemy import insert, select
from hermadata.database.models import Vet
from hermadata.models import SearchQuery
from hermadata.repositories import SQLBaseRepository


class VetModel(BaseModel):
    id: int | None = None
    business_name: str = constr(max_length=100)
    fiscal_code: str = constr(
        pattern=r"\d{11}|[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]"
    )
    name: str | None = None
    surname: str | None = None


class SearchVetQuery(SearchQuery):
    fiscal_code: str | None = None
    business_name: str | None = None


class SQLVetRepository(SQLBaseRepository):

    def create(self, data: VetModel) -> VetModel:
        dump = data.model_dump(exclude_none=True)
        result = self.session.execute(insert(Vet).values(**dump))

        self.session.flush()

        adopter_id = result.lastrowid

        return VetModel(**dump, id=adopter_id)

    def search(self, query: SearchVetQuery) -> list[VetModel]:
        where = []
        if query.fiscal_code is not None:
            where.append(Vet.fiscal_code.like(f"{query.fiscal_code}%"))

        total = self.session.execute(
            select(func.count("*")).select_from(Vet).where(*where)
        ).scalar_one()
        result = self.session.execute(select(Vet).where(*where)).scalars().all()

        adopters = [
            VetModel.model_validate(r, from_attributes=True) for r in result
        ]

        return adopters
