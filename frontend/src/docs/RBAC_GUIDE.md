# Role-Based Access Control (RBAC) Implementation

## Overview

This implementation provides comprehensive role-based access control for your React application, extending the existing authentication system to support user roles and permissions.

## Features

### 1. User Roles

-   **Regular User**: Standard access to all basic features
-   **Super User**: Admin access to restricted features and pages

### 2. Protection Levels

-   **Route-level protection**: Entire pages protected by role
-   **Component-level protection**: Individual components/features hidden based on role
-   **Conditional rendering**: Content shown/hidden based on permissions

## Usage Examples

### 1. Protecting Routes

```tsx
// In routes.tsx
{
    path: "admin",
    element: (
        <RoleProtectedRoute requiredRole="superuser">
            <AdminPage />
        </RoleProtectedRoute>
    ),
}
```

### 2. Conditional Menu Items

```tsx
// In SideMenu.tsx
{
    canAccessSuperUserFeatures() && (
        <MenuElement icon={faUserShield} to="/admin" label="Pannello Admin" />
    )
}
```

### 3. Component-level Permissions

```tsx
// Using ConditionalRender component
;<ConditionalRender requiredRole="superuser">
    <Button label="Delete All Data" severity="danger" />
</ConditionalRender>

// Using usePermissions hook
const { isSuperUser, hasPermission } = usePermissions()

{
    isSuperUser && <div>Super User Only Content</div>
}

{
    hasPermission("superuser") && <Button label="Admin Action" />
}
```

### 4. User Information Display

```tsx
// LoggedUserCard shows username and role badge
const { user, isSuperUser } = useAuth()

return (
    <div>
        <span>{user?.username}</span>
        {isSuperUser && <Badge value="Super User" />}
    </div>
)
```

## API Integration

### Backend Requirements

Your backend login endpoint should return:

```json
{
    "access_token": "your_jwt_token",
    "token_type": "bearer",
    "username": "john_doe",
    "is_superuser": true
}
```

### Frontend Storage

User data is stored in:

-   `localStorage.getItem("accessToken")` - JWT token
-   `localStorage.getItem("userData")` - User info including role

## Components and Hooks

### Components

-   `RoleProtectedRoute` - Route-level protection
-   `ConditionalRender` - Component-level conditional rendering
-   `ProtectedRoute` - Basic authentication protection

### Hooks

-   `useAuth()` - Main authentication context
-   `usePermissions()` - Simplified permission checking

### Context

-   `AuthContext` - Manages authentication state and user data

## Permission Methods

```tsx
const { hasPermission } = useAuth()

// Check for specific role
hasPermission("superuser") // boolean

// Quick access methods
const { canAccessSuperUserFeatures } = usePermissions()
canAccessSuperUserFeatures() // boolean
```

## Security Notes

1. **Client-side only**: This is UI protection only - always validate permissions on the backend
2. **Token validation**: JWT tokens should include role information for server-side validation
3. **Fallback behavior**: Users without permissions are redirected to safe pages
4. **Automatic logout**: Invalid/expired tokens trigger automatic logout

## Extending Roles

To add new roles, update:

1. `user.schema.ts` - Add new role types
2. `AuthContext.tsx` - Update permission checking logic
3. `usePermissions.tsx` - Add convenience methods
4. Components - Add role-specific UI elements

Example for adding "moderator" role:

```tsx
// In AuthContext
const hasPermission = (requiredRole?: "superuser" | "moderator") => {
    switch (requiredRole) {
        case "superuser":
            return user?.is_superuser === true
        case "moderator":
            return user?.is_moderator === true || user?.is_superuser === true
        default:
            return isAuthenticated
    }
}
```
