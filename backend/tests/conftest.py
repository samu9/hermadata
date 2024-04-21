from jinja2 import (
    Environment,
    FileSystemLoader,
    select_autoescape,
)
import pytest

from alembic import command
from alembic.config import Config
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from hermadata.reports.report_generator import ReportGenerator
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository
from hermadata.storage.disk_storage import DiskStorage


def pytest_sessionstart():
    command.downgrade(Config("tests/alembic.ini"), "3bebd7731267")

    command.upgrade(Config("tests/alembic.ini"), "head")


@pytest.fixture(scope="function")
def engine():

    e = create_engine("mysql+pymysql://root:dev@localhost/hermadata_test")

    return e


@pytest.fixture(scope="function")
def disk_storage():
    storage = DiskStorage("attic/")

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

    return jinja_env


@pytest.fixture(scope="function")
def report_generator(jinja_env) -> ReportGenerator:

    return ReportGenerator(jinja_env=jinja_env)


@pytest.fixture(scope="function")
def animal_repository(db_session: Session) -> SQLAnimalRepository:
    repo = SQLAnimalRepository(db_session)
    return repo
