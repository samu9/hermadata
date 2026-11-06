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


# --- user-specific permission overrides ---


def _ensure_permissions(db_session: Session, codes: list[str]):
    from hermadata.database.models import Permission as PermissionEntity

    for code in codes:
        db_session.merge(PermissionEntity(code=code))
    db_session.flush()


def _make_role_user(
    db_session: Session, make_user, role_codes: list[str]
) -> int:
    """Create a user with a fresh role granting `role_codes`"""
    from hermadata.database.models import UserRole, UserRolePermission

    _ensure_permissions(db_session, role_codes + ["MU", "BAV"])

    role = UserRole(name=f"r_{uuid4().hex[:10]}")
    db_session.add(role)
    db_session.flush()
    for code in role_codes:
        db_session.add(
            UserRolePermission(role_id=role.id, permission_code=code)
        )

    user_id = make_user()
    user = db_session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one()
    user.role_id = role.id
    db_session.flush()
    return user_id


def test_effective_permissions_role_only(
    user_repository: SQLUserRepository, make_user, db_session: Session
):
    user_id = _make_role_user(db_session, make_user, ["CA", "DS"])
    user = user_repository.get_by_id(user_id)

    assert sorted(user.permissions) == ["CA", "DS"]


def test_effective_permissions_with_overrides(
    user_repository: SQLUserRepository, make_user, db_session: Session
):
    from hermadata.repositories.user_repository import (
        SetUserPermissionsModel,
        UserPermissionOverride,
    )

    user_id = _make_role_user(db_session, make_user, ["CA", "DS"])

    user_repository.set_user_permissions(
        user_id,
        SetUserPermissionsModel(
            overrides=[
                UserPermissionOverride(permission_code="MU", granted=True),
                UserPermissionOverride(permission_code="CA", granted=False),
            ]
        ),
    )

    user = user_repository.get_by_id(user_id)
    assert sorted(user.permissions) == ["DS", "MU"]

    by_email = user_repository.get_by_email(user.email)
    assert sorted(by_email.permissions) == ["DS", "MU"]


def test_set_user_permissions_replaces_previous(
    user_repository: SQLUserRepository, make_user, db_session: Session
):
    from hermadata.database.models import UserPermission
    from hermadata.repositories.user_repository import (
        SetUserPermissionsModel,
        UserPermissionOverride,
    )

    user_id = _make_role_user(db_session, make_user, ["CA"])

    user_repository.set_user_permissions(
        user_id,
        SetUserPermissionsModel(
            overrides=[
                UserPermissionOverride(permission_code="MU", granted=True),
                UserPermissionOverride(permission_code="CA", granted=False),
            ]
        ),
    )
    user_repository.set_user_permissions(
        user_id,
        SetUserPermissionsModel(
            overrides=[
                UserPermissionOverride(permission_code="BAV", granted=True)
            ]
        ),
    )

    rows = db_session.execute(
        select(UserPermission.permission_code, UserPermission.granted).where(
            UserPermission.user_id == user_id
        )
    ).all()
    assert [tuple(r) for r in rows] == [("BAV", True)]
    assert sorted(user_repository.get_by_id(user_id).permissions) == [
        "BAV",
        "CA",
    ]

    user_repository.set_user_permissions(
        user_id, SetUserPermissionsModel(overrides=[])
    )
    assert user_repository.get_by_id(user_id).permissions == ["CA"]


def test_get_user_permission_details(
    user_repository: SQLUserRepository, make_user, db_session: Session
):
    from hermadata.repositories.user_repository import (
        SetUserPermissionsModel,
        UserPermissionOverride,
    )

    user_id = _make_role_user(db_session, make_user, ["CA", "DS"])
    user_repository.set_user_permissions(
        user_id,
        SetUserPermissionsModel(
            overrides=[
                UserPermissionOverride(permission_code="MU", granted=True),
                UserPermissionOverride(permission_code="CA", granted=False),
            ]
        ),
    )

    details = {
        d.code: d for d in user_repository.get_user_permission_details(user_id)
    }
    all_codes = {p.code for p in user_repository.get_all_permissions()}

    assert set(details) == all_codes

    assert details["CA"].from_role is True
    assert details["CA"].override is False
    assert details["CA"].effective is False

    assert details["DS"].from_role is True
    assert details["DS"].override is None
    assert details["DS"].effective is True

    assert details["MU"].from_role is False
    assert details["MU"].override is True
    assert details["MU"].effective is True

    assert details["BAV"].from_role is False
    assert details["BAV"].override is None
    assert details["BAV"].effective is False
