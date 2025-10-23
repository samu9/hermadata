from datetime import date

from hermadata.services.adopter_service import (
    AdopterService,
    NewAdopterRequest,
)


def test_create_adopter(adopter_service: AdopterService):
    """Test creating a new adopter through the service."""
    new_adopter_data = NewAdopterRequest(
        name="Mario",
        surname="Rossi",
        fiscal_code="RSSMRA80A01H501U",
        residence_city_code="H501",
        phone="3331234567",
        document_type="id",
        document_number="AR1234567",
    )

    result = adopter_service.create(new_adopter_data)

    assert result.name == "MARIO"
    assert result.surname == "ROSSI"
    assert result.fiscal_code == "RSSMRA80A01H501U"
    assert result.residence_city_code == "H501"
    assert result.phone == "3331234567"
    assert result.document_type == "id"
    assert result.document_number == "AR1234567"
    assert result.id is not None
    assert result.birth_city_code == "H501"
    assert result.birth_date == date(1980, 1, 1)


def test_search_adopters(
    adopter_service: AdopterService, make_adopter: callable
):
    """Test searching for adopters through the service."""
    from hermadata.repositories.adopter_repository import AdopterSearchQuery

    make_adopter()
    # Search for the adopter
    search_query = AdopterSearchQuery(
        name="Mario",
        from_index=0,
        to_index=10,
    )

    result = adopter_service.search(search_query)

    assert result.total >= 1
    assert len(result.items) >= 1
    assert any(adopter.name == "MARIO" for adopter in result.items)
