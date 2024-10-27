from datetime import datetime
import os

from sqlalchemy import select
from hermadata.constants import DocKindCode, EntryType
from hermadata.database.models import (
    Animal,
    AnimalDocument,
    Document,
    DocumentKind,
)
from hermadata.repositories.animal.models import (
    CompleteEntryModel,
    NewAnimalModel,
    UpdateAnimalModel,
)
from hermadata.services.animal_service import AnimalService
from sqlalchemy.orm import Session
from hermadata.storage.disk_storage import DiskStorage
from typing import Callable


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
