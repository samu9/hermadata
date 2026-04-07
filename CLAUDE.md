# HermaData

Animal shelter management system. Tracks animals from intake to exit (adoption, return, death, etc.), manages structures (shelters/vets), adopters, documents, and health records.

## Repo layout

```
hermadata/
├── backend/        # Python / FastAPI
└── frontend/       # React / TypeScript / Vite
```

---

## Backend

**Stack:** Python 3.12+, FastAPI, SQLAlchemy 2, Alembic, Pydantic v2, MySQL (PyMySQL), JWT auth, WeasyPrint (PDF), boto3 (S3 for images), uv (package manager).

**Entry point:** `backend/hermadata/`

```
hermadata/
├── routers/            # FastAPI routers (one per domain)
│   ├── animal_router.py
│   ├── structure_router.py
│   ├── adoption_router.py
│   ├── adopter_router.py
│   ├── document_router.py
│   ├── breed_router.py
│   ├── race_router.py
│   ├── vet_router.py
│   ├── user_router.py
│   └── util_router.py
├── repositories/       # Data access layer
│   └── animal/
│       ├── animal_repository.py   # Main animal queries
│       └── models.py              # Pydantic I/O models
├── database/
│   └── models.py       # SQLAlchemy ORM models
├── constants.py        # Enums (EntryType, ExitType, AnimalStage, StructureType, Permission…)
├── initializations.py  # FastAPI dependency injection
├── permissions.py      # Permission helpers
└── models.py           # Shared Pydantic models (ApiError, PaginationResult)
```

### Key domain concepts

- **Animal** — core entity. Has a `code` (unique string identifier), `race_id` (C=dog, G=cat), `structure_id` (current structure), `stage` (S=shelter, H=healthcare). Soft-deleted via `deleted_at`.
- **AnimalEntry** — each intake event. One entry is marked `current=True`. Holds `entry_date`, `entry_type`, `exit_date`, `exit_type`, `origin_city_code`.
- **Structure** — shelter or veterinary clinic (`structure_type`: S/R). Animals belong to one structure at a time and can be moved via `POST /animal/{id}/move-structure`.
- **Adoption** — links animal to adopter, supports temporary (`T`) and permanent (`A`) exit types.

### Repository pattern

Each domain has a `SQL*Repository` class. The animal repository is the most complex — its `get()` method builds a named tuple (`AnimalGetQuery`) positionally from `AnimalModel.model_fields.keys()`, so the `select()` column order must exactly match `AnimalModel` field order.

### Running / tooling

```bash
cd backend
uv run uvicorn hermadata.main:app --reload   # dev server
uv run pytest                                 # tests
uv run ruff check .                           # lint
uv run ruff format .                          # format
uv run alembic upgrade head                   # run migrations
```

---

## Frontend

**Stack:** React 18, TypeScript, Vite, React Query (v3), React Hook Form, Zod, React Router v6, PrimeReact (UI components), Tailwind CSS, FontAwesome icons, date-fns.

**Entry point:** `frontend/src/`

```
src/
├── components/
│   ├── animal/         # Animal record, header, list, overview, forms
│   ├── adopter/
│   ├── adoption/
│   ├── new-entry/      # New animal intake form
│   ├── forms/          # Reusable form components (dropdowns, inputs)
│   └── ...
├── pages/              # Route-level page components
├── models/             # Zod schemas + inferred TS types
│   ├── animal.schema.ts
│   └── structure.schema.ts
├── queries.tsx          # All React Query hooks (useAnimalQuery, useStructuresQuery…)
├── services/
│   ├── api.ts           # Axios-based API client (ApiService class)
│   └── apiEndpoints.ts  # Centralized endpoint strings
├── contexts/
│   ├── AuthContext.tsx       # JWT auth, permissions, isSuperUser
│   ├── StructureContext.tsx  # Active structure selection (persisted in localStorage)
│   └── Toolbar.tsx           # Floating action buttons per page
├── hooks/
│   └── useMaps.ts       # Lookup maps for enums (exit types, entry types…)
└── constants.ts         # Permission codes, label maps
```

### Data fetching conventions

- All server state lives in React Query. Query keys: `"animal"`, `"animal-search"`, `"structures"`, etc.
- `useStructuresQuery` uses `staleTime: Infinity` — structures are cached for the session and never re-fetched. Use this cached data to resolve structure names from IDs rather than embedding names in other responses.
- Zod schemas validate API responses at runtime. Always update the schema when adding fields to a backend model.

### Structure context

`StructureContext` tracks the user's currently active structure (stored in `localStorage`). The animal list is automatically filtered by `currentStructure.id`. New animal entries are pre-populated with it.

### Auth & permissions

`useAuth()` exposes `can(permissionCode)` and `isSuperUser`. Route guards use `ProtectedRoute` / `RoleProtectedRoute`. Permission codes are defined in `backend/hermadata/constants.py` and mirrored in `frontend/src/constants.ts`.

---

## Things to fill in

- [ ] Local dev setup (env vars, DB setup, how to run both services together)
- [ ] Deployment setup (PM2 ecosystem config is present at root)
- [ ] Test strategy / how to run integration tests
- [ ] S3 / image storage configuration
- [ ] Any Italian-specific domain rules (rescue city codes, chip code format, etc.)
