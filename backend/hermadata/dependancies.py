from ast import TypeVar
from typing import Annotated, Type

from fastapi import Depends
from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from hermadata import __version__
from hermadata.reports.report_generator import ReportGenerator
from hermadata.repositories import SQLBaseRepository
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository
from hermadata.repositories.document_repository import (
    SQLDocumentRepository,
    StorageType,
)
from hermadata.services.animal_service import AnimalService
from hermadata.settings import Settings
from hermadata.storage.disk_storage import DiskStorage


settings = Settings()


def get_engine():
    engine = create_engine(settings.db.url)
    return engine


def get_session(engine: Annotated[Engine, Depends(get_engine)]):
    session = sessionmaker(engine)

    try:
        with session.begin() as s:
            yield s
    except Exception as e:
        s.rollback()
        raise e


def get_disk_storage():
    disk_storage = DiskStorage(settings.storage.disk.base_path)

    return disk_storage


Repo = TypeVar("T")


engine = get_engine()
DBSession = sessionmaker(engine)
disk_storage = get_disk_storage()

animal_repository = SQLAnimalRepository()

with DBSession.begin() as db_session:
    document_repository = SQLDocumentRepository(
        db_session, storage={StorageType.disk: disk_storage}
    )

repository_map: dict[Type[SQLBaseRepository], SQLBaseRepository] = {
    SQLAnimalRepository: animal_repository,
    SQLDocumentRepository: document_repository,
}


def get_repository(
    repo: Type[SQLBaseRepository],
):
    def get(
        db_session: Annotated[Session, Depends(get_session)],
    ):
        r = repository_map[repo]
        with r(db_session):
            yield r

    return get


def get_jinja_env() -> Environment:
    jinja_env = Environment(
        loader=FileSystemLoader("hermadata/reports/templates"),
        autoescape=select_autoescape(),
    )
    jinja_env.globals = {
        "software_name": "Hermadata",
        "software_version": __version__,
    }

    return jinja_env


def get_report_generator(
    jinja_env: Annotated[Environment, Depends(get_jinja_env, use_cache=True)],
):
    return ReportGenerator(jinja_env=jinja_env)


def get_animal_service(
    disk_storage: Annotated[
        DiskStorage, Depends(get_disk_storage, use_cache=True)
    ],
    report_generator: Annotated[
        ReportGenerator, Depends(get_report_generator, use_cache=True)
    ],
    animal_repository: Annotated[
        ReportGenerator, Depends(get_repository(SQLAnimalRepository))
    ],
    document_repository: Annotated[
        ReportGenerator, Depends(get_repository(SQLDocumentRepository))
    ],
):
    service = AnimalService(
        animal_repository=animal_repository,
        document_repository=document_repository,
        report_generator=report_generator,
        storage=disk_storage,
    )

    return service
