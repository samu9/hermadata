from datetime import datetime, timedelta, timezone
from fastapi import Depends
import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from hermadata.dependancies import get_db_session
from hermadata.repositories.user_repository import (
    CreateUserModel,
    SQLUserRepository,
)


class UserModel(BaseModel):
    user_id: int
    email: EmailStr
    is_superuser: bool
    is_active: bool


class RegisterUserModel(BaseModel):
    email: EmailStr
    password: str


class TokenData(BaseModel):
    user_id: int
    email: EmailStr


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

    def register(self, data: RegisterUserModel) -> int:

        hashed_password = self.pwd_context.hash(data.password)

        user_id = self.user_repository.create(
            CreateUserModel(email=data.email, hashed_password=hashed_password)
        )

        return user_id

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
            user_data = self.user_repository.get_by_email(email)

        except NoResultFound:
            return

        password_verified = self._verify_password(
            password, user_data.hashed_password
        )

        if not password_verified:
            return

        user = UserModel(
            user_id=user_data.id,
            email=user_data.email,
            is_superuser=user_data.is_superuser,
            is_active=user_data.is_active,
        )

        jwt = self._encode_jwt(user.model_dump())

        return jwt

    def get_by_id(self, id: int) -> UserModel:
        user_data = self.user_repository.get_by_id(id)

        user = UserModel.model_validate(user_data, from_attributes=True)

        return user
