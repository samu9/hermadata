from datetime import date, datetime, timedelta, timezone
from uuid import uuid4

import pytest
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from hermadata.constants import AnimalFur, EntryType, ExitType, RecurrenceType
from hermadata.database.models import (
    Animal,
    AnimalEntry,
    FurColor,
    MedicalActivityRecord,
)
from hermadata.models import UtilElement
from hermadata.repositories.animal.animal_repository import (
    AnimalModel,
    AnimalSearchModel,
    AnimalWithoutChipCodeException,
    SQLAnimalRepository,
)
from hermadata.repositories.animal.models import (
    AnimalDaysQuery,
    AnimalExit,
    AnimalExitsQuery,
    CompleteEntryModel,
    MedicalActivityModel,
    NewAnimalModel,
    NewEntryModel,
    UpdateAnimalModel,
)
from hermadata.repositories.breed_repository import (
    NewBreedModel,
    SQLBreedRepository,
)
from tests.utils import random_chip_code


def get_animal_id_by_code(db_session: Session, code: str) -> int:
    animal_id = db_session.execute(select(Animal.id).where(Animal.code == code)).scalar()

    return animal_id


def test_new_animal(animal_repository: SQLAnimalRepository):
    animal_repository.new_animal(
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

    animal_id = db_session.execute(select(Animal.id).where(Animal.code == code)).scalar()

    animal_repository.complete_entry(animal_id, CompleteEntryModel(entry_date=datetime.now().date()))
    exit_notes = uuid4().hex

    exit_data = AnimalExit(
        exit_date=datetime.now().date(),
        exit_type=ExitType.death,
        notes=exit_notes,
    )
    with pytest.raises(AnimalWithoutChipCodeException):
        animal_repository.exit(animal_id=animal_id, data=exit_data)

    animal_repository.update(animal_id, UpdateAnimalModel(chip_code=random_chip_code()))

    animal_repository.exit(animal_id=animal_id, data=exit_data)

    check = db_session.execute(
        select(AnimalEntry.id).where(
            AnimalEntry.animal_id == animal_id,
            AnimalEntry.exit_date.is_(None),
        )
    ).scalar()

    assert check is None

    notes_check = db_session.execute(
        select(AnimalEntry).where(AnimalEntry.animal_id == animal_id).order_by(AnimalEntry.created_at.desc())
    ).scalar()

    assert notes_check.exit_notes == exit_notes


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


def test_search(animal_repository: SQLAnimalRepository, make_animal):
    now = datetime.now(tz=timezone.utc) - timedelta(seconds=10)
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
        make_animal(t)

    query = AnimalSearchModel(race_id="C", from_created_at=now)
    result = animal_repository.search(query)

    assert result.total >= 2
    assert "A117" in [i.rescue_city_code for i in result.items]


def test_update(db_session: Session, animal_repository: SQLAnimalRepository):
    new_entry_data = NewAnimalModel(
        entry_type="R",
        rescue_city_code="A117",
        race_id="C",
    )

    code = animal_repository.new_animal(new_entry_data)

    animal_id = db_session.execute(select(Animal.id).where(Animal.code == code)).scalar()
    animal_repository.update(
        animal_id,
        UpdateAnimalModel(
            name="Test Cat",
            sterilized=True,
        ),
    )

    name, sterilized = db_session.execute(select(Animal.name, Animal.sterilized).where(Animal.code == code)).first()

    assert name == "Test Cat"

    assert sterilized is True

    animal_repository.update(animal_id, UpdateAnimalModel(sterilized=False))

    name, sterilized = db_session.execute(select(Animal.name, Animal.sterilized).where(Animal.code == code)).first()

    assert name == "Test Cat"

    assert sterilized is False


def test_add_entry(db_session: Session, animal_repository: SQLAnimalRepository):
    data = NewAnimalModel(race_id="C", rescue_city_code="H501", entry_type=EntryType.rescue)
    code = animal_repository.new_animal(data)

    animal_id = get_animal_id_by_code(db_session, code)

    animal_repository.complete_entry(animal_id, CompleteEntryModel(entry_date=date(2024, 1, 1)))

    with pytest.raises(AnimalWithoutChipCodeException):
        animal_repository.exit(
            animal_id,
            AnimalExit(exit_date=date(2024, 1, 2), exit_type=ExitType.return_),
        )

    animal_repository.update(animal_id, UpdateAnimalModel(chip_code=random_chip_code()))

    animal_repository.exit(
        animal_id,
        AnimalExit(exit_date=date(2024, 1, 2), exit_type=ExitType.return_),
    )

    animal_repository.add_entry(
        animal_id,
        NewEntryModel(rescue_city_code="B180", entry_type=EntryType.confiscation),
    )

    animal_repository.complete_entry(animal_id, CompleteEntryModel(entry_date=date(2024, 1, 3)))

    entries = (
        db_session.execute(
            select(AnimalEntry).where(AnimalEntry.animal_id == animal_id).order_by(AnimalEntry.entry_date.asc())
        )
        .scalars()
        .all()
    )

    assert len(entries) == 2
    assert entries[0].current is False


def test_count_days(db_session: Session, animal_repository: SQLAnimalRepository):
    new_animal = NewAnimalModel(race_id="C", rescue_city_code="H501", entry_type=EntryType.rescue.value)

    code = animal_repository.new_animal(new_animal)

    animal_id = db_session.execute(select(Animal.id).where(Animal.code == code)).scalar_one()

    animal_repository.update(
        animal_id,
        UpdateAnimalModel(name="Test", chip_code="123.456.789.123.456"),
    )

    animal_repository.complete_entry(animal_id, CompleteEntryModel(entry_date=date(2020, 1, 1)))

    animal_repository.exit(
        animal_id,
        AnimalExit(exit_date=date(2020, 1, 10), exit_type=ExitType.disappeared),
    )

    animal_repository.add_entry(
        animal_id=animal_id,
        data=NewEntryModel(rescue_city_code="H501", entry_type=EntryType.confiscation),
    )

    animal_repository.complete_entry(
        animal_id=animal_id,
        data=CompleteEntryModel(entry_date=date(2020, 1, 15)),
    )

    animal_repository.exit(
        animal_id,
        AnimalExit(exit_date=date(2020, 2, 10), exit_type=ExitType.disappeared.value),
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

    new_animal = NewAnimalModel(race_id="C", rescue_city_code="H501", entry_type=EntryType.rescue.value)

    code = animal_repository.new_animal(new_animal)

    animal_id = db_session.execute(select(Animal.id).where(Animal.code == code)).scalar_one()

    animal_repository.update(
        animal_id,
        UpdateAnimalModel(name="Test1", chip_code="000.000.000.000.000"),
    )

    animal_repository.complete_entry(animal_id, CompleteEntryModel(entry_date=date(2020, 1, 10)))

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


def test_count_days_same_day(db_session: Session, animal_repository: SQLAnimalRepository, make_animal):
    animal_id = make_animal()

    animal_repository.complete_entry(animal_id, CompleteEntryModel(entry_date=date(2024, 4, 1)))

    animal_repository.update(animal_id, UpdateAnimalModel(chip_code=random_chip_code()))

    animal_repository.exit(
        animal_id,
        AnimalExit(exit_date=date(2024, 4, 2), exit_type=ExitType.disappeared),
    )

    days = animal_repository.count_animal_days(
        AnimalDaysQuery(
            from_date=date(2024, 3, 1),
            to_date=date(2024, 4, 2),
            city_code="H501",
        )
    )

    assert days


def test_count_exits(empty_db, make_animal, animal_repository: SQLAnimalRepository):
    animal_id1 = make_animal()

    animal_repository.complete_entry(animal_id1, CompleteEntryModel(entry_date=date(2024, 1, 1)))

    animal_repository.update(animal_id1, UpdateAnimalModel(chip_code=random_chip_code()))

    animal_repository.exit(
        animal_id1,
        AnimalExit(exit_date=date(2024, 1, 3), exit_type=ExitType.death),
    )

    animal_id2 = make_animal()

    animal_repository.complete_entry(animal_id2, CompleteEntryModel(entry_date=date(2024, 1, 1)))

    animal_repository.update(animal_id2, UpdateAnimalModel(chip_code=random_chip_code()))
    animal_repository.exit(
        animal_id2,
        AnimalExit(exit_date=date(2024, 3, 1), exit_type=ExitType.death),
    )

    query = AnimalExitsQuery(
        from_date=date(2024, 1, 1),
        to_date=date(2024, 2, 1),
        exit_type=ExitType.death,
        city_code="H501",
    )

    result = animal_repository.count_animal_exits(query)

    assert result.total == 1
    assert result.items[0].exit_date == date(2024, 1, 3)
    assert result.items[0].exit_type == ExitType.death

    query = AnimalExitsQuery(
        from_date=date(2024, 1, 1),
        to_date=date(2024, 4, 1),
        exit_type=ExitType.death,
        city_code="H501",
    )

    result = animal_repository.count_animal_exits(query)

    assert result.total == 2
    assert result.items[1].exit_date == date(2024, 3, 1)


def test_add_medical_activity_and_records(make_animal, make_vet, animal_repository: SQLAnimalRepository):
    animal_id = make_animal()
    vet_id = make_vet()

    data = MedicalActivityModel(
        recurrence_type=RecurrenceType.WEEKLY,
        recurrence_value=1,
        vet_id=vet_id,
        name="Medicinale",
        from_date=date(2020, 1, 1),
    )

    medical_activity = animal_repository.new_medical_activity(animal_id=animal_id, data=data)

    assert medical_activity.from_date == date(2020, 1, 1)

    assert medical_activity.animal_id == animal_id

    medical_activity_record = animal_repository.add_medical_activity_record(medical_activity_id=medical_activity.id)

    assert medical_activity_record.created_at.date() == datetime.now().date()


def test_get_variation_report_variables(
    empty_db,
    make_animal,
    animal_repository: SQLAnimalRepository,
    breed_repository: SQLBreedRepository,
):
    animal_id = make_animal()

    breed = breed_repository.create(data=NewBreedModel(race_id="C", name="Test"))

    fur_color = animal_repository.add_fur_color(name=uuid4().hex)
    animal_repository.update(
        animal_id,
        updates=UpdateAnimalModel(
            name="Gino",
            birth_date=datetime.now().date() - timedelta(days=365 * 4 - 1),
            chip_code="123.123.123.123.123",
            fur=AnimalFur.cordato,
            sex=0,
            breed_id=breed.id,
            color=fur_color.id,
        ),
    )
    animal_repository.complete_entry(animal_id, data=CompleteEntryModel(entry_date=datetime.now().date()))

    animal_repository.exit(
        animal_id,
        data=AnimalExit(exit_date=datetime.now().date(), exit_type=ExitType.disappeared),
    )

    variables = animal_repository.get_variation_report_variables(animal_id=animal_id)

    assert variables.animal.age == 3
    assert variables.animal.fur_color == fur_color.label


@pytest.mark.skip(reason="Not implemented yet")
def test_get_pending_therapies(empty_db, make_animal, animal_repository: SQLAnimalRepository):
    animal1_id = make_animal()
    _ = make_animal()

    medical_activity = animal_repository.new_medical_activity(
        animal_id=animal1_id,
        data=MedicalActivityModel(
            recurrence_type=RecurrenceType.WEEKLY,
            recurrence_value=1,
            name="Test",
            from_date=(datetime.now() - timedelta(days=10)).date(),
        ),
    )

    animal_repository.add_medical_activity_record(medical_activity.id)

    animal_repository.session.execute(
        update(MedicalActivityRecord)
        .where(MedicalActivityRecord.medical_activity_id == medical_activity.id)
        .values({MedicalActivityRecord.created_at: datetime.now() - timedelta(days=8)})
    )
    result = animal_repository.get_pending_medical_activities(animal_id=animal1_id)

    assert result


def test_get_fur_colors(animal_repository: SQLAnimalRepository, db_session: Session):
    color_name = uuid4().hex
    c = FurColor(name=color_name)
    db_session.add(c)
    db_session.flush()
    result = animal_repository.get_fur_colors()

    assert len(result) > 0

    assert isinstance(result[0], UtilElement)

    assert color_name in [r.label for r in result]


def test_new_fur_color(animal_repository: SQLAnimalRepository, db_session: Session):
    name = uuid4().hex
    result = animal_repository.add_fur_color(name)

    assert isinstance(result, UtilElement)

    db_session.execute(select(FurColor).where(FurColor.id == result.id, FurColor.name == result.label)).scalar_one()
