from fastapi.testclient import TestClient

from hermadata.repositories.vet_repository import VetModel


def test_create_vet(app: TestClient):
    data = {
        "business_name": "Studio Veterinario Test",
        "fiscal_code": "12345678901",
        "name": "Luigi",
        "surname": "Bianchi",
    }

    result = app.post("/vet", json=data)

    assert result.status_code == 200
    vet = result.json()
    assert vet["business_name"] == data["business_name"]
    assert vet["fiscal_code"] == data["fiscal_code"]
    assert "id" in vet


def test_search_vet(app: TestClient, make_vet):
    vet_id = make_vet()

    result = app.get("/vet/search", params={"fiscal_code": "12345678912"})

    assert result.status_code == 200
    data = result.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1


def test_search_vet_by_business_name(app: TestClient, make_vet):
    make_vet()

    result = app.get("/vet/search", params={"business_name": "Veterinario"})

    assert result.status_code == 200
    data = result.json()
    assert "items" in data
    assert data["total"] >= 0
