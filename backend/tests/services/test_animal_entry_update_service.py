from datetime import date, datetime, timedelta
from typing import Callable

import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from hermadata.constants import DocKindCode, ExitType
from hermadata.database.models import Adoption, AnimalDocument, DocumentKind
from hermadata.repositories.adopter_repository import (
    IDDocumentType,
    NewAdopter,
    SQLAdopterRepository,
)
from hermadata.repositories.animal.models import (
    AnimalExit,
    CompleteEntryModel,
    NewAnimalModel,
    UpdateAnimalEntryModel,
)
from hermadata.services.animal_service import AnimalService


def test_update_entry_basic_fields(
    make_animal: Callable[[NewAnimalModel], int],
    animal_service: AnimalService,
):
    """Test that basic entry fields (dates, notes)
    are updated via the service."""
    animal_id = make_animal()

    animal_service.complete_entry(
        animal_id,
        CompleteEntryModel(entry_date=date(2024, 5, 1)),
    )

    entries = animal_service.animal_repository.get_animal_entries(animal_id)
    entry_id = entries[0].id

    updated = animal_service.update_animal_entry(
        animal_id,
        entry_id,
        UpdateAnimalEntryModel(
            entry_date=date(2024, 5, 15),
            entry_notes="Updated note",
        ),
    )

    assert updated == 1

    refreshed = animal_service.animal_repository.get_animal_entry(entry_id)
    assert refreshed.entry_date == date(2024, 5, 15)
    assert refreshed.entry_notes == "Updated note"


def test_update_entry_wrong_animal_raises(
    make_animal: Callable[[NewAnimalModel], int],
    animal_service: AnimalService,
):
    """Service should raise when entry_id doesn't belong to animal_id."""
    animal_id_1 = make_animal()
    animal_id_2 = make_animal()

    animal_service.complete_entry(
        animal_id_1,
        CompleteEntryModel(entry_date=date(2024, 5, 1)),
    )
    animal_service.complete_entry(
        animal_id_2,
        CompleteEntryModel(entry_date=date(2024, 5, 1)),
    )

    entries = animal_service.animal_repository.get_animal_entries(animal_id_1)
    entry_id = entries[0].id

    with pytest.raises(Exception, match="Entry does not belong to animal"):
        animal_service.update_animal_entry(
            animal_id_2,
            entry_id,
            UpdateAnimalEntryModel(entry_notes="Should fail"),
        )


def test_update_entry_changes_adopter(
    make_animal: Callable[[NewAnimalModel], int],
    make_adopter: Callable,
    complete_animal_data,
    animal_service: AnimalService,
    db_session: Session,
):
    """Changing adopter_id should update the Adoption row."""
    animal_id = make_animal()
    adopter_id_1 = make_adopter()

    animal_service.complete_entry(
        animal_id,
        CompleteEntryModel(
            entry_date=datetime.now().date() - timedelta(days=10)
        ),
    )
    complete_animal_data(animal_id)

    animal_service.animal_repository.exit(
        animal_id,
        AnimalExit(
            exit_date=datetime.now().date(),
            exit_type=ExitType.adoption,
            adopter_id=adopter_id_1,
            notes="Original",
            location_address="Via Vecchia 1",
            location_city_code="H501",
        ),
    )

    # Verify original adoption
    adoption = db_session.execute(
        select(Adoption).where(
            Adoption.animal_id == animal_id,
            Adoption.returned_at.is_(None),
        )
    ).scalar_one()
    assert adoption.adopter_id == adopter_id_1

    # Create second adopter
    adopter_repo = SQLAdopterRepository()(db_session)
    adopter_obj = adopter_repo.create(
        data=NewAdopter(
            fiscal_code="NRIMRC90D15H501Y",
            name="Marco",
            surname="Neri",
            birth_city_code="H501",
            birth_date=date(1990, 4, 15),
            phone="3331112222",
            residence_city_code="H501",
            document_number="FF11111GG",
            document_type=IDDocumentType.identity_card,
        )
    )
    adopter_id_2 = adopter_obj.id

    entries = animal_service.animal_repository.get_animal_entries(animal_id)
    entry_id = entries[0].id

    animal_service.update_animal_entry(
        animal_id,
        entry_id,
        UpdateAnimalEntryModel(
            adopter_id=adopter_id_2,
            location_address="Via Nuova 10",
            location_city_code="H501",
        ),
    )

    db_session.expire_all()
    adoption = db_session.execute(
        select(Adoption).where(
            Adoption.animal_id == animal_id,
            Adoption.returned_at.is_(None),
        )
    ).scalar_one()

    assert adoption.adopter_id == adopter_id_2
    assert adoption.location_address == "Via Nuova 10"
    assert adoption.location_city_code == "H501"


def test_update_entry_adopter_regenerates_documents(
    make_animal: Callable[[NewAnimalModel], int],
    make_adopter: Callable,
    complete_animal_data,
    animal_service: AnimalService,
    db_session: Session,
):
    """
    Changing adopter on an adoption entry should trigger
    regeneration of adoption documents.
    """

    animal_id = make_animal()
    adopter_id_1 = make_adopter()

    animal_service.complete_entry(
        animal_id,
        CompleteEntryModel(
            entry_date=datetime.now().date() - timedelta(days=10)
        ),
    )
    complete_animal_data(animal_id)

    animal_service.animal_repository.exit(
        animal_id,
        AnimalExit(
            exit_date=datetime.now().date(),
            exit_type=ExitType.adoption,
            adopter_id=adopter_id_1,
            notes="Original",
            location_address="Via Vecchia 1",
            location_city_code="H501",
        ),
    )

    # Count initial adoption documents
    initial_docs = db_session.execute(
        select(AnimalDocument)
        .join(DocumentKind, DocumentKind.id == AnimalDocument.document_kind_id)
        .where(
            AnimalDocument.animal_id == animal_id,
            DocumentKind.code == DocKindCode.adozione.value,
        )
    ).all()
    initial_count = len(initial_docs)

    # Create second adopter
    adopter_repo = SQLAdopterRepository()(db_session)
    adopter_obj = adopter_repo.create(
        data=NewAdopter(
            fiscal_code="RSSGPP75A01H501Q",
            name="Giuseppe",
            surname="Rosso",
            birth_city_code="H501",
            birth_date=date(1975, 1, 1),
            phone="4445556666",
            residence_city_code="H501",
            document_number="HH22222II",
            document_type=IDDocumentType.identity_card,
        )
    )
    adopter_id_2 = adopter_obj.id

    entries = animal_service.animal_repository.get_animal_entries(animal_id)
    entry_id = entries[0].id

    animal_service.update_animal_entry(
        animal_id,
        entry_id,
        UpdateAnimalEntryModel(
            adopter_id=adopter_id_2,
            location_address="Via Nuova 10",
            location_city_code="H501",
        ),
    )

    # After adopter change, new adoption documents should be generated
    db_session.expire_all()
    final_docs = db_session.execute(
        select(AnimalDocument)
        .join(DocumentKind, DocumentKind.id == AnimalDocument.document_kind_id)
        .where(
            AnimalDocument.animal_id == animal_id,
            DocumentKind.code == DocKindCode.adozione.value,
        )
    ).all()

    # There should be more adoption documents than before
    assert len(final_docs) > initial_count
