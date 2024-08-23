from datetime import date
from pydantic import BaseModel
from sqlalchemy import func, insert, select
from hermadata.database.models import Adopter, Animal
from hermadata.models import PaginationResult, SearchQuery
from hermadata.repositories import SQLBaseRepository
from hermadata.repositories.animal.models import WhereClauseMapItem


class NewAdopter(BaseModel):
    name: str
    surname: str
    birth_date: date
    birth_city_code: str
    residence_city_code: str
    fiscal_code: str
    phone: str


class AdopterModel(NewAdopter):
    id: int


class AdopterSearchQuery(SearchQuery):
    name: str | None = None
    surname: str | None = None
    fiscal_code: str | None = None

    _where_clause_map: dict[str, WhereClauseMapItem] = {
        "name": WhereClauseMapItem(lambda v: Adopter.name.like(f"{v}%")),
        "surname": WhereClauseMapItem(lambda v: Adopter.surname.like(f"{v}%")),
        "fiscal_code": WhereClauseMapItem(
            lambda v: Adopter.fiscal_code.like(f"{v}%")
        ),
    }


class SQLAdopterRepository(SQLBaseRepository):

    def create(self, data: NewAdopter) -> AdopterModel:
        dump = data.model_dump()
        result = self.session.execute(insert(Adopter).values(**dump))

        self.session.flush()

        adopter_id = result.lastrowid

        return AdopterModel(**dump, id=adopter_id)

    def search(self, query: AdopterSearchQuery) -> list[AdopterModel]:
        where = query.as_where_clause()

        total = self.session.execute(
            select(func.count("*")).select_from(Adopter).where(*where)
        ).scalar_one()
        stmt = (
            select(Adopter)
            .select_from(Animal)
            .where(*where)
            .order_by(query.as_order_by_clause())
        )
        if query.from_index is not None:
            stmt = stmt.offset(query.from_index)
        if query.to_index is not None:
            stmt = stmt.limit(query.to_index - query.from_index or 0)

        result = self.session.execute(stmt).all()

        response = [
            AdopterModel.model_validate(r, from_attributes=True) for r in result
        ]

        return PaginationResult(items=response, total=total)
