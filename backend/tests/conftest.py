from datetime import date
import os
from typing import Callable, Generator

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy import Engine, create_engine, delete, select, text
from sqlalchemy.orm import Session, sessionmaker

from hermadata import __version__
from hermadata.constants import EntryType, StorageType
from hermadata.database.alembic.import_initial_data import (
    import_doc_kinds,
)
from hermadata.database.models import (
    Adopter,
    Adoption,
    Animal,
    AnimalDocument,
    AnimalEntry,
    AnimalLog,
    Breed,
    Document,
    MedicalActivity,
    MedicalActivityRecord,
)
from hermadata.dependancies import get_db_session
from hermadata.reports.report_generator import ReportGenerator
from hermadata.repositories.adopter_repository import (
    AdopterModel,
    NewAdopter,
    SQLAdopterRepository,
)
from hermadata.repositories.adoption_repository import (
    SQLAdopionRepository,
)
from hermadata.repositories.animal.animal_repository import (
    SQLAnimalRepository,
)
from hermadata.repositories.animal.models import NewAnimalModel
from hermadata.repositories.breed_repository import SQLBreedRepository
from hermadata.repositories.city_repository import SQLCityRepository
from hermadata.repositories.document_repository import (
    SQLDocumentRepository,
)
from hermadata.repositories.race_repository import SQLRaceRepository
from hermadata.repositories.vet_repository import (
    SQLVetRepository,
    VetModel,
)
from hermadata.services.animal_service import AnimalService
from hermadata.storage.disk_storage import DiskStorage

TRUNCATE_QUERY = "TRUNCATE TABLE {}"

TABLES = [
    "adoption",
    "animal_entry",
    "animal_log",
    "animal_document",
    "document",
    "adopter",
    "vet_service_record",
    "vet",
    "animal",
]


def pytest_sessionstart():
    alembic_config = Config("tests/alembic.ini")

    command.upgrade(alembic_config, "head")

    for f in os.listdir("attic/storage"):
        os.remove(os.path.join("attic", "storage", f))

    e = create_engine("mysql+pymysql://root:dev@localhost/hermadata_test")

    session = sessionmaker(bind=e)

    import_doc_kinds(e)

    with session() as db_session:
        db_session.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        for t in TABLES:
            db_session.execute(text(TRUNCATE_QUERY.format(t)))
        db_session.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))


def pytest_sessionfinish():
    pass


@pytest.fixture(scope="function")
def engine():
    e = create_engine("mysql+pymysql://root:dev@localhost/hermadata_test")

    return e


@pytest.fixture(scope="function")
def disk_storage():
    storage = DiskStorage("attic/storage")

    return storage


@pytest.fixture(scope="function")
def DBSessionMaker(engine: Engine) -> Session:
    session = sessionmaker(bind=engine)

    return session


@pytest.fixture(scope="function")
def db_session(
    DBSessionMaker: sessionmaker,
) -> Generator[Session, Session, None]:
    with DBSessionMaker.begin() as db_session:
        yield db_session


@pytest.fixture(scope="function")
def jinja_env():
    jinja_env = Environment(
        loader=FileSystemLoader("hermadata/reports/templates"),
        autoescape=select_autoescape(),
    )
    jinja_env.globals = {
        "software_name": "Hermadata",
        "software_version": __version__,
    }

    return jinja_env


@pytest.fixture(scope="function")
def report_generator(jinja_env) -> ReportGenerator:
    return ReportGenerator(jinja_env=jinja_env)


@pytest.fixture(scope="function")
def document_repository(
    db_session: Session, disk_storage
) -> Generator[SQLDocumentRepository, SQLDocumentRepository, None]:
    repo = SQLDocumentRepository(
        db_session,
        storage={StorageType.disk: disk_storage},
        selected_storage=StorageType.disk,
    )
    return repo(db_session)


@pytest.fixture(scope="function")
def adopter_repository(
    db_session: Session,
) -> Generator[SQLAdopterRepository, SQLAdopterRepository, None]:
    repo = SQLAdopterRepository()
    return repo(db_session)


@pytest.fixture(scope="function")
def adoption_repository(
    db_session: Session,
) -> Generator[SQLAdopionRepository, SQLAdopionRepository, None]:
    repo = SQLAdopionRepository()
    return repo(db_session)


@pytest.fixture(scope="function")
def animal_repository(
    db_session: Session,
) -> Generator[SQLAnimalRepository, SQLAnimalRepository, None]:
    repo = SQLAnimalRepository()
    return repo(db_session)


@pytest.fixture(scope="function")
def vet_repository(
    db_session: Session,
) -> Generator[SQLVetRepository, SQLVetRepository, None]:
    repo = SQLVetRepository()
    return repo(db_session)


@pytest.fixture(scope="function")
def race_repository(
    db_session: Session,
) -> Generator[SQLRaceRepository, SQLRaceRepository, None]:
    repo = SQLRaceRepository()
    return repo(db_session)


@pytest.fixture(scope="function")
def city_repository(
    db_session: Session,
) -> Generator[SQLCityRepository, SQLCityRepository, None]:
    repo = SQLCityRepository()
    return repo(db_session)


@pytest.fixture(scope="function")
def breed_repository(
    db_session: Session,
) -> Generator[SQLBreedRepository, SQLBreedRepository, None]:
    repo = SQLBreedRepository()
    return repo(db_session)


@pytest.fixture(scope="function")
def animal_service(
    animal_repository,
    document_repository,
    report_generator,
    disk_storage,
) -> AnimalService:
    return AnimalService(
        animal_repository=animal_repository,
        document_repository=document_repository,
        report_generator=report_generator,
        storage=disk_storage,
    )


@pytest.fixture(scope="function")
def make_animal(
    db_session: Session,
    animal_repository: SQLAnimalRepository,
) -> Callable[[NewAnimalModel], int]:
    """
    `db_session` and `animal_repository` fixtures are not used because
    i want a separate session to be committed at the end of the function
    in order to have the data available to other transactions
    """

    def make(data: NewAnimalModel = None) -> int:
        if data is None:
            data = NewAnimalModel(
                race_id="C",
                rescue_city_code="H501",
                entry_type=EntryType.rescue,
            )
        code = animal_repository.new_animal(data=data)

        animal_id = db_session.execute(select(Animal.id).where(Animal.code == code)).scalar()
        return animal_id

    return make


@pytest.fixture(scope="function")
def make_adopter(
    adopter_repository: SQLAdopterRepository,
) -> Callable[[NewAdopter], int]:
    def make(data: AdopterModel = None) -> int:
        if data is None:
            data = NewAdopter(
                fiscal_code="RSSMRO11A22B123A",
                name="Mario",
                surname="Rossi",
                birth_city_code="H501",
                birth_date=date(1970, 2, 3),
                phone="1234567890",
                residence_city_code="H501",
            )
        adopter = adopter_repository.create(data=data)

        return adopter.id

    return make


@pytest.fixture(scope="function")
def make_vet(
    vet_repository: SQLVetRepository,
) -> Callable[[VetModel], int]:
    def make(data: VetModel = None) -> int:
        if data is None:
            data = VetModel(
                business_name="Veterinario",
                fiscal_code="12345678912",
                name="Mario",
                surname="Rossi",
            )
        vet = vet_repository.create(data=data)

        return vet.id

    return make


@pytest.fixture(scope="function")
def app(db_session):
    from hermadata.settings import settings

    settings.db.url = "mysql+pymysql://root:dev@localhost/hermadata_test"
    settings.storage.disk.base_path = "attic/storage"
    settings.storage.selected = StorageType.disk

    def get_db_session_override():
        yield db_session

    from hermadata.main import build_app

    app = build_app()

    app.dependency_overrides[get_db_session] = get_db_session_override

    test_app = TestClient(app)

    yield test_app


@pytest.fixture(scope="function")
def empty_db(db_session: Session):
    db_session.execute(delete(MedicalActivityRecord))
    db_session.execute(delete(MedicalActivity))
    db_session.execute(delete(Adoption))
    db_session.execute(delete(AnimalEntry))
    db_session.execute(delete(AnimalLog))
    db_session.execute(delete(AnimalDocument))
    db_session.execute(delete(Document))
    db_session.execute(delete(Animal))
    db_session.execute(delete(Adopter))
    db_session.execute(delete(Breed))
