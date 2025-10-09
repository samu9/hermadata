from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from hermadata.database.models import User
from hermadata.services.user_service import RegisterUserModel, UserService


def test_register_and_login_user(
    user_service: UserService, db_session: Session
):
    data = RegisterUserModel(email=f"{uuid4().hex}@test.it", password="test")
    user_id = user_service.register(data)

    user = db_session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one()

    assert user.email == data.email
    assert user_service._verify_password("test", user.hashed_password)

    jwt = user_service.login(data.email, data.password)

    assert jwt

    decoded = user_service.decode_jwt(jwt)

    assert decoded.email == data.email

    logged = user_service.login(user.email, uuid4().hex)

    assert not logged


def test_wrong_login_user(user_service: UserService):
    logged = user_service.login(f"{uuid4().hex}@test.it", uuid4().hex)

    assert not logged
