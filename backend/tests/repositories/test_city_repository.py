from hermadata.repositories.city_repository import (
    ProvinciaModel,
    SQLCityRepository,
)


def test_city_repository(city_repository: SQLCityRepository):
    province = city_repository.get_province()

    assert ProvinciaModel(id="LU", name="Lucca") in province
