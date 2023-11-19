from hermadata.repositories.city_repository import (
    ProvinciaModel,
    SQLCityRepository,
)


def test_city_repository(db_session):
    repo = SQLCityRepository(db_session())

    province = repo.get_province()

    assert ProvinciaModel(id="LU", name="Lucca") in province
