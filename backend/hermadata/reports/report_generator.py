import logging
import os
import re
from collections import defaultdict
from datetime import date
from enum import Enum
from io import BytesIO
from typing import Annotated

import openpyxl
from jinja2 import Environment
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.worksheet.worksheet import Worksheet
from pydantic import (
    AfterValidator,
    BaseModel,
    Field,
    PlainSerializer,
    StringConstraints,
    computed_field,
    field_serializer,
    field_validator,
    model_validator,
)
from weasyprint import CSS, HTML

from hermadata.constants import (
    ENTRY_TYPE_LABELS,
    EXIT_TYPE_LABELS,
    FUR_LABELS,
    ID_DOCUMENT_TYPE_LABELS,
    SIZE_LABELS,
    AnimalFur,
    AnimalSize,
    ExitType,
    IDDocumentType,
)
from hermadata.repositories.animal.models import (
    AnimalDaysQuery,
    AnimalDaysResult,
    AnimalEntriesItem,
    AnimalEntriesQuery,
    AnimalExitsItem,
    AnimalExitsQuery,
    AnimalListReportExtraField,
    AnimalListReportItem,
    AnimalOverviewQuery,
    AnimalOverviewResult,
    AnimalPresenceItem,
    AnimalReportResult,
)
from hermadata.time_utils import get_today

ReportDate = Annotated[
    date, PlainSerializer(lambda x: x.strftime("%d/%m/%Y"), return_type=str)
]

NullableString = Annotated[
    str | None, Field(default=""), AfterValidator(lambda x: x or "")
]

NullableInt = Annotated[
    int | None,
    Field(default=""),
    AfterValidator(lambda x: "" if x is None else x),
]

NullableDate = Annotated[
    date | None,
    Field(default=None),
    PlainSerializer(
        lambda x: x.strftime("%d/%m/%Y") if x else "", return_type=str
    ),
]


def transform_date_to_string(raw: date) -> str:
    return raw.strftime("%d/%m/%Y")


class ReportFormat(Enum):
    pdf = "application/pdf"
    excel = "xls"


DEFAULT_EXTENSIONS: dict[ReportFormat, str] = {ReportFormat.excel: "xlsx"}


_BOLD = Font(bold=True)
_CENTER = Alignment(horizontal="center", vertical="center")
_SECTION_FILLS = {
    "Entrate": PatternFill("solid", fgColor="FEF3C7"),
    "Uscite": PatternFill("solid", fgColor="DBEAFE"),
}
# Characters not allowed in Excel sheet names
_SHEET_NAME_FORBIDDEN = re.compile(r"[\\/*?:\[\]]")


class _OverviewSection(BaseModel):
    # Group header of the type columns ("Entrate", "Uscite")
    title: str
    # Summary label of the selected types
    types_title: str
    items: list[AnimalPresenceItem]
    # (type code, label) in the order requested
    types: list[tuple[str, str]]


def _count_animals(items: list[AnimalPresenceItem], **filters) -> int:
    """Distinct animals among the items matching all the filters."""
    return len(
        {
            i.animal_id
            for i in items
            if all(getattr(i, k) == v for k, v in filters.items())
        }
    )


def _blank_zero(value: int) -> int | None:
    # Empty cells instead of zeros, as in the sheets kept by the shelter
    return value or None


def _bold_last_row(ws: Worksheet):
    for cell in ws[ws.max_row]:
        cell.font = _BOLD


def _autofit(ws: Worksheet):
    for column in ws.columns:
        width = max(len(str(c.value or "")) for c in column)
        ws.column_dimensions[column[0].column_letter].width = min(
            max(width + 2, 10), 50
        )


def _overview_period(query: AnimalOverviewQuery) -> str:
    if query.from_date and query.to_date:
        return (
            f"dal {transform_date_to_string(query.from_date)}"
            f" al {transform_date_to_string(query.to_date)}"
        )
    if query.from_date:
        return f"dal {transform_date_to_string(query.from_date)}"
    return f"fino al {transform_date_to_string(query.to_date)}"


def _sheet_name(name: str, taken: set[str]) -> str:
    """Valid (max 31 chars, no forbidden characters) and unique name."""
    base = _SHEET_NAME_FORBIDDEN.sub("-", name)[:31]
    candidate, n = base, 2
    while candidate.lower() in taken:
        suffix = f" ({n})"
        candidate = base[: 31 - len(suffix)] + suffix
        n += 1
    taken.add(candidate.lower())
    return candidate


def _write_type_headers(
    ws: Worksheet, lead: list[str], sections: list[_OverviewSection]
):
    """Two header rows: the lead columns (merged vertically), then a
    group header per section over its type columns."""
    first_row: list[str | None] = list(lead)
    second_row: list[str | None] = [None] * len(lead)
    for section in sections:
        first_row += [section.title] + [None] * (len(section.types) - 1)
        second_row += [label for _, label in section.types]
    ws.append(first_row)
    ws.append(second_row)
    # After an empty append() max_row lags behind: read it afterwards
    top = ws.max_row - 1

    for col in range(1, len(lead) + 1):
        ws.merge_cells(
            start_row=top, start_column=col, end_row=top + 1, end_column=col
        )
    col = len(lead) + 1
    for section in sections:
        last = col + len(section.types) - 1
        if last > col:
            ws.merge_cells(
                start_row=top, start_column=col, end_row=top, end_column=last
            )
        for c in range(col, last + 1):
            for r in (top, top + 1):
                ws.cell(r, c).fill = _SECTION_FILLS[section.title]
        col = last + 1
    for r in (top, top + 1):
        for cell in ws[r]:
            cell.font = _BOLD
            cell.alignment = _CENTER


def _write_overview_summary(
    ws: Worksheet,
    query: AnimalOverviewQuery,
    sections: list[_OverviewSection],
    races: list[tuple[str, str]],
    cities: list[tuple[str, str]],
):
    """Filters used, then distinct animals per comune (and race, when
    more than one is selected) for each entry/exit type."""
    ws.title = "Riepilogo"
    ws.append(["Riepilogo animali"])
    _bold_last_row(ws)
    ws.append(["Periodo", _overview_period(query)])
    ws.append(
        [
            "Comuni",
            ", ".join(name for _, name in cities)
            if query.city_codes
            else "Tutti",
        ]
    )
    ws.append(["Tipi di animale", ", ".join(name for _, name in races)])
    for section in sections:
        ws.append(
            [
                section.types_title,
                ", ".join(label for _, label in section.types),
            ]
        )
    ws.append(["Dividi per comune", "Sì" if query.split_by_city else "No"])
    ws.append([])

    # With a single race the race column would only repeat it
    by_race = len(races) > 1
    _write_type_headers(
        ws, ["Comune"] + (["Tipo animale"] if by_race else []), sections
    )

    def row(labels: list[str], **filters):
        ws.append(
            labels
            + [
                _blank_zero(_count_animals(s.items, type=t, **filters))
                for s in sections
                for t, _ in s.types
            ]
        )

    for city_code, city_name in cities:
        if by_race:
            for race_id, race_name in races:
                row(
                    [city_name, race_name],
                    city_code=city_code,
                    race_id=race_id,
                )
        else:
            row([city_name], city_code=city_code)
    row(["Totale"] + ([None] if by_race else []))
    _bold_last_row(ws)
    _autofit(ws)


def _write_daily_sheet(
    ws: Worksheet,
    title: str,
    sections: list[_OverviewSection],
    **filters,
):
    """Like the shelter's sheet: a row for each day with at least one
    movement, a column for each entry/exit type, then the totals (sum of
    the days)."""
    ws.append([title])
    _bold_last_row(ws)
    ws.append([])
    _write_type_headers(ws, ["Data"], sections)

    # (day, type) -> distinct animals, per section
    counts: list[dict[tuple[date, str], set[int]]] = []
    for section in sections:
        by_day: dict[tuple[date, str], set[int]] = defaultdict(set)
        for i in section.items:
            if all(getattr(i, k) == v for k, v in filters.items()):
                by_day[(i.day, i.type)].add(i.animal_id)
        counts.append(by_day)

    days = sorted({day for c in counts for day, _ in c})
    columns = [
        (c, t)
        for c, section in zip(counts, sections, strict=True)
        for t, _ in section.types
    ]
    totals = [0] * len(columns)
    for day in days:
        values = [len(c.get((day, t), ())) for c, t in columns]
        totals = [a + b for a, b in zip(totals, values, strict=True)]
        ws.append([day] + [_blank_zero(v) for v in values])
        ws.cell(ws.max_row, 1).number_format = "DD/MM/YYYY"
    ws.append(["Totale"] + [_blank_zero(v) for v in totals])
    _bold_last_row(ws)

    ws.freeze_panes = "B5"
    _autofit(ws)
    ws.column_dimensions["A"].width = 12


class BaseVariables(BaseModel):
    pass


class StructureVariables(BaseModel):
    name: str
    address: NullableString
    city: NullableString


class ReportDefaultVariables(BaseVariables):
    day: ReportDate = Field(default_factory=lambda: get_today())
    title: str
    structure: StructureVariables | None = None

    @field_serializer("day")
    def serialize_day(self, day: date):
        return day.strftime("%d/%m/%Y")


class ReportAnimalEntryVariables(ReportDefaultVariables):
    title: str = "INGRESSO ANIMALE"
    city: str
    animal_type: str
    animal_name: str | None = None
    entry_date: ReportDate


class ReportChipAssignmentVariables(ReportDefaultVariables):
    title: str = "ASSEGNAMENTO CHIP"
    animal_name: str | None = None
    chip_code: str
    assignment_date: ReportDate


class AdopterVariables(BaseModel):
    name: str
    surname: str
    residence_city: str
    residence_address: NullableString
    birth_city: str
    birth_date: ReportDate
    phone: NullableString
    fiscal_code: NullableString
    document_type: NullableString
    document_number: NullableString

    @field_validator("document_type", mode="before")
    @classmethod
    def validate_document_type(cls, value: IDDocumentType | str | None):
        if isinstance(value, IDDocumentType):
            return ID_DOCUMENT_TYPE_LABELS[value]
        if isinstance(value, str):
            try:
                return ID_DOCUMENT_TYPE_LABELS[IDDocumentType(value)]
            except ValueError:
                return value
        return value


def format_age(birth_date: date | None) -> str:
    if birth_date is None:
        return ""
    today = date.today()
    years = (
        today.year
        - birth_date.year
        - ((today.month, today.day) < (birth_date.month, birth_date.day))
    )
    if years >= 1:
        return f"{years} {'anno' if years == 1 else 'anni'}"
    months = (
        (today.year - birth_date.year) * 12 + today.month - birth_date.month
    )
    if today.day < birth_date.day:
        months -= 1
    if months > 0:
        return f"{months} {'mese' if months == 1 else 'mesi'}"
    days = (today - birth_date).days
    if days > 0:
        return f"{days} {'giorno' if days == 1 else 'giorni'}"
    return "Appena nato"


class AnimalVariables(BaseVariables):
    name: NullableString
    chip_code: NullableString
    race: Annotated[NullableString, StringConstraints(to_lower=True)]
    breed: NullableString
    sex: NullableString
    age: str = ""
    birth_date: ReportDate | None = None
    size: NullableString
    fur_type: NullableString
    fur_color: NullableString
    origin_city: str
    entry_date: ReportDate

    @model_validator(mode="before")
    @classmethod
    def compute_age(cls, data):
        birth_date = data.get("birth_date")
        if birth_date is None:
            return data
        if isinstance(birth_date, str):
            from datetime import datetime

            birth_date = datetime.strptime(birth_date, "%Y-%m-%d").date()
        data["age"] = format_age(birth_date)
        return data

    @field_validator("sex", mode="before")
    def validate_sex(value: int | str):
        if isinstance(value, int):
            value = "M" if value == 0 else "F"
        return value

    @field_validator("fur_type", mode="before")
    def validate_fur(value: int | str):
        if isinstance(value, int):
            value = FUR_LABELS[AnimalFur(value)]
        return value

    @field_validator("size", mode="before")
    def validate_size(value: int | str):
        if isinstance(value, int):
            value = SIZE_LABELS[AnimalSize(value)]
        return value


class ReportVariationVariables(ReportDefaultVariables):
    title: str = "COMUNICAZIONE DI VARIAZIONE"
    animal: AnimalVariables
    adopter: AdopterVariables | None = None

    variation_type: ExitType  # scomparso, deceduto, stato ceduto
    variation_date: ReportDate
    notes: NullableString
    location_address: NullableString
    location_city: NullableString
    location_province: NullableString


class ReportAdoptionVariables(ReportDefaultVariables):
    title: str = "DOCUMENTO DI ADOZIONE"
    animal: AnimalVariables
    adopter: AdopterVariables
    exit_date: ReportDate
    notes: NullableString
    location_address: Annotated[str, StringConstraints(to_upper=True)]
    location_city: Annotated[str, StringConstraints(to_upper=True)]
    location_province: Annotated[str, StringConstraints(to_upper=True)]


class ReportCustodyVariables(ReportDefaultVariables):
    title: str = "DOCUMENTO DI AFFIDO"
    animal_name: str
    chip_code: str
    exit_date: ReportDate


class AnimalListReportRow(AnimalListReportItem):
    @computed_field
    @property
    def age(self) -> str:
        return format_age(self.birth_date)


class ReportAnimalListVariables(ReportDefaultVariables):
    title: str = ""
    items: list[AnimalListReportRow]
    total: int
    extra_fields: list[AnimalListReportExtraField] = []

    def model_post_init(self, __context) -> None:
        if not self.title:
            self.title = f"ELENCO ANIMALI del {self.day.strftime('%d/%m/%Y')}"


logging.getLogger("weasyprint").setLevel(logging.ERROR)


class ReportGenerator:
    def __init__(self, jinja_env: Environment) -> None:
        self.jinja_env = jinja_env

    def _build_template(
        self, filename: str, variables: ReportDefaultVariables
    ) -> bytes:
        template = self.jinja_env.get_template(filename)

        rendered_html = template.render(**variables.model_dump())

        target = BytesIO()

        HTML(string=rendered_html).write_pdf(
            target=target,
            stylesheets=[
                CSS(
                    filename=os.path.join(
                        os.path.dirname(__file__), "static", "tailwind.css"
                    )
                )
            ],
        )

        return target.getvalue()

    def build_animal_entry_report(
        self, variables: ReportAnimalEntryVariables
    ) -> bytes:
        return self._build_template("animal_entry.jinja", variables)

    def build_animal_list_report(
        self, variables: ReportAnimalListVariables
    ) -> bytes:
        return self._build_template("animal_list.jinja", variables)

    def build_chip_assignment_report(
        self, variables: ReportChipAssignmentVariables
    ) -> bytes:
        return self._build_template("chip_assignment.jinja", variables)

    def build_adoption_report(
        self, variables: ReportAdoptionVariables
    ) -> bytes:
        return self._build_template("adoption.jinja", variables)

    def build_custody_report(self, variables: ReportCustodyVariables) -> bytes:
        return self._build_template("custody.jinja", variables)

    def build_variation_report(
        self, variables: ReportVariationVariables
    ) -> bytes:
        return self._build_template("variation.jinja", variables)

    def generate_animal_days_count_report(
        self,
        query: AnimalDaysQuery,
        data: AnimalDaysResult,
        format: ReportFormat = ReportFormat.excel,
    ) -> tuple[str, bytes]:
        if format != ReportFormat.excel:
            raise Exception("format not supported")

        wb = openpyxl.Workbook()

        ws = wb.active
        ws.append(["Nome", "Chip", "Giorni"])
        for d in data.items:
            ws.append([d.animal_name, d.animal_chip_code, d.animal_days])

        ws.append([])
        ws.append(["Totale", "", data.total_days])

        filename = (
            f"giorni_cane{query.from_date.strftime('%Y-%m-%d')}"
            f"_{query.to_date.strftime('%Y-%m-%d')}"
            f".{DEFAULT_EXTENSIONS[format]}"
        )

        fp = BytesIO()
        wb.save(fp)

        bytes_data = fp.getvalue()

        return filename, bytes_data

    def generate_animal_entries_report(
        self,
        query: AnimalEntriesQuery,
        data: AnimalReportResult[AnimalEntriesItem],
        format: ReportFormat = ReportFormat.excel,
    ) -> tuple[str, bytes]:
        if format != ReportFormat.excel:
            raise Exception("format not supported")

        wb = openpyxl.Workbook()

        ws = wb.active
        ws.append(
            [
                "Tipo",
                "Nome",
                "Chip",
                "Data nascita",
                "Sesso",
                "Data ingresso",
                "Tipo Ingresso",
                "Comune",
            ]
        )
        for d in data.items:
            ws.append(
                [
                    d.animal_race,
                    d.animal_name,
                    d.animal_chip_code,
                    d.animal_birth_date,
                    d.animal_sex,
                    d.entry_date,
                    ENTRY_TYPE_LABELS[d.entry_type],
                    d.entry_city,
                ]
            )

        filename = (
            f"ingressi_{query.from_date.strftime('%Y-%m-%d')}"
            f"_{query.to_date.strftime('%Y-%m-%d')}"
            f".{DEFAULT_EXTENSIONS[format]}"
        )

        fp = BytesIO()
        wb.save(fp)

        bytes_data = fp.getvalue()

        return filename, bytes_data

    def generate_animal_overview_report(
        self,
        query: AnimalOverviewQuery,
        data: AnimalOverviewResult,
        format: ReportFormat = ReportFormat.excel,
    ) -> tuple[str, bytes]:
        """Excel with a summary sheet (distinct animals per comune and
        type) plus daily sheets, one per race or, with split_by_city, one
        per race and comune."""
        if format != ReportFormat.excel:
            raise Exception("format not supported")

        races = [(r, data.races[r]) for r in query.race_ids if r in data.races]
        cities = sorted(data.cities.items(), key=lambda c: c[1])

        sections: list[_OverviewSection] = []
        if data.entries is not None:
            sections.append(
                _OverviewSection(
                    title="Entrate",
                    types_title="Tipi di ingresso",
                    items=data.entries,
                    types=[
                        (t.value, ENTRY_TYPE_LABELS.get(t, t.value))
                        for t in query.entry_types
                    ],
                )
            )
        if data.exits is not None:
            sections.append(
                _OverviewSection(
                    title="Uscite",
                    types_title="Tipi di uscita",
                    items=data.exits,
                    types=[
                        (t.value, EXIT_TYPE_LABELS.get(t, t.value))
                        for t in query.exit_types
                    ],
                )
            )

        wb = openpyxl.Workbook()
        _write_overview_summary(wb.active, query, sections, races, cities)

        taken = {"riepilogo"}
        selected_cities = (
            ", ".join(name for _, name in cities)
            if query.city_codes
            else "Tutti i comuni"
        )
        period = _overview_period(query)
        for race_id, race_name in races:
            if not query.split_by_city:
                _write_daily_sheet(
                    wb.create_sheet(_sheet_name(race_name, taken)),
                    f"{race_name.upper()} · {selected_cities} · {period}",
                    sections,
                    race_id=race_id,
                )
                continue
            for city_code, city_name in cities:
                _write_daily_sheet(
                    wb.create_sheet(
                        _sheet_name(f"{race_name} - {city_name}", taken)
                    ),
                    f"{race_name.upper()} · {city_name} · {period}",
                    sections,
                    race_id=race_id,
                    city_code=city_code,
                )

        period_parts = []
        if query.from_date:
            period_parts.append(f"dal_{query.from_date.strftime('%Y-%m-%d')}")
        if query.to_date:
            period_parts.append(f"al_{query.to_date.strftime('%Y-%m-%d')}")
        filename = (
            f"riepilogo_{'_'.join(period_parts)}.{DEFAULT_EXTENSIONS[format]}"
        )

        fp = BytesIO()
        wb.save(fp)

        return filename, fp.getvalue()

    def generate_animal_exits_report(
        self,
        query: AnimalExitsQuery,
        data: AnimalReportResult[AnimalExitsItem],
        format: ReportFormat = ReportFormat.excel,
    ) -> tuple[str, bytes]:
        if format != ReportFormat.excel:
            raise Exception("format not supported")

        wb = openpyxl.Workbook()

        ws = wb.active
        ws.append(
            [
                "Tipo",
                "Nome",
                "Chip",
                "Data nascita",
                "Sesso",
                "Data uscita",
                "Tipo uscita",
            ]
        )
        for d in data.items:
            ws.append(
                [
                    d.animal_race,
                    d.animal_name,
                    d.animal_chip_code,
                    d.animal_birth_date,
                    d.animal_sex,
                    d.exit_date,
                    EXIT_TYPE_LABELS[d.exit_type],
                ]
            )

        filename = (
            f"uscite_{query.from_date.strftime('%Y-%m-%d')}"
            f"_{query.to_date.strftime('%Y-%m-%d')}"
            f".{DEFAULT_EXTENSIONS[format]}"
        )

        fp = BytesIO()
        wb.save(fp)

        bytes_data = fp.getvalue()

        return filename, bytes_data
