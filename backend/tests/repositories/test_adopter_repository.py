from datetime import date

import pytest

from hermadata.errors import DuplicateFiscalCodeException
from hermadata.repositories.adopter_repository import (
    AdopterSearchQuery,
    IDDocumentType,
    NewAdopter,
    SQLAdopterRepository,
)


def test_save_and_search(adopter_repository: SQLAdopterRepository):
    adopter_repository.create(
        NewAdopter(
            name="Mario",
            surname="Bianchi",
            birth_city_code="H501",
            residence_city_code="H501",
            birth_date=date(1990, 1, 2),
            phone="123456",
            fiscal_code="AAAAAA12Z12Z123A",
            document_number="AA12345AA",
            document_type=IDDocumentType.driving_licence,
        )
    )

    result = adopter_repository.search(
        AdopterSearchQuery(fiscal_code="AAAAAA12Z12Z123A")
    )

    assert result.total == 1


def test_create_duplicate_fiscal_code_raises(
    adopter_repository: SQLAdopterRepository,
):
    data = NewAdopter(
        name="Mario",
        surname="Bianchi",
        birth_city_code="H501",
        residence_city_code="H501",
        birth_date=date(1990, 1, 2),
        phone="123456",
        fiscal_code="BBBBBB12Z12Z123A",
        document_number="AA12345AA",
        document_type=IDDocumentType.driving_licence,
    )
    adopter_repository.create(data)

    with pytest.raises(DuplicateFiscalCodeException):
        adopter_repository.create(data)
