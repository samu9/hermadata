from typing import Generic, TypeVar
from pydantic import BaseModel


T = TypeVar("T")


class PaginationQuery(BaseModel):
    from_index: int | None = None
    to_index: int | None = None


class PaginationResult(BaseModel, Generic[T]):
    total: int
    items: list[T] = []
