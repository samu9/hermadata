import json

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def test_get_races(app: TestClient, db_session: Session):
    result = app.get("/race")

    content = result.content.decode()
    races = json.loads(content)

    assert "id" in races[0] and "name" in races[0]
