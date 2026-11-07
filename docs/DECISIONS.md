## 2026-11-01: React Router audit warnings
- npm audit shows 2 moderate advisories in react-router (open redirect, SSR hydration).
- Not applicable: no SSR, no redirects built from user input, app runs only on localhost.
- Decision: leave as is. Recheck before Tauri packaging.


## 2026-11-04: Local CORS Origins (localhost vs 127.0.0.1)
- Windows browsers treat `http://localhost:5173` and `http://127.0.0.1:5173` as distinct origins.
- Accessing the frontend via `127.0.0.1:5173` triggered CORS preflight `OPTIONS` 400 Bad Request when only `localhost` was permitted.
- Decision: Allow both `http://localhost:5173` and `http://127.0.0.1:5173` in CORSMiddleware. Both resolve strictly to the local machine loopback interface, maintaining strict local-first network boundaries.


## 2026-11-05: Phase B Backend Hardening & Error Standardization
- **Root Cause of Journal Save Failure**: 
  1. The browser accessed the frontend on `127.0.0.1:5173`. Because CORS only listed `localhost:5173`, the browser's preflight `OPTIONS /journal` received `400 Bad Request`, causing the browser to abort the request with `net::ERR_FAILED`.
  2. An entry for date `2026-11-04` already existed in `jarvis.db`. Repeated `POST` calls for the same date returned `409 Conflict`.
- **Decisions Made**:
  - Centralized settings in `pydantic-settings` (`backend/app/core/config.py`), explicitly permitting `http://localhost:5173`, `http://127.0.0.1:5173`, and fallback `http://localhost:5174`.
  - Disallowed CORS wildcards: restricted methods to `GET, POST, PUT, DELETE, OPTIONS` and headers to `Content-Type`.
  - Added SQLite PRAGMAs on every connection: `journal_mode=WAL`, `foreign_keys=ON`, `busy_timeout=5000`.
  - Added normalized error formatting in `backend/app/core/errors.py`: every error returns a clean string `detail` and a machine-readable `code`.
  - Standardized string trimming and conversion of empty strings `""` to `null` across all models and schemas.
  - Required at least one non-empty text section in journal submissions (`"Write at least one section"`), while flexibly accepting numeric strings for metrics.
  - Implemented automatic point-in-time database backups (keeping the 10 most recent) and programmatic Alembic migration verification on application startup.
