# Hermadata — Project Context Document

> Written for AI assistants and developers who have never seen this repository.  
> Current as of: May 2026. Branch surveyed: `feature/medical-report`.

---

## 1. What the application does

Hermadata is an **animal shelter management system** used by Italian rescue organisations. It tracks:

- Animals from **intake to exit** (adoption, temporary adoption, death, disappearance, custody, return).
- Multiple **structures** (shelters and veterinary clinics) and movement of animals between them.
- **Adopters** and the adoptions they are linked to.
- **Documents** (PDFs, uploads) attached to animals, with fine-grained per-role/per-user permissions.
- **Health records**: therapies, medical activities, reminders.
- **Users**, roles, and a permission system that controls who can do what.

Domain language is Italian. City and province codes follow the Italian ISTAT standard (e.g., `A561` for a comune, `PT` for a province). The fiscal code validator uses `python-codicefiscale`.

---

## 2. Stack

| Layer | Technology |
|---|---|
| Language | Python 3.12+ |
| Web framework | FastAPI |
| ORM | SQLAlchemy 2 |
| Migrations | Alembic |
| Validation (BE) | Pydantic v2 |
| Database | MySQL 8 (driver: PyMySQL) |
| Auth | JWT via PyJWT, bcrypt passwords |
| PDF reports | WeasyPrint + Jinja2 templates |
| Excel reports | openpyxl |
| File storage | Local disk **or** AWS S3 (runtime-configurable) |
| Package manager | uv |
| Frontend framework | React 18 + TypeScript + Vite |
| UI library | PrimeReact 10, Tailwind CSS 3 |
| Data fetching | React Query v3 |
| Forms | React Hook Form 7 + Zod 3 |
| HTTP client | Axios |
| Deploy | PM2 (`ecosystem.config.js` at repo root) |

---

## 3. Repository layout

```
hermadata/
├── backend/
│   ├── hermadata/              # Python package — main source
│   │   ├── main.py             # App factory (build_app), router registration
│   │   ├── constants.py        # All domain enums (see §5)
│   │   ├── settings.py         # Pydantic-settings config (ENV vars with __ delimiter)
│   │   ├── initializations.py  # FastAPI dependency providers
│   │   ├── permissions.py      # Permission check helpers
│   │   ├── models.py           # Shared Pydantic types (ApiError, PaginationResult)
│   │   ├── routers/            # One file per domain (animal_router.py, etc.)
│   │   ├── repositories/       # Data-access classes (SQL*Repository)
│   │   │   └── animal/
│   │   │       ├── animal_repository.py
│   │   │       └── models.py   # Pydantic I/O models for the animal domain
│   │   ├── database/
│   │   │   ├── models.py       # SQLAlchemy ORM models
│   │   │   └── alembic/        # Alembic env + versions/
│   │   ├── services/           # Business-logic layer (AnimalService, UserService, …)
│   │   ├── reports/            # Report generation (WeasyPrint, openpyxl)
│   │   └── templates/          # Jinja2 HTML templates for PDF reports
│   ├── pyproject.toml
│   ├── .dev.env                # Dev environment variables
│   └── .prod.env               # Prod environment variables
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable and domain UI components
│   │   ├── pages/              # Route-level page components
│   │   ├── models/             # Zod schemas + inferred TS types
│   │   ├── queries.tsx         # All React Query hooks
│   │   ├── services/
│   │   │   ├── api.ts          # Axios API client (ApiService class)
│   │   │   ├── apiEndpoints.ts # Centralised endpoint strings
│   │   │   └── toast.ts        # Toast singleton (toastService)
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx      # JWT auth, permissions, isSuperUser
│   │   │   ├── StructureContext.tsx # Active structure (localStorage)
│   │   │   └── Toolbar.tsx          # Floating action buttons per page
│   │   ├── hooks/
│   │   │   └── useMaps.ts      # Lookup maps for enum values
│   │   └── constants.ts        # Permission codes enum, exit-field labels
│   └── package.json
└── ecosystem.config.js         # PM2 production process config
```

---

## 4. How a request flows through the backend

```
HTTP Request
  ↓
FastAPI router (routers/animal_router.py)
  ↓ Depends(get_current_user) — JWT decoded → TokenData
  ↓ Depends(require_permission("CA")) — checks TokenData.permissions
  ↓ Depends(get_animal_repository) — creates SQLAnimalRepository(session)
  ↓
Router handler function
  ↓ calls repository or service method
  ↓
SQLAnimalRepository / AnimalService
  ↓ builds SQLAlchemy query against MySQL
  ↓ returns Pydantic output model
  ↓
Router serialises to JSON response
```

Errors bubble up as `APIException` (custom), caught by `api_error_exception_handler`, returned as `{"code": "ECC", "message": "..."}` with an appropriate HTTP status.

---

## 5. Domain enums (constants.py)

### EntryType — how an animal arrived
| Code | Meaning (Italian) |
|------|-------------------|
| `R` | Recupero — rescue |
| `C` | Sequestro — confiscation |
| `P` | Conferimento da privato — private surrender |
| `Q` | Rinuncia di proprietà — owner quitclaim |
| `T` | Conferimento temporaneo del padrone — temporary owner surrender |
| `O` | Cessione da altra struttura — transfer from another structure |
| `N` | Rientro — return (animal came back) |
| `L` | Lasciato in clinica — left at clinic |

Entry types `{R, C, P, Q, L}` trigger automatic setting of `Animal.in_shelter_from`.

### ExitType — how an animal left
| Code | Meaning |
|------|---------|
| `A` | Adozione — permanent adoption |
| `T` | Adozione Temporanea — temporary adoption |
| `D` | Morte — death |
| `R` | Restituzione — return to previous owner |
| `I` | Scomparsa — disappeared |
| `C` | Custodia — custody |

### AnimalStage — current stage
| Code | Meaning |
|------|---------|
| `S` | Rifugio — shelter |
| `H` | Sanitario — hospital/healthcare |

### StructureType
| Code | Meaning |
|------|---------|
| `S` | Sanitary (veterinary clinic) |
| `R` | Shelter (rifugio) |

### AnimalSize (IntEnum)
`0=Mini`, `1=Piccolo`, `2=Medio`, `3=Grande`

### AnimalFur (IntEnum, values 1–11)
Raso, Corto, Lungo riccio, Lungo liscio, Riccio, Semilungo, Lungo, Duro, Frangiato, Cordato, Medio

### AnimalEvent — audit log codes
| Code | Meaning |
|------|---------|
| `CR` | Animal created |
| `EX` | Animal exited |
| `NE` | New entry (re-entry) |
| `EC` | Entry completed (entry_date set) |
| `DU` | Animal data updated |
| `CA` | Chip code assigned |
| `MS` | Moved to shelter (from hospital) |
| `TC` | Temporary adoption confirmed → permanent |
| `TU` | Temporary adoption undone (animal returned) |
| `MV` | Moved to another structure |
| `TH` | Therapy created |
| `THD` | Therapy soft-deleted |

### DocKindCode — document type codes
`CI` (comunicazione ingresso), `IN` (documento ingresso), `IA` (iscrizione anagrafe canina), `SS` (spostamento sanitario/rifugio), `U` (uscita), `ID` (documento identità), `V` (varie), `C` (attribuzione chip), `AF` (affido), `AD` (adozione), `VA` (variazione)

### Permission codes — used in both BE and FE
| Code | Constant |
|------|----------|
| `CA` | CREATE_ANIMAL |
| `MA` | MAKE_ADOPTION |
| `UD` | UPLOAD_DOCUMENT |
| `EAD` | EDIT_ADOPTER |
| `EAN` | EDIT_ANIMAL |
| `BPA` | BROWSE_PRESENT_ANIMALS |
| `BNA` | BROWSE_NOT_PRESENT_ANIMALS |
| `BAD` | BROWSE_ADOPTERS |
| `BAV` | BROWSE_VETS |
| `DD` | DOWNLOAD_DOCUMENT |
| `DS` | DOWNLOAD_SUMMARY |
| `SDP` | SET_DOCUMENT_PERMISSION |
| `MU` | MANAGE_USERS |
| `BDA` | BROWSE_DELETED_ANIMALS |
| `AAE` | ADD_ANIMAL_EVENT |
| `BAE` | BROWSE_ANIMAL_EVENTS |
| `UAI` | UPLOAD_ANIMAL_IMAGE |

---

## 6. Data layer

### Database models (database/models.py — SQLAlchemy ORM)

#### `animal`
```
id (PK), code (unique, 13-char String),
race_id (FK race), stage (S/H),
name, chip_code (unique nullable), chip_code_set (bool),
breed_id (FK), sex (0=M, 1=F),
birth_date, in_shelter_from (datetime),
sterilized, adoptable, adoptability_index (0–3),
color (FK fur_color), size (AnimalSize), fur (AnimalFur),
notes (text),
structure_id (FK structure),
created_at, updated_at, deleted_at (soft delete)
```
Relationships: `entries` (list[AnimalEntry]), `adoptions`, `logs`

#### `animal_entry`
```
id (PK), animal_id (FK),
entry_type (single-char EntryType), entry_date (nullable date),
origin_city_code (4-char ISTAT), exit_date, exit_type (nullable),
entry_notes, exit_notes (text),
without_chip (bool), current (bool — True for active entry),
created_at, updated_at
```

#### `adoption`
```
id (PK), animal_id (FK), animal_entry_id (FK), adopter_id (FK),
location_address, location_city_code,
created_at, updated_at, completed_at, returned_at
```

#### `users`
```
id, email (unique), hashed_password (bcrypt),
name, surname, is_active, is_superuser,
role_id (FK user_roles), city_codes (JSON list[str] — ISTAT access filter),
created_at, updated_at
```

#### `user_roles` / `user_role_permissions`
```
user_roles: id, name
user_role_permissions: id, role_id (FK), permission_code (2–3 char)
```

#### `structure`
```
id, name, city_id (FK comune), address, structure_type (S/R),
created_at, updated_at
```

#### `document` / `animal_document`
```
document: id, storage_service, key, filename, mimetype, is_uploaded
animal_document: id, animal_id, document_id, document_kind_id, title
  — unique constraint on (animal_id, document_id, document_kind_id)
```

#### `document_permissions`
```
id, role_id (nullable FK), user_id (nullable FK),
document_kind_id (FK), document_id (nullable FK),
can_view, can_upload, can_delete (all bool)
```

#### `therapy`
```
id, animal_id (FK), start_date, end_date (nullable),
description, reminder_value (int nullable), reminder_unit (day/week/month/year),
prescription_document_id, transport_document_id, animal_log_id (all nullable FKs),
deleted_at (soft delete)
```

#### `animal_log`
```
id, animal_id (FK), user_id (FK), event (FK AnimalEventType.code),
data (JSON), created_at
```

#### Reference tables
`race` (id=single char, name), `breed` (id, name, race_id), `adopter`, `vet`, `fur_color`, `provincia` (2-char), `comune` (4-char ISTAT, FK provincia)

### Important repository constraint

`SQLAnimalRepository.get()` builds a named tuple positionally from `AnimalModel.model_fields.keys()`. The `select()` column order in the SQL query **must exactly match** the field order in `AnimalModel`. Breaking this causes silent field misalignment.

---

## 7. Authentication & authorisation

### JWT flow

1. `POST /user/login` (form: `email` + `password`) → `UserService.login()` verifies bcrypt hash.
2. On success, a JWT is signed with `AUTH__SECRET` (HS256). Payload:
   ```json
   {
     "user_id": 42,
     "email": "user@example.com",
     "is_active": true,
     "is_superuser": false,
     "role": "Operatore",
     "city_codes": ["A561"],
     "permissions": ["CA", "MA", "BPA"],
     "exp": 1234567890
   }
   ```
3. Default token expiry: 30 minutes (prod: 7200 minutes).
4. Frontend stores token in `localStorage["token"]`, user data in `localStorage["userData"]`.
5. Every API request includes `Authorization: Bearer {token}`.

### Permission checking

**Backend (`permissions.py`)**:
- `require_permission(permission_code)` — FastAPI `Depends` factory; raises HTTP 403 if code not in `TokenData.permissions`. Superusers always pass.
- `check_permission(current_user, permission_code) -> bool` — standalone function, no raise.
- `require_superuser(current_user)` — requires `is_superuser=True`.

**Frontend (`AuthContext.tsx`)**:
- `auth.can("CA")` — checks `User.permissions` array.
- `auth.isSuperUser` — bypasses all UI guards.
- `ProtectedRoute` / `RoleProtectedRoute` — route-level guards.

### City-based access control

`User.city_codes` (list of ISTAT codes stored in JWT) restricts which animals a user can see. If set, `animal/search` queries add a WHERE filter on `animal_entry.origin_city_code IN (...)`. Empty list = no restriction.

---

## 8. API surface — key endpoints

### Animals (`/animal`)

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `POST` | `/animal` | CA | Create new animal + first entry |
| `GET` | `/animal/search` | BPA or BNA | Search/filter animals (paginated) |
| `GET` | `/animal/stats` | — | Aggregate counts (total/present/adopted/entered) |
| `GET` | `/animal/search/report` | DS | PDF of filtered animal list |
| `GET` | `/animal/days/report` | DS | Excel: days in shelter per animal |
| `GET` | `/animal/entries/report` | DS | Excel: entry events |
| `GET` | `/animal/exits/report` | DS | Excel: exit events |
| `GET` | `/animal/{id}` | — | Full animal record |
| `POST` | `/animal/{id}` | EAN | Update animal fields |
| `DELETE` | `/animal/{id}` | superuser | Soft-delete animal |
| `GET` | `/animal/{id}/logs` | BAE | Event log for animal |
| `POST` | `/animal/{id}/logs` | AAE | Add manual event |
| `GET` | `/animal/{id}/entry` | — | Current entry record |
| `POST` | `/animal/{id}/entry` | — | New entry (re-entry) |
| `POST` | `/animal/{id}/entry/complete` | — | Set entry_date |
| `GET` | `/animal/{id}/entries` | — | All historical entries |
| `PUT` | `/animal/{id}/entries/{entry_id}` | — | Edit an entry |
| `POST` | `/animal/{id}/exit` | MA | Create exit event |
| `GET` | `/animal/{id}/exit-check` | — | Validate completeness for exit |
| `POST` | `/animal/{id}/move_to_shelter` | — | Hospital → shelter transition |
| `POST` | `/animal/{id}/confirm-temporary-adoption` | — | Temp → permanent adoption |
| `POST` | `/animal/{id}/undo-temporary-adoption` | — | Revert temp adoption |
| `GET/POST` | `/animal/{id}/document` | DD / UD | List / upload documents |
| `GET/POST/DELETE` | `/animal/{id}/image` | — / UAI | Manage images |
| `POST` | `/animal/{id}/image/{img_id}/profile` | — | Set profile image |

### Therapies
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/therapies/reminders` | All upcoming therapy reminders (query: `structure_ids`, `days`) |
| `POST` | `/animal/{id}/therapies` | Create therapy |
| `GET` | `/animal/{id}/therapies` | List therapies |
| `DELETE` | `/animal/{id}/therapies/{tid}` | Soft-delete therapy |
| `POST` | `/animal/{id}/therapies/{tid}/end` | Mark therapy ended today |
| `POST` | `/animal/{id}/therapies/{tid}/document/{doc_type}` | Attach prescription/transport doc |

### Other domains
`/user` (login, CRUD, role/permission management), `/structure` (list, move animal), `/adopter`, `/adoption`, `/vet`, `/document`, `/race`, `/breed`, `/util` (provinces, cities, enums)

---

## 9. Animal lifecycle state machine

```
[Intake] POST /animal
  → Animal created (stage = H or S depending on healthcare_stage)
  → AnimalEntry #1 created (current=True, exit_date=null)
  → AnimalEvent CR logged

POST /animal/{id}/entry/complete  (sets entry_date)
  → AnimalEvent EC logged

POST /animal/{id}/move_to_shelter  (stage: H → S)
  → AnimalEvent MS logged

POST /animal/{id}/exit  (sets exit_date + exit_type on current entry)
  → AnimalEvent EX logged
  → If adoption: Adoption record created
  → AnimalEntry.current = False

POST /animal/{id}/confirm-temporary-adoption  (T → A)
  → Adoption.completed_at set, exit_type updated to A
  → AnimalEvent TC logged

POST /animal/{id}/undo-temporary-adoption
  → exit_date/exit_type cleared, Adoption.returned_at set
  → AnimalEvent TU logged

POST /animal/{id}/entry  (re-entry after exit)
  → New AnimalEntry created (current=True)
  → AnimalEvent NE logged
```

---

## 10. Frontend conventions

### Data fetching

All server state lives in React Query (v3). Key patterns:

- Query key shapes: `"races"`, `["animal", id]`, `["animal-search", queryData]`, `["breeds", raceId]`
- `staleTime: Infinity` on reference data (races, breeds, provinces, structures). Use the cached data — never re-fetch within a session.
- `staleTime: 0` on data that changes frequently (animal entries).

### API client (`services/api.ts`)

- Base URL: `VITE_API_BASE_URL` env var (default: `http://127.0.0.1:8000`).
- Token read from `localStorage["token"]`, injected as `Authorization: Bearer`.
- HTTP errors are automatically toasted by the Axios error interceptor — **do not add duplicate error handling in components**.
- Responses are validated against Zod schemas at runtime.

### Toast notifications

Always use `toastService` (`src/services/toast.ts`):

```ts
import { toastService } from "../services/toast"
toastService.showSuccess("Saved")
toastService.showError("Something went wrong")
toastService.showWarn(<ReactNode />, "Title", 8000)
```

Never add toast methods to `ApiService`.

### Structure context

`StructureContext` tracks the user's active structure (persisted in localStorage). Animal list queries are automatically filtered by `currentStructure.id`. Always use `setCurrentStructure()` — it persists and fires a toast.

### Zod schemas

- Files live in `frontend/src/models/*.schema.ts`.
- When adding a field to a backend Pydantic model, always update the corresponding Zod schema.
- Key validators: `chipCodeValidator` (`\d{3}\.\d{3}\.\d{3}\.\d{3}\.\d{3}`), `cityCodeValidator` (`[A-Z]\d{3}`), `dateOnly`, `dateFromString`.

### Forms

React Hook Form + Zod resolver pattern throughout. Reusable controlled components in `src/components/forms/`: `ControlledInput`, `ControlledDropdown`, `ControlledBreedsDropdown`, etc.

---

## 11. Running the project locally

### Backend

```bash
cd backend

# Install (uv)
uv sync

# Run migrations
ENV_PATH=.dev.env uv run alembic upgrade head

# Start dev server
ENV_PATH=.dev.env uv run uvicorn hermadata.main:app --reload

# Tests / lint
uv run pytest
uv run ruff check .
uv run ruff format .
```

Dev env vars (`.dev.env`):
```
DB__URL=mysql+pymysql://root:dev@localhost/hermadata
STORAGE__SELECTED=dd          # disk storage
STORAGE__DISK__BASE_PATH=...
AUTH__SECRET=<hex string>
APP__PREFERRED_PROVINCES=["PT"]
APP__PREFERRED_CITIES=["A561","B251"]
```

All `uv run` commands must be prefixed with `ENV_PATH=.dev.env` (the app reads this to load settings).

### Frontend

```bash
cd frontend
npm install
npm run dev     # Vite on http://localhost:5173
npm run build
npm run test    # Vitest
```

Env: `frontend/.env` → `VITE_API_BASE_URL=http://127.0.0.1:8000`

---

## 12. API error handling

Standard error body: `{"code": "ECC", "message": "..."}` (HTTP 4xx).

Known error codes:
- `ECC` — `existingChipCode`: chip_code already assigned to another animal.

HTTP conventions: `400` invalid input / chip conflict, `401` missing/bad JWT, `403` insufficient permission, `404` resource not found.

---

## 13. Key design decisions & gotchas

1. **`AnimalModel` field order is load-bearing.** The repository builds query results positionally from `AnimalModel.model_fields.keys()`. Reordering fields in `AnimalModel` without reordering the `select()` columns causes silent data corruption.

2. **Superusers bypass all permission checks.** `require_permission` short-circuits when `TokenData.is_superuser=True`.

3. **`useStructuresQuery` uses `staleTime: Infinity`.** Structures are never re-fetched. Use the cached data to resolve structure names from IDs rather than embedding names in other API responses.

4. **HTTP error toasts are automatic.** The Axios interceptor in `ApiService` calls `toastService.showError`. Don't toast HTTP errors again in component error handlers.

5. **Storage backend is runtime-configurable.** `STORAGE__SELECTED=dd` → disk; `=s3` → AWS S3. The same `StorageService` interface is used for both. Prod uses S3 (DigitalOcean MySQL + S3).

6. **City-code access control is silently applied.** If a user's `city_codes` is non-empty, every animal search query adds an ISTAT city filter. This is invisible in the UI.

7. **Soft deletes.** Animals (`deleted_at`) and therapies (`deleted_at`) are soft-deleted. Searches exclude soft-deleted records by default; `deleted=True` in `AnimalSearchModel` includes them (requires `BDA` permission).

8. **`ReminderUnit`** values are plain strings: `"day"`, `"week"`, `"month"`, `"year"`.

9. **Italian geographic codes.** `origin_city_code` / `rescue_city_code` are 4-character strings matching the pattern `[A-Z]\d{3}` (e.g., `A561`). Province codes are 2-char strings (e.g., `PT`). A special foreign-province code `EE` exists for non-Italian origins.
