from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from hermadata.database.models import User
from hermadata.repositories.user_repository import (
    CreateUserModel,
    SQLUserRepository,
    UpdateUserModel,
)


def test_add_user(user_repository: SQLUserRepository, db_session: Session):
    data = CreateUserModel(
        email=f"{uuid4().hex}@test.it",
        hashed_password=uuid4().hex,
        name="Repo",
        surname="Test",
        is_active=False,
    )

    result = user_repository.create(data)

    assert isinstance(result, int)

    new_user = db_session.execute(
        select(User).where(User.id == result)
    ).scalar_one()

    assert new_user.email == data.email
    assert new_user.hashed_password == data.hashed_password
    assert new_user.name == data.name
    assert new_user.surname == data.surname
    assert new_user.is_active == data.is_active


def test_update_repository(
    user_repository: SQLUserRepository, make_user, db_session: Session
):
    user_id: int = make_user()

    new_email = f"{uuid4().hex}@test.it"
    new_name = "Updated"
    new_surname = "User"
    user_repository.update(
        user_id,
        data=UpdateUserModel(
            email=new_email,
            is_superuser=True,
            name=new_name,
            surname=new_surname,
        ),
    )

    updated_user = db_session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one()

    assert updated_user.is_superuser
    assert updated_user.email == new_email
    assert updated_user.name == new_name
    assert updated_user.surname == new_surname


def test_email_exists(
    user_repository: SQLUserRepository, make_user, db_session: Session
):
    user_id: int = make_user()
    existing_email = db_session.execute(
        select(User.email).where(User.id == user_id)
    ).scalar_one()

    assert user_repository.email_exists(existing_email)
    assert not user_repository.email_exists(f"{uuid4().hex}@test.it")
