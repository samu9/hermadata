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


def test_get_by_email(user_repository: SQLUserRepository, make_user, db_session: Session):
    user_id: int = make_user()
    email = db_session.execute(
        select(User.email).where(User.id == user_id)
    ).scalar_one()

    user = user_repository.get_by_email(email)

    assert user.email == email
    assert user.id == user_id


def test_get_by_id(user_repository: SQLUserRepository, make_user):
    user_id: int = make_user()

    user = user_repository.get_by_id(user_id)

    assert user.id == user_id
    assert user.name == "Fixture"


def test_get_all(user_repository: SQLUserRepository, make_user):
    from hermadata.repositories.user_repository import UserListQuery

    make_user()

    result = user_repository.get_all(UserListQuery())

    assert result.total >= 1
    assert len(result.items) >= 1


def test_delete_user(user_repository: SQLUserRepository, make_user, db_session: Session):
    user_id: int = make_user()

    user_repository.delete(user_id)

    user = db_session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one()

    assert user.deleted_at is not None


def test_update_password(user_repository: SQLUserRepository, make_user, db_session: Session):
    user_id: int = make_user()

    new_hashed = "new_hashed_password_test"
    user_repository.update_password(user_id, new_hashed)

    user = db_session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one()

    assert user.hashed_password == new_hashed


def test_get_all_roles(user_repository: SQLUserRepository):
    from hermadata.repositories.user_repository import RoleModel

    result = user_repository.get_all_roles()

    assert isinstance(result, list)


def test_get_all_permissions(user_repository: SQLUserRepository):
    from hermadata.repositories.user_repository import PermissionModel

    result = user_repository.get_all_permissions()

    assert isinstance(result, list)
