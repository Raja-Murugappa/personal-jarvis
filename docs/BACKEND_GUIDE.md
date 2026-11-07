# Personal JARVIS Backend Guide

A practical reference for running, migrating, testing, backing up, and extending the Personal JARVIS backend.

---

## 1. Running the System

### Backend Server
Always bind to `127.0.0.1:8000`:
```powershell
cd backend
.\.venv\Scripts\uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
On startup, the server automatically:
1. Takes a safety backup of `backend/data/jarvis.db` to `backend/data/backups/`.
2. Programmatically runs `alembic upgrade head`.

### Frontend Dev Server
```powershell
cd frontend
npm run dev
```
Open `http://localhost:5173` (or `http://127.0.0.1:5173`) in your browser.

---

## 2. Database & Migrations

The database is stored locally in `backend/data/jarvis.db`.

### Creating a New Migration
When modifying or adding SQLAlchemy models:
```powershell
cd backend
.\.venv\Scripts\alembic revision --autogenerate -m "describe changes"
```

### Applying Migrations Manually
```powershell
cd backend
.\.venv\Scripts\alembic upgrade head
```

### Inspecting Migration Status
```powershell
cd backend
.\.venv\Scripts\alembic current
.\.venv\Scripts\alembic heads
```

---

## 3. Running Tests

All tests run against temporary in-memory databases and **never touch the real `jarvis.db`**.

### Backend Tests (pytest)
```powershell
cd backend
.\.venv\Scripts\pytest tests
```

### Frontend Tests (Vitest)
```powershell
cd frontend
npm run test
```

### Full Frontend Typecheck and Build
```powershell
cd frontend
npm run build
```

---

## 4. Backups and Disaster Recovery

### Automatic Backups
Every time the backend starts, a timestamped snapshot is created in `backend/data/backups/jarvis_backup_<timestamp>.db`. The system automatically maintains the 10 most recent backups.

### Manual Backup
Run using Python module execution:
```powershell
cd backend
.\.venv\Scripts\python -m app.scripts.backup
```

### Restoring a Database
Restoring requires an explicit safety flag `--confirm`:
```powershell
cd backend
# Restores the latest backup
.\.venv\Scripts\python -m app.scripts.restore --confirm

# Or restore a specific backup file
.\.venv\Scripts\python -m app.scripts.restore --confirm --file data/backups/jarvis_backup_20261105_004534.db
```

---

## 5. Checklist for Adding a New Module

Adding a future module (e.g., `projects`, `hackathons`, `academics`) requires only modular files without bloating existing logic:

1. **Model** (`backend/app/models/<module>.py`):
   - Inherit from `Base, TimestampMixin` from `app.models.base`.
   - Register in `backend/app/models/__init__.py`.
2. **Schema** (`backend/app/schemas/<module>.py`):
   - Define `<Module>Create`, `<Module>Update`, `<Module>Read`.
   - Trim text strings, convert empty strings to `None`.
   - Register in `backend/app/schemas/__init__.py`.
3. **Service** (`backend/app/services/<module>_service.py`):
   - Encapsulate database queries with deterministic sorting.
   - Enforce zero user-payload logging.
4. **Router** (`backend/app/routers/<module>.py`):
   - Use `APIRouter(prefix="/<module>", tags=["<module>"])`.
   - Standard HTTP status codes: `200` GET/PUT, `201` POST, `204` DELETE, `404` not found, `409` conflict.
5. **Register Router** in `backend/app/main.py`:
   - Add single line: `app.include_router(<module>_router)`.
6. **Migration**:
   - Run `alembic revision --autogenerate -m "create <module> table"`.
7. **Tests** (`backend/tests/test_<module>.py`):
   - Test CRUD, empty string normalization, validation errors, and 404/409 handling.

