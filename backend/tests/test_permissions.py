"""
Unit tests for the permission dependency functions.
"""

import pytest
from fastapi import HTTPException

from hermadata.permissions import require_permission
from hermadata.services.user_service import TokenData


def test_require_permission_allows_superuser():
    """Test that superusers are allowed regardless of permissions."""
    superuser = TokenData(
        user_id=1,
        email="admin@example.com",
        is_active=True,
        is_superuser=True,
        role="admin",
        permissions=[],
    )

    permission_dep = require_permission("CA")
    result = permission_dep(superuser)
    assert result == superuser


def test_require_permission_allows_user_with_permission():
    """Test that users with the required permission are allowed."""
    user = TokenData(
        user_id=2,
        email="user@example.com",
        is_active=True,
        is_superuser=False,
        role="user",
        permissions=["CA", "UD"],
    )

    permission_dep = require_permission("CA")
    result = permission_dep(user)
    assert result == user


def test_require_permission_denies_user_without_permission():
    """Test that users without the required permission are denied."""
    user = TokenData(
        user_id=3,
        email="user@example.com",
        is_active=True,
        is_superuser=False,
        role="user",
        permissions=["UD", "MA"],
    )

    permission_dep = require_permission("CA")
    with pytest.raises(HTTPException) as exc_info:
        permission_dep(user)

    assert exc_info.value.status_code == 403
    assert "Insufficient permissions" in exc_info.value.detail
    assert "CA" in exc_info.value.detail


def test_require_permission_denies_user_with_empty_permissions():
    """Test that users with no permissions are denied."""
    user = TokenData(
        user_id=4,
        email="user@example.com",
        is_active=True,
        is_superuser=False,
        role="user",
        permissions=[],
    )

    permission_dep = require_permission("MU")
    with pytest.raises(HTTPException) as exc_info:
        permission_dep(user)

    assert exc_info.value.status_code == 403
    assert "Insufficient permissions" in exc_info.value.detail
    assert "MU" in exc_info.value.detail


def test_require_permission_with_permission_enum():
    """Test that require_permission works with Permission enum values."""
    from hermadata.constants import Permission

    user = TokenData(
        user_id=5,
        email="user@example.com",
        is_active=True,
        is_superuser=False,
        role="user",
        permissions=[Permission.CREATE_ANIMAL.value],
    )

    permission_dep = require_permission(Permission.CREATE_ANIMAL)
    result = permission_dep(user)
    assert result == user

    permission_dep_deny = require_permission(Permission.MANAGE_USERS)
    with pytest.raises(HTTPException) as exc_info:
        permission_dep_deny(user)
    assert exc_info.value.status_code == 403
