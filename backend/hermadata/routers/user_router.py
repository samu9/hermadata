from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from hermadata.initializations import (
    get_current_user,
    get_user_repository,
    get_user_service,
)
from hermadata.models import PaginationResult
from hermadata.repositories.user_repository import (
    PermissionModel,
    RoleModel,
    SQLUserRepository,
    UpdateUserModel,
    UserListQuery,
)
from hermadata.services.user_service import (
    ChangePasswordModel,
    RegisterUserModel,
    TokenData,
    UserModel,
    UserService,
)

router = APIRouter(prefix="/user", tags=["user"])


@router.post("", response_model=UserModel)
def create_user(
    current_user: Annotated[TokenData, Depends(get_current_user)],
    data: RegisterUserModel,
    service: Annotated[UserService, Depends(get_user_service)],
):
    user = service.register(data)

    return user


@router.get("", response_model=PaginationResult[UserModel])
def get_all_users(
    query: Annotated[UserListQuery, Depends()],
    current_user: Annotated[TokenData, Depends(get_current_user)],
    service: Annotated[UserService, Depends(get_user_service)],
):
    """Get all users with pagination. Requires authentication."""
    return service.get_all_users(query)


@router.get("/me", response_model=UserModel)
def get_current_user_profile(
    current_user: Annotated[TokenData, Depends(get_current_user)],
    service: Annotated[UserService, Depends(get_user_service)],
):
    """Get current user's profile information"""
    return service.get_user_by_id(current_user.user_id)


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
        "permissions": user_details.permissions,
    }


@router.get("/roles", response_model=list[RoleModel])
def get_all_roles(
    current_user: Annotated[TokenData, Depends(get_current_user)],
    user_repository: Annotated[
        SQLUserRepository, Depends(get_user_repository)
    ],
):
    """Get all available user roles. Requires authentication."""
    return user_repository.get_all_roles()


@router.get("/permissions", response_model=list[PermissionModel])
def get_all_permissions(
    current_user: Annotated[TokenData, Depends(get_current_user)],
    user_repository: Annotated[
        SQLUserRepository, Depends(get_user_repository)
    ],
):
    """Get all available permissions. Requires authentication."""
    return user_repository.get_all_permissions()


@router.put("/{user_id}")
def update(
    user_id: int,
    data: UpdateUserModel,
    current_user: Annotated[TokenData, Depends(get_current_user)],
    user_repository: Annotated[UserService, Depends(get_user_repository)],
):
    if not current_user.is_superuser and current_user.user_id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this user"
        )
    user_repository.update(user_id, data)


@router.post("/{user_id}/password")
def change_password(
    user_id: int,
    data: ChangePasswordModel,
    current_user: Annotated[TokenData, Depends(get_current_user)],
    service: Annotated[UserService, Depends(get_user_service)],
):
    """Change user password with current password verification"""
    # Users can only change their own password, unless they are superuser
    if not current_user.is_superuser and current_user.user_id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to change this password"
        )

    # If user is changing their own password, current_password is required
    if current_user.user_id == user_id and data.current_password is None:
        raise HTTPException(
            status_code=400,
            detail="Current password required when changing your own password",
        )

    # If superuser is changing another user's password, current_password not
    # needed but if provided, it should be verified
    success = service.change_password(
        user_id, data.current_password, data.new_password
    )

    if not success:
        raise HTTPException(
            status_code=400, detail="Current password is incorrect"
        )

    return {"message": "Password changed successfully"}
