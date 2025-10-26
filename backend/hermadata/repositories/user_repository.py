from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr
from sqlalchemy import func, select, update
from sqlalchemy.exc import NoResultFound

from hermadata.database.models import User, UserRole, UserRolePermission
from hermadata.models import PaginationQuery, PaginationResult
from hermadata.repositories import SQLBaseRepository


class CreateUserModel(BaseModel):
    email: EmailStr
    hashed_password: str


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
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class UserListQuery(PaginationQuery):
    pass


class SQLUserRepository(SQLBaseRepository):
    def create(self, data: CreateUserModel) -> int:
        result = self.add_entity(User, **data.model_dump())
        return result.id

    def get_by_email(self, email: EmailStr):
        result = self.session.execute(
            select(User).where(User.email == email)
        ).scalar_one()

        return result

    def get_by_id(self, id: int) -> User:
        result = self.session.execute(
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
        # Base query for users
        base_query = select(User)

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
        result = self.session.execute(base_query).scalars().all()

        # Convert to UserModel instances
        user_models = [UserModel.model_validate(user) for user in result]

        return PaginationResult(items=user_models, total=total)
