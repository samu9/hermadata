from datetime import date, datetime, timedelta

from fastapi.encoders import jsonable_encoder
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from hermadata.constants import ExitType
from hermadata.database.models import Adoption, AnimalEntry
from hermadata.repositories.animal.models import (
    AnimalExit,
    CompleteEntryModel,
    UpdateAnimalEntryModel,
)
from hermadata.services.animal_service import AnimalService


def test_update_animal_entry_dates(
    app: TestClient,
    make_animal,
    animal_service: AnimalService,
    db_session: Session,
):
    """Test updating entry and exit dates on an animal entry."""
    animal_id = make_animal()

    animal_service.complete_entry(
        animal_id,
        CompleteEntryModel(entry_date=date(2024, 6, 1)),
    )

    entries = animal_service.animal_repository.get_animal_entries(animal_id)
    entry_id = entries[0].id

    new_entry_date = date(2024, 7, 1)
    data = jsonable_encoder(
        UpdateAnimalEntryModel(entry_date=new_entry_date).model_dump(
            exclude_none=True
        )
    )

    result = app.put(f"/animal/{animal_id}/entries/{entry_id}", json=data)

    assert result.status_code == 200
    body = result.json()
    assert body["updated_rows"] == 1

    entry = db_session.execute(
        select(AnimalEntry).where(AnimalEntry.id == entry_id)
    ).scalar_one()

    assert entry.entry_date == new_entry_date


def test_update_animal_entry_notes(
    app: TestClient,
    make_animal,
    animal_service: AnimalService,
    db_session: Session,
):
    """Test updating entry and exit notes."""
    animal_id = make_animal()
    animal_service.complete_entry(
        animal_id,
        CompleteEntryModel(entry_date=date(2024, 6, 1)),
    )

    entries = animal_service.animal_repository.get_animal_entries(animal_id)
    entry_id = entries[0].id

    data = jsonable_encoder(
        UpdateAnimalEntryModel(
            entry_notes="Nota ingresso aggiornata",
            exit_notes="Nota uscita aggiornata",
        ).model_dump(exclude_none=True)
    )

    result = app.put(f"/animal/{animal_id}/entries/{entry_id}", json=data)

    assert result.status_code == 200

    entry = db_session.execute(
        select(AnimalEntry).where(AnimalEntry.id == entry_id)
    ).scalar_one()

    assert entry.entry_notes == "Nota ingresso aggiornata"
    assert entry.exit_notes == "Nota uscita aggiornata"


def test_update_animal_entry_not_found(
    app: TestClient,
    make_animal,
    animal_service: AnimalService,
):
    """Test updating a non-existent entry returns 404."""
    animal_id = make_animal()
    animal_service.complete_entry(
        animal_id,
        CompleteEntryModel(entry_date=date(2024, 6, 1)),
    )

    result = app.put(
        f"/animal/{animal_id}/entries/999999",
        json={"entry_notes": "test"},
    )

    assert result.status_code == 400


def test_update_animal_entry_wrong_animal(
    app: TestClient,
    make_animal,
    animal_service: AnimalService,
):
    """Test updating an entry that belongs to a
    different animal returns 404."""
    animal_id_1 = make_animal()
    animal_id_2 = make_animal()

    animal_service.complete_entry(
        animal_id_1,
        CompleteEntryModel(entry_date=date(2024, 6, 1)),
    )
    animal_service.complete_entry(
        animal_id_2,
        CompleteEntryModel(entry_date=date(2024, 6, 1)),
    )

    entries = animal_service.animal_repository.get_animal_entries(animal_id_1)
    entry_id = entries[0].id

    # Try to update animal_id_1's entry using animal_id_2's route
    result = app.put(
        f"/animal/{animal_id_2}/entries/{entry_id}",
        json={"entry_notes": "test"},
    )

    assert result.status_code == 400


def test_update_adopter_on_adoption_entry(
    app: TestClient,
    make_animal,
    make_adopter,
    complete_animal_data,
    animal_service: AnimalService,
    db_session: Session,
):
    """Test changing the adopter on an entry with adoption exit type."""
    animal_id = make_animal()
    adopter_id_1 = make_adopter()

    animal_service.complete_entry(
        animal_id,
        CompleteEntryModel(
            entry_date=datetime.now().date() - timedelta(days=10)
        ),
    )
    complete_animal_data(animal_id)

    # Create initial exit with adoption
    animal_service.animal_repository.exit(
        animal_id,
        AnimalExit(
            exit_date=datetime.now().date(),
            exit_type=ExitType.adoption,
            adopter_id=adopter_id_1,
            notes="Initial adoption",
            location_address="Via Roma 1",
            location_city_code="H501",
        ),
    )

    # Verify initial adoption
    adoption = db_session.execute(
        select(Adoption).where(Adoption.animal_id == animal_id)
    ).scalar_one()
    assert adoption.adopter_id == adopter_id_1

    entries = animal_service.animal_repository.get_animal_entries(animal_id)
    entry_id = entries[0].id

    # Now change the adopter via update_animal_entry
    from hermadata.repositories.adopter_repository import (
        IDDocumentType,
        NewAdopter,
    )

    adopter_2 = NewAdopter(
        fiscal_code="VRDLGI80B01H501Z",
        name="Luigi",
        surname="Verdi",
        birth_city_code="H501",
        birth_date=date(1980, 2, 1),
        phone="9876543210",
        residence_city_code="H501",
        document_number="CC98765DD",
        document_type=IDDocumentType.identity_card,
    )
    from hermadata.repositories.adopter_repository import SQLAdopterRepository

    adopter_repo = SQLAdopterRepository()
    adopter_repo = adopter_repo(db_session)
    adopter_obj = adopter_repo.create(data=adopter_2)
    adopter_id_2 = adopter_obj.id

    data = jsonable_encoder(
        UpdateAnimalEntryModel(
            adopter_id=adopter_id_2,
            location_address="Via Nuova 5",
            location_city_code="H501",
        ).model_dump(exclude_none=True)
    )

    result = app.put(f"/animal/{animal_id}/entries/{entry_id}", json=data)

    assert result.status_code == 200

    # Verify adoption row was updated
    db_session.expire_all()
    adoption = db_session.execute(
        select(Adoption).where(
            Adoption.animal_id == animal_id,
            Adoption.returned_at.is_(None),
        )
    ).scalar_one()

    assert adoption.adopter_id == adopter_id_2
    assert adoption.location_address == "Via Nuova 5"
    assert adoption.location_city_code == "H501"


def test_update_adopter_on_temporary_adoption_entry(
    app: TestClient,
    make_animal,
    make_adopter,
    complete_animal_data,
    animal_service: AnimalService,
    db_session: Session,
):
    """Test changing the adopter on an entry with
    temporary adoption exit type."""
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
            exit_type=ExitType.temporary_adoption,
            adopter_id=adopter_id_1,
            notes="Temporary adoption",
            location_address="Via Temporanea 1",
            location_city_code="H501",
        ),
    )

    entries = animal_service.animal_repository.get_animal_entries(animal_id)
    entry_id = entries[0].id

    from hermadata.repositories.adopter_repository import (
        IDDocumentType,
        NewAdopter,
        SQLAdopterRepository,
    )

    adopter_repo = SQLAdopterRepository()(db_session)
    adopter_obj = adopter_repo.create(
        data=NewAdopter(
            fiscal_code="BNCLRA85C50H501X",
            name="Chiara",
            surname="Bianchi",
            birth_city_code="H501",
            birth_date=date(1985, 3, 10),
            phone="5551234567",
            residence_city_code="H501",
            document_number="DD55555EE",
            document_type=IDDocumentType.identity_card,
        )
    )
    adopter_id_2 = adopter_obj.id

    data = jsonable_encoder(
        UpdateAnimalEntryModel(
            adopter_id=adopter_id_2,
            location_address="Via Temporanea 2",
            location_city_code="H501",
        ).model_dump(exclude_none=True)
    )

    result = app.put(f"/animal/{animal_id}/entries/{entry_id}", json=data)

    assert result.status_code == 200

    db_session.expire_all()
    adoption = db_session.execute(
        select(Adoption).where(
            Adoption.animal_id == animal_id,
            Adoption.returned_at.is_(None),
        )
    ).scalar_one()

    assert adoption.adopter_id == adopter_id_2
    assert adoption.location_address == "Via Temporanea 2"


def test_get_entries_includes_adopter_info(
    app: TestClient,
    make_animal,
    make_adopter,
    complete_animal_data,
    animal_service: AnimalService,
):
    """Test that GET entries returns adopter_id and location fields."""
    animal_id = make_animal()
    adopter_id = make_adopter()

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
            adopter_id=adopter_id,
            notes="Adoption test",
            location_address="Via Test 10",
            location_city_code="H501",
        ),
    )

    result = app.get(f"/animal/{animal_id}/entries")

    assert result.status_code == 200
    entries = result.json()
    assert len(entries) >= 1

    entry = entries[0]
    assert entry["adopter_id"] == adopter_id
    assert entry["location_address"] == "VIA TEST 10"
    assert entry["location_city_code"] == "H501"
