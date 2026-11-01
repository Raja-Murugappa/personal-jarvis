# AGENTS.md - Personal JARVIS Architecture & Operational Rules

## Core Principles
1. **Local-First Only**:
   - Single-user, offline-capable personal management app for Windows.
   - Strictly NO cloud databases, NO Supabase/Firebase, and NO external login/auth services.
   - All data is stored locally in SQLite (`backend/data/jarvis.db`).

2. **Data Integrity & Truthfulness**:
   - Strictly NO mock or fake data.
   - When real data does not exist or endpoints are unpopulated, components must display proper **Empty**, **Loading**, or **Error** states.
   - Today's date and real local system information are the only client-computed values without backend persistence.

3. **Database & Migrations**:
   - SQLite database file located at `backend/data/jarvis.db`.
   - Never reset or delete the database without explicit user confirmation.
   - All schema changes must be version-controlled using **Alembic** migrations.

4. **Network & Communication**:
   - Backend binds strictly to `127.0.0.1:8000`.
   - CORS is restricted exclusively to `http://localhost:5173`.
   - The frontend communicates with the backend **ONLY** through `frontend/src/lib/api.ts`.
   - Base URL is configured via `VITE_API_URL` (default: `http://localhost:8000`).

5. **Technology Stack**:
   - **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui primitives, React Router, TanStack Query, React Hook Form + Zod, Recharts, lucide-react.
   - **Backend**: Python 3.11+, FastAPI, Pydantic, SQLAlchemy, Alembic, SQLite, pytest.

6. **Code Quality**:
   - Small, focused, single-responsibility files. No bloated modules or duplicated logic.
   - Unit and integration tests for all backend endpoints and critical frontend utilities.
   - Work in small, self-contained slices and request approval before moving to subsequent slices.
