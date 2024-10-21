import json
import logging
import logging.config

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from hermadata.dependancies import get_session_maker
from hermadata.settings import settings
from hermadata.constants import StorageType
from hermadata.repositories.document_repository import SQLDocumentRepository
from hermadata.routers import (
    adopter_router,
    animal_router,
    breed_router,
    document_router,
    race_router,
    util_router,
    vet_router,
)
from hermadata.storage.disk_storage import DiskStorage
from hermadata.storage.s3_storage import S3Storage

logging.config.dictConfig(json.load(open("hermadata/log-configs.json")))

logger = logging.getLogger(__name__)


def build_app():

    app = FastAPI(lifespan=lifespan)

    s3_storage = S3Storage(settings.storage.s3.bucket)
    disk_storage = DiskStorage(settings.storage.disk.base_path)

    storage_map = {
        StorageType.disk: disk_storage,
        StorageType.aws_s3: s3_storage,
    }

    session = get_session_maker()
    with session() as s:
        SQLDocumentRepository.factory(
            session=s,
            selected_storage=settings.storage.selected,
            storage=storage_map,
        )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-filename"],
    )
    app.include_router(animal_router.router)
    app.include_router(util_router.router)
    app.include_router(race_router.router)
    app.include_router(breed_router.router)
    app.include_router(document_router.router)
    app.include_router(adopter_router.router)
    app.include_router(vet_router.router)

    logger.info("hermadata set up")

    return app


def lifespan(app: FastAPI):

    yield


app = build_app()
