from fastapi.testclient import TestClient


def test_list_structures(app: TestClient):
    result = app.get("/structure")
    assert result.status_code == 200
    data = result.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    structure = data[0]
    assert "id" in structure
    assert "name" in structure
    assert "structure_type" in structure


def test_move_animal_to_structure(app: TestClient, make_animal, db_session):
    animal_id = make_animal()

    result = app.post(
        f"/animal/{animal_id}/move-structure",
        json={"structure_id": 1},
    )
    assert result.status_code == 200
    assert result.json() is True
