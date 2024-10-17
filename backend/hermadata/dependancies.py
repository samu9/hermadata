import logging
import os
from typing import Annotated

from fastapi import Depends
from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from hermadata import __version__
from hermadata.constants import StorageType

from hermadata.settings import settings
from hermadata.storage.disk_storage import DiskStorage
from hermadata.storage.s3_storage import S3Storage

logger = logging.getLogger(__name__)


def get_session():
    engine = create_engine(**settings.db.model_dump())

    SessionMaker = sessionmaker(engine)
    session = SessionMaker()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        logger.error("Session rollback because of exception: %s", e)
        raise e
    finally:
        session.close()


def get_s3_storage():
    s3_storage = S3Storage(settings.storage.s3.bucket)

    return s3_storage


def get_disk_storage():
    disk_storage = DiskStorage(settings.storage.disk.base_path)

    return disk_storage


def get_storage_map(
    disk_storage: Annotated[DiskStorage, Depends(get_disk_storage)],
    s3_storage: Annotated[S3Storage, Depends(get_s3_storage)],
):
    return {
        StorageType.disk: disk_storage,
        StorageType.aws_s3: s3_storage,
    }


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
