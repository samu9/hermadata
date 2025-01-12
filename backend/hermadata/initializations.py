from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from hermadata.constants import StorageType
from hermadata.dependancies import get_jinja_env, get_session_maker
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

animal_repository = SQLAnimalRepository()
s3_storage = S3Storage(settings.storage.s3.bucket)
disk_storage = DiskStorage(settings.storage.disk.base_path)

storage_map = {
    StorageType.disk: disk_storage,
    StorageType.aws_s3: s3_storage,
}
sessionmaker = get_session_maker()
with sessionmaker() as s:
    document_repository = SQLDocumentRepository(
        session=s,
        selected_storage=settings.storage.selected,
        storage=storage_map,
    )
breed_repository = SQLBreedRepository()
city_repository = SQLCityRepository()
race_repository = SQLRaceRepository()
vet_repository = SQLVetRepository()
adopter_repository = SQLAdopterRepository()
user_repository = SQLUserRepository()

report_generator = ReportGenerator(get_jinja_env())

animal_service = AnimalService(
    animal_repository=animal_repository,
    document_repository=document_repository,
    report_generator=report_generator,
    storage=storage_map[settings.storage.selected],
)

user_service = UserService(
    user_repository=user_repository,
    secret=settings.auth.secret,
    access_token_expire_minutes=settings.auth.access_token_expire_minutes,
    algorithm=settings.auth.algorithm,
)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="user/token")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    service: Annotated[UserService, Depends(user_service)],
) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:

        token_data = service.decode_jwt(token)

    except jwt.InvalidTokenError:
        raise credentials_exception

    return token_data
