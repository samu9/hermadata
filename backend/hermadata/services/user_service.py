from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from hermadata.dependancies import get_db_session
from hermadata.models import PaginationResult
from hermadata.repositories.user_repository import (
    CreateUserModel,
    SQLUserRepository,
    UserListQuery,
    UserModel,
)


class RegisterUserModel(BaseModel):
    email: EmailStr
    password: str
    role_name: str | None = None
    name: str | None = None
    surname: str | None = None
    is_active: bool = True


class ChangePasswordModel(BaseModel):
    current_password: str | None = None
    new_password: str


class TokenData(BaseModel):
    user_id: int
    email: EmailStr
    is_active: bool = False
    is_superuser: bool = False
    role: str | None = None
    permissions: list[str] = []


class UserService:
    def __init__(
        self,
        user_repository: SQLUserRepository,
        secret: str,
        access_token_expire_minutes: int,
        algorithm: str,
    ):
        self.user_repository = user_repository
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.secret = secret
        self.access_token_expire_minutes = access_token_expire_minutes
        self.algorithm = algorithm

    def __call__(self, session: Session = Depends(get_db_session)):
        self.user_repository(session)
        return self

    def register(self, data: RegisterUserModel) -> UserModel:
        hashed_password = self.pwd_context.hash(data.password)

        user_id = self.user_repository.create(
            CreateUserModel(
                email=data.email,
                role_name=data.role_name,
                hashed_password=hashed_password,
                name=data.name,
                surname=data.surname,
                is_active=data.is_active,
            )
        )

        user = UserModel(
            id=user_id,
            email=data.email,
            is_active=data.is_active,
            is_superuser=False,
            name=data.name,
            surname=data.surname,
            created_at=datetime.now(timezone.utc),
        )
        return user

    def _verify_password(self, plain: str, hashed: str):
        return self.pwd_context.verify(plain, hashed)

    def _encode_jwt(self, data: dict):
        to_encode = data.copy()

        expire = datetime.now(timezone.utc) + timedelta(
            minutes=self.access_token_expire_minutes
        )

        to_encode.update({"exp": expire})

        encoded_jwt = jwt.encode(
            to_encode, self.secret, algorithm=self.algorithm
        )
        return encoded_jwt

    def decode_jwt(self, token: str) -> TokenData:
        payload = jwt.decode(token, self.secret, algorithms=[self.algorithm])

        data = TokenData.model_validate(payload)

        return data

    def login(self, email: str, password: str) -> UserModel:
        try:
            hashed_password = self.user_repository.get_for_login(email)

        except NoResultFound:
            return

        password_verified = self._verify_password(password, hashed_password)

        if not password_verified:
            return
        user_data = self.user_repository.get_by_email(email)
        user = TokenData(
            user_id=user_data.id,
            email=user_data.email,
            is_superuser=user_data.is_superuser,
            is_active=user_data.is_active,
            role=user_data.role_name,
            permissions=user_data.permissions,
        )

        jwt = self._encode_jwt(user.model_dump())

        return jwt

    def get_by_id(self, id: int) -> UserModel:
        user_data = self.user_repository.get_by_id(id)

        user = UserModel.model_validate(user_data, from_attributes=True)

        return user

    def get_user_details(self, email: str) -> UserModel:
        """Get user details by email for login response"""
        user_data = self.user_repository.get_by_email(email)

        user = UserModel.model_validate(user_data, from_attributes=True)

        return user

    def get_user_by_id(self, user_id: int) -> UserModel:
        """Get user details by ID"""
        user = self.user_repository.get_by_id(user_id)

        return user

    def get_all_users(
        self, query: UserListQuery
    ) -> PaginationResult[UserModel]:
        """Get all users with pagination"""
        result = self.user_repository.get_all(query)
        return result

    def change_password(
        self, user_id: int, current_password: str | None, new_password: str
    ) -> bool:
        """Change user password after verifying current password if provided"""
        try:
            # Get user by ID
            user_data = self.user_repository.get_by_id(user_id)

            # Verify current password only if provided
            if current_password is not None:
                if not self._verify_password(
                    current_password, user_data.hashed_password
                ):
                    return False

            # Hash new password
            new_hashed_password = self.pwd_context.hash(new_password)

            # Update password in database
            self.user_repository.update_password(user_id, new_hashed_password)

            return True
        except NoResultFound:
            return False
