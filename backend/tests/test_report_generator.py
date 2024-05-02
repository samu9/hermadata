from datetime import date, datetime

from hermadata.reports.report_generator import (
    ReportAnimalEntryVariables,
    ReportChipAssignmentVariables,
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

    with open("attic/storage/generated.pdf", "wb") as fp:
        fp.write(pdf)

    assert pdf


def test_chip_assignment_report(report_generator: ReportGenerator):

    variables = ReportChipAssignmentVariables(
        animal_name="Gino",
        chip_code="111.111.111.111.111",
        assignment_date=datetime.now().date(),
    )
    pdf = report_generator.build_chip_assignment_report(variables)

    with open("attic/storage/generated.pdf", "wb") as fp:
        fp.write(pdf)

    assert pdf
