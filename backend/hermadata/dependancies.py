from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from hermadata.repositories import BaseRepository
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
