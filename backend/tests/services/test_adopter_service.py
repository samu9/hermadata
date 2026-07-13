from datetime import date, datetime, timedelta
from typing import Callable

from sqlalchemy import select

from hermadata.constants import DocKindCode, ExitType
from hermadata.database.models import AnimalDocument, DocumentKind
from hermadata.repositories.animal.models import (
    AnimalExit,
    CompleteEntryModel,
    NewAnimalModel,
)
from hermadata.services.adopter_service import (
    AdopterService,
    NewAdopterRequest,
)
from hermadata.services.animal_service import AnimalService


def test_create_adopter(adopter_service: AdopterService):
    """Test creating a new adopter through the service."""
    new_adopter_data = NewAdopterRequest(
        name="Mario",
        surname="Rossi",
        fiscal_code="RSSMRA80A01H501U",
        residence_city_code="H501",
        phone="3331234567",
        document_type="id",
        document_number="AR1234567",
    )

    result = adopter_service.create(new_adopter_data)

    assert result.name == "MARIO"
    assert result.surname == "ROSSI"
    assert result.fiscal_code == "RSSMRA80A01H501U"
    assert result.residence_city_code == "H501"
    assert result.phone == "3331234567"
    assert result.document_type == "id"
    assert result.document_number == "AR1234567"
    assert result.id is not None
    assert result.birth_city_code == "H501"
    assert result.birth_date == date(1980, 1, 1)


def test_search_adopters(
    adopter_service: AdopterService, make_adopter: callable
):
    """Test searching for adopters through the service."""
    from hermadata.repositories.adopter_repository import AdopterSearchQuery

    make_adopter()
    # Search for the adopter
    search_query = AdopterSearchQuery(
        name="Mario",
        from_index=0,
        to_index=10,
    )

    result = adopter_service.search(search_query)

    assert len(result.items) > 0
    assert result.items[0].name == "MARIO"


def test_create_adopter_invalid_fiscal_code(adopter_service: AdopterService):
    """Test that creating an adopter with invalid fiscal code raises error."""
    import pytest

    from hermadata.errors import InvalidFiscalCodeException

    new_adopter_data = NewAdopterRequest(
        name="Mario",
        surname="Rossi",
        fiscal_code="RSSMRA80A01ZZZZU",  # Invalid fiscal code (ZZZZ not a valid birthplace)
        residence_city_code="H501",
        phone="3331234567",
        document_type="id",
        document_number="AR1234567",
    )

    with pytest.raises(InvalidFiscalCodeException):
        adopter_service.create(new_adopter_data)


def test_create_adopter_invalid_residence_city(
    adopter_service: AdopterService,
):
    """Test creating adopter with invalid residence city raises error."""
    import pytest

    new_adopter_data = NewAdopterRequest(
        name="Mario",
        surname="Rossi",
        fiscal_code="RSSMRA80A01H501U",
        residence_city_code="ZZZZ",  # Invalid city code
        phone="3331234567",
        document_type="id",
        document_number="AR1234567",
    )

    with pytest.raises(ValueError, match="Residence city code 'ZZZZ'"):
        adopter_service.create(new_adopter_data)


def test_create_adopter_foreign_born(adopter_service: AdopterService):
    """Test creating an adopter born abroad (foreign birthplace code starting with Z)."""
    # RSSMRA80A01Z100A is a valid codice fiscale for someone born in Albania (Z100)
    new_adopter_data = NewAdopterRequest(
        name="Mario",
        surname="Rossi",
        fiscal_code="RSSMRA80A01Z100A",
        residence_city_code="H501",
        phone="3331234567",
        document_type="id",
        document_number="AR1234567",
    )

    result = adopter_service.create(new_adopter_data)

    assert result.name == "MARIO"
    assert result.surname == "ROSSI"
    assert result.fiscal_code == "RSSMRA80A01Z100A"
    assert result.birth_city_code == "Z100"
    assert result.birth_date == date(1980, 1, 1)

    # Verify the foreign city was stored in the database
    from hermadata.repositories.city_repository import SQLCityRepository

    city = adopter_service.city_repository.get_comune("Z100")
    assert city is not None
    assert city.name == "STATO ESTERO"
    assert city.provincia == "EE"


def test_update_adopter_marks_adoption_documents_dirty(
    adopter_service: AdopterService,
    animal_service: AnimalService,
    make_animal: Callable[[NewAnimalModel], int],
    complete_animal_data: Callable[[int], None],
):
    """Editing an adopter flags its rendered adoption (AD) documents dirty.

    Non-adoption rendered documents on the same entry (e.g. the variation
    report) must stay clean, since they don't embed adopter data.
    """
    adopter = adopter_service.create(
        NewAdopterRequest(
            name="Mario",
            surname="Rossi",
            fiscal_code="RSSMRA80A01H501U",
            residence_city_code="H501",
            phone="3331234567",
            document_type="id",
            document_number="AR1234567",
        )
    )

    # Set up an adopted animal: exit with adoption produces a rendered
    # adoption (AD) document plus a variation (VA) document on the same entry.
    animal_id = make_animal()
    animal_service.complete_entry(
        animal_id,
        CompleteEntryModel(
            entry_date=datetime.now().date() - timedelta(days=10)
        ),
    )
    complete_animal_data(animal_id)
    animal_service.exit(
        animal_id,
        AnimalExit(
            exit_date=datetime.now().date(),
            exit_type=ExitType.adoption,
            adopter_id=adopter.id,
            notes="Test",
            location_address="Via test",
            location_city_code="H501",
        ),
    )

    entry_id = animal_service.animal_repository.get_current_entry_id(animal_id)
    session = adopter_service.adopter_repository.session

    def dirty_flags(kind_code: str) -> list:
        return (
            session.execute(
                select(AnimalDocument.dirty)
                .join(
                    DocumentKind,
                    DocumentKind.id == AnimalDocument.document_kind_id,
                )
                .where(
                    AnimalDocument.animal_entry_id == entry_id,
                    AnimalDocument.deleted_at.is_(None),
                    DocumentKind.code == kind_code,
                )
            )
            .scalars()
            .all()
        )

    ad_before = dirty_flags(DocKindCode.adozione.value)
    assert ad_before and all(not d for d in ad_before)

    adopter_service.update(
        adopter.id,
        NewAdopterRequest(
            name="Luigi",
            surname="Verdi",
            fiscal_code="RSSMRA80A01H501U",
            residence_city_code="H501",
            phone="3339999999",
            document_type="id",
            document_number="AR7654321",
        ),
    )

    # Adopter record updated.
    updated = adopter_service.adopter_repository.get_by_id(adopter.id)
    assert updated.name == "LUIGI"
    assert updated.phone == "3339999999"

    # Adoption document flagged dirty; variation document left clean.
    assert all(dirty_flags(DocKindCode.adozione.value))
    assert all(not d for d in dirty_flags(DocKindCode.variazione.value))
