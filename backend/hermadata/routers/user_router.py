from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from hermadata.initializations import get_current_user, get_user_service
from hermadata.models import PaginationResult
from hermadata.repositories.user_repository import (
    UpdateUserModel,
    UserListQuery,
)
from hermadata.services.user_service import (
    RegisterUserModel,
    TokenData,
    UserModel,
    UserService,
)

router = APIRouter(prefix="/user", tags=["user"])


@router.post("/", response_model=UserModel)
def test(
    current_user: Annotated[TokenData, Depends(get_current_user)],
    service: Annotated[UserService, Depends(get_user_service)],
):
    user = service.get_by_id(current_user.user_id)
    return user


@router.get("/", response_model=PaginationResult[UserModel])
def get_all_users(
    query: Annotated[UserListQuery, Depends()],
    current_user: Annotated[TokenData, Depends(get_current_user)],
    service: Annotated[UserService, Depends(get_user_service)],
):
    """Get all users with pagination. Requires authentication."""
    return service.get_all_users(query)


@router.post("/register")
def register(
    data: RegisterUserModel,
    service: Annotated[UserService, Depends(get_user_service)],
):
    service.register(data)

    return True


@router.post("/login")
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: Annotated[UserService, Depends(get_user_service)],
):
    login_result = service.login(form_data.username, form_data.password)

    if not login_result:
        raise HTTPException(
            status_code=400, detail="Incorrect username or password"
        )

    # Get user details for the response
    user_details = service.get_user_details(form_data.username)

    return {
        "access_token": login_result,
        "token_type": "bearer",
        "username": user_details.email,
        "is_superuser": user_details.is_superuser,
    }


@router.post("/update")
def update(
    data: UpdateUserModel,
    service: Annotated[UserService, Depends(get_user_service)],
):
    pass
