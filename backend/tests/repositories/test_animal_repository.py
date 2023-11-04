from datetime import date

from hermadata.repositories.animal import AnimalModel

from hermadata.repositories.animal import SQLAnimalRepository
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


def test_animal_repostiory_save():
    engine = create_engine("mysql+pymysql://root:dev@localhost/hermadata")
    Session = sessionmaker(bind=engine)
    repo = SQLAnimalRepository(session=Session())
    model = AnimalModel(
        code="test",
        name="Leone",
        race="cane",
        breed="chihuahua",
        birth_date=date(2020, 1, 2),
        sex=0,
        origin_city_code="G491",
    )
    repo.save(model)

    assert True
