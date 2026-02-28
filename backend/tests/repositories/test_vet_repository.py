import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from hermadata.database.models import Vet
from hermadata.repositories.vet_repository import (
    SearchVetQuery,
    SQLVetRepository,
    VetModel,
)


def test_vet_repository_create(
    db_session: Session, vet_repository: SQLVetRepository
):
    data = VetModel(business_name="Veterinario 1", fiscal_code="1234567890a")

    result = vet_repository.create(data)

    check = db_session.execute(
        select(Vet).where(Vet.id == result.id)
    ).scalar_one()

    assert check.business_name == "Veterinario 1"
    assert check.fiscal_code == "1234567890a"


def test_vet_search(vet_repository: SQLVetRepository):
    vet_repository.create(
        VetModel(
            business_name="Clinica Test",
            fiscal_code="11111111111",
            name="Anna",
            surname="Verdi",
        )
    )

    result = vet_repository.search(SearchVetQuery(fiscal_code="11111111111"))

    assert result.total >= 1
    assert any(v.fiscal_code == "11111111111" for v in result.items)


def test_vet_search_no_results(vet_repository: SQLVetRepository):
    result = vet_repository.search(SearchVetQuery(fiscal_code="99999999999"))

    assert result.total == 0
    assert result.items == []


@pytest.mark.parametrize(
    "business_name,fiscal_code,name,surname",
    [
        ("Studio A", "11122233344", "Mario", "Rossi"),
        ("Clinica B", "55566677788", "Luigi", "Bianchi"),
    ],
)
def test_create_vet_parametric(
    vet_repository: SQLVetRepository,
    business_name: str,
    fiscal_code: str,
    name: str,
    surname: str,
):
    data = VetModel(
        business_name=business_name,
        fiscal_code=fiscal_code,
        name=name,
        surname=surname,
    )
    result = vet_repository.create(data)

    assert result.id is not None
    assert result.business_name == business_name
    assert result.fiscal_code == fiscal_code
