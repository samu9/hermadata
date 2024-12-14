from datetime import date, datetime
from enum import Enum
from io import BytesIO

import openpyxl
from jinja2 import Environment
from pydantic import (
    BaseModel,
    Field,
    SerializerFunctionWrapHandler,
    field_serializer,
    field_validator,
    model_serializer,
)
from weasyprint import CSS, HTML

from hermadata.constants import ENTRY_TYPE_LABELS, EXIT_TYPE_LABELS, ExitType
from hermadata.repositories.animal.models import (
    AnimalDaysQuery,
    AnimalDaysResult,
    AnimalEntriesItem,
    AnimalEntriesQuery,
    AnimalExitsItem,
    AnimalExitsQuery,
    AnimalReportResult,
)


def transform_date_to_string(raw: date) -> str:
    return raw.strftime("%d/%m/%Y")


class ReportFormat(Enum):
    pdf = "application/pdf"
    excel = "xls"


DEFAULT_EXTENSIONS: dict[ReportFormat, str] = {ReportFormat.excel: "xlsx"}


class ReportDefaultVariables(BaseModel):
    day: str = Field(
        default_factory=lambda: datetime.now().date().strftime("%Y-%m-%d")
    )
    title: str

    # @field_serializer("day")
    # def serialize_day(self, day: date):
    #     return day.strftime("%Y-%m-%d")

    # @model_serializer(mode="wrap")
    # def serialize_model(self, nxt: SerializerFunctionWrapHandler):
    #     dump = nxt()
    #     dump = {}
    #     for k, v in dump.items():
    #         if isinstance(v, date):
    #             dump[k] = v.strftime("%d/%m/%Y")

    #     return dump


class ReportAnimalEntryVariables(ReportDefaultVariables):
    title: str = "INGRESSO ANIMALE"
    city: str
    animal_type: str
    animal_name: str | None = None
    entry_date: str

    transform_entry_date = field_validator("entry_date", mode="before")(
        transform_date_to_string
    )


class ReportChipAssignmentVariables(ReportDefaultVariables):
    title: str = "ASSEGNAMENTO CHIP"
    animal_name: str | None = None
    chip_code: str
    assignment_date: str

    transform_assignment_date = field_validator(
        "assignment_date", mode="before"
    )(transform_date_to_string)


class AdopterVariables(BaseModel):
    name: str
    surname: str
    residence_city: str
    residence_address: str | None = None


class ReportVariationVariables(ReportDefaultVariables):
    title: str = "VARIAZIONE"
    animal_name: str | None = None
    animal_chip_code: str
    animal_breed: str
    animal_fur_type: str
    animal_fur_color: str
    animal_sex: str
    animal_age: int
    animal_origin_city: str
    adopter: AdopterVariables | None = None

    variation_type: ExitType  # scomparso, deceduto, stato ceduto
    variation_date: date


class ReportAdoptionVariables(ReportDefaultVariables):
    title: str = "DOCUMENTO DI ADOZIONE"
    animal_name: str
    chip_code: str
    exit_date: str

    transform_exit_date = field_validator("exit_date", mode="before")(
        transform_date_to_string
    )


class ReportCustodyVariables(ReportDefaultVariables):
    title: str = "DOCUMENTO DI AFFIDO"
    animal_name: str
    chip_code: str
    exit_date: str

    transform_exit_date = field_validator("exit_date", mode="before")(
        transform_date_to_string
    )


class ReportGenerator:
    def __init__(self, jinja_env: Environment) -> None:
        self.jinja_env = jinja_env

    def _build_template(
        self, filename: str, variables: ReportDefaultVariables
    ) -> bytes:
        template = self.jinja_env.get_template(filename)

        rendered_html = template.render(**variables.model_dump())

        with open("output.html", "w") as fp:
            fp.write(rendered_html)

        target = BytesIO()

        HTML(string=rendered_html).write_pdf(
            target=target,
            stylesheets=[
                CSS(filename="hermadata/reports/templates/tailwind.css")
            ],
        )

        return target.getvalue()

    def build_animal_entry_report(
        self, variables: ReportAnimalEntryVariables
    ) -> bytes:
        return self._build_template("animal_entry.jinja", variables)

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
