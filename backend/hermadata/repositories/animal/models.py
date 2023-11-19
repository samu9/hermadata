from datetime import date, datetime
from pydantic import BaseModel, Field


rescue_city_code_PATTERN = r"[A-Z]\d{3}"


class NewAnimalModel(BaseModel):
    race_id: str
    rescue_city_code: str = Field(pattern=rescue_city_code_PATTERN)
    rescue_date: date


class AnimalSearchModel(BaseModel):
    race_id: str = None
    code: str = None
    from_rescue_date: date = None
    to_rescue_date: date = None
    name: str = None
    from_created_at: datetime = None
    to_created_at: datetime = None


class AnimalModel(BaseModel):
    code: str
    race_id: str
    rescue_city_code: str = Field(pattern=rescue_city_code_PATTERN)
    rescue_date: date
    breed_id: str = None
    name: str = None
    birth_date: date = None
    sex: int = None


class UpdateAnimalModel(BaseModel):
    name: str = None
    breed_id: str = None
    sex: int = None
    sterilized: bool = None
    notes: str = None


class AnimalQueryModel(BaseModel):
    id: int = None
    code: str = None
    race_id: str = None
    rescue_city_code: str = Field(
        pattern=rescue_city_code_PATTERN, default=None
    )
    rescue_date: date = None


class AnimalSearchResult(BaseModel):
    code: str
    name: str = None
    race_id: str
    rescue_date: date
    rescue_city_code: str
    rescue_city: str
    rescue_province: str
