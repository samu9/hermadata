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
            structure_id=1,
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

    animal_service.generate_variation_report(
        animal_id,
        animal_service.animal_repository.get_current_entry_id(animal_id),
    )

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

    animal_service.generate_variation_report(
        animal_id,
        animal_service.animal_repository.get_current_entry_id(animal_id),
    )

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


def test_temporary_adoption_exit_generates_document(
    make_animal,
    make_adopter,
    animal_service: AnimalService,
    complete_animal_data,
    db_session,
):
    """Test that exiting with temporary adoption generates a document with 'Temporanea' in title."""
    from sqlalchemy import select
    from hermadata.constants import DocKindCode
    from hermadata.database.models import AnimalDocument, DocumentKind
    from datetime import datetime, timedelta

    animal_id = make_animal()
    animal_service.complete_entry(
        animal_id,
        data=CompleteEntryModel(
            entry_date=datetime.now().date() - timedelta(days=10)
        ),
    )
    adopter_id = make_adopter()
    complete_animal_data(animal_id)

    animal_service.exit(
        animal_id,
        data=AnimalExit(
            exit_date=datetime.now().date(),
            exit_type=ExitType.temporary_adoption,
            adopter_id=adopter_id,
            notes="Test temporaneo",
            location_address="Via test",
            location_city_code="H501",
        ),
    )

    # Verify a document was generated with the correct kind
    doc = animal_service.animal_repository.session.execute(
        select(AnimalDocument.title)
        .join(DocumentKind, DocumentKind.id == AnimalDocument.document_kind_id)
        .where(
            AnimalDocument.animal_id == animal_id,
            DocumentKind.code == DocKindCode.adozione.value,
        )
    ).scalar_one()

    assert doc is not None
    assert "Temporanea" in doc or "Adozione Temporanea" in doc


def test_confirm_temporary_adoption_service(
    make_animal,
    make_adopter,
    animal_service: AnimalService,
    complete_animal_data,
    db_session,
):
    """Test that confirming a temporary adoption via service generates a final adoption document."""
    from sqlalchemy import select
    from hermadata.constants import DocKindCode
    from hermadata.database.models import AnimalDocument, AnimalEntry, DocumentKind
    from datetime import datetime, timedelta, date

    animal_id = make_animal()
    animal_service.complete_entry(
        animal_id,
        data=CompleteEntryModel(
            entry_date=datetime.now().date() - timedelta(days=20)
        ),
    )
    adopter_id = make_adopter()
    complete_animal_data(animal_id)

    animal_service.exit(
        animal_id,
        data=AnimalExit(
            exit_date=datetime.now().date() - timedelta(days=5),
            exit_type=ExitType.temporary_adoption,
            adopter_id=adopter_id,
            notes="Test temporaneo",
            location_address="Via test",
            location_city_code="H501",
        ),
    )

    confirmation_date = datetime.now().date()
    animal_service.confirm_temporary_adoption(animal_id, confirmation_date)

    # Verify exit type is now adoption
    entry = animal_service.animal_repository.session.execute(
        select(AnimalEntry).where(
            AnimalEntry.animal_id == animal_id,
            AnimalEntry.current.is_(True),
        )
    ).scalar_one()

    assert entry.exit_type == ExitType.adoption
    assert entry.exit_date == confirmation_date

    # Verify a final adoption document was generated
    docs = animal_service.animal_repository.session.execute(
        select(AnimalDocument.title)
        .join(DocumentKind, DocumentKind.id == AnimalDocument.document_kind_id)
        .where(
            AnimalDocument.animal_id == animal_id,
            DocumentKind.code == DocKindCode.adozione.value,
        )
    ).scalars().all()

    # There should be at least 2 documents: one for temp adoption, one for final
    assert len(docs) >= 2
    # The last one should NOT have "Temporanea" in title
    final_doc = [d for d in docs if d and "Temporanea" not in d]
    assert len(final_doc) >= 1


def test_edit_marks_documents_dirty_and_rerender_clears(
    make_animal,
    make_adopter,
    animal_service: AnimalService,
    complete_animal_data,
):
    """Editing embedded data flags the entry's rendered docs dirty; re-render
    produces a fresh, non-dirty document tied to the same entry."""
    animal_id = make_animal()
    animal_service.complete_entry(
        animal_id,
        data=CompleteEntryModel(
            entry_date=datetime.now().date() - timedelta(days=10)
        ),
    )
    adopter_id = make_adopter()
    complete_animal_data(animal_id)

    animal_service.exit(
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

    repo = animal_service.animal_repository

    # The exit generated a fresh (non-dirty) adoption document.
    docs = repo.get_documents(animal_id)
    ad_doc = next(
        d
        for d in docs
        if d.document_kind_code == DocKindCode.adozione.value
    )
    assert ad_doc.dirty is False
    assert ad_doc.rerenderable is True
    assert ad_doc.animal_entry_id is not None
    entry_id = ad_doc.animal_entry_id
    old_document_id = ad_doc.document_id

    # Editing animal data flags the entry's rendered documents dirty.
    animal_service.update(animal_id, UpdateAnimalModel(name="Rinominato"))
    docs = repo.get_documents(animal_id)
    ad_doc = next(
        d
        for d in docs
        if d.document_kind_code == DocKindCode.adozione.value
    )
    assert ad_doc.dirty is True

    # Re-render: old doc gone, fresh doc in its place, same entry, not dirty.
    animal_service.rerender_document(animal_id, old_document_id)
    docs = repo.get_documents(animal_id)
    ad_docs = [
        d
        for d in docs
        if d.document_kind_code == DocKindCode.adozione.value
    ]
    assert len(ad_docs) == 1
    new_ad = ad_docs[0]
    assert new_ad.document_id != old_document_id
    assert new_ad.dirty is False
    assert new_ad.animal_entry_id == entry_id


def test_rerender_document_not_found_raises(
    make_animal,
    animal_service: AnimalService,
):
    import pytest
    from sqlalchemy.exc import NoResultFound

    animal_id = make_animal()
    with pytest.raises(NoResultFound):
        animal_service.rerender_document(animal_id, 999999)
