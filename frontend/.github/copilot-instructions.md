# Hermadata Frontend - AI Assistant Instructions

## Project Overview
React + TypeScript SPA for animal shelter management using Vite, React Router v6, React Query, and PrimeReact UI components.

## Commit Message Convention

**IMPORTANT**: All frontend commit messages MUST be prefixed with `fe:` to indicate frontend changes.

### Format
```
fe: <type>: <short description>

<optional detailed description>
```

### Common Commit Types & Examples
- **Feature**: `fe: feat: add animal health records page`
- **Bug fix**: `fe: fix: correct date formatting in adoption form`
- **Refactor**: `fe: refactor: extract animal search into custom hook`
- **UI/UX**: `fe: ui: improve mobile responsiveness of side menu`
- **Tests**: `fe: test: add unit tests for auth context`
- **Docs**: `fe: docs: update RBAC guide with new permissions`
- **Styling**: `fe: style: update PrimeReact theme to match branding`
- **Performance**: `fe: perf: lazy load animal profile tabs`
- **Dependency**: `fe: deps: upgrade react-query to v4`
- **Build**: `fe: build: optimize Vite bundle size`

### Guidelines
- Keep the first line under 72 characters
- Use present tense ("add" not "added")
- Reference issue numbers when applicable: `fe: fix: resolve #123`
- For breaking changes, add `BREAKING:` in the body

## Architecture

### Core Structure
- **Entry point**: `src/main.tsx` sets up providers (QueryClient, PrimeReact, Auth, Loader, Router)
- **Routing**: React Router v6 config in `src/router/routes.tsx` with nested routes and breadcrumbs
- **API layer**: Centralized `ApiService` class in `src/services/api.ts` with axios instance
- **State management**: React Query for server state + Context API for auth/global state
- **UI library**: PrimeReact components with custom theming

### Authentication Flow
- **Login**: POST to `/auth/login` → stores JWT in `localStorage.accessToken` + user data in `localStorage.userData`
- **Token injection**: Axios request interceptor adds `Authorization: Bearer <token>` header
- **Auto-logout**: 401 responses trigger logout and redirect to `/login`
- **Auth context**: `AuthContext` (in `src/contexts/AuthContext.tsx`) provides `isAuthenticated`, `user`, `login()`, `logout()`
- **Permission checking**: `can(permissionCode)` method checks user permissions array

### Route Protection
Two protection patterns:
1. **ProtectedRoute**: Wraps authenticated sections, redirects to `/login` if not authenticated
2. **RoleProtectedRoute**: Requires specific role (e.g., `superuser`), shows 403 or redirects

Example from `routes.tsx`:
```tsx
{
  path: "admin",
  element: (
    <RoleProtectedRoute requiredRole="superuser">
      <Outlet />
    </RoleProtectedRoute>
  ),
}
```

### API Service Pattern
Single `apiService` instance exported from `main.tsx`:
- Methods return typed Pydantic-validated responses (Zod schemas in `src/models/`)
- Toast notifications via ref injection: `apiService.setToastRef(toast)`
- Auto-parsing of error responses to display user-friendly messages
- Consistent error handling with `DEFAULT_ERROR_MESSAGE` fallback

## Development Workflows

### Running
- **Dev server**: `npm run dev` (Vite with HMR)
- **Build**: `npm run build` (outputs to `dist/`)
- **Preview**: `npm run preview` (serve production build locally)
- **Lint**: `npm run lint` (ESLint for TS/TSX)

### Environment Variables
- `.env` file with `VITE_` prefix (e.g., `VITE_API_BASE_URL`)
- Accessed via `import.meta.env.VITE_*`
- No `.env` file in repo - document required vars in README

## Code Conventions

### Component Organization
- **Pages**: High-level route components in `src/pages/` (e.g., `AnimalsPage.tsx`)
- **Components**: Reusable UI in `src/components/` organized by domain (e.g., `components/animal/`)
- **Layout**: Shared layout components in `src/components/layout/` (e.g., `SideMenu.tsx`, `PageWrapper.tsx`)
- **Forms**: Form components often named with `Form` suffix (e.g., `AnimalEditFormWrapper.tsx`)

### Data Fetching Pattern
React Query for all server state:
```tsx
// In src/queries.tsx or component
const { data, isLoading } = useQuery(['animals', searchParams], 
  () => apiService.searchAnimals(searchParams)
);
```

### Routing with Breadcrumbs
- Routes use `handle.crumb` for breadcrumb generation (see `AppBreadCrumbs.tsx`)
- Dynamic params accessed via `data.params['id']` in crumb function
- Nested routes with `<Outlet />` for child rendering

### TypeScript Models
- Zod schemas in `src/models/*.schema.ts` for runtime validation
- Generated types: `z.infer<typeof schema>`
- Example: `animalSchema` in `animal.schema.ts` validates API responses

### UI/UX & Styling Guidelines

**Theme & Colors**
- **Primary Color**: Teal (`primary-600` / `#0d9488`). Used for main actions, active states, and brand identity.
- **Surface Color**: Slate (`surface-50` to `surface-900`). Used for backgrounds, borders, and text.
- **Variables**: Use CSS variables defined in `index.css` via Tailwind classes (e.g., `bg-primary-50`, `text-surface-700`).
- **PrimeReact Theme**: `lara-light-teal`. Do not use other themes.

**Layout Patterns**
- **Page Background**: `bg-surface-50` (applied in `PageWrapper`).
- **Cards**: Standard container for content.
  ```tsx
  <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
      {/* Content */}
  </div>
  ```
- **Section Headers**:
  - Title: `text-2xl font-bold text-surface-900`
  - Subtitle: `text-surface-600`
- **Grid Layouts**: Use `grid grid-cols-1 md:grid-cols-2 gap-6` for responsive forms/displays.

**Component Styling**
- **Buttons**:
  - Primary: `!bg-primary-600 !border-primary-600 hover:!bg-primary-700`
  - Secondary/Text: `!text-surface-600 hover:!bg-surface-100`
  - Danger: `!bg-red-600` (use sparingly)
- **Inputs**: Standard PrimeReact inputs are styled by the theme, but ensure consistent width (e.g., `w-full`).
- **PrimeReact Customization**: Use the `pt` (PassThrough) prop to inject Tailwind classes into internal elements when the default theme is insufficient.
  ```tsx
  <TabMenu pt={{
      root: { className: 'bg-transparent border-b border-surface-200' },
      menuitem: { className: 'bg-transparent' }
  }} />
  ```

**Icons**
- Use FontAwesome or PrimeIcons.
- Color: `text-surface-400` for inactive/decorative, `text-primary-600` for active/brand.
- Size: Consistent sizing (e.g., `text-xl` for card icons).

**Animations**
- Use `animate-fade-in` for smooth content entry.
- Transitions: `transition-all duration-200` for interactive elements.

## Key Domain Patterns

### Permission-Based UI
Conditional rendering based on user permissions:
```tsx
// Using AuthContext
const { can } = useAuth();

{can('CA') && <NewItemButton />}
```
Or with `ConditionalRender` component for more complex logic.

### Animal Profile Navigation
Nested routes under `/animal/:id/*`:
- `/overview` - Basic info
- `/docs` - Documents
- `/events` - Activity log
- `/edit` - Edit form
- `/health` - Health records
- `/exit` - Process exit

### Form Handling
- **React Hook Form**: Used with Zod resolvers (`@hookform/resolvers/zod`)
- **PrimeReact inputs**: Wrapped in RHF Controller components
- **Validation**: Zod schemas define client-side validation rules

### Toast Notifications
Global toast via ref in `App.tsx`:
- ApiService receives toast ref to show API errors
- Use `toast.current?.show()` for success messages in components

## Integration Points

### API Communication
- Base URL from env: `import.meta.env.VITE_API_BASE_URL`
- All endpoints defined in `src/services/apiEndpoints.ts` (constant strings)
- Response parsing with Zod schemas ensures type safety
- File downloads handled via blob responses with `X-filename` header

### Third-Party Libraries
- **axios**: HTTP client with interceptors
- **react-router-dom**: v6 routing with data APIs
- **react-query**: Server state caching and synchronization
- **primereact**: UI component library
- **react-hook-form**: Form state management
- **zod**: Runtime type validation
- **@fortawesome**: Icon library
- **date-fns**: Date manipulation

### State Management Strategy
- **Server state**: React Query (animals, adopters, etc.)
- **Auth state**: Context API (`AuthContext`)
- **UI state**: Local component state + Context for global UI (loader, toolbar)
- **Form state**: React Hook Form

## Best Practices

### Error Handling
- API errors displayed via toast (auto-wired in ApiService)
- Loading states managed by React Query `isLoading`/`isFetching`
- Error boundaries at route level for uncaught errors

### Code Splitting
- Route-based code splitting via dynamic imports (if implemented)
- Lazy loading components not currently used but available via `React.lazy()`

### Type Safety
- Strict TypeScript config in `tsconfig.json`
- Zod schemas as single source of truth for API types
- Avoid `any` - use `unknown` and type guards instead

### Performance
- React Query default: no refetch on window focus (see `main.tsx` config)
- Memoize expensive computations with `useMemo`
- Use `React.memo` for pure components that rerender often

## Documentation
Comprehensive RBAC guide in `src/docs/RBAC_GUIDE.md` - reference for implementing permissions.
