import os
from datetime import datetime, timedelta
from typing import Callable

from sqlalchemy import select
from sqlalchemy.orm import Session

from hermadata.constants import AnimalFur, DocKindCode, EntryType, ExitType
from hermadata.database.models import (
    Animal,
    AnimalDocument,
    Document,
    DocumentKind,
)
from hermadata.repositories.animal.models import (
    AnimalExit,
    CompleteEntryModel,
    NewAnimalModel,
    UpdateAnimalModel,
)
from hermadata.repositories.adopter_repository import AdopterModel
from hermadata.services.animal_service import AnimalService
from hermadata.storage.disk_storage import DiskStorage
from tests.utils import random_chip_code


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

    doc_code, doc_key = db_session.execute(
        select(DocumentKind.code, Document.key)
        .select_from(Animal)
        .join(AnimalDocument, AnimalDocument.animal_id == Animal.id)
        .join(Document, Document.id == AnimalDocument.document_id)
        .join(DocumentKind, DocumentKind.id == AnimalDocument.document_kind_id)
        .where(Animal.id == animal_id)
    ).one()
    assert doc_code == DocKindCode.comunicazione_ingresso.value

    assert os.path.exists(os.path.join(disk_storage.base_path, doc_key))


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
):
    animal_id = make_animal()

    animal_service.complete_entry(
        animal_id,
        data=CompleteEntryModel(
            entry_date=datetime.now().date() - timedelta(days=10)
        ),
    )

    adopter_id = make_adopter()

    animal_service.update(
        animal_id,
        data=UpdateAnimalModel(
            birth_date=datetime.now().date() - timedelta(days=366),
            chip_code=random_chip_code(),
            fur=AnimalFur.cordato,
            name="Test",
            sex=0,
        ),
    )

    animal_service.animal_repository.exit(
        animal_id,
        data=AnimalExit(
            exit_date=datetime.now().date(),
            exit_type=ExitType.adoption,
            adopter_id=adopter_id,
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
):
    animal_id = make_animal()

    animal_service.complete_entry(
        animal_id,
        data=CompleteEntryModel(
            entry_date=datetime.now().date() - timedelta(days=10)
        ),
    )

    animal_service.update(
        animal_id,
        data=UpdateAnimalModel(
            birth_date=datetime.now().date() - timedelta(days=365),
            chip_code=random_chip_code(),
            fur=AnimalFur.cordato,
            name="Test",
            sex=0,
        ),
    )
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
