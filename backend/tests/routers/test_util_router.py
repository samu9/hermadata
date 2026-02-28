from fastapi.testclient import TestClient


def test_get_animal_event_types(app: TestClient):
    result = app.get("/util/events")

    assert result.status_code == 200
    data = result.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "code" in data[0]
    assert "description" in data[0]


def test_get_province(app: TestClient):
    result = app.get("/util/province")

    assert result.status_code == 200
    data = result.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_get_comuni(app: TestClient):
    result = app.get("/util/comuni", params={"provincia": "LU"})

    assert result.status_code == 200
    data = result.json()
    assert isinstance(data, list)


def test_get_comune_by_code(app: TestClient):
    result = app.get("/util/comune/H501")

    assert result.status_code == 200
    data = result.json()
    assert data is not None
    assert "name" in data


def test_get_comune_not_found(app: TestClient):
    result = app.get("/util/comune/ZZZZ")

    assert result.status_code == 200
    assert result.json() is None


def test_get_entry_types(app: TestClient):
    result = app.get("/util/entry-types")

    assert result.status_code == 200
    data = result.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "id" in data[0]
    assert "label" in data[0]


def test_get_exit_types(app: TestClient):
    result = app.get("/util/exit-types")

    assert result.status_code == 200
    data = result.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "id" in data[0]
    assert "label" in data[0]


def test_get_animal_sizes(app: TestClient):
    result = app.get("/util/animal-size")

    assert result.status_code == 200
    data = result.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_get_animal_fur_types(app: TestClient):
    result = app.get("/util/animal-fur")

    assert result.status_code == 200
    data = result.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_get_animal_stages(app: TestClient):
    result = app.get("/util/animal-stages")

    assert result.status_code == 200
    data = result.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_get_fur_colors(app: TestClient):
    result = app.get("/util/fur-color")

    assert result.status_code == 200
    data = result.json()
    assert isinstance(data, list)


def test_add_fur_color(app: TestClient):
    from uuid import uuid4

    color_name = uuid4().hex[:15]

    result = app.post("/util/fur-color", json={"name": color_name})

    assert result.status_code == 200
    data = result.json()
    assert data["label"] == color_name.upper()
    assert "id" in data
