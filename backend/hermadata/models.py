from typing import Annotated, Generic, Iterable, TypeVar

from pydantic import BaseModel, BeforeValidator, StringConstraints
from sqlalchemy import or_
from sqlalchemy.orm import MappedColumn

from hermadata.constants import ApiErrorCode

T = TypeVar("T")


class PaginationQuery(BaseModel):
    from_index: int | None = None
    to_index: int | None = None

    sort_field: str | None = None
    sort_order: int | None = None


class SearchQuery(PaginationQuery):
    def as_where_clause(self) -> list:
        or_elems = []
        where = []
        for field in self._where_clause_map.keys():
            value = getattr(self, field)
            if value is None:
                continue
            builder, in_or = self._where_clause_map[field]
            attribute = builder(value)

            to_add = or_elems if in_or else where
            if isinstance(attribute, Iterable):
                to_add.extend(attribute)
            else:
                to_add.append(attribute)

        if or_elems:
            where.append(or_(*or_elems))
        return where

    def as_order_by_clause(self) -> MappedColumn | None: ...


class PaginationResult(BaseModel, Generic[T]):
    total: int
    items: list[T] = []


class UtilElement(BaseModel):
    id: str | int
    label: str


class EntryTypeElement(BaseModel):
    id: str
    label: str
    healthcare_stage: bool


class ApiError(BaseModel):
    code: ApiErrorCode
    content: dict
    message: str | None = None


def int_to_sex(v: int | str) -> str:
    if isinstance(v, int):
        if v > 1 or v < 0:
            raise ValueError("int value representing sex must be 0 or 1")
        if v == 0:
            return "M"
        if v == 1:
            return "F"
    return v


Sex = Annotated[
    str, StringConstraints(pattern=r"[MF]"), BeforeValidator(int_to_sex)
]
