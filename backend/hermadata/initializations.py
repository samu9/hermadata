from hermadata.constants import StorageType
from hermadata.dependancies import get_jinja_env, get_session_maker
from hermadata.reports.report_generator import ReportGenerator
from hermadata.repositories.adopter_repository import SQLAdopterRepository
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository
from hermadata.repositories.breed_repository import SQLBreedRepository
from hermadata.repositories.city_repository import SQLCityRepository
from hermadata.repositories.document_repository import SQLDocumentRepository
from hermadata.repositories.race_repository import SQLRaceRepository
from hermadata.repositories.vet_repository import SQLVetRepository
from hermadata.services.animal_service import AnimalService
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
city_repository = SQLCityRepository(
    preferred_provinces=settings.app.preferred_provinces,
    preferred_cities=settings.app.preferred_cities,
)
race_repository = SQLRaceRepository()
vet_repository = SQLVetRepository()
adopter_repository = SQLAdopterRepository()

report_generator = ReportGenerator(get_jinja_env())

animal_service = AnimalService(
    animal_repository=animal_repository,
    document_repository=document_repository,
    report_generator=report_generator,
    storage=storage_map[settings.storage.selected],
)
