from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from hermadata.constants import StorageType
from hermadata.dependancies import (
    get_db_session,
    get_jinja_env,
    get_storage_map,
)
from hermadata.reports.report_generator import ReportGenerator
from hermadata.repositories.adopter_repository import SQLAdopterRepository
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository
from hermadata.repositories.breed_repository import SQLBreedRepository
from hermadata.repositories.city_repository import SQLCityRepository
from hermadata.repositories.document_repository import SQLDocumentRepository
from hermadata.repositories.race_repository import SQLRaceRepository
from hermadata.repositories.user_repository import SQLUserRepository
from hermadata.repositories.vet_repository import SQLVetRepository
from hermadata.services.animal_service import AnimalService
from hermadata.services.user_service import TokenData, UserService
from hermadata.settings import settings
from hermadata.storage.disk_storage import DiskStorage
from hermadata.storage.s3_storage import S3Storage


# Dependency functions for repositories
def get_animal_repository(session: Annotated[Session, Depends(get_db_session)]) -> SQLAnimalRepository:
    return SQLAnimalRepository()(session)


def get_document_repository(
    session: Annotated[Session, Depends(get_db_session)], storage_map: Annotated[dict, Depends(get_storage_map)]
) -> SQLDocumentRepository:
    return SQLDocumentRepository(
        session=session,
        selected_storage=settings.storage.selected,
        storage=storage_map,
    )


def get_breed_repository(session: Annotated[Session, Depends(get_db_session)]) -> SQLBreedRepository:
    return SQLBreedRepository()(session)


def get_city_repository(session: Annotated[Session, Depends(get_db_session)]) -> SQLCityRepository:
    return SQLCityRepository(
        preferred_provinces=settings.app.preferred_provinces,
        preferred_cities=settings.app.preferred_cities,
    )(session)


def get_race_repository(session: Annotated[Session, Depends(get_db_session)]) -> SQLRaceRepository:
    return SQLRaceRepository()(session)


def get_vet_repository(session: Annotated[Session, Depends(get_db_session)]) -> SQLVetRepository:
    return SQLVetRepository()(session)


def get_adopter_repository(session: Annotated[Session, Depends(get_db_session)]) -> SQLAdopterRepository:
    return SQLAdopterRepository()(session)


def get_user_repository(session: Annotated[Session, Depends(get_db_session)]) -> SQLUserRepository:
    return SQLUserRepository()(session)


# Keep global instances for non-session dependent objects
s3_storage = S3Storage(settings.storage.s3.bucket)
disk_storage = DiskStorage(settings.storage.disk.base_path)

storage_map = {
    StorageType.disk: disk_storage,
    StorageType.aws_s3: s3_storage,
}

report_generator = ReportGenerator(get_jinja_env())


def get_animal_service(
    animal_repository: Annotated[SQLAnimalRepository, Depends(get_animal_repository)],
    document_repository: Annotated[SQLDocumentRepository, Depends(get_document_repository)],
) -> AnimalService:
    return AnimalService(
        animal_repository=animal_repository,
        document_repository=document_repository,
        report_generator=report_generator,
        storage=storage_map[settings.storage.selected],
    )


def get_user_service(user_repository: Annotated[SQLUserRepository, Depends(get_user_repository)]) -> UserService:
    return UserService(
        user_repository=user_repository,
        secret=settings.auth.secret,
        access_token_expire_minutes=settings.auth.access_token_expire_minutes,
        algorithm=settings.auth.algorithm,
    )


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="user/login")


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    service: Annotated[UserService, Depends(get_user_service)],
) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token_data = service.decode_jwt(token)

    except jwt.InvalidTokenError as e:
        raise credentials_exception from e

    return token_data
