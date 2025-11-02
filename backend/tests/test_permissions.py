"""
Unit tests for the permission decorator.
"""

import pytest
from fastapi import HTTPException

from hermadata.permissions import require_permission
from hermadata.services.user_service import TokenData


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

    # Create a mock function
    @require_permission("CA")
    def mock_function():
        return {"success": True}

    # Should allow superuser even without the permission
    result = mock_function(current_user=superuser)
    assert result == {"success": True}


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

    # Create a mock function
    @require_permission("CA")
    def mock_function():
        return {"success": True}

    # Should allow user with the permission
    result = mock_function(current_user=user)
    assert result == {"success": True}


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

    # Create a mock function
    @require_permission("CA")
    def mock_function():
        return {"success": True}

    # Should raise 403 Forbidden
    with pytest.raises(HTTPException) as exc_info:
        mock_function(current_user=user)

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

    # Create a mock function
    @require_permission("MU")
    def mock_function():
        return {"success": True}

    # Should raise 403 Forbidden
    with pytest.raises(HTTPException) as exc_info:
        mock_function(current_user=user)

    assert exc_info.value.status_code == 403
    assert "Insufficient permissions" in exc_info.value.detail
    assert "MU" in exc_info.value.detail


def test_require_permission_denies_without_current_user():
    """Test that function raises 401 if current_user is not provided."""

    # Create a mock function
    @require_permission("CA")
    def mock_function():
        return {"success": True}

    # Should raise 401 Unauthorized if no current_user provided
    with pytest.raises(HTTPException) as exc_info:
        mock_function()  # No current_user parameter

    assert exc_info.value.status_code == 401
    assert "Authentication required" in exc_info.value.detail
