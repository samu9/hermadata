from datetime import datetime
import pdfkit
from jinja2 import (
    Environment,
    FileSystemLoader,
    select_autoescape,
)
from pydantic import BaseModel, Field


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


class ReportGenerator:
    def __init__(self, jinja_env: Environment) -> None:
        self.jinja_env = jinja_env

    def build_animal_entry_report(
        self, variables: ReportAnimalEntryVariables
    ) -> bytes:
        template = self.jinja_env.get_template("animal_entry.jinja")

        rendered_html = template.render(**variables.model_dump())

        pdf = pdfkit.from_string(input=rendered_html)

        return pdf


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
