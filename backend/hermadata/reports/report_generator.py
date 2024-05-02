from datetime import date, datetime
import pdfkit
from jinja2 import (
    Environment,
    FileSystemLoader,
    select_autoescape,
)
from pydantic import BaseModel, Field, field_validator


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


if __name__ == "__main__":
    jinja_env = Environment(
        loader=FileSystemLoader("hermadata/reports/templates"),
        autoescape=select_autoescape(),
    )
    jinja_env.globals = {
        "software_name": "Hermadata",
        "software_version": "0.1.0.0",
    }
    report_generator = ReportGenerator(jinja_env=jinja_env)

    variables = ReportAnimalEntryVariables(
        city="Montecatini Terme", animal_name="Gino", animal_type="Cane"
    )
    pdf = report_generator.build_animal_entry_report(variables)

    with open("test.pdf", "wb") as fp:
        fp.write(pdf)
