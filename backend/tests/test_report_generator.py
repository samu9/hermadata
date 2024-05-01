from datetime import date

from hermadata.reports.report_generator import (
    ReportAnimalEntryVariables,
    ReportGenerator,
)


def test_animal_entry_report(report_generator: ReportGenerator):

    variables = ReportAnimalEntryVariables(
        city="Test",
        animal_name="Gino",
        animal_type="Gatto",
        entry_date=date(2020, 2, 1),
    )
    pdf = report_generator.build_animal_entry_report(variables)

    with open("generated.pdf", "wb") as fp:
        fp.write(pdf)

    assert pdf
