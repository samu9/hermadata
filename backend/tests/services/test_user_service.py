from uuid import uuid4

import pytest
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from hermadata.database.models import User
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
    assert exc.value.detail == "Email already registered"
