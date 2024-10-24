from datetime import date, datetime
from enum import Enum
from io import BytesIO

import openpyxl
import pdfkit
from fastapi import Depends
from jinja2 import Environment
from pydantic import BaseModel, Field, field_validator

from hermadata.dependancies import get_jinja_env
from hermadata.repositories.animal.models import (
    AnimalDaysQuery,
    AnimalDaysResult,
    AnimalEntriesQuery,
    AnimalEntriesResult,
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


class ReportFormat(Enum):
    pdf = "application/pdf"
    excel = "xls"


class ReportGenerator:
    def __init__(self, jinja_env: Environment = Depends(get_jinja_env)) -> None:
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

    def build_adoption_report(
        self, variables: ReportAdoptionVariables
    ) -> bytes:
        return self._build_template("adoption.jinja", variables)

    def build_custody_report(self, variables: ReportCustodyVariables) -> bytes:
        return self._build_template("custody.jinja", variables)

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

    def generate_animal_entries_report(
        self,
        query: AnimalEntriesQuery,
        data: AnimalEntriesResult,
        format: ReportFormat = ReportFormat.excel,
    ) -> tuple[str, bytes]:
        if format != ReportFormat.excel:
            raise Exception("format not supported")

        wb = openpyxl.Workbook()

        ws = wb.active
        ws.append(["Nome", "Chip", "Data ingresso", "Tipo Ingresso", "Comune"])
        for d in data.items:
            ws.append(
                [
                    d.animal_name,
                    d.animal_chip_code,
                    d.entry_date,
                    d.entry_type,
                    d.entry_city,
                ]
            )

        filename = f"ingressi_{query.from_date.strftime('%Y-%m-%d')}_{query.to_date.strftime('%Y-%m-%d')}.xls"

        fp = BytesIO()
        wb.save(fp)

        bytes_data = fp.getvalue()

        return filename, bytes_data
