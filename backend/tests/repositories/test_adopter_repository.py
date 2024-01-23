from datetime import date
from hermadata.repositories.adopter_repository import (
    AdopterQuery,
    NewAdopter,
    SQLAdopterRepository,
)


def test_save_and_search(db_session):
    repo = SQLAdopterRepository(session=db_session)

    repo.create(
        NewAdopter(
            name="Mario",
            surname="Bianchi",
            birth_city_code="H501",
            residence_city_code="H501",
            birth_date=date(1990, 1, 2),
            phone="123456",
            fiscal_code="AAAAAA12Z12Z123A",
        )
    )

    result = repo.search(AdopterQuery(fiscal_code="AAAAAA12Z12Z123A"))

    assert len(result) == 1
