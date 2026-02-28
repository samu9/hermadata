from uuid import uuid4

import pytest
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from hermadata.database.models import User
from hermadata.repositories.user_repository import UserListQuery
from hermadata.services.user_service import RegisterUserModel, UserService


def test_register_and_login_user(
    user_service: UserService, db_session: Session
):
    data = RegisterUserModel(
        email=f"{uuid4().hex}@test.it",
        password="test",
        name="Test",
        surname="User",
        is_active=False,
    )
    user = user_service.register(data)

    db_user = db_session.execute(
        select(User).where(User.id == user.id)
    ).scalar_one()

    assert db_user.email == data.email
    assert db_user.name == data.name
    assert db_user.surname == data.surname
    assert db_user.is_active == data.is_active
    assert user_service._verify_password("test", db_user.hashed_password)

    jwt = user_service.login(data.email, data.password)

    assert jwt

    decoded = user_service.decode_jwt(jwt)

    assert decoded.email == data.email

    logged = user_service.login(user.email, uuid4().hex)

    assert not logged


def test_wrong_login_user(user_service: UserService):
    logged = user_service.login(f"{uuid4().hex}@test.it", uuid4().hex)

    assert not logged


def test_register_duplicate_email(user_service: UserService):
    email = f"{uuid4().hex}@test.it"
    user_service.register(
        RegisterUserModel(
            email=email,
            password="test",
            name="First",
            surname="User",
        )
    )

    with pytest.raises(HTTPException) as exc:
        user_service.register(
            RegisterUserModel(
                email=email,
                password="another",
                name="Second",
                surname="User",
            )
        )

    assert exc.value.status_code == 400
    assert exc.value.detail == "Email già registrata"


def test_get_user_by_id(user_service: UserService, make_user):
    user_id = make_user()

    user = user_service.get_user_by_id(user_id)

    assert user.id == user_id
    assert user.name == "Fixture"
    assert user.surname == "User"


def test_get_all_users(user_service: UserService, make_user):
    make_user()

    result = user_service.get_all_users(UserListQuery())

    assert result.total >= 1
    assert len(result.items) >= 1


def test_delete_user(user_service: UserService, make_user, db_session: Session):
    user_id = make_user()

    user_service.delete_user(user_id)

    user = db_session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one()

    assert user.deleted_at is not None


def test_change_password(user_service: UserService, make_user):
    user_id = make_user()

    success = user_service.change_password(user_id, None, "new_password_123")

    assert success is True


def test_change_password_wrong_current(user_service: UserService, make_user):
    user_id = make_user()

    success = user_service.change_password(
        user_id, "wrong_current_password", "new_password_123"
    )

    assert success is False


def test_change_password_nonexistent_user(user_service: UserService):
    success = user_service.change_password(999999, None, "new_password_123")

    assert success is False
