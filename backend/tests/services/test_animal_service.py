from datetime import datetime, timedelta
from typing import Callable

from sqlalchemy import select
from sqlalchemy.orm import Session

from hermadata.constants import DocKindCode, EntryType, ExitType
from hermadata.database.models import AnimalDocument, Document, DocumentKind
from hermadata.repositories.adopter_repository import AdopterModel
from hermadata.repositories.animal.models import (
    AnimalExit,
    CompleteEntryModel,
    NewAnimalModel,
    UpdateAnimalModel,
)
from hermadata.services.animal_service import AnimalService
from hermadata.storage.disk_storage import DiskStorage


def test_new_entry(
    disk_storage: DiskStorage,
    animal_service: AnimalService,
    make_animal: Callable[[NewAnimalModel], int],
    db_session: Session,
):
    animal_id = make_animal(
        NewAnimalModel(
            race_id="C",
            rescue_city_code="H501",
            entry_type=EntryType.confiscation.value,
        )
    )

    animal_service.complete_entry(
        animal_id, CompleteEntryModel(entry_date=datetime.now().date())
    )


def test_update(
    make_animal: Callable[[NewAnimalModel], int],
    animal_service: AnimalService,
):
    animal_id = make_animal()

    affected = animal_service.update(
        animal_id,
        UpdateAnimalModel(name="Dingo", chip_code="111.111.111.111.111"),
    )

    assert affected == 1


def test_variation_report_adoption(
    make_animal: Callable[[NewAnimalModel], int],
    make_adopter: Callable[[AdopterModel], AdopterModel],
    animal_service: AnimalService,
    complete_animal_data,
):
    animal_id = make_animal()

    animal_service.complete_entry(
        animal_id,
        data=CompleteEntryModel(
            entry_date=datetime.now().date() - timedelta(days=10)
        ),
    )

    adopter_id = make_adopter()

    complete_animal_data(animal_id)

    animal_service.animal_repository.exit(
        animal_id,
        data=AnimalExit(
            exit_date=datetime.now().date(),
            exit_type=ExitType.adoption,
            adopter_id=adopter_id,
            notes="Test",
            location_address="Via test",
            location_city_code="H501",
        ),
    )

    animal_service.generate_variation_report(animal_id)

    animal_service.animal_repository.session.execute(
        select(DocumentKind.code)
        .select_from(AnimalDocument)
        .join(Document, Document.id == AnimalDocument.document_id)
        .join(
            DocumentKind,
            DocumentKind.id == AnimalDocument.document_kind_id,
        )
        .where(
            AnimalDocument.animal_id == animal_id,
            DocumentKind.code == DocKindCode.variazione.value,
        )
    ).scalar_one()


def test_variation_report_death(
    make_animal: Callable[[NewAnimalModel], int],
    animal_service: AnimalService,
    complete_animal_data,
):
    animal_id = make_animal()

    animal_service.complete_entry(
        animal_id,
        data=CompleteEntryModel(
            entry_date=datetime.now().date() - timedelta(days=10)
        ),
    )

    complete_animal_data(animal_id)

    animal_service.animal_repository.exit(
        animal_id,
        data=AnimalExit(
            exit_date=datetime.now().date(), exit_type=ExitType.death
        ),
    )

    animal_service.generate_variation_report(animal_id)

    animal_service.animal_repository.session.execute(
        select(DocumentKind.code)
        .select_from(AnimalDocument)
        .join(Document, Document.id == AnimalDocument.document_id)
        .join(
            DocumentKind,
            DocumentKind.id == AnimalDocument.document_kind_id,
        )
        .where(
            AnimalDocument.animal_id == animal_id,
            DocumentKind.code == DocKindCode.variazione.value,
        )
    ).scalar_one()


def test_generate_entry_report(
    make_animal: Callable[[NewAnimalModel], int],
    animal_service: AnimalService,
    complete_animal_data,
):
    from hermadata.repositories.animal.models import AnimalEntriesQuery
    from hermadata.constants import EntryType
    from datetime import date

    animal_id = make_animal()

    animal_service.complete_entry(
        animal_id,
        data=CompleteEntryModel(entry_date=datetime.now().date()),
    )

    entries = animal_service.animal_repository.get_animal_entries(animal_id)
    assert len(entries) >= 1
    entry_id = entries[0].id

    animal_service.generate_entry_report(entry_id)


def test_days_report(
    animal_service: AnimalService,
):
    from datetime import date
    from hermadata.repositories.animal.models import AnimalDaysQuery

    query = AnimalDaysQuery(
        from_date=date(2024, 1, 1),
        to_date=date(2024, 12, 31),
        city_code="H501",
    )

    filename, report = animal_service.days_report(query)

    assert filename is not None
    assert report is not None
    assert isinstance(report, bytes)


def test_entries_report(
    animal_service: AnimalService,
):
    from datetime import date
    from hermadata.constants import EntryType
    from hermadata.repositories.animal.models import AnimalEntriesQuery

    query = AnimalEntriesQuery(
        from_date=date(2024, 1, 1),
        to_date=date(2024, 12, 31),
        entry_type=EntryType.rescue,
        city_code="H501",
    )

    filename, report = animal_service.entries_report(query)

    assert filename is not None
    assert report is not None
    assert isinstance(report, bytes)


def test_exits_report(
    animal_service: AnimalService,
):
    from datetime import date
    from hermadata.constants import ExitType
    from hermadata.repositories.animal.models import AnimalExitsQuery

    query = AnimalExitsQuery(
        from_date=date(2024, 1, 1),
        to_date=date(2024, 12, 31),
        exit_type=ExitType.adoption,
        city_code="H501",
    )

    filename, report = animal_service.exits_report(query)

    assert filename is not None
    assert report is not None
    assert isinstance(report, bytes)
