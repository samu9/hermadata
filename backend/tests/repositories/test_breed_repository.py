from hermadata.repositories.breed_repository import NewBreedModel


def test_new_breed_model():
    model = NewBreedModel(race_id="C", name="Test")

    assert model.name == "TEST"
