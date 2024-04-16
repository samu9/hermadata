import pdfkit
from jinja2 import (
    Environment,
    FileSystemLoader,
    PackageLoader,
    select_autoescape,
)


class ReportGenerator:
    def __init__(self, jinja_env: Environment) -> None:
        self.jinja_env = jinja_env

    def build_animal_entry_report(self) -> bytes:
        template = self.jinja_env.get_template("animal_entry.jinja")

        rendered_html = template.render(name="prova")

        pdf = pdfkit.from_string(input=rendered_html)

        return pdf


if __name__ == "__main__":
    report_generator = ReportGenerator(
        jinja_env=Environment(
            loader=FileSystemLoader("hermadata/reports/templates"),
            autoescape=select_autoescape(),
        )
    )

    report_generator.build_animal_entry_report()
