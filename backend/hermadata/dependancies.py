import logging
import os
from threading import current_thread
from typing import Annotated, Type

from fastapi import Depends
from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from hermadata import __version__
from hermadata.reports.report_generator import ReportGenerator
from hermadata.repositories import SQLBaseRepository
from hermadata.repositories.adopter_repository import SQLAdopterRepository
from hermadata.repositories.adoption_repository import SQLAdopionRepository
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository
from hermadata.repositories.breed_repository import SQLBreedRepository
from hermadata.repositories.city_repository import SQLCityRepository
from hermadata.repositories.document_repository import (
    SQLDocumentRepository,
    StorageType,
)
from hermadata.repositories.race_repository import SQLRaceRepository
from hermadata.services.animal_service import AnimalService
from hermadata.settings import settings
from hermadata.storage.disk_storage import DiskStorage


logger = logging.getLogger(__name__)

engine = create_engine(**settings.db.model_dump())

SessionMaker = sessionmaker(engine)


def get_session():

    try:
        with SessionMaker.begin() as s:
            yield s
    except Exception as e:
        s.rollback()
        raise e


def get_disk_storage():
    disk_storage = DiskStorage(settings.storage.disk.base_path)

    return disk_storage


DBSession = sessionmaker(engine)
disk_storage = get_disk_storage()


with DBSession.begin() as db_session:
    document_repository = SQLDocumentRepository(
        db_session, storage={StorageType.disk: disk_storage}
    )


race_repository = SQLRaceRepository()
adoption_repository = SQLAdopionRepository()
adopter_repository = SQLAdopterRepository()
breed_repository = SQLBreedRepository()
city_repository = SQLCityRepository()
animal_repository = SQLAnimalRepository()

repository_map: dict[Type[SQLBaseRepository], SQLBaseRepository] = {
    SQLAnimalRepository: animal_repository,
    SQLDocumentRepository: document_repository,
    SQLRaceRepository: race_repository,
    SQLAdopionRepository: adoption_repository,
    SQLAdopterRepository: adopter_repository,
    SQLBreedRepository: breed_repository,
    SQLCityRepository: city_repository,
}


def get_repository(
    repo: Type[SQLBaseRepository],
):
    def get(
        db_session: Annotated[Session, Depends(get_session)],
    ):
        r = repository_map[repo]
        r.local_session.session = db_session
        logger.info(
            "repo %s, set session %s, thread %s",
            r.__class__,
            r.session,
            current_thread().ident,
        )
        try:
            yield r
        except Exception as e:
            logger.info(
                "repo %s error - thread %s", r.__class__, current_thread().ident
            )
            raise e
        finally:
            # r.local_session.session = None
            logger.info(
                "repo %s, nulled session %s, thread %s",
                r.__class__,
                r.session,
                current_thread().ident,
            )

    return get


def get_jinja_env() -> Environment:
    templates_dir = os.path.join(
        os.path.dirname(__file__), "reports", "templates"
    )
    jinja_env = Environment(
        loader=FileSystemLoader(templates_dir),
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
