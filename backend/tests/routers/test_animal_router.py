from fastapi.testclient import TestClient
from sqlalchemy import select

from hermadata.constants import EntryType
from hermadata.database.models import Animal
from hermadata.repositories.animal.models import (
    NewAnimalModel,
    UpdateAnimalModel,
)
from sqlalchemy.orm import Session, sessionmaker


def test_create_animal(app: TestClient, db_session: Session):
    request_body = NewAnimalModel(
        race_id="C",
        rescue_city_code="H501",
        entry_type=EntryType.confiscation.value,
    ).model_dump()

    result = app.post("/animal/", json=request_body)

    animal_code = result.content.decode(encoding="utf-8").replace('"', "")

    assert isinstance(animal_code, str)

    animal_id = db_session.execute(
        select(Animal.id).where(Animal.code == animal_code)
    ).scalar_one()

    assert animal_id


def test_update_animal(
    app: TestClient, make_animal, DBSessionMaker: sessionmaker
):
    animal_id = make_animal(
        NewAnimalModel(
            race_id="C",
            rescue_city_code="H501",
            entry_type=EntryType.confiscation.value,
        )
    )

    update_data = UpdateAnimalModel(
        name="Test", chip_code="123.123.123.123.123"
    ).model_dump()
    result = app.post(f"/animal/{animal_id}", json=update_data)

    affected = int(result.content.decode())
    assert affected == 1

    with DBSessionMaker.begin() as db_session:
        animal = db_session.execute(
            select(Animal).where(Animal.id == animal_id)
        ).scalar_one()

        assert animal.name == "Test"
        assert animal.chip_code == "123.123.123.123.123"
        assert animal.chip_code_set
