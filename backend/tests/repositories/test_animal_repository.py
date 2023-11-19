from datetime import date, datetime, timedelta
from uuid import uuid4
from sqlalchemy import insert, select

from sqlalchemy.orm import Session
from hermadata.database.models import Animal

from hermadata.repositories.animal.animal_repository import (
    AnimalModel,
    AnimalSearchModel,
    SQLAnimalRepository,
)
from hermadata.repositories.animal.models import UpdateAnimalModel


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
        rescue_date=rescue_date,
        sex=0,
        rescue_city_code=rescue_city_code,
    )
    repo.save(model)

    assert True


def test_search(db_session: Session):
    now = datetime.utcnow() - timedelta(seconds=10)
    repo = SQLAnimalRepository(session=db_session)
    test_values = [
        {
            "code": uuid4().hex[0:11],
            "rescue_date": date(2020, 2, 3),
            "rescue_city_code": "A074",
            "race_id": "C",
        },
        {
            "code": uuid4().hex[0:11],
            "rescue_date": date(2020, 3, 4),
            "rescue_city_code": "A117",
            "race_id": "C",
        },
        {
            "code": uuid4().hex[0:11],
            "rescue_date": date(2020, 5, 6),
            "rescue_city_code": "A109",
            "race_id": "G",
        },
    ]
    for t in test_values:
        db_session.execute(insert(Animal).values(**t))
    db_session.commit()

    result = repo.search(AnimalSearchModel(race_id="C", from_created_at=now))

    assert len(result) == 2
    assert result[0].race_id == "C"


def test_update(db_session: Session):
    repo = SQLAnimalRepository(session=db_session)
    code = uuid4().hex[0:11]
    db_session.execute(
        insert(Animal).values(
            {
                "code": code,
                "rescue_date": date(2020, 3, 4),
                "rescue_city_code": "A117",
                "race_id": "C",
            }
        )
    )
    db_session.commit()

    repo.update(code, UpdateAnimalModel(name="Test Cat", sterilized=True))

    name, sterilized = db_session.execute(
        select(Animal.name, Animal.sterilized).where(Animal.code == code)
    ).first()

    assert name == "Test Cat"

    assert sterilized is True

    repo.update(code, UpdateAnimalModel(sterilized=False))

    name, sterilized = db_session.execute(
        select(Animal.name, Animal.sterilized).where(Animal.code == code)
    ).first()

    assert name == "Test Cat"

    assert sterilized is False
