from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr
from sqlalchemy import func, select, update
from sqlalchemy.exc import NoResultFound

from hermadata.constants import Permission
from hermadata.database.models import Permission as PermissionEntity
from hermadata.database.models import User, UserRole, UserRolePermission
from hermadata.models import PaginationQuery, PaginationResult
from hermadata.repositories import SQLBaseRepository


class CreateUserModel(BaseModel):
    email: EmailStr
    hashed_password: str
    role_name: str


class UpdateUserModel(BaseModel):
    email: EmailStr | None = None
    is_active: bool | None = None
    is_superuser: bool | None = None


class UserModel(BaseModel):
    id: int
    name: str | None = None
    surname: str | None = None
    email: str
    is_active: bool
    is_superuser: bool
    role_name: str | None = None
    created_at: datetime
    updated_at: datetime | None = None
    permissions: list[Permission] = []
    model_config = ConfigDict(from_attributes=True)


class UserListQuery(PaginationQuery):
    pass


class RoleModel(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class PermissionModel(BaseModel):
    code: str
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)


class SQLUserRepository(SQLBaseRepository):
    def _get_role_id_by_name(self, role_name: str) -> int | None:
        """Get role ID by role name"""
        try:
            result = self.session.execute(
                select(UserRole.id).where(UserRole.name == role_name)
            ).scalar_one()
            return result
        except NoResultFound:
            return None

    def create(self, data: CreateUserModel) -> int:
        # Get role_id from role_name
        role_id = self._get_role_id_by_name(data.role_name)

        # Create user data without role_name but with role_id
        user_data = data.model_dump(exclude={"role_name"})
        user_data["role_id"] = role_id

        result = self.add_entity(User, **user_data)
        return result.id

    def get_for_login(self, email: EmailStr) -> str:
        return self.session.execute(
            select(User.hashed_password).where(User.email == email)
        ).scalar_one()

    def get_by_email(self, email: EmailStr) -> UserModel:
        result = self.session.execute(
            select(User, UserRole.name.label("role_name"))
            .outerjoin(UserRole, User.role_id == UserRole.id)
            .where(User.email == email)
        ).first()

        if result is None:
            raise NoResultFound("User not found")

        user_data, role_name = result

        permissions = self.get_user_permissions(user_data.role_id)

        user = UserModel(
            id=user_data.id,
            name=user_data.name,
            surname=user_data.surname,
            email=user_data.email,
            permissions=permissions,
            role_name=role_name,
            is_active=user_data.is_active,
            is_superuser=user_data.is_superuser,
            created_at=user_data.created_at,
            updated_at=user_data.updated_at,
        )

        return user

    def get_by_id(self, id: int) -> User:
        result = self.session.execute(
            select(User, UserRole.name.label("role_name"))
            .outerjoin(UserRole, User.role_id == UserRole.id)
            .where(User.id == id)
        ).first()

        if result is None:
            raise NoResultFound("User not found")

        user, role_name = result
        # Add role_name as attribute to user object
        user.role_name = role_name

        # Get permissions for this user's role
        permissions = self.get_user_permissions(user.role_id)
        user.permissions = permissions

        return user

    def get_user_permissions(self, role_id: int) -> list[str]:
        """Get all permission codes for a given role"""
        if role_id is None:
            return []

        result = (
            self.session.execute(
                select(UserRolePermission.permission_code).where(
                    UserRolePermission.role_id == role_id
                )
            )
            .scalars()
            .all()
        )

        return list(result)

    def get_all_roles(self) -> list[RoleModel]:
        """Get all roles"""
        result = self.session.execute(select(UserRole)).scalars().all()

        return [
            RoleModel.model_validate(role, from_attributes=True)
            for role in result
        ]

    def update(self, user_id: int, data: UpdateUserModel):
        self.session.execute(
            update(User)
            .values(data.model_dump(exclude_none=True))
            .where(User.id == user_id)
        )

    def update_password(self, user_id: int, hashed_password: str):
        """Update user password with hashed password"""
        self.session.execute(
            update(User)
            .values(hashed_password=hashed_password)
            .where(User.id == user_id)
        )

    def get_all(self, query: UserListQuery) -> PaginationResult[UserModel]:
        """Get all users with pagination"""
        # Base query for users with role information
        base_query = select(User, UserRole.name.label("role_name")).outerjoin(
            UserRole, User.role_id == UserRole.id
        )

        # Count total users
        count_query = select(func.count()).select_from(User)
        total = self.session.execute(count_query).scalar_one()

        # Apply pagination
        if query.from_index is not None and query.to_index is not None:
            limit = query.to_index - query.from_index + 1
            base_query = base_query.offset(query.from_index).limit(limit)

        # Apply sorting if specified
        if query.sort_field and hasattr(User, query.sort_field):
            sort_column = getattr(User, query.sort_field)
            if query.sort_order == -1:
                sort_column = sort_column.desc()
            base_query = base_query.order_by(sort_column)
        else:
            # Default sort by id
            base_query = base_query.order_by(User.id)

        # Execute query
        result = self.session.execute(base_query).all()

        # Convert to UserModel instances
        user_models = []
        for user, role_name in result:
            permissions = self.get_user_permissions(user.role_id)

            user_data = UserModel(
                id=user.id,
                name=user.name,
                surname=user.surname,
                email=user.email,
                permissions=permissions,
                role_name=role_name,
                is_active=user.is_active,
                is_superuser=user.is_superuser,
                created_at=user.created_at,
                updated_at=user.updated_at,
            )

            user_models.append(user_data)

        return PaginationResult(items=user_models, total=total)

    def get_all_permissions(self) -> list[PermissionModel]:
        """Get all available permissions with their codes and descriptions"""
        query = select(PermissionEntity)
        result = self.session.execute(query).scalars().all()

        return [
            PermissionModel(
                code=permission.code, description=permission.description
            )
            for permission in result
        ]
