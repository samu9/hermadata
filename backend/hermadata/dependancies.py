from ast import TypeVar
from functools import lru_cache
from typing import Callable, Type

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from hermadata.settings import Settings


@lru_cache()
def get_settings():
    settings = Settings()
    return settings


@lru_cache()
def get_engine():
    settings = get_settings()
    engine = create_engine(settings.db.url)
    return engine


def get_session(readwrite=False):
    session = sessionmaker(get_engine())

    try:
        if readwrite:
            with session() as s:
                yield s
        else:
            with session.begin() as s:
                yield s
    except Exception as e:
        s.rollback()
        raise e


Repo = TypeVar("T")


def get_repository(class_name: Type[Repo], readwrite=False) -> Callable[[], Repo]:
    session = get_session(readwrite)

    return lambda: class_name(session)
