"""
Permission utilities for route protection and authorization checking.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status

from hermadata.constants import Permission
from hermadata.initializations import get_current_user
from hermadata.services.user_service import TokenData


def require_permission(permission_code: Permission | str):
    """
    FastAPI dependency function that requires a specific permission.

    Args:
        permission_code: The permission code that the user must have.
                        Can be a Permission enum value or string.

    Returns:
        A dependency function that can be used with FastAPI's Depends()

    Raises:
        HTTPException: 403 if user doesn't have the required permission

    Example:
        @router.get("/protected-endpoint")
        def protected_route(
            current_user: Annotated[
                TokenData,
                Depends(require_permission(Permission.CREATE_ANIMAL))
            ],
        ):
            return {"message": "Access granted"}
    """

    def permission_dependency(
        current_user: Annotated[TokenData, Depends(get_current_user)],
    ) -> TokenData:
        # Super users have all permissions
        if current_user.is_superuser:
            return current_user

        # Check if user has the required permission
        # Convert enum to string value if needed
        permission_str = (
            permission_code.value
            if isinstance(permission_code, Permission)
            else permission_code
        )
        if permission_str not in current_user.permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Insufficient permissions. Required: {permission_str}"
                ),
            )

        return current_user

    return permission_dependency


def check_permission(
    current_user: TokenData, permission_code: Permission | str
) -> bool:
    """
    Standalone function to check if a user has a specific permission.

    This function can be used within route logic to conditionally
    execute code based on permissions without raising exceptions.

    Args:
        current_user: The current authenticated user
        permission_code: The permission code to check.
                        Can be a Permission enum value or string.

    Returns:
        bool: True if user has permission or is superuser, False otherwise

    Example:
        @router.get("/mixed-endpoint")
        def mixed_route(
            current_user: Annotated[TokenData, Depends(get_current_user)],
        ):
            result = {"message": "Basic access granted"}

            if check_permission(current_user, "CA"):
                result["can_create_animals"] = True
                result["animals"] = get_all_animals()  # Sensitive data
            else:
                result["can_create_animals"] = False

            return result
    """
    # Super users have all permissions
    if current_user.is_superuser:
        return True

    # Check if user has the required permission
    # Convert enum to string value if needed
    permission_str = (
        permission_code.value
        if isinstance(permission_code, Permission)
        else permission_code
    )
    return permission_str in current_user.permissions


def require_permission_or_raise(
    current_user: TokenData, permission_code: Permission | str
):
    """
    Standalone function that raises HTTPException if user lacks permission.

    This function can be used within route logic when you want to
    conditionally check permissions and raise an exception if denied.

    Args:
        current_user: The current authenticated user
        permission_code: The permission code to check.
                        Can be a Permission enum value or string.

    Raises:
        HTTPException: 403 if user doesn't have the required permission

    Example:
        @router.post("/conditional-create")
        def conditional_create(
            data: CreateModel,
            current_user: Annotated[TokenData, Depends(get_current_user)],
        ):
            # Basic logic that everyone can access
            result = process_basic_data(data)

            # Conditional permission check within the route
            if data.requires_special_permission:
                require_permission_or_raise(current_user, "CA")
                result = process_special_data(data)

            return result
    """
    if not check_permission(current_user, permission_code):
        # Convert enum to string value for the error message
        permission_str = (
            permission_code.value
            if isinstance(permission_code, Permission)
            else permission_code
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(f"Insufficient permissions. Required: {permission_str}"),
        )
