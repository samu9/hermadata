from pydantic import BaseModel, EmailStr
from sqlalchemy import select, update

from hermadata.database.models import User
from hermadata.repositories import SQLBaseRepository


class CreateUserModel(BaseModel):
    email: EmailStr
    hashed_password: str


class UpdateUserModel(BaseModel):
    email: EmailStr | None = None
    is_active: bool | None = None
    is_superuser: bool | None = None


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
            select(User).where(User.id == id)
        ).scalar_one()

        return result

    def update(self, user_id: int, data: UpdateUserModel):
        self.session.execute(
            update(User)
            .values(data.model_dump(exclude_none=True))
            .where(User.id == user_id)
        )
