from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field

from hermadata.models import PaginationQuery


rescue_city_code_PATTERN = r"[A-Z]\d{3}"


class NewAnimalEntryModel(BaseModel):
    race_id: str
    rescue_city_code: str = Field(pattern=rescue_city_code_PATTERN)
    entry_type: str


class AnimalSearchModel(PaginationQuery):
    from_index: int | None = None
    to_index: int | None = None
    race_id: str | None = None
    code: str | None = None
    from_entry_date: date | None = None
    to_entry_date: date | None = None
    name: str | None = None
    from_created_at: datetime | None = None
    to_created_at: datetime | None = None


class AnimalModel(BaseModel):
    code: str
    race_id: str
    rescue_city_code: str = Field(pattern=rescue_city_code_PATTERN)
    breed_id: str | None = None
    chip_code: str | None = None
    name: str | None = None
    birth_date: date | None = None
    entry_date: date | None = None
    sex: int | None = None
    sterilized: bool | None = None

    model_config = ConfigDict(extra="ignore")


class UpdateAnimalModel(BaseModel):
    name: str | None = None
    breed_id: str | None = None
    chip_code: str | None = None
    sex: int | None = None
    sterilized: bool | None = None
    notes: str | None = None
    entry_date: date | None = None


class AnimalQueryModel(BaseModel):
    id: int = None
    code: str = None
    race_id: str = None
    rescue_city_code: str = Field(
        pattern=rescue_city_code_PATTERN, default=None
    )
    rescue_date: date = None


class AnimalSearchResult(BaseModel):
    id: int
    code: str
    name: str | None = None
    race_id: str
    entry_date: date | None = None
    rescue_city_code: str
    rescue_city: str
    rescue_province: str
