# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# HermaData

Animal shelter management system built for Rifugio Hermada. Tracks animals from intake to exit (adoption, return, death, etc.), manages structures (shelters/vets), adopters, documents (PDF generation), health records and CSV reports. Monorepo: `backend/` (Python/FastAPI) and `frontend/` (React/TypeScript/Vite). The frontend is desktop-only. UI labels and `docs/CHECKLIST.md` (feature/bug backlog) are in Italian.

---

## Backend

**Stack:** Python 3.12+, FastAPI, SQLAlchemy 2, Alembic, Pydantic v2 / pydantic-settings, MySQL (PyMySQL), JWT auth (pyjwt + passlib/bcrypt), Jinja2 + WeasyPrint (PDF), boto3 (S3), uv. Packaged with flit; the version is `__version__` in `hermadata/__init__.py`, and changelogs live in `backend/changelog/`.

### Commands (run from `backend/`)

```bash
uv sync --group dev
uv run uvicorn hermadata.main:app --reload    # dev server; must run from backend/ (main.py opens hermadata/log-configs.json relatively)
uv run ruff check . && uv run ruff format .   # line-length 79, rules E,C,I,B
uv run alembic upgrade head                   # needs ENV_PATH pointing to an env file
uv run alembic revision --autogenerate -m "..."
uv run sync-initial-data                      # sync CSV seed data (comuni, races, breeds, permissions, roles, doc kinds…)
```

### Tests

Tests need a **real MySQL** at `mysql+pymysql://root:dev@localhost/hermadata_test` (hardcoded in `tests/.env`, `tests/alembic.ini` and the `engine` fixture in `tests/conftest.py`). pytest-env sets `ENV_PATH=tests/.env` automatically. `pytest_sessionstart` runs the alembic migrations to head and truncates tables. Disk storage writes to `tests/storage/`, so create that directory first.

```bash
mkdir -p tests/storage
uv run pytest
uv run pytest tests/repositories/test_animal_repository.py::test_name -x
uv run pytest --cov=hermadata
```

CI (`.github/workflows/test.yml`) runs the same steps against a MySQL service container on push to `main`.

### Configuration

`hermadata/settings.py` defines a single `Settings` object loaded from the file at `$ENV_PATH`. Nested keys use the `__` delimiter, e.g. `DB__URL`, `STORAGE__SELECTED`, `STORAGE__DISK__BASE_PATH`, `STORAGE__S3__BUCKET`, `AUTH__SECRET`, `APP__TIMEZONE`. `tests/.env` is a minimal working example. Alembic's `env.py` also reads the DB URL from `Settings`, which overrides `alembic.ini`.

### Architecture

The layers are: **routers → services (optional) → repositories → SQLAlchemy models**.

- `routers/`: one per domain (animal, adoption, adopter, structure, document, breed, race, vet, user, therapy and its `reminders_router`, util). Each one is registered in `main.py:build_app`.
- `services/`: logic that spans several repositories (`AnimalService`, `AdopterService`, `UserService`, which also handles auth and tokens).
- `repositories/`: each domain has a `SQL*Repository` class. Most subclass the base in `repositories/__init__.py` and are instantiated as `SQLXRepository()(session)`, because `__call__` binds the session. Pydantic I/O models live next to the repository (`repositories/animal/models.py` for animals).
- `initializations.py`: all FastAPI `Depends` factories (repositories, services, storage, `get_current_user`). `dependancies.py` (spelled that way) holds the low-level ones (`get_db_session`, storage map, jinja env).
- **Transactions:** `get_db_session` commits when the request succeeds and rolls back on exception. Repositories should `flush`, not `commit`.
- **Errors:** raise `APIException` (`errors.py`). `error_handlers.py` turns it into an `ApiError` response.
- **Storage:** `storage/base.py:StorageInterface` has two implementations, `DiskStorage` and `S3Storage`. `STORAGE__SELECTED` picks one; documents record which storage they were saved to.
- **Reports/PDFs:** `reports/report_generator.py` renders the Jinja templates in `reports/templates/` with WeasyPrint.
- **Permissions:** permission and role definitions are **DB data** seeded from `database/alembic/initial_data/*.csv` (permissions, roles, role-permissions, document-permissions). The `Permission` enum in `constants.py` holds the codes, which are mirrored in `frontend/src/constants.ts`. Protect endpoints with `Depends(require_permission(Permission.X))` from `permissions.py`. New permissions usually also need an alembic data migration that grants them to roles.
- **Positional query tuples:** `AnimalGetQuery`, `AnimalSearchResultQuery` and `AnimalListReportItemQuery` in `repositories/animal/models.py` are namedtuples built from `Model.model_fields.keys()`. The matching `select()` in `animal_repository.py` must list its columns in **exactly the same order** as the Pydantic model's fields. When you add a field, update both places.

### Key domain concepts

- **Animal**: the core entity. Has `code` (unique string), `race_id` (C=dog, G=cat), `structure_id` (current structure) and `stage` (S=shelter, H=healthcare). Soft-deleted via `deleted_at`.
- **AnimalEntry**: one intake event. Exactly one entry per animal has `current=True`. Holds `entry_date`, `entry_type`, `exit_date`, `exit_type` and `origin_city_code`.
- **Structure**: a shelter or veterinary clinic (`structure_type` S/R). An animal belongs to one structure at a time and moves via `POST /animal/{id}/move-structure`. Animals that are not in healthcare stage cannot be placed in a healthcare structure.
- **Adoption**: links an animal to an adopter. Supports temporary (`T`) and permanent (`A`) exit types.
- Cities/provinces are Italian ISTAT comuni/province, seeded from CSV. Adopters have a validated codice fiscale (`python-codicefiscale`).

---

## Frontend

**Stack:** React 18, TypeScript, Vite, React Query v3, React Hook Form, Zod, React Router v6, PrimeReact, Tailwind, FontAwesome, date-fns. Tests use Vitest, Testing Library and MSW.

### Commands (run from `frontend/`)

```bash
npm run dev
npm run build
npm run lint                  # eslint, --max-warnings 0
npm test                      # vitest run
npx vitest run src/test/unit/validators.test.ts
```

The API base URL comes from `VITE_API_BASE_URL`. Tests live in `src/test/` (`unit/`, `components/`, `pages/`, `services/`), and MSW handlers and mock data are in `src/test/mocks/`.

### Conventions

- **Data fetching:** all server state goes through React Query hooks in `src/queries.tsx`, which call the `ApiService` class in `src/services/api.ts`. Endpoint strings live in `services/apiEndpoints.ts`.
- **Zod schemas** in `src/models/*.schema.ts` validate API responses at runtime. When you add a field to a backend Pydantic model, update the matching schema too.
- **Structures:** `useStructuresQuery` uses `staleTime: Infinity`, so structures are cached for the whole session. Resolve structure names from IDs with this cache instead of adding names to other responses.
- **Toasts:** go through the `toastService` singleton (`src/services/toast.ts`, wired to PrimeReact `<Toast>` in `App.tsx`). Do **not** add toast methods to `ApiService`. Its error interceptor already toasts HTTP errors.
  ```ts
  import { toastService } from "../services/toast"
  toastService.showSuccess("Done"); toastService.showError("…"); toastService.showWarn(<Node/>, "Title", 8000)
  ```
- **StructureContext:** holds the active structure, persisted in localStorage. The animal list filters by `currentStructure.id`, and new entries are pre-filled with it. Always change it through `setCurrentStructure`, which persists the value and fires a toast.
- **Auth:** `useAuth()` (`contexts/AuthContext.tsx`) exposes `can(permissionCode)` and `isSuperUser`. Routes are defined in `src/router/` and guarded by `ProtectedRoute` / `RoleProtectedRoute` (see `src/docs/RBAC_GUIDE.md`).
- Per-page floating action buttons come from `contexts/Toolbar.tsx`. Enum label lookups come from `hooks/useMaps.ts`.

---

## Deployment

`.github/workflows/deploy.yml` is a manual `workflow_dispatch` (component: both/backend/frontend, plus an optional stage used in the release tag). It works as follows:

- **Backend:** runs `uv build` and copies the sdist and `alembic.ini` over SSH to `/opt/hermadata`. There it runs `pip install`, then `alembic upgrade head` with `ENV_PATH=.env`, then `pm2 restart hermadata-backend` (see `ecosystem.config.js`, uvicorn on port 8888).
- **Frontend:** runs `npm ci && npm run build`, packs `frontend/dist` into a tarball and extracts it into `/var/www/hermadata` on the server.
- After a successful deploy, the workflow tags the commit, using the stage input in the tag name if one was given.
