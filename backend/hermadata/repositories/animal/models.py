from collections import namedtuple
from datetime import date, datetime
from enum import Enum
from typing import (
    Annotated,
    Any,
    Callable,
    Generic,
    Iterable,
    NamedTuple,
    Optional,
    TypeVar,
)

from pydantic import BaseModel, ConfigDict, Field, StringConstraints
from sqlalchemy import and_, or_
from sqlalchemy.orm import InstrumentedAttribute, MappedColumn

from hermadata.constants import EntryType, ExitType, RecurrenceType
from hermadata.database.models import Animal, AnimalEntry
from hermadata.models import PaginationQuery, Sex

rescue_city_code_PATTERN = r"[A-Z]\d{3}"

T = TypeVar("T")


FurColorName = Annotated[
    str,
    StringConstraints(strip_whitespace=True, to_upper=True, min_length=2, max_length=100),
]


class WhereClauseMapItem(NamedTuple):
    """
    * attribute_builder: callable which returns the attribute
    or a in iterable of attributes to put in the whereclause
    * in_or: bool which determines if the attribute should be put in or
    """

    attribute_builder: Callable[[Any], InstrumentedAttribute]
    in_or: bool = False


class NewAnimalModel(BaseModel):
    race_id: str
    rescue_city_code: str = Field(pattern=rescue_city_code_PATTERN)
    entry_type: str


class CompleteEntryModel(BaseModel):
    entry_date: date


class NewEntryModel(BaseModel):
    rescue_city_code: str = Field(pattern=rescue_city_code_PATTERN)
    entry_type: str


class AnimalSearchSortField(str, Enum):
    name = "name"
    entry_date = "entry_date"
    entry_city = "entry_city"
    created_at = "created_at"

    # TODO: this is bugged, rewrite


SORT_FIELD_MAP: dict[str, MappedColumn] = {
    AnimalSearchSortField.entry_date: AnimalEntry.entry_date,
    AnimalSearchSortField.created_at: Animal.created_at,
    AnimalSearchSortField.entry_city: AnimalEntry.origin_city_code,
}


class AnimalSearchModel(PaginationQuery):
    race_id: Optional[str] = None
    code: Optional[str] = None
    from_entry_date: date | None = None
    to_entry_date: date | None = None
    name: Optional[str] = None
    from_created_at: datetime | None = None
    to_created_at: datetime | None = None
    rescue_city_code: str | None = Field(pattern=rescue_city_code_PATTERN, default=None)
    entry_type: Optional[str] = None
    exit_type: Optional[str] = None
    present: bool = True
    not_present: bool = False
    chip_code: Optional[str] = None

    _where_clause_map: dict[str, WhereClauseMapItem] = {
        "name": WhereClauseMapItem(lambda v: Animal.name.like(f"{v}%")),
        "chip_code": WhereClauseMapItem(lambda v: Animal.chip_code.like(f"%{v}%")),
        "rescue_city_code": WhereClauseMapItem(lambda v: AnimalEntry.origin_city_code == v),
        "entry_type": WhereClauseMapItem(lambda v: AnimalEntry.entry_type == v),
        "exit_type": WhereClauseMapItem(lambda v: AnimalEntry.exit_type == v),
        "race_id": WhereClauseMapItem(lambda v: Animal.race_id == v),
        "from_entry_date": WhereClauseMapItem(lambda v: AnimalEntry.entry_date >= v),
        "to_entry_date": WhereClauseMapItem(lambda v: AnimalEntry.entry_date <= v),
        "from_created_at": WhereClauseMapItem(lambda v: Animal.created_at >= v),
        "to_created_at": WhereClauseMapItem(lambda v: Animal.created_at <= v),
        "present": WhereClauseMapItem(
            lambda v: (
                or_(
                    AnimalEntry.exit_date.is_(None),
                    AnimalEntry.exit_date > datetime.now().date(),
                )
                if v
                else None
            ),
            in_or=True,
        ),
        "not_present": WhereClauseMapItem(
            lambda v: (
                and_(
                    AnimalEntry.exit_date.is_not(None),
                    AnimalEntry.exit_date <= datetime.now().date(),
                )
                if v
                else None
            ),
            in_or=True,
        ),
    }

    def as_order_by_clause(self) -> MappedColumn | None:
        if not (self.sort_field and self.sort_order) and self.sort_field not in SORT_FIELD_MAP:
            return Animal.created_at.desc()
        column: MappedColumn = SORT_FIELD_MAP[self.sort_field]
        if self.sort_order == 1:
            return column.asc()
        if self.sort_order == -1:
            return column.desc()

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


class AnimalModel(BaseModel):
    code: str
    race_id: str
    rescue_city_code: str = Field(pattern=rescue_city_code_PATTERN)
    breed_id: int | None = None
    chip_code: str | None = None
    chip_code_set: bool
    name: str | None = None
    birth_date: date | None = None
    entry_date: date | None = None
    entry_type: EntryType | None = None
    sex: int | None = None
    sterilized: bool | None = None
    notes: str | None = None
    img_path: str | None = None
    fur: int | None = None
    color: int | None = None
    size: int | None = None
    exit_date: date | None = None
    exit_type: ExitType | None = None

    model_config = ConfigDict(extra="ignore")


class UpdateAnimalModel(BaseModel):
    name: str | None = None
    breed_id: int | None = None
    chip_code: str | None = Field(pattern=r"\d{3}\.\d{3}\.\d{3}\.\d{3}\.\d{3}", default=None)
    chip_code_set: bool | None = False

    sex: int | None = None
    sterilized: bool | None = None
    notes: str | None = None
    birth_date: date | None = None
    fur: int | None = None
    color: int | None = None
    size: int | None = None


class AnimalQueryModel(BaseModel):
    id: int = None
    code: str = None
    race_id: str = None
    rescue_city_code: str = Field(pattern=rescue_city_code_PATTERN, default=None)
    rescue_date: date = None


class AnimalSearchResult(BaseModel):
    id: int
    code: str
    name: str | None = None
    chip_code: str | None = None
    race_id: str
    entry_date: date | None = None
    rescue_city_code: str
    rescue_city: str
    rescue_province: str
    entry_type: str
    exit_date: date | None = None
    exit_type: str | None = None


AnimalSearchResultQuery = namedtuple("AnimalSearchResultQuery", AnimalSearchResult.model_fields.keys())

AnimalGetQuery = namedtuple("AnimalGetQuery", AnimalModel.model_fields.keys())


class NewAnimalDocument(BaseModel):
    document_id: int
    document_kind_code: str
    title: Annotated[str, StringConstraints(max_length=100)]


class AnimalDocumentModel(BaseModel):
    animal_id: int
    document_id: int
    document_kind_code: str
    created_at: datetime


class AnimalExit(BaseModel):
    exit_date: date
    exit_type: ExitType
    exit_data: dict | None = None
    adopter_id: int | None = None  # TODO: add validation based on exit_type
    location_address: str | None = None
    location_city_code: str | None = None
    notes: str | None = None


class ExtractionQuery(BaseModel):
    from_date: date
    to_date: date
    city_code: str


class AnimalDaysQuery(ExtractionQuery):
    pass


class AnimalEntriesQuery(ExtractionQuery):
    entry_type: EntryType | None = None


class AnimalExitsQuery(ExtractionQuery):
    exit_type: ExitType | None = None


class AnimalDaysItem(BaseModel):
    animal_name: str | None = None
    animal_chip_code: str | None = None
    animal_days: int


class AnimalDaysResult(BaseModel):
    items: list[AnimalDaysItem]
    total_days: int


class AnimalReportBaseItem(BaseModel):
    animal_race: str
    animal_name: str | None = None
    animal_chip_code: str | None = None
    animal_birth_date: date | None = None
    animal_sex: Sex | None = None


class AnimalEntriesItem(AnimalReportBaseItem):
    entry_date: date
    entry_type: EntryType
    entry_city: str


class AnimalReportResult(BaseModel, Generic[T]):
    items: list[T]
    total: int


class AnimalExitsItem(AnimalReportBaseItem):
    exit_date: date
    exit_type: ExitType


class AddMedicalRecordModel(BaseModel):
    causal: str
    price: int
    vet_id: int
    performed_at: date


class AnimalEntryModel(BaseModel):
    animal_id: int
    animal_name: str | None = None
    entry_date: date
    exit_date: date | None = None
    entry_type: EntryType
    exit_type: ExitType | None = None
    origin_city_code: str
    origin_city_name: str
    animal_race: str
    animal_race_id: str


class NewAdoption(BaseModel):
    animal_id: int
    adopter_id: int
    location_address: Annotated[str, StringConstraints(to_upper=True)] | None = None
    location_city_code: str | None = None


class AdoptionModel(BaseModel):
    id: int
    adopter_id: int
    animal_id: int


class MedicalActivityModel(BaseModel):
    recurrence_type: RecurrenceType | None
    recurrence_value: int | None
    name: str
    vet_id: int | None = None
    from_date: date | None = None
    to_date: date | None = None
    notes: str | None = None
