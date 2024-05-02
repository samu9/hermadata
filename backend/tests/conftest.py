import os

import pytest
from alembic import command
from alembic.config import Config
from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy import Engine, create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from hermadata import __version__
from hermadata.constants import EntryType
from hermadata.database.models import Animal
from hermadata.reports.report_generator import ReportGenerator
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository
from hermadata.repositories.animal.models import NewAnimalModel
from hermadata.repositories.document_repository import (
    SQLDocumentRepository,
    StorageType,
)
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
def db_session(engine: Engine) -> Session:
    session = sessionmaker(bind=engine)()

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
) -> SQLDocumentRepository:
    repo = SQLDocumentRepository(
        db_session, storage={StorageType.disk: disk_storage}
    )
    return repo


@pytest.fixture(scope="function")
def animal_repository(db_session: Session) -> SQLAnimalRepository:
    repo = SQLAnimalRepository(db_session)
    return repo


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
def make_animal(db_session: Session, animal_repository: SQLAnimalRepository):
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
