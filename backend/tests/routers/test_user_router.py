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


# --- user-specific permission overrides ---


def test_get_and_set_user_permissions(app: TestClient, make_user):
    user_id = make_user()

    result = app.get(f"/user/{user_id}/permissions")
    assert result.status_code == 200
    details = result.json()
    assert len(details) > 0
    assert all(d["override"] is None for d in details)

    result = app.put(
        f"/user/{user_id}/permissions",
        json={"overrides": [{"permission_code": "MU", "granted": True}]},
    )
    assert result.status_code == 200

    details = {
        d["code"]: d
        for d in app.get(f"/user/{user_id}/permissions").json()
    }
    assert details["MU"]["override"] is True
    assert details["MU"]["effective"] is True


def test_set_user_permissions_unknown_code(app: TestClient, make_user):
    user_id = make_user()

    result = app.put(
        f"/user/{user_id}/permissions",
        json={"overrides": [{"permission_code": "ZZZ", "granted": True}]},
    )
    assert result.status_code == 400


def test_user_permissions_unknown_user(app: TestClient):
    assert app.get("/user/999999999/permissions").status_code == 404
    result = app.put("/user/999999999/permissions", json={"overrides": []})
    assert result.status_code == 404


def test_user_permissions_requires_manage_users(app: TestClient, make_user):
    from hermadata.initializations import get_current_user
    from hermadata.services.user_service import TokenData

    user_id = make_user()

    def no_mu_user():
        return TokenData(
            user_id=1,
            email="test@test.it",
            is_active=True,
            is_superuser=False,
            permissions=["CA"],
        )

    def mu_user():
        return TokenData(
            user_id=1,
            email="test@test.it",
            is_active=True,
            is_superuser=False,
            permissions=["MU"],
        )

    app.app.dependency_overrides[get_current_user] = no_mu_user
    assert app.get(f"/user/{user_id}/permissions").status_code == 403
    result = app.put(f"/user/{user_id}/permissions", json={"overrides": []})
    assert result.status_code == 403

    app.app.dependency_overrides[get_current_user] = mu_user
    assert app.get(f"/user/{user_id}/permissions").status_code == 200
