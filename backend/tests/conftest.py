import os
import random
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Callable, Generator
from uuid import uuid4

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy import Engine, create_engine, delete, insert, select, text
from sqlalchemy.orm import Session, sessionmaker

from hermadata import __version__
from hermadata.constants import AnimalFur, EntryType, StorageType
from hermadata.database.alembic.import_initial_data import import_doc_kinds
from hermadata.database.models import (
    Adopter,
    Adoption,
    Animal,
    AnimalDocument,
    AnimalEntry,
    AnimalLog,
    Breed,
    Document,
    FurColor,
    MedicalActivity,
    MedicalActivityRecord,
)
from hermadata.reports.report_generator import ReportGenerator
from hermadata.repositories.adopter_repository import (
    AdopterModel,
    IDDocumentType,
    NewAdopter,
    SQLAdopterRepository,
)
from hermadata.repositories.adoption_repository import SQLAdopionRepository
from hermadata.repositories.animal.animal_repository import SQLAnimalRepository
from hermadata.repositories.animal.models import (
    NewAnimalModel,
    UpdateAnimalModel,
)
from hermadata.repositories.breed_repository import SQLBreedRepository
from hermadata.repositories.city_repository import SQLCityRepository
from hermadata.repositories.document_repository import SQLDocumentRepository
from hermadata.repositories.race_repository import SQLRaceRepository
from hermadata.repositories.user_repository import (
    CreateUserModel,
    SQLUserRepository,
)
from hermadata.repositories.vet_repository import SQLVetRepository, VetModel
from hermadata.services.animal_service import AnimalService
from hermadata.services.user_service import RegisterUserModel, UserService
from hermadata.storage.disk_storage import DiskStorage
from tests.utils import random_chip_code

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
    "breed",
    "fur_color",
    "animal",
]


@pytest.fixture(scope="session", autouse=True)
def set_env():
    os.environ["ENV_PATH"] = "tests/.env"


def insert_initial_data(session: Session):
    session.execute(
        insert(Breed).values({Breed.name: "cane_1", Breed.race_id: "C"})
    )
    session.execute(
        insert(Breed).values({Breed.name: "gatto_1", Breed.race_id: "G"})
    )
    session.execute(insert(FurColor).values({FurColor.name: "fur_color_1"}))


def pytest_sessionstart():
    from hermadata.settings import settings

    alembic_config = Config("tests/alembic.ini")

    command.upgrade(alembic_config, "head")

    for f in os.listdir(settings.storage.disk.base_path):
        os.remove(Path(settings.storage.disk.base_path) / f)

    e = create_engine(settings.db.url)

    session = sessionmaker(bind=e)

    import_doc_kinds(e)
    with session.begin() as db_session:
        db_session.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        for t in TABLES:
            db_session.execute(text(TRUNCATE_QUERY.format(t)))
        db_session.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        insert_initial_data(db_session)


def pytest_sessionfinish():
    pass


@pytest.fixture(scope="function")
def engine():
    e = create_engine("mysql+pymysql://root:dev@localhost/hermadata_test")

    return e


@pytest.fixture(scope="session")
def test_settings():
    from hermadata.settings import settings

    return settings


@pytest.fixture(scope="function")
def disk_storage(test_settings):
    storage = DiskStorage(test_settings.storage.disk.base_path)

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
    repo = SQLCityRepository(
        preferred_provinces=["LU", "PT"],
        preferred_cities=["H501", "A561", "B251"],
    )
    return repo(db_session)


@pytest.fixture(scope="function")
def breed_repository(
    db_session: Session,
) -> Generator[SQLBreedRepository, SQLBreedRepository, None]:
    repo = SQLBreedRepository()
    return repo(db_session)


@pytest.fixture(scope="function")
def user_repository(
    db_session: Session,
) -> Generator[SQLUserRepository, SQLUserRepository, None]:
    repo = SQLUserRepository()
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
def user_service(
    user_repository,
) -> UserService:
    return UserService(
        user_repository=user_repository,
        secret="SECRET",
        access_token_expire_minutes=30,
        algorithm="HS256",
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

        animal_id = db_session.execute(
            select(Animal.id).where(Animal.code == code)
        ).scalar()
        return animal_id

    return make


@pytest.fixture(scope="function")
def complete_animal_data(
    db_session: Session, animal_repository: SQLAnimalRepository
) -> Callable[[NewAnimalModel], int]:
    def complete(animal_id: int):
        breed_id = db_session.execute(
            select(Breed.id).where(Breed.race_id == "C")
        ).scalar()
        color_id = db_session.execute(select(FurColor.id)).scalar()
        animal_repository.update(
            animal_id,
            UpdateAnimalModel(
                chip_code=random_chip_code(),
                fur=random.choice([f.value for f in AnimalFur]),
                color=color_id,
                birth_date=(datetime.now() - timedelta(days=100)).date(),
                breed_id=breed_id,
                sex=0,
                sterilized=True,
                size=0,
            ),
        )

    return complete


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
                document_number="AA12345BB",
                document_type=IDDocumentType.identity_card,
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
def make_user(
    user_service: UserService,
) -> Callable[[CreateUserModel], int]:
    def make(data: CreateUserModel = None) -> int:
        if data is None:
            data = RegisterUserModel(
                email=f"{uuid4().hex}@test.it", password=uuid4().hex
            )
        user_id = user_service.register(data=data)

        return user_id

    return make


@pytest.fixture(scope="function")
def app(db_session):
    def get_db_session_override():
        yield db_session

    from hermadata.dependancies import get_db_session
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
    # db_session.execute(delete(Breed))
