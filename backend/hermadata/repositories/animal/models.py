from collections import namedtuple
from datetime import date, datetime
from typing import Any, Callable, Iterable, NamedTuple, Optional

from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import and_, or_
from sqlalchemy.orm import InstrumentedAttribute, MappedColumn

from hermadata.constants import DocKindCode, EntryType, ExitType
from hermadata.database.models import Animal, AnimalEntry
from hermadata.models import PaginationQuery

rescue_city_code_PATTERN = r"[A-Z]\d{3}"


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


class AnimalSearchModel(PaginationQuery):
    from_index: int | None = None
    to_index: int | None = None

    sort_field: str | None = None
    sort_order: int | None = None

    race_id: Optional[str] = None
    code: Optional[str] = None
    from_entry_date: date | None = None
    to_entry_date: date | None = None
    name: Optional[str] = None
    from_created_at: datetime | None = None
    to_created_at: datetime | None = None
    rescue_city_code: str | None = Field(
        pattern=rescue_city_code_PATTERN, default=None
    )
    entry_type: Optional[str] = None
    exit_type: Optional[str] = None
    present: bool = True
    not_present: bool = False
    chip_code: Optional[str] = None

    _sort_field_map: dict[str, MappedColumn] = {
        "entry_date": AnimalEntry.entry_date
    }
    _where_clause_map: dict[str, WhereClauseMapItem] = {
        "name": WhereClauseMapItem(lambda v: Animal.name.like(f"{v}%")),
        "chip_code": WhereClauseMapItem(
            lambda v: Animal.chip_code.like(f"%{v}%")
        ),
        "rescue_city_code": WhereClauseMapItem(
            lambda v: Animal.rescue_city_code == v
        ),
        "entry_type": WhereClauseMapItem(lambda v: AnimalEntry.entry_type == v),
        "exit_type": WhereClauseMapItem(lambda v: AnimalEntry.exit_type == v),
        "race_id": WhereClauseMapItem(lambda v: Animal.race_id == v),
        "from_entry_date": WhereClauseMapItem(
            lambda v: AnimalEntry.entry_date >= v
        ),
        "to_entry_date": WhereClauseMapItem(
            lambda v: AnimalEntry.entry_date <= v
        ),
        "from_created_at": WhereClauseMapItem(lambda v: Animal.created_at >= v),
        "to_created_at": WhereClauseMapItem(lambda v: Animal.created_at <= v),
        "present": WhereClauseMapItem(
            lambda v: v
            and (
                or_(
                    AnimalEntry.exit_date.is_(None),
                    AnimalEntry.exit_date > datetime.now().date(),
                ),
            )
            or None,
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
        if (
            not (self.sort_field and self.sort_order)
            and self.sort_field not in self._sort_field_map
        ):
            return Animal.created_at.desc()
        column: MappedColumn = self._sort_field_map[self.sort_field]
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
    size: int | None = None
    exit_date: date | None = None
    exit_type: ExitType | None = None

    model_config = ConfigDict(extra="ignore")


class UpdateAnimalModel(BaseModel):
    name: str | None = None
    breed_id: int | None = None
    chip_code: str | None = Field(
        pattern=r"\d{3}\.\d{3}\.\d{3}\.\d{3}\.\d{3}", default=None
    )
    chip_code_set: bool | None = False

    sex: int | None = None
    sterilized: bool | None = None
    notes: str | None = None
    birth_date: date | None = None
    fur: int | None = None
    size: int | None = None


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
    chip_code: str | None = None
    race_id: str
    entry_date: date | None = None
    rescue_city_code: str
    rescue_city: str
    rescue_province: str
    entry_type: str
    exit_date: date | None = None
    exit_type: str | None = None


AnimalSearchResultQuery = namedtuple(
    "AnimalSearchResultQuery", AnimalSearchResult.model_fields.keys()
)

AnimalGetQuery = namedtuple("AnimalGetQuery", AnimalModel.model_fields.keys())


class NewAnimalDocument(BaseModel):
    document_id: int
    document_kind_code: DocKindCode
    title: str


class AnimalDocumentModel(BaseModel):
    animal_id: int
    document_id: int
    document_kind_id: int
    created_at: datetime


class AnimalExit(BaseModel):
    exit_date: date
    exit_type: ExitType


class AnimalDaysQuery(BaseModel):
    from_date: date
    to_date: date
    city_code: str


class AnimalDaysItem(BaseModel):
    animal_name: str | None = None
    animal_chip_code: str | None = None
    animal_days: int


class AnimalDaysResult(BaseModel):
    items: list[AnimalDaysItem]
    total_days: int


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
