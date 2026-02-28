from fastapi.testclient import TestClient

from hermadata.repositories.breed_repository import (
    BreedModel,
    NewBreedModel,
    SQLBreedRepository,
)


def test_get_breeds(app: TestClient, breed_repository: SQLBreedRepository):
    breed_repository.create(NewBreedModel(race_id="C", name="test_breed_router"))

    result = app.get("/breed", params={"race_id": "C"})

    assert result.status_code == 200
    data = result.json()
    assert isinstance(data, list)
    assert any(b["name"] == "TEST_BREED_ROUTER" for b in data)


def test_create_breed(app: TestClient):
    data = {"race_id": "C", "name": "new_router_breed"}

    result = app.post("/breed", json=data)

    assert result.status_code == 200
    breed = result.json()
    assert breed["name"] == "NEW_ROUTER_BREED"
    assert breed["race_id"] == "C"
    assert "id" in breed


def test_create_breed_cat(app: TestClient):
    data = {"race_id": "G", "name": "cat_breed_router"}

    result = app.post("/breed", json=data)

    assert result.status_code == 200
    breed = result.json()
    assert breed["race_id"] == "G"
