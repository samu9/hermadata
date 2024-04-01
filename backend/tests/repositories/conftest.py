import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from hermadata.repositories.animal.animal_repository import SQLAnimalRepository
from hermadata.storage.disk_storage import DiskStorage


@pytest.fixture(scope="function")
def engine():

    e = create_engine("mysql+pymysql://root:dev@localhost/hermadata-tests")

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
def animal_repository(db_session: Session) -> SQLAnimalRepository:
    repo = SQLAnimalRepository(db_session)
    return repo
