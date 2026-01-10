# Hermadata Backend - AI Assistant Instructions

## Project Overview
Animal shelter management system backend built with FastAPI, SQLAlchemy, and MySQL. Manages animal records, adoptions, documents, and veterinary care with RBAC permissions.

## Commit Message Convention

**IMPORTANT**: All backend commit messages MUST be prefixed with `be:` to indicate backend changes.

### Format
```
be: <type>: <short description>

<optional detailed description>
```

### Common Commit Types & Examples
- **Feature**: `be: feat: add veterinary medical records endpoint`
- **Bug fix**: `be: fix: resolve chip code validation error on animal exit`
- **Refactor**: `be: refactor: extract adoption logic into service layer`
- **Database**: `be: migration: add medical_activity_record table`
- **Tests**: `be: test: add coverage for animal entry validation`
- **Docs**: `be: docs: update API endpoint documentation`
- **Performance**: `be: perf: optimize animal search query with indexes`
- **Dependency**: `be: deps: upgrade SQLAlchemy to 2.0.25`

### Guidelines
- Keep the first line under 72 characters
- Use present tense ("add" not "added")
- Reference issue numbers when applicable: `be: fix: resolve #123`
- For breaking changes, add `BREAKING:` in the body

## Architecture

### Core Structure
- **FastAPI app**: Entry point in `hermadata/main.py` with router registration
- **Database**: SQLAlchemy ORM models in `hermadata/database/models.py`
- **Repositories**: Data access layer in `hermadata/repositories/` (e.g., `animal_repository.py`)
- **Services**: Business logic in `hermadata/services/` (e.g., `animal_service.py`, `user_service.py`)
- **Routers**: API endpoints in `hermadata/routers/` (e.g., `animal_router.py`)
- **Reports**: PDF generation using WeasyPrint + Jinja2 templates in `hermadata/reports/`

### Dependency Injection Pattern
Dependencies are initialized in `hermadata/initializations.py` and injected via FastAPI's `Depends()`:
```python
# Example from animal_router.py
def search_animals(
    repo: Annotated[SQLAnimalRepository, Depends(get_animal_repository)],
    current_user: Annotated[TokenData, Depends(get_current_user)],
):
```

### Authentication & Authorization
- **JWT-based**: Tokens in `Authorization: Bearer <token>` header
- **Permission system**: String-based codes defined in `constants.Permission` enum
- **Two protection patterns**:
  1. `require_permission(Permission.CREATE_ANIMAL)` - raises 403 if unauthorized
  2. `check_permission(user, Permission.BROWSE_ADOPTERS)` - returns bool for conditional logic
- **Superusers**: Bypass all permission checks automatically

### Settings Management
Uses `pydantic-settings` with nested config via double underscore delimiter:
```python
# Environment variables like DB__URL map to settings.db.url
# Configured in hermadata/settings.py with ENV_PATH override
```

## Development Workflows

### Setup & Running
1. **Environment**: `source .venv/bin/activate` (use `uv` for package management)
2. **Database**: Create `hermadata` MySQL database, run `alembic upgrade head`
3. **Start server**: `uvicorn hermadata.main:app --log-config=hermadata/log-configs.json`
4. **Report CSS**: Watch mode for Tailwind CSS in reports: `npx tailwindcss build -i hermadata/reports/static/base.css -o hermadata/reports/static/tailwind.css --watch`

### Testing
- Test database: `hermadata-test` with separate Alembic config in `tests/alembic.ini`
- Run: `pytest` (uses `pytest-env` for test environment variables)
- Test config in `pyproject.toml` under `[tool.pytest.ini_options]`

### Database Migrations
- Config: `alembic.ini` points to `hermadata/database/alembic`
- Commands: `alembic revision --autogenerate -m "message"`, `alembic upgrade head`
- Initial data imports available via script: `import-doc-kinds` (defined in `pyproject.toml` scripts)

## Code Conventions

### Repository Pattern
Repositories use callable pattern for session injection:
```python
class SQLAnimalRepository(SQLBaseRepository):
    def __call__(self, session: Session):
        self.session = session
        return self
```

### Error Handling
- Custom exceptions extend `APIException` (see `hermadata/errors.py`)
- Domain-specific exceptions in repositories (e.g., `ExistingChipCodeException`, `EntryNotCompleteException`)
- Global exception handler in `main.py`: `api_error_exception_handler`

### Pydantic Models
- Request/response models in `hermadata/repositories/<domain>/models.py`
- Use `Depends()` to parse Pydantic models as query parameters (see `animal_router.py` search endpoint)
- Validation decorators: `@validate_call` for repository methods

### Logging
- Configured via JSON in `hermadata/log-configs.json`
- Per-module loggers: `logger = logging.getLogger(__name__)`
- Special note: Passlib bcrypt logging suppressed in `main.py`

### Storage Abstraction
Two storage backends (disk/S3) selected via `settings.storage.selected`:
- Abstract interfaces in `hermadata/storage/`
- Document storage managed by `SQLDocumentRepository` with injected storage map
- Physical file paths stored in database, handled by storage layer

## Key Domain Patterns

### Animal Lifecycle
- **Animals** have multiple **Entries** (rescue, surrender, etc.) tracked in `AnimalEntry`
- Entry has `current=True` flag for active entry
- **Exit** modifies current entry (sets `exit_date`, `exit_type`)
- Exit validation checks required fields based on exit type (see `EXIT_REQUIRED_DATA` dict in `animal_repository.py`)

### Adoption Flow
- Links `Animal`, `AnimalEntry`, and `Adopter` via `Adoption` model
- States: `created_at`, `completed_at`, `returned_at` (nullable timestamps)
- Exit types for adopters: `ExitType.adoption` and `ExitType.custody`

### Document Generation
- Templates in `hermadata/reports/templates/` (Jinja2)
- Static assets use Tailwind CSS (build in `hermadata/reports/static/`)
- Report generator in `hermadata/reports/report_generator.py`
- Documents stored via storage abstraction, metadata in `AnimalDocument` table

## Integration Points

### External Dependencies
- **MySQL**: Via SQLAlchemy with PyMySQL driver
- **AWS S3**: Optional storage backend via boto3
- **WeasyPrint**: PDF generation (requires `pango1.0-tools` system package)
- **Alembic**: Database migrations independent of main app

### API Response Patterns
- Paginated results: `PaginationResult[T]` model with `total`, `page`, `per_page`, `results`
- Excel exports: Set `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Document downloads: `X-filename` header for client-side naming
