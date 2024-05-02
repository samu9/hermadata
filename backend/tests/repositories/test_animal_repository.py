from datetime import date, datetime, timedelta, timezone
import pytest
from sqlalchemy import select

from sqlalchemy.orm import Session
from hermadata.constants import EntryType, ExitType
from hermadata.database.models import Animal, AnimalEntry

from hermadata.repositories.animal.animal_repository import (
    AnimalModel,
    AnimalSearchModel,
    SQLAnimalRepository,
)
from hermadata.repositories.animal.models import (
    AnimalDaysQuery,
    AnimalExit,
    CompleteEntryModel,
    NewAnimalModel,
    NewEntryModel,
    UpdateAnimalModel,
)


def get_animal_id_by_code(db_session: Session, code: str) -> int:
    animal_id = db_session.execute(
        select(Animal.id).where(Animal.code == code)
    ).scalar()

    return animal_id


def test_new_animal(db_session):
    repo = SQLAnimalRepository(session=db_session)

    repo.new_animal(
        NewAnimalModel(
            race_id="C",
            rescue_city_code="H501",
            entry_type=EntryType.rescue.value,
        )
    )

    assert True


def test_exit(db_session: Session, animal_repository: SQLAnimalRepository):
    new_entry = NewAnimalModel(
        race_id="C",
        rescue_city_code="H501",
        entry_type=EntryType.rescue.value,
    )

    code = animal_repository.new_animal(new_entry)

    animal_id = db_session.execute(
        select(Animal.id).where(Animal.code == code)
    ).scalar()

    animal_repository.complete_entry(
        animal_id, CompleteEntryModel(entry_date=datetime.now().date())
    )

    exit_data = AnimalExit(
        exit_date=datetime.now().date(), exit_type=ExitType.death
    )
    animal_repository.exit(animal_id=animal_id, data=exit_data)

    check = db_session.execute(
        select(AnimalEntry.id).where(
            AnimalEntry.animal_id == animal_id,
            AnimalEntry.exit_date.is_(None),
        )
    ).scalar()

    assert check is None


@pytest.mark.skip(reason="Not used")
def test_save(db_session):
    repo = SQLAnimalRepository(session=db_session)
    race_id = "C"
    rescue_city_code = "A074"
    rescue_date = date(2020, 1, 2)

    code = repo.generate_code(race_id, rescue_city_code, rescue_date)
    model = AnimalModel(
        code=code,
        name="Leone",
        race_id=race_id,
        chip_code_set=False,
        sex=0,
        rescue_city_code=rescue_city_code,
    )
    repo.save(model)

    assert True


def test_search(db_session: Session):
    now = datetime.now(tz=timezone.utc) - timedelta(seconds=10)
    repo = SQLAnimalRepository(session=db_session)
    test_values = [
        NewAnimalModel(
            entry_type="R",
            rescue_city_code="A074",
            race_id="C",
        ),
        NewAnimalModel(
            entry_type="R",
            rescue_city_code="A117",
            race_id="C",
        ),
        NewAnimalModel(
            entry_type="R",
            rescue_city_code="A109",
            race_id="G",
        ),
    ]
    for t in test_values:
        repo.new_animal(t)

    query = AnimalSearchModel(race_id="C", from_created_at=now)
    result = repo.search(query)

    assert result.total >= 2
    assert "A117" in [i.rescue_city_code for i in result.items]


def test_update(db_session: Session):
    repo = SQLAnimalRepository(session=db_session)

    new_entry_data = NewAnimalModel(
        entry_type="R",
        rescue_city_code="A117",
        race_id="C",
    )

    code = repo.new_animal(new_entry_data)

    animal_id = db_session.execute(
        select(Animal.id).where(Animal.code == code)
    ).scalar()
    repo.update(
        animal_id,
        UpdateAnimalModel(
            name="Test Cat",
            sterilized=True,
        ),
    )

    name, sterilized = db_session.execute(
        select(Animal.name, Animal.sterilized).where(Animal.code == code)
    ).first()

    assert name == "Test Cat"

    assert sterilized is True

    repo.update(animal_id, UpdateAnimalModel(sterilized=False))

    name, sterilized = db_session.execute(
        select(Animal.name, Animal.sterilized).where(Animal.code == code)
    ).first()

    assert name == "Test Cat"

    assert sterilized is False


def test_add_entry(db_session: Session, animal_repository: SQLAnimalRepository):
    data = NewAnimalModel(
        race_id="C", rescue_city_code="H501", entry_type=EntryType.rescue
    )
    code = animal_repository.new_animal(data)

    animal_id = get_animal_id_by_code(db_session, code)

    animal_repository.complete_entry(
        animal_id, CompleteEntryModel(entry_date=date(2024, 1, 1))
    )

    animal_repository.exit(
        animal_id,
        AnimalExit(exit_date=date(2024, 1, 2), exit_type=ExitType.return_),
    )

    animal_repository.add_entry(
        animal_id,
        NewEntryModel(
            rescue_city_code="B180", entry_type=EntryType.confiscation
        ),
    )

    animal_repository.complete_entry(
        animal_id, CompleteEntryModel(entry_date=date(2024, 1, 3))
    )

    entries = (
        db_session.execute(
            select(AnimalEntry)
            .where(AnimalEntry.animal_id == animal_id)
            .order_by(AnimalEntry.entry_date.asc())
        )
        .scalars()
        .all()
    )

    assert len(entries) == 2
    assert entries[0].current is False


def test_count_days(
    db_session: Session, animal_repository: SQLAnimalRepository
):
    new_animal = NewAnimalModel(
        race_id="C", rescue_city_code="H501", entry_type=EntryType.rescue.value
    )

    code = animal_repository.new_animal(new_animal)

    animal_id = db_session.execute(
        select(Animal.id).where(Animal.code == code)
    ).scalar_one()

    animal_repository.update(
        animal_id,
        UpdateAnimalModel(name="Test", chip_code="123.456.789.123.456"),
    )

    animal_repository.complete_entry(
        animal_id, CompleteEntryModel(entry_date=date(2020, 1, 1))
    )

    animal_repository.exit(
        animal_id,
        AnimalExit(exit_date=date(2020, 1, 10), exit_type=ExitType.adoption),
    )

    animal_repository.add_entry(
        animal_id=animal_id,
        data=NewEntryModel(
            rescue_city_code="H501", entry_type=EntryType.confiscation
        ),
    )

    animal_repository.complete_entry(
        animal_id=animal_id,
        data=CompleteEntryModel(entry_date=date(2020, 1, 15)),
    )

    animal_repository.exit(
        animal_id,
        AnimalExit(
            exit_date=date(2020, 2, 10), exit_type=ExitType.adoption.value
        ),
    )

    result = animal_repository.count_animal_days(
        AnimalDaysQuery(
            from_date=date(2020, 1, 1),
            to_date=date(2020, 1, 31),
            city_code="H501",
        )
    )

    assert result.total_days == 25

    result = animal_repository.count_animal_days(
        AnimalDaysQuery(
            from_date=date(2020, 1, 11),
            to_date=date(2020, 1, 31),
            city_code="H501",
        )
    )

    assert result.total_days == 16

    result = animal_repository.count_animal_days(
        AnimalDaysQuery(
            from_date=date(2020, 2, 1),
            to_date=date(2020, 2, 28),
            city_code="H501",
        )
    )

    assert result.total_days == 10

    new_animal = NewAnimalModel(
        race_id="C", rescue_city_code="H501", entry_type=EntryType.rescue.value
    )

    code = animal_repository.new_animal(new_animal)

    animal_id = db_session.execute(
        select(Animal.id).where(Animal.code == code)
    ).scalar_one()

    animal_repository.update(
        animal_id,
        UpdateAnimalModel(name="Test1", chip_code="000.000.000.000.000"),
    )

    animal_repository.complete_entry(
        animal_id, CompleteEntryModel(entry_date=date(2020, 1, 10))
    )

    result = animal_repository.count_animal_days(
        AnimalDaysQuery(
            from_date=date(2020, 1, 1),
            to_date=date(2020, 1, 31),
            city_code="H501",
        )
    )

    assert result.total_days == 46

    assert len(result.items) == 2

    result = animal_repository.count_animal_days(
        AnimalDaysQuery(
            from_date=date(2020, 1, 10),
            to_date=date(2020, 1, 20),
            city_code="H501",
        )
    )

    assert result.total_days == 10 + 5
