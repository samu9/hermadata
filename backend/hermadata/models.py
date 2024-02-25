from typing import Generic, TypeVar
from pydantic import BaseModel

from hermadata.constants import ApiErrorCode


T = TypeVar("T")


class PaginationQuery(BaseModel):
    from_index: int | None = None
    to_index: int | None = None


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
