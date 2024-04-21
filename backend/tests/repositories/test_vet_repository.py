from sqlalchemy import select
from sqlalchemy.orm import Session

from hermadata.database.models import Vet
from hermadata.repositories.vet_repository import SQLVetRepository, VetModel


def test_vet_repository_create(db_session: Session):
    repo = SQLVetRepository(db_session)

    data = VetModel(business_name="Veterinario 1", fiscal_code="1234567890a")

    result = repo.create(data)

    check = db_session.execute(
        select(Vet).where(Vet.id == result.id)
    ).scalar_one()

    assert check.business_name == "Veterinario 1"
    assert check.fiscal_code == "1234567890a"
