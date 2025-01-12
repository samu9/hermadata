from uuid import uuid4
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from hermadata.services.user_service import RegisterUserModel


def test_user_token_route(app: TestClient, make_user, db_session: Session):
    form_data = {
        "username": "testuser",
        "password": "testpassword",
    }
    result = app.post("/user/login", data=form_data)

    assert result.status_code == 400

    user_data = RegisterUserModel(
        email=f"{uuid4().hex}@email.com", password="test"
    )
    make_user(user_data)

    form_data = {
        "username": user_data.email,
        "password": user_data.password,
    }
    result = app.post("/user/login", data=form_data)

    assert result.status_code == 200
