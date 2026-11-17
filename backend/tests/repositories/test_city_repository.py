import pytest

from hermadata.repositories.city_repository import (
    ProvinciaModel,
    SQLCityRepository,
)

FAVOURITES = ["H501", "A561", "B251"]


@pytest.fixture
def favourite_comuni(city_repository: SQLCityRepository):
    for code in FAVOURITES:
        city_repository.set_favourite(code, True)
    yield FAVOURITES
    for code in FAVOURITES:
        city_repository.set_favourite(code, False)


def test_city_repository(city_repository: SQLCityRepository, favourite_comuni):
    province = city_repository.get_province()

    assert ProvinciaModel(id="LU", name="Lucca") in province
    # test preferred province
    assert province[0].id == "LU"

    cities = city_repository.get_comuni("PT")

    assert "Pescia" in [c.name for c in cities]
    # favourite comuni first (B251 Buggiano and A561 Montecatini-Terme are
    # the ones in PT), ordered by name
    assert [c.name for c in cities[:2]] == ["Buggiano", "Montecatini-Terme"]
    assert all(c.favourite for c in cities[:2])
    assert not any(c.favourite for c in cities[2:])


def test_get_all_comuni(city_repository: SQLCityRepository, favourite_comuni):
    cities = city_repository.get_comuni()

    provinces = {c.provincia for c in cities}
    assert {"PT", "LU"} <= provinces
    # favourite comuni come first, ordered by name
    head = cities[: len(FAVOURITES)]
    assert {c.id for c in head} == set(FAVOURITES)
    assert [c.name for c in head] == sorted(c.name for c in head)
    assert not any(c.favourite for c in cities[len(FAVOURITES) :])


def test_get_comuni_without_favourites(city_repository: SQLCityRepository):
    cities = city_repository.get_comuni("PT")

    assert not any(c.favourite for c in cities)
    assert cities[0].name != "Buggiano"


def test_set_favourite(city_repository: SQLCityRepository):
    city_repository.set_favourite("G491", True)
    try:
        assert city_repository.get_comune("G491").favourite is True
    finally:
        city_repository.set_favourite("G491", False)

    assert city_repository.get_comune("G491").favourite is False
