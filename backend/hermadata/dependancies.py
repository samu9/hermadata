from ast import TypeVar
from typing import Annotated, Any, Callable, Type

from fastapi import Depends
from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from hermadata import __version__
from hermadata.reports.report_generator import ReportGenerator
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository
from hermadata.repositories.document_repository import (
    SQLDocumentRepository,
    StorageType,
)
from hermadata.services.animal_service import AnimalService
from hermadata.settings import Settings
from hermadata.storage.disk_storage import DiskStorage


def get_settings():
    settings = Settings()
    return settings


def get_engine(
    settings: Annotated[Settings, Depends(get_settings, use_cache=True)]
):
    settings = get_settings()
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


Repo = TypeVar("T")


def get_disk_storage(
    settings: Annotated[Settings, Depends(get_settings, use_cache=True)]
):
    disk_storage = DiskStorage(settings.storage.disk.base_path)

    return disk_storage


def document_repository_factory(
    db_session: Annotated[Session, Depends(get_session)],
    disk_storage: Annotated[
        DiskStorage, Depends(get_disk_storage, use_cache=True)
    ],
):
    storage = {StorageType.disk: disk_storage}
    repo = SQLDocumentRepository(db_session, storage=storage)

    yield repo


def animal_repository_factory(
    db_session: Annotated[Session, Depends(get_session)]
):
    repo = SQLAnimalRepository(db_session)
    yield repo


REPOSITORIES_FACTORIES = {SQLAnimalRepository: document_repository_factory}


class RepositoryFactory:
    def __init__(self, repo_class: Type[Repo]) -> None:
        self.repo_class = repo_class

    def __call__(
        self, db_session: Annotated[Session, Depends(get_session)]
    ) -> Any:
        yield self.repo_class(db_session)


def get_repository(
    class_name: Type[Repo], readwrite=False
) -> Callable[[], Repo]:
    db_session_generator = get_session(readwrite)

    def factory():
        with db_session_generator as db_session:
            yield class_name(db_session)

    return factory


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
):
    service = AnimalService(
        animal_repository=get_repository(SQLAnimalRepository),
        document_repository=get_repository(SQLDocumentRepository),
        report_generator=report_generator,
        storage=disk_storage,
    )

    return service
