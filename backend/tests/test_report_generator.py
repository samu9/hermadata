from datetime import date, datetime, timedelta
from io import BytesIO

from openpyxl import load_workbook

from hermadata.constants import EntryType, ExitType
from hermadata.reports.report_generator import (
    AdopterVariables,
    AnimalListReportRow,
    AnimalVariables,
    ReportAdoptionVariables,
    ReportAnimalEntryVariables,
    ReportAnimalListVariables,
    ReportChipAssignmentVariables,
    ReportFormat,
    ReportGenerator,
    ReportVariationVariables,
    format_age,
)
from hermadata.repositories.animal.models import (
    AnimalDaysItem,
    AnimalDaysQuery,
    AnimalDaysResult,
    AnimalEntriesItem,
    AnimalEntriesQuery,
    AnimalListReportExtraField,
    AnimalReportResult,
)
from hermadata.settings import Settings


def test_animal_entry_report(
    report_generator: ReportGenerator, test_settings: Settings
):
    variables = ReportAnimalEntryVariables(
        city="Test",
        animal_name="Gino",
        animal_type="Gatto",
        entry_date=date(2020, 2, 1),
    )
    pdf = report_generator.build_animal_entry_report(variables)

    with open(
        test_settings.storage.disk.base_path + "/generated.pdf", "wb"
    ) as fp:
        fp.write(pdf)

    assert pdf


def test_chip_assignment_report(
    report_generator: ReportGenerator, test_settings
):
    variables = ReportChipAssignmentVariables(
        animal_name="Gino",
        chip_code="111.111.111.111.111",
        assignment_date=datetime.now().date(),
    )
    pdf = report_generator.build_chip_assignment_report(variables)

    with open(
        test_settings.storage.disk.base_path + "/generated.pdf", "wb"
    ) as fp:
        fp.write(pdf)

    assert pdf


def test_animal_days_report(report_generator: ReportGenerator, test_settings):
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
    query = AnimalDaysQuery(
        from_date=date(2023, 1, 1),
        to_date=date(2023, 2, 1),
        city_code="H501",
    )
    filename, report = report_generator.generate_animal_days_count_report(
        query, data
    )

    assert isinstance(filename, str)
    assert (
        filename == f"giorni_cane{query.from_date.strftime('%Y-%m-%d')}"
        f"_{query.to_date.strftime('%Y-%m-%d')}.xlsx"
    )
    with open(
        test_settings.storage.disk.base_path + "/generated.xls", "wb"
    ) as fp:
        fp.write(report)

    assert isinstance(report, bytes)


def test_animal_entries_report(empty_db, report_generator: ReportGenerator):
    query = AnimalEntriesQuery(
        from_date=date(2024, 1, 1),
        to_date=date(2024, 12, 31),
        entry_type=EntryType.rescue,
        city_code="H501",
    )
    data = AnimalReportResult[AnimalEntriesItem](
        items=[
            AnimalEntriesItem(
                animal_race="Cane",
                animal_name="Dino",
                animal_chip_code="123.123.123.123.123",
                animal_birth_date=date(2020, 1, 1),
                animal_sex="M",
                entry_city="Montecatini Terme",
                entry_date=date(2024, 1, 2),
                entry_type=EntryType.rescue,
            )
        ],
        total=1,
    )
    filename, report = report_generator.generate_animal_entries_report(
        query, data, ReportFormat.excel
    )

    assert (
        filename == f"ingressi_{query.from_date.strftime('%Y-%m-%d')}"
        f"_{query.to_date.strftime('%Y-%m-%d')}.xlsx"
    )
    file_ = BytesIO(report)
    wb = load_workbook(file_)

    sheet = wb[wb.sheetnames[0]]

    rows = list(sheet.rows)
    assert len(rows) == 2

    assert rows[1][0].value == "Cane"
    assert rows[1][1].value == "Dino"
    assert rows[1][4].value == "M"


def test_variation_report(jinja_env, report_generator: ReportGenerator):
    variables = ReportVariationVariables(
        animal=AnimalVariables(
            name="Gino",
            chip_code="111.111.111.111.111",
            fur_type="lungo",
            age=12,
            birth_date=date(2010, 5, 15),
            size="Piccolo",
            breed="Chihuahua",
            fur_color="binaco",
            origin_city="Montecatini terme",
            sex="maschio",
            entry_date=datetime.now().date(),
        ),
        variation_date=datetime.now().date(),
        adopter=AdopterVariables(
            name="Mario",
            surname="Rossi",
            residence_city="Montecatini Terme",
            birth_city="Roma",
            birth_date=date(1979, 2, 3),
        ),
        variation_type=ExitType.custody,
    )
    pdf = report_generator.build_variation_report(variables)

    assert pdf

    return_variables = variables.model_copy(
        update={"variation_type": ExitType.return_}
    )
    template = jinja_env.get_template("variation.jinja")
    html = template.render(**return_variables.model_dump())
    assert "stato restituito al Sig." in html
    assert "stato restituito dal Sig." not in html


def test_adoption_report(report_generator: ReportGenerator):
    variables = ReportAdoptionVariables(
        animal=AnimalVariables(
            name="Gino",
            chip_code="111.111.111.111.111",
            fur_type="lungo",
            age=12,
            birth_date=date(2010, 5, 15),
            size="Piccolo",
            breed="Chihuahua",
            fur_color="binaco",
            origin_city="Montecatini terme",
            sex="maschio",
            entry_date=datetime.now().date() - timedelta(days=30),
        ),
        adopter=AdopterVariables(
            name="Mario",
            surname="Rossi",
            residence_city="Montecatini Terme",
            birth_city="Roma",
            birth_date=date(1979, 2, 3),
            residence_address="Via test",
            phone="123456789",
        ),
        exit_date=datetime.now().date(),
        notes="Test",
        location_address="Via Prova",
        location_city="LUCCA",
        location_province="LU",
    )

    pdf = report_generator.build_adoption_report(variables)

    assert pdf


def test_models():
    v = AnimalVariables(
        name="test",
        age=4,
        birth_date=date(2018, 1, 1),
        size="Medio",
        breed="test",
        chip_code="test",
        entry_date=date(2022, 4, 5),
        fur_color="test",
        fur_type="test",
        origin_city="test",
        sex="M",
    )

    # age is computed from birth_date as a formatted string (e.g. "8 anni")
    assert isinstance(v.age, str)
    assert "anni" in v.age

    dump = v.model_dump()

    assert dump["entry_date"] == "05/04/2022"
    assert isinstance(dump["age"], str)

    r = ReportVariationVariables(
        animal=v,
        variation_type=ExitType.adoption,
        variation_date=datetime.now().date(),
    )

    dump = r.model_dump()

    assert isinstance(dump["animal"]["age"], str)


def test_format_age():
    today = date.today()
    assert format_age(None) == ""
    assert format_age(today) == "Appena nato"
    assert format_age(today - timedelta(days=1)) == "1 giorno"
    assert format_age(today.replace(year=today.year - 1)) == "1 anno"
    assert format_age(today.replace(year=today.year - 3)) == "3 anni"


def test_animal_list_report_extra_fields(
    jinja_env, report_generator: ReportGenerator
):
    items = [
        AnimalListReportRow(
            name="Gino",
            chip_code="111.111.111.111.111",
            origin_city="Trieste",
            sex="M",
            birth_date=date.today().replace(year=date.today().year - 2),
            sterilized=True,
        ),
        AnimalListReportRow(origin_city="Trieste", sterilized=False),
    ]
    template = jinja_env.get_template("animal_list.jinja")

    base = ReportAnimalListVariables(items=items, total=len(items))
    html = template.render(**base.model_dump())
    assert "Età" not in html
    assert "Sterilizzato" not in html

    full = ReportAnimalListVariables(
        items=items,
        total=len(items),
        extra_fields=[
            AnimalListReportExtraField.AGE,
            AnimalListReportExtraField.STERILIZED,
        ],
    )
    html = template.render(**full.model_dump())
    assert "<th>Età</th>" in html
    assert "<th>Sterilizzato</th>" in html
    assert "<td>2 anni</td>" in html
    assert "Sì" in html and "<td>No</td>" in html

    assert report_generator.build_animal_list_report(full)
