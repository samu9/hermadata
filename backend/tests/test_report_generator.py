from datetime import date, datetime

from hermadata.reports.report_generator import (
    ReportAnimalEntryVariables,
    ReportChipAssignmentVariables,
    ReportGenerator,
)
from hermadata.repositories.animal.models import (
    AnimalDaysItem,
    AnimalDaysQuery,
    AnimalDaysResult,
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


def test_animal_days_report(report_generator: ReportGenerator):
    data = AnimalDaysResult(
        items=[
            AnimalDaysItem(
                animal_name="Test",
                animal_chip_code="123.123.123.123.123",
                animal_days=5,
            )
        ],
        total_days=5,
    )
    filename, report = report_generator.generate_animal_days_count_report(
        AnimalDaysQuery(
            from_date=date(2023, 1, 1),
            to_date=date(2023, 2, 1),
            city_code="H501",
        ),
        data,
    )

    assert isinstance(filename, str)

    with open("attic/storage/generated.xls", "wb") as fp:
        fp.write(report)

    assert isinstance(report, bytes)
