from datetime import date, datetime
from enum import Enum
from io import BytesIO
import openpyxl
import pdfkit
from jinja2 import Environment
from pydantic import BaseModel, Field, field_validator

from hermadata.repositories.animal.models import (
    AnimalDaysQuery,
    AnimalDaysResult,
)


def transform_date_to_string(raw: date) -> str:
    return raw.strftime("%d/%m/%Y")


class ReportDefaultVariables(BaseModel):
    day: str = Field(
        default_factory=lambda: datetime.now().date().strftime("%Y-%m-%d")
    )
    title: str


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


class ReportFormat(Enum):
    pdf = "application/pdf"
    excel = "xls"


class ReportGenerator:
    def __init__(self, jinja_env: Environment) -> None:
        self.jinja_env = jinja_env

    def _build_template(
        self, filename: str, variables: ReportDefaultVariables
    ) -> bytes:
        template = self.jinja_env.get_template(filename)

        rendered_html = template.render(**variables.model_dump())

        pdf = pdfkit.from_string(input=rendered_html)

        return pdf

    def build_animal_entry_report(
        self, variables: ReportAnimalEntryVariables
    ) -> bytes:
        return self._build_template("animal_entry.jinja", variables)

    def build_chip_assignment_report(
        self, variables: ReportChipAssignmentVariables
    ) -> bytes:
        return self._build_template("chip_assignment.jinja", variables)

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

        filename = f"giorni_cane{query.from_date.strftime('%Y-%m-%d')}_{query.to_date.strftime('%Y-%m-%d')}.xls"

        fp = BytesIO()
        wb.save(fp)

        bytes_data = fp.getvalue()

        return filename, bytes_data
