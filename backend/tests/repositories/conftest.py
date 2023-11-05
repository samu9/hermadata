import pytest
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import sessionmaker


@pytest.fixture(scope="function")
def engine():
    e = create_engine("mysql+pymysql://root:dev@localhost/hermadata")

    return e


@pytest.fixture(scope="function")
def db_session(engine: Engine):
    session = sessionmaker(bind=engine)

    return session
