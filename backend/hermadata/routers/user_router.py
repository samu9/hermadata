from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from hermadata.services.user_service import (
    RegisterUserModel,
    TokenData,
    UserService,
)
from hermadata.initializations import get_current_user, user_service

router = APIRouter(prefix="/user", tags=["user"])


@router.post("/", response_model=UserModel)
def test(
    current_user: Annotated[TokenData, Depends(get_current_user)],
    service: Annotated[UserService, Depends(user_service)],
):
    user = service.get_by_id(current_user.user_id)
    return user


@router.post("/register")
def register(
    data: RegisterUserModel,
    service: Annotated[UserService, Depends(user_service)],
):
    service.register(data)

    return True


@router.post("/login")
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: Annotated[UserService, Depends(user_service)],
):

    jwt = service.login(form_data.username, form_data.password)

    if not jwt:
        raise HTTPException(
            status_code=400, detail="Incorrect username or password"
        )

    return {"access_token": jwt, "token_type": "bearer"}
