from typing import Generic, Iterable, TypeVar
from pydantic import BaseModel

from hermadata.constants import ApiErrorCode
from sqlalchemy import or_


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


class PaginationResult(BaseModel, Generic[T]):
    total: int
    items: list[T] = []


class UtilElement(BaseModel):
    id: str | int
    label: str


class ApiError(BaseModel):
    code: ApiErrorCode
    content: dict
    message: str | None = None
