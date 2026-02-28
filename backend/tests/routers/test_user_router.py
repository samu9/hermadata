from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from hermadata.repositories.user_repository import UpdateUserModel
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


def test_create_user(app: TestClient):
    data = {
        "email": f"{uuid4().hex}@test.it",
        "password": "testpassword123",
        "name": "Test",
        "surname": "User",
    }

    result = app.post("/user/", json=data)

    assert result.status_code == 200
    content = result.json()
    assert content["email"] == data["email"]
    assert content["name"] == data["name"]


def test_get_all_users(app: TestClient, make_user):
    make_user()

    result = app.get("/user/")

    assert result.status_code == 200
    content = result.json()
    assert "items" in content
    assert "total" in content
    assert content["total"] >= 1


def test_get_current_user_profile(app: TestClient, make_user):
    make_user()

    result = app.get("/user/me")

    assert result.status_code == 200
    content = result.json()
    assert "email" in content
    assert "id" in content


def test_get_all_roles(app: TestClient):
    result = app.get("/user/roles")

    assert result.status_code == 200
    roles = result.json()
    assert isinstance(roles, list)


def test_get_all_permissions(app: TestClient):
    result = app.get("/user/permissions")

    assert result.status_code == 200
    permissions = result.json()
    assert isinstance(permissions, list)


def test_update_user(app: TestClient, make_user):
    user_id = make_user()

    update_data = {
        "name": "Updated Name",
        "surname": "Updated Surname",
    }

    result = app.put(f"/user/{user_id}", json=update_data)

    assert result.status_code == 200


def test_delete_user(app: TestClient, make_user):
    user_id = make_user()

    result = app.delete(f"/user/{user_id}")

    assert result.status_code == 200


def test_register_user(app: TestClient):
    data = {
        "email": f"{uuid4().hex}@test.it",
        "password": "testpassword123",
        "name": "Reg",
        "surname": "User",
    }

    result = app.post("/user/register", json=data)

    assert result.status_code == 200
