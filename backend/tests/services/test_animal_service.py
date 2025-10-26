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
