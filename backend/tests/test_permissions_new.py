"""
Unit tests for the permission utilities.
"""

import pytest
from fastapi import HTTPException

from hermadata.permissions import (
    check_permission,
    require_permission,
    require_permission_or_raise,
)
from hermadata.services.user_service import TokenData

# ===== TESTS FOR DEPENDS-STYLE PERMISSION CHECKING =====


def test_require_permission_allows_superuser():
    """Test that superusers are allowed regardless of permissions."""
    # Create a mock superuser without the specific permission
    superuser = TokenData(
        user_id=1,
        email="admin@example.com",
        is_active=True,
        is_superuser=True,
        role="admin",
        permissions=[],  # No specific permissions
    )

    # Create the permission dependency
    permission_dep = require_permission("CA")

    # Should allow superuser even without the permission
    result = permission_dep(superuser)
    assert result == superuser


def test_require_permission_allows_user_with_permission():
    """Test that users with the required permission are allowed."""
    # Create a regular user with the specific permission
    user = TokenData(
        user_id=2,
        email="user@example.com",
        is_active=True,
        is_superuser=False,
        role="user",
        permissions=["CA", "UD"],  # Has "CA" permission
    )

    # Create the permission dependency
    permission_dep = require_permission("CA")

    # Should allow user with the permission
    result = permission_dep(user)
    assert result == user


def test_require_permission_denies_user_without_permission():
    """Test that users without the required permission are denied."""
    # Create a regular user without the specific permission
    user = TokenData(
        user_id=3,
        email="user@example.com",
        is_active=True,
        is_superuser=False,
        role="user",
        permissions=["UD", "MA"],  # Doesn't have "CA" permission
    )

    # Create the permission dependency
    permission_dep = require_permission("CA")

    # Should raise 403 Forbidden
    with pytest.raises(HTTPException) as exc_info:
        permission_dep(user)

    assert exc_info.value.status_code == 403
    assert "Insufficient permissions" in exc_info.value.detail
    assert "CA" in exc_info.value.detail


def test_require_permission_denies_user_with_empty_permissions():
    """Test that users with no permissions are denied."""
    # Create a regular user with no permissions
    user = TokenData(
        user_id=4,
        email="user@example.com",
        is_active=True,
        is_superuser=False,
        role="user",
        permissions=[],  # No permissions
    )

    # Create the permission dependency
    permission_dep = require_permission("MU")

    # Should raise 403 Forbidden
    with pytest.raises(HTTPException) as exc_info:
        permission_dep(user)

    assert exc_info.value.status_code == 403
    assert "Insufficient permissions" in exc_info.value.detail
    assert "MU" in exc_info.value.detail


# ===== TESTS FOR STANDALONE PERMISSION CHECKING =====


def test_check_permission_allows_superuser():
    """Test that check_permission returns True for superusers."""
    superuser = TokenData(
        user_id=1,
        email="admin@example.com",
        is_active=True,
        is_superuser=True,
        role="admin",
        permissions=[],  # No specific permissions
    )

    # Should return True for any permission for superusers
    assert check_permission(superuser, "CA") is True
    assert check_permission(superuser, "MU") is True
    assert check_permission(superuser, "NONEXISTENT") is True


def test_check_permission_allows_user_with_permission():
    """Test that check_permission returns True for users with permission."""
    user = TokenData(
        user_id=2,
        email="user@example.com",
        is_active=True,
        is_superuser=False,
        role="user",
        permissions=["CA", "UD"],
    )

    # Should return True for permissions the user has
    assert check_permission(user, "CA") is True
    assert check_permission(user, "UD") is True

    # Should return False for permissions the user doesn't have
    assert check_permission(user, "MU") is False
    assert check_permission(user, "NONEXISTENT") is False


def test_check_permission_denies_user_without_permission():
    """Test that check_permission returns False for users without permission."""
    user = TokenData(
        user_id=3,
        email="user@example.com",
        is_active=True,
        is_superuser=False,
        role="user",
        permissions=["UD", "MA"],
    )

    # Should return False for permissions the user doesn't have
    assert check_permission(user, "CA") is False
    assert check_permission(user, "MU") is False


def test_require_permission_or_raise_allows_superuser():
    """Test that require_permission_or_raise allows superusers."""
    superuser = TokenData(
        user_id=1,
        email="admin@example.com",
        is_active=True,
        is_superuser=True,
        role="admin",
        permissions=[],
    )

    # Should not raise any exception
    require_permission_or_raise(superuser, "CA")
    require_permission_or_raise(superuser, "MU")


def test_require_permission_or_raise_allows_user_with_permission():
    """Test that require_permission_or_raise allows users with permission."""
    user = TokenData(
        user_id=2,
        email="user@example.com",
        is_active=True,
        is_superuser=False,
        role="user",
        permissions=["CA", "UD"],
    )

    # Should not raise exception for permissions the user has
    require_permission_or_raise(user, "CA")
    require_permission_or_raise(user, "UD")


def test_require_permission_or_raise_denies_user_without_permission():
    """Test that require_permission_or_raise raises for users without permission."""
    user = TokenData(
        user_id=3,
        email="user@example.com",
        is_active=True,
        is_superuser=False,
        role="user",
        permissions=["UD", "MA"],
    )

    # Should raise 403 Forbidden for permissions the user doesn't have
    with pytest.raises(HTTPException) as exc_info:
        require_permission_or_raise(user, "CA")

    assert exc_info.value.status_code == 403
    assert "Insufficient permissions" in exc_info.value.detail
    assert "CA" in exc_info.value.detail

    with pytest.raises(HTTPException) as exc_info:
        require_permission_or_raise(user, "MU")

    assert exc_info.value.status_code == 403
    assert "MU" in exc_info.value.detail
