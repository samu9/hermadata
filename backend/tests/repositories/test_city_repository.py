from hermadata.repositories.city_repository import (
    ProvinciaModel,
    SQLCityRepository,
)


def test_city_repository(city_repository: SQLCityRepository):
    province = city_repository.get_province()

    assert ProvinciaModel(id="LU", name="Lucca") in province
    # test preferred province
    assert province[0].id == "LU"

    cities = city_repository.get_comuni("PT")

    assert "Pescia" in [c.name for c in cities]
    # test preferred cities
    assert cities[0].name == "Buggiano"


def test_get_all_comuni(city_repository: SQLCityRepository):
    cities = city_repository.get_comuni()

    provinces = {c.provincia for c in cities}
    assert {"PT", "LU"} <= provinces
    # preferred cities still come first
    assert cities[0].name == "Buggiano"
