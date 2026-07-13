from datetime import date
from enum import Enum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints
from sqlalchemy import func, insert, select, update
from sqlalchemy.orm import MappedColumn

from hermadata.constants import DocKindCode
from hermadata.database.models import (
    Adopter,
    Adoption,
    AnimalDocument,
    Comune,
    DocumentKind,
)
from hermadata.models import PaginationResult, SearchQuery
from hermadata.repositories import SQLBaseRepository
from hermadata.repositories.animal.models import WhereClauseMapItem


class IDDocumentType(Enum):
    identity_card = "id"
    driving_licence = "dl"


class NewAdopter(BaseModel):
    name: Annotated[str, StringConstraints(to_upper=True)]
    surname: Annotated[str, StringConstraints(to_upper=True)]
    birth_date: date
    birth_city_code: str
    residence_city_code: str
    fiscal_code: Annotated[str, StringConstraints(to_upper=True)]
    phone: Annotated[str, StringConstraints(pattern=r"[\d\+\. ]+")]
    document_type: IDDocumentType
    document_number: str

    model_config = ConfigDict(use_enum_values=True)


class AdopterModel(NewAdopter):
    id: int
    document_type: IDDocumentType | None = None
    document_number: str | None = None


class AdopterSearchResult(AdopterModel):
    city: str | None = None


class AdopterSearchQuery(SearchQuery):
    name: str | None = None
    surname: str | None = None
    fiscal_code: str | None = None
    phone: str | None = None
    city: str | None = None

    _where_clause_map: dict[str, WhereClauseMapItem] = {
        "name": WhereClauseMapItem(
            lambda v: Adopter.name.like(f"{v}%"), False
        ),
        "surname": WhereClauseMapItem(
            lambda v: Adopter.surname.like(f"{v}%"), False
        ),
        "fiscal_code": WhereClauseMapItem(
            lambda v: Adopter.fiscal_code.like(f"{v}%"), False
        ),
        "phone": WhereClauseMapItem(
            lambda v: Adopter.phone.like(f"{v}%"), False
        ),
        "city": WhereClauseMapItem(lambda v: Comune.name.like(f"{v}%"), False),
    }

    def as_order_by_clause(self) -> MappedColumn:
        return Adopter.created_at


class SQLAdopterRepository(SQLBaseRepository):
    def create(self, data: NewAdopter) -> AdopterModel:
        dump = data.model_dump()
        result = self.session.execute(insert(Adopter).values(**dump))

        self.session.flush()

        adopter_id = result.lastrowid

        return AdopterModel.model_validate({**dump, "id": adopter_id})

    def search(
        self, query: AdopterSearchQuery
    ) -> PaginationResult[AdopterSearchResult]:
        where = query.as_where_clause()

        count_stmt = (
            select(func.count("*"))
            .select_from(Adopter)
            .join(
                Comune, Adopter.residence_city_code == Comune.id, isouter=True
            )
            .where(*where)
        )
        total = self.session.execute(count_stmt).scalar_one()

        stmt = (
            select(Adopter, Comune.name.label("city"))
            .join(
                Comune, Adopter.residence_city_code == Comune.id, isouter=True
            )
            .where(*where)
            .order_by(query.as_order_by_clause())
        )
        if query.from_index is not None:
            stmt = stmt.offset(query.from_index)
        if query.to_index is not None:
            stmt = stmt.limit(query.to_index - query.from_index or 0)

        rows = self.session.execute(stmt)

        response = [
            AdopterSearchResult.model_validate(
                {
                    **AdopterModel.model_validate(
                        row.Adopter, from_attributes=True
                    ).model_dump(),
                    "city": row.city,
                }
            )
            for row in rows
        ]

        return PaginationResult(items=response, total=total)

    def get_by_id(self, id: int) -> AdopterModel:
        result = self.session.get(Adopter, id)
        if not result:
            raise Exception("Adopter not found")
        return AdopterModel.model_validate(result, from_attributes=True)

    def update(self, id: int, data: NewAdopter) -> int:
        """Update an adopter and return the number of updated rows."""
        result = self.session.execute(
            update(Adopter).where(Adopter.id == id).values(**data.model_dump())
        )
        self.session.flush()
        return result.rowcount

    def mark_adopter_documents_dirty(self, adopter_id: int) -> int:
        """Flag the adopter's rendered adoption documents as stale (dirty).

        Called after the adopter's data is edited. Adopter data is embedded
        only in adoption (AD) documents, so we mark just those, scoped to the
        entries where this adopter has a non-voided adoption.
        """
        adozione_kind_id = (
            select(DocumentKind.id)
            .where(DocumentKind.code == DocKindCode.adozione.value)
            .scalar_subquery()
        )
        entry_ids = (
            select(Adoption.animal_entry_id)
            .where(
                Adoption.adopter_id == adopter_id,
                Adoption.deleted_at.is_(None),
            )
            .scalar_subquery()
        )
        result = self.session.execute(
            update(AnimalDocument)
            .where(
                AnimalDocument.animal_entry_id.in_(entry_ids),
                AnimalDocument.deleted_at.is_(None),
                AnimalDocument.dirty.is_(False),
                AnimalDocument.document_kind_id == adozione_kind_id,
            )
            .values(dirty=True)
        )
        self.session.flush()
        return result.rowcount
