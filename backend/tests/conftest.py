import os
from typing import Callable, Generator

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy import Engine, create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from hermadata import __version__
from hermadata.constants import EntryType
from hermadata.database.models import Animal
from hermadata.dependancies import settings
from hermadata.main import build_app
from hermadata.reports.report_generator import ReportGenerator
from hermadata.repositories.adopter_repository import SQLAdopterRepository
from hermadata.repositories.adoption_repository import SQLAdopionRepository
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository
from hermadata.repositories.animal.models import NewAnimalModel
from hermadata.repositories.city_repository import SQLCityRepository
from hermadata.repositories.document_repository import (
    SQLDocumentRepository,
    StorageType,
)
from hermadata.repositories.race_repository import SQLRaceRepository
from hermadata.repositories.vet_repository import SQLVetRepository
from hermadata.services.animal_service import AnimalService
from hermadata.storage.disk_storage import DiskStorage


def pytest_sessionstart():
    command.downgrade(Config("tests/alembic.ini"), "3bebd7731267")

    command.upgrade(Config("tests/alembic.ini"), "head")

    for f in os.listdir("attic/storage"):
        os.remove(os.path.join("attic", "storage", f))


def pytest_sessionfinish():
    pass


@pytest.fixture(scope="function")
def engine():

    e = create_engine("mysql+pymysql://root:dev@localhost/hermadata_test")

    return e


@pytest.fixture(scope="function")
def disk_storage():
    storage = DiskStorage("attic/storage")

    return storage


@pytest.fixture(scope="function")
def DBSessionMaker(engine: Engine) -> Session:
    session = sessionmaker(bind=engine)

    return session


@pytest.fixture(scope="function")
def db_session(DBSessionMaker: sessionmaker) -> Session:
    session = DBSessionMaker()

    return session


@pytest.fixture(scope="function")
def jinja_env():
    jinja_env = Environment(
        loader=FileSystemLoader("hermadata/reports/templates"),
        autoescape=select_autoescape(),
    )
    jinja_env.globals = {
        "software_name": "Hermadata",
        "software_version": __version__,
    }

    return jinja_env


@pytest.fixture(scope="function")
def report_generator(jinja_env) -> ReportGenerator:

    return ReportGenerator(jinja_env=jinja_env)


@pytest.fixture(scope="function")
def document_repository(
    db_session: Session, disk_storage
) -> Generator[SQLDocumentRepository, SQLDocumentRepository, None]:
    repo = SQLDocumentRepository(
        db_session, storage={StorageType.disk: disk_storage}
    )
    with repo(db_session):
        yield repo


@pytest.fixture(scope="function")
def adopter_repository(
    db_session: Session,
) -> Generator[SQLAdopterRepository, SQLAdopterRepository, None]:
    repo = SQLAdopterRepository()
    with repo(db_session):
        yield repo


@pytest.fixture(scope="function")
def adoption_repository(
    db_session: Session,
) -> Generator[SQLAdopionRepository, SQLAdopionRepository, None]:
    repo = SQLAdopionRepository()
    with repo(db_session):
        yield repo


@pytest.fixture(scope="function")
def animal_repository(
    db_session: Session,
) -> Generator[SQLAnimalRepository, SQLAnimalRepository, None]:
    repo = SQLAnimalRepository()
    with repo(db_session):
        yield repo


@pytest.fixture(scope="function")
def vet_repository(
    db_session: Session,
) -> Generator[SQLVetRepository, SQLVetRepository, None]:
    repo = SQLVetRepository()
    with repo(db_session):
        yield repo


@pytest.fixture(scope="function")
def race_repository(
    db_session: Session,
) -> Generator[SQLRaceRepository, SQLRaceRepository, None]:
    repo = SQLRaceRepository()
    with repo(db_session):
        yield repo


@pytest.fixture(scope="function")
def city_repository(
    db_session: Session,
) -> Generator[SQLCityRepository, SQLCityRepository, None]:
    repo = SQLCityRepository()
    with repo(db_session):
        yield repo


@pytest.fixture(scope="function")
def animal_service(
    animal_repository, document_repository, report_generator, disk_storage
) -> AnimalService:
    return AnimalService(
        animal_repository=animal_repository,
        document_repository=document_repository,
        report_generator=report_generator,
        storage=disk_storage,
    )


@pytest.fixture(scope="function")
def make_animal(
    db_session: Session, animal_repository: SQLAnimalRepository
) -> Callable[[NewAnimalModel], int]:
    def make(data: NewAnimalModel = None) -> int:
        if data is None:
            data = NewAnimalModel(
                race_id="C",
                rescue_city_code="H501",
                entry_type=EntryType.rescue,
            )
        code = animal_repository.new_animal(data=data)

        animal_id = db_session.execute(
            select(Animal.id).where(Animal.code == code)
        ).scalar()

        return animal_id

    return make


@pytest.fixture(scope="function")
def app():

    settings.db.url = "mysql+pymysql://root:dev@localhost/hermadata_test"
    settings.storage.disk.base_path = "attic/storage"
    app = build_app()
    test_app = TestClient(app)

    return test_app
