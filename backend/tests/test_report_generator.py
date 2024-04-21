from unittest.mock import patch, Mock

from jinja2 import Environment, Template
from hermadata.reports.report_generator import (
    ReportAnimalEntryVariables,
    ReportGenerator,
)


@patch.object(Environment, "get_template", spec=Template)
def test_animal_entry_report(
    mocked_template: Mock, report_generator: ReportGenerator
):
    def render(*args):
        assert args

        return bytes()

    mocked_template.render = render

    variables = ReportAnimalEntryVariables(
        city="Test", animal_name="Gino", animal_type="Gatto"
    )
    pdf = report_generator.build_animal_entry_report(variables)

    assert pdf
