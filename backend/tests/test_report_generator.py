from datetime import date, datetime, timedelta
from io import BytesIO

import pytest
from openpyxl import load_workbook

from hermadata.constants import EntryType, ExitType, IDDocumentType
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
    _sheet_name,
    format_age,
)
from hermadata.repositories.animal.models import (
    AnimalDaysItem,
    AnimalDaysQuery,
    AnimalDaysResult,
    AnimalEntriesItem,
    AnimalEntriesQuery,
    AnimalListReportExtraField,
    AnimalOverviewQuery,
    AnimalOverviewResult,
    AnimalPresenceItem,
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
        race_ids=["C", "G"],
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
        race_ids=["C", "G"],
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


@pytest.mark.parametrize(
    ("document_type", "document_label"),
    [
        (IDDocumentType.identity_card, "Carta di identità"),
        (IDDocumentType.passport, "Passaporto"),
    ],
)
def test_variation_report(
    jinja_env, report_generator: ReportGenerator, document_type, document_label
):
    variables = ReportVariationVariables(
        animal=AnimalVariables(
            name="Gino",
            chip_code="111.111.111.111.111",
            race="Cane",
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
            document_type=document_type,
            document_number="AA12345BB",
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
    assert f"Documento ({document_label}) n. AA12345BB" in html
    assert "proprietario del cane" in html
    assert "il suddetto cane è" in html
    assert "iscritto all'Anagrafe Animali d'Affezione" in html

    temporary_variables = variables.model_copy(
        update={"variation_type": ExitType.temporary_adoption}
    )
    html = " ".join(
        template.render(**temporary_variables.model_dump()).split()
    )
    assert "stato affidato temporaneamente al Sig. Rossi Mario" in html
    assert f"Documento ({document_label}) n. AA12345BB" in html

    cat_variables = return_variables.model_copy(
        update={
            "animal": return_variables.animal.model_copy(
                update={"race": "gatto"}
            )
        }
    )
    html = template.render(**cat_variables.model_dump())
    assert "proprietario del gatto" in html
    assert "il suddetto gatto è" in html
    assert "cane" not in html

    release_variables = cat_variables.model_copy(
        update={"variation_type": ExitType.territory_release, "adopter": None}
    )
    html = template.render(**release_variables.model_dump())
    assert "il suddetto gatto è stato reimmesso sul territorio il" in " ".join(
        html.split()
    )

    no_race_variables = return_variables.model_copy(
        update={
            "animal": return_variables.animal.model_copy(update={"race": ""})
        }
    )
    html = template.render(**no_race_variables.model_dump())
    assert "proprietario dell'animale" in html
    assert "il suddetto animale è" in html


@pytest.mark.parametrize(
    ("document_type", "document_label"),
    [("dl", "Patente di guida"), ("pa", "Passaporto")],
)
def test_adoption_report(
    jinja_env, report_generator: ReportGenerator, document_type, document_label
):
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
            document_type=document_type,
            document_number="PT9876543",
        ),
        exit_date=datetime.now().date(),
        notes="Test",
        location_address="Via Prova",
        location_city="LUCCA",
        location_province="LU",
    )

    pdf = report_generator.build_adoption_report(variables)

    assert pdf

    template = jinja_env.get_template("adoption.jinja")
    html = template.render(**variables.model_dump())
    assert f"Documento ({document_label}) n. PT9876543" in html

    no_type_adopter = variables.adopter.model_copy(
        update={"document_type": ""}
    )
    html_no_type = template.render(
        **variables.model_copy(
            update={"adopter": no_type_adopter}
        ).model_dump()
    )
    assert "Documento n. PT9876543" in html_no_type


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


def _presence(animal_id, city, race, type_, day):
    return AnimalPresenceItem(
        animal_id=animal_id,
        city_code=city,
        race_id=race,
        type=type_,
        day=day,
    )


def _rows(ws):
    return list(ws.iter_rows(values_only=True))


def test_animal_overview_report(report_generator: ReportGenerator):
    query = AnimalOverviewQuery(
        race_ids=["C", "G"],
        from_date=date(2024, 1, 1),
        entry_types=[EntryType.rescue, EntryType.confiscation],
        exit_types=[ExitType.adoption],
    )
    data = AnimalOverviewResult(
        entries=[
            _presence(1, "H501", "C", "R", date(2024, 1, 5)),
            _presence(2, "H501", "C", "R", date(2024, 1, 5)),
            _presence(3, "F205", "G", "R", date(2024, 1, 7)),
            # animal 1 came back with another entry type
            _presence(1, "H501", "C", "C", date(2024, 1, 20)),
            _presence(5, "F205", "C", "R", date(2024, 1, 20)),
        ],
        exits=[
            _presence(1, "H501", "C", "A", date(2024, 1, 10)),
            _presence(3, "F205", "G", "A", date(2024, 1, 7)),
        ],
        cities={"H501": "ROMA", "F205": "MILANO"},
        races={"C": "Cane", "G": "Gatto"},
    )

    filename, report = report_generator.generate_animal_overview_report(
        query, data
    )

    assert filename == "riepilogo_dal_2024-01-01.xlsx"
    wb = load_workbook(BytesIO(report))
    # Comuni summed: one daily sheet per race
    assert wb.sheetnames == ["Riepilogo", "Cane", "Gatto"]

    # Days with movements only, empty cells instead of zeros, totals are
    # the sum of the days
    assert _rows(wb["Cane"]) == [
        ("CANE · Tutti i comuni · dal 01/01/2024", None, None, None),
        (None, None, None, None),
        ("Data", "Entrate", None, "Uscite"),
        (None, "Recupero", "Sequestro", "Adozione"),
        (datetime(2024, 1, 5), 2, None, None),
        (datetime(2024, 1, 10), None, None, 1),
        (datetime(2024, 1, 20), 1, 1, None),
        ("Totale", 3, 1, 1),
    ]
    assert _rows(wb["Gatto"])[4:] == [
        (datetime(2024, 1, 7), 1, None, 1),
        ("Totale", 1, None, 1),
    ]
    assert "A3:A4" in wb["Cane"].merged_cells
    assert "B3:C3" in wb["Cane"].merged_cells

    summary = _rows(wb["Riepilogo"])
    assert summary[1][:2] == ("Periodo", "dal 01/01/2024")
    assert summary[2][:2] == ("Comuni", "Tutti")
    assert summary[4][:2] == ("Tipi di ingresso", "Recupero, Sequestro")
    assert summary[5][:2] == ("Tipi di uscita", "Adozione")
    assert summary[6][:2] == ("Dividi per comune", "No")
    # Distinct animals per comune and race
    assert summary[8:] == [
        ("Comune", "Tipo animale", "Entrate", None, "Uscite"),
        (None, None, "Recupero", "Sequestro", "Adozione"),
        ("MILANO", "Cane", 1, None, None),
        ("MILANO", "Gatto", 1, None, 1),
        ("ROMA", "Cane", 2, 1, 1),
        ("ROMA", "Gatto", None, None, None),
        ("Totale", None, 4, 1, 2),
    ]


def test_animal_overview_report_split_by_city_single_race(
    report_generator: ReportGenerator,
):
    query = AnimalOverviewQuery(
        race_ids=["C"],
        to_date=date(2024, 12, 31),
        city_codes=["H501", "F205"],
        exit_types=[ExitType.adoption, ExitType.death],
        split_by_city=True,
    )
    data = AnimalOverviewResult(
        exits=[
            _presence(1, "H501", "C", "A", date(2024, 3, 1)),
            _presence(2, "H501", "C", "D", date(2024, 3, 1)),
            _presence(4, "F205", "C", "A", date(2024, 2, 1)),
            # animal 1 adopted again later: the daily totals count it twice
            _presence(1, "H501", "C", "A", date(2024, 6, 1)),
        ],
        cities={"H501": "ROMA", "F205": "MILANO"},
        races={"C": "Cane"},
    )

    filename, report = report_generator.generate_animal_overview_report(
        query, data
    )

    assert filename == "riepilogo_al_2024-12-31.xlsx"
    wb = load_workbook(BytesIO(report))
    # The entries section was not requested
    assert wb.sheetnames == ["Riepilogo", "Cane - MILANO", "Cane - ROMA"]

    assert _rows(wb["Cane - ROMA"]) == [
        ("CANE · ROMA · fino al 31/12/2024", None, None),
        (None, None, None),
        ("Data", "Uscite", None),
        (None, "Adozione", "Morte"),
        (datetime(2024, 3, 1), 1, 1),
        (datetime(2024, 6, 1), 1, None),
        ("Totale", 2, 1),
    ]

    summary = _rows(wb["Riepilogo"])
    assert summary[1][:2] == ("Periodo", "fino al 31/12/2024")
    assert summary[2][:2] == ("Comuni", "MILANO, ROMA")
    assert summary[5][:2] == ("Dividi per comune", "Sì")
    # A single race: no race column; distinct animals
    assert summary[7:] == [
        ("Comune", "Uscite", None),
        (None, "Adozione", "Morte"),
        ("MILANO", 1, None),
        ("ROMA", 1, 1),
        ("Totale", 2, 1),
    ]


def test_overview_sheet_name():
    taken = {"riepilogo"}
    assert _sheet_name("Cane - Reggio/Calabria", taken) == (
        "Cane - Reggio-Calabria"
    )
    long = "Gatto - San Giovanni in Fiore di Sopra"
    assert _sheet_name(long, taken) == long[:31]
    assert _sheet_name(long, taken) == long[:27] + " (2)"
