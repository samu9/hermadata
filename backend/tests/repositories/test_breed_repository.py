import pytest

from hermadata.repositories.breed_repository import (
    NewBreedModel,
    SQLBreedRepository,
)


def test_new_breed_model():
    model = NewBreedModel(race_id="C", name="Test")

    assert model.name == "TEST"


def test_create_and_get_breed(breed_repository: SQLBreedRepository):
    new_breed = NewBreedModel(race_id="C", name="TestBreedRepo")
    result = breed_repository.create(new_breed)

    assert result.id is not None
    assert result.name == "TESTBREEDREPO"
    assert result.race_id == "C"

    breeds = breed_repository.get_all("C")
    assert any(b.name == "TESTBREEDREPO" for b in breeds)


def test_get_all_breeds_for_race(breed_repository: SQLBreedRepository):
    breed_repository.create(NewBreedModel(race_id="G", name="GattoRazza"))

    cat_breeds = breed_repository.get_all("G")
    dog_breeds = breed_repository.get_all("C")

    assert any(b.name == "GATTORAZZA" for b in cat_breeds)
    assert not any(b.name == "GATTORAZZA" for b in dog_breeds)


@pytest.mark.parametrize("race_id,name", [
    ("C", "beagle"),
    ("C", "labrador"),
    ("G", "siamese"),
    ("G", "persiano"),
])
def test_create_breed_parametric(breed_repository: SQLBreedRepository, race_id: str, name: str):
    new_breed = NewBreedModel(race_id=race_id, name=name)
    result = breed_repository.create(new_breed)

    assert result.id is not None
    assert result.name == name.upper()
    assert result.race_id == race_id
