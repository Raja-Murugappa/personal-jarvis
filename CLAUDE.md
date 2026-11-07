# CLAUDE.md - Personal JARVIS Master Blueprint & Architecture Reference

> **Purpose**: This file is the single source of truth for Claude (and other AI agents) working on the **Personal JARVIS** codebase. It documents the core principles, operational constraints, complete technical architecture, file-by-file directory, and step-by-step implementation standards for continuing development.

---

## 1. System Overview & Core Invariants

**Personal JARVIS** is a local-first, single-user, offline-capable personal intelligence and productivity vault designed to run exclusively on a Windows laptop.

### Non-Negotiable Invariants (from `AGENTS.md`)
1. **Local-First & Zero Cloud Leakage**:
   - Strictly **NO** cloud databases (no Supabase, Firebase, AWS RDS, etc.).
   - Strictly **NO** third-party authentication/login services.
   - All data is stored in local SQLite (`backend/data/jarvis.db`).
   - Uploaded files are stored locally in `backend/data/uploads/` and never served as static assets.
2. **Data Integrity & Truthfulness**:
   - Strictly **NO mock, fake, or seed data** in application views.
   - The app starts empty when new modules are initialized.
   - When real data does not exist, components MUST show explicit **Empty**, **Loading**, or **Error** states.
   - Real system information and current calendar dates are the only client-computed values without backend persistence.
3. **Database & Migrations**:
   - Database location: `backend/data/jarvis.db`.
   - Never reset, truncate, or drop the database without explicit user confirmation.
   - All schema changes must use version-controlled **Alembic batch migrations** (`render_as_batch=True`).
   - SQLite WAL mode and `PRAGMA foreign_keys = ON` are enforced on every database connection.
4. **Network & Communications**:
   - Backend binds strictly to `http://127.0.0.1:8000` (IPv4 loopback).
   - CORS is restricted to `http://localhost:5173`, `http://127.0.0.1:5173`, and fallback port `5174`.
   - All frontend communication flows **ONLY** through `frontend/src/lib/api.ts`.
   - Frontend Base URL is `http://127.0.0.1:8000` (configured via `frontend/.env` `VITE_API_URL`).
5. **Privacy & Security**:
   - Strictly **NO logging** of user reflection text, project notes, description text, external URLs, or uploaded file names into server logs (`backend/logs/app.log`).
   - Attachment files are validated using magic byte signatures (rejecting disguised executables/SVGs), EXIF metadata is stripped from images using Pillow, and files are stored with random UUID filenames to prevent path traversal attacks.

---

## 2. Tech Stack & Command Cheat Sheet

### Technology Stack
- **Backend**: Python 3.11+ (running 3.13.3 in `.venv`), FastAPI, SQLAlchemy 2.0, Alembic, Pydantic V2, Pydantic-Settings, Pillow (image processing), python-multipart, pytest, AnyIO, httpx.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui design tokens, Lucide React, TanStack Query (React Query) v5, React Hook Form + Zod, Recharts, Vitest.

### Daily Operation Commands (Windows PowerShell / CMD)

| Action | Command | Location |
| :--- | :--- | :--- |
| **Launch Everything (1-Click)** | `.\start_jarvis.bat` or `.\start-jarvis.bat` | Repo Root |
| **Start Backend Manually** | `.\.venv\Scripts\uvicorn app.main:app --reload --host 127.0.0.1 --port 8000` | `backend/` |
| **Start Frontend Manually** | `npm run dev` | `frontend/` |
| **Run Backend Tests** | `.\.venv\Scripts\pytest tests` | `backend/` |
| **Run Frontend Tests** | `npm test -- --run` | `frontend/` |
| **Frontend Typecheck & Build** | `npm run build` (`tsc -b && vite build`) | `frontend/` |
| **Create Alembic Migration** | `.\.venv\Scripts\alembic revision --autogenerate -m "describe_change"` | `backend/` |
| **Apply Alembic Migrations** | `.\.venv\Scripts\alembic upgrade head` | `backend/` |
| **Manual Backup (DB + Uploads)**| `.\.venv\Scripts\python -m app.scripts.backup` | `backend/` |
| **Restore from Backup** | `.\.venv\Scripts\python -m app.scripts.restore --confirm` | `backend/` |

---

## 3. Slice Implementation Status

| Slice / Module | Route | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Foundation & Architecture** | `/` | **COMPLETE** | Dark/light theme, layout shell, health indicator, custom dashboard widgets. |
| **Slice 3: Tasks & Calendar** | `/tasks` | **COMPLETE** | Full CRUD, priority, category, status (`todo`/`in_progress`/`done`), due dates, filters, dialogs. |
| **Slice 4: Daily Journal** | `/journal` | **COMPLETE** | One entry per day, 7 reflection sections, mood/energy/sleep tracking, date range filters. |
| **Phase B: Backend Hardening** | `*` | **COMPLETE** | Modular architecture (routers, services, models, schemas, config, errors, logging). |
| **Slice 5: Projects Vault** | `/projects` | **COMPLETE** | LinkedIn-like showcase, cover hero, image gallery with lightbox, markdown/LinkedIn copy buttons, file uploads. |
| **Slice 5: Hackathons Vault**| `/hackathons` | **COMPLETE** | Yearly timeline, award badges, problem statement, team roles, linked projects. |
| **Academics** | `/academics` | *Placeholder* | Renders `PlaceholderPage` stub. |
| **Skills & Learning** | `/skills` | *Placeholder* | Renders `PlaceholderPage` stub. |
| **Career Intelligence** | `/career` | *Placeholder* | Renders `PlaceholderPage` stub. |
| **AI News** | `/ai-news` | *Placeholder* | Renders `PlaceholderPage` stub. |
| **Fitness & Health** | `/fitness` | *Placeholder* | Renders `PlaceholderPage` stub. |
| **Finance** | `/finance` | *Placeholder* | Renders `PlaceholderPage` stub. |
| **Analytics** | `/analytics` | *Placeholder* | Renders `PlaceholderPage` stub. |
| **JARVIS Assistant** | `/assistant` | *Placeholder* | Renders `PlaceholderPage` stub. |
| **Settings & Backup** | `/settings` | *Placeholder* | Renders `PlaceholderPage` stub. |

---

## 4. Complete File-by-File Blueprint

### Root Directory

- **`AGENTS.md`**: Core architecture rules, local-first principles, network restrictions, and invariants.
- **`start-jarvis.bat` / `start_jarvis.bat`**: Windows batch launchers that invoke `scripts/launch.ps1` with bypass execution policy.
- **`.gitattributes`**: Enforces LF line endings repository-wide to avoid Windows CRLF warnings, while keeping CRLF for `.bat` and `.cmd` scripts.
- **`.gitignore`**: Excludes virtual environments (`.venv`), SQLite databases (`*.db`, `*.db-shm`, `*.db-wal`), uploads, backups, build caches, and node_modules.

### Scripts (`scripts/`)

- **`scripts/launch.ps1`**: Production-grade PowerShell launcher:
  1. Checks for python virtualenv.
  2. Scans and kills stale processes on ports `8000` and `5173` using `taskkill /T /F`.
  3. Launches Backend in a dedicated titled window.
  4. Actively polls `http://127.0.0.1:8000/health` until returning `{"status":"ok"}`.
  5. Launches Frontend in a dedicated titled window.
  6. Automatically opens default browser to `http://localhost:5173`.
  7. Waits for Enter/Ctrl+C to cleanly stop both servers with zero lingering processes.

---

### Backend (`backend/`)

#### Configuration & Core (`backend/app/core/`)
- **`backend/app/core/config.py`**:
  - `Settings` class inheriting from Pydantic-Settings `BaseSettings`.
  - Resolves `DEFAULT_DB_PATH` (`backend/data/jarvis.db`) and `uploads_dir` (`backend/data/uploads/`).
  - Whitelists CORS origins: `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:5174`, `http://127.0.0.1:5174`.
- **`backend/app/core/database.py`**:
  - SQLAlchemy SQLite engine setup.
  - Listener event `connect` sets PRAGMAs: `journal_mode = WAL`, `synchronous = NORMAL`, and `foreign_keys = ON`.
  - `get_db()` yields session with auto-rollback on error.
- **`backend/app/core/errors.py`**:
  - Global exception handlers for `RequestValidationError`, `HTTPException`, SQLAlchemy `IntegrityError`, and generic `Exception`.
  - Guarantees standard `{ "detail": "...", "code": "..." }` responses.
- **`backend/app/core/logging.py`**:
  - Formatted logger writing to console and `backend/logs/app.log`.
  - Sanitization logic prevents logging secret notes, descriptions, or file names.
- **`backend/app/main.py`**:
  - FastAPI application factory.
  - Lifespan context: On startup, takes automated database backup (`jarvis_backup_{timestamp}.zip`) and programmatically runs `alembic upgrade head`.
  - Registers CORSMiddleware, global exception handlers, and all domain routers.

#### Models (`backend/app/models/`)
- **`backend/app/models/base.py`**: Declarative `Base` class.
- **`backend/app/models/task.py`**: `Task` model (`id`, `title`, `description`, `priority` [low/medium/high], `category`, `due_date`, `status` [todo/in_progress/done], `created_at`, `updated_at`).
- **`backend/app/models/journal.py`**: `JournalEntry` model (`id`, `entry_date` [unique], `completed`, `learned`, `went_wrong`, `could_improve`, `important_events`, `reflections`, `tomorrow_priorities`, `mood` [1-5], `energy` [1-5], `sleep_hours`, `created_at`, `updated_at`).
- **`backend/app/models/technology.py`**:
  - `Technology`: Unique normalized technology names (`id`, `name`).
  - `project_technologies`: Composite PK `(project_id, technology_id)` with `ON DELETE CASCADE`.
  - `hackathon_technologies`: Composite PK `(hackathon_id, technology_id)` with `ON DELETE CASCADE`.
- **`backend/app/models/project.py`**:
  - `Project`: Portfolio projects (`id`, `title`, `headline`, `description`, `problem_statement`, `category`, `status` [idea/in_progress/completed/paused], `start_date`, `end_date`, `my_contribution`, `challenges`, `lessons_learned`, `future_improvements`, `notes`, `is_featured`, `archived_at`, timestamps).
  - CHECK constraint: `end_date >= start_date`.
  - Selectin relationships to technologies, team_members, links, attachments.
- **`backend/app/models/hackathon.py`**:
  - `Hackathon`: Competitions (`id`, `name`, `organiser`, `start_date`, `end_date`, `mode` [online/offline/hybrid], `location`, `problem_statement_id`, `problem_statement`, `team_name`, `my_role`, `submission_summary`, `result` [winner/runner_up/finalist/shortlisted/participated/other], `result_detail`, `feedback`, `lessons_learned`, `notes`, `is_featured`, `project_id` [FK to `projects.id` with `ON DELETE SET NULL`], `archived_at`, timestamps).
- **`backend/app/models/team_member.py`**:
  - `TeamMember`: `(id, name, role, linkedin_url, project_id, hackathon_id)`.
  - CHECK constraint `ck_team_members_one_parent`: Exactly one of `project_id` or `hackathon_id` is set.
- **`backend/app/models/link.py`**:
  - `Link`: External links `(id, label, url, kind, sort_order, project_id, hackathon_id)`.
  - CHECK constraint `ck_links_one_parent`: Exactly one parent.
- **`backend/app/models/attachment.py`**:
  - `Attachment`: Uploaded files `(id, original_name, stored_name, mime_type, size_bytes, width, height, caption, alt_text, sort_order, is_cover, project_id, hackathon_id, created_at)`.
  - CHECK constraint `ck_attachments_one_parent`: Exactly one parent.

#### Schemas (`backend/app/schemas/`)
- **`backend/app/schemas/task.py`**: `TaskCreate`, `TaskUpdate`, `TaskRead`. Trims strings, converts empty strings to `null`.
- **`backend/app/schemas/journal.py`**: `JournalCreate`, `JournalUpdate`, `JournalRead`. Enforces: at least 1 reflection section non-empty; parses numeric mood/energy/sleep; prohibits dates >1 day in future.
- **`backend/app/schemas/technology.py`**: `TechnologyRead`, `TechnologyCreate`.
- **`backend/app/schemas/team_member.py`**: `TeamMemberCreate`, `TeamMemberRead`.
- **`backend/app/schemas/link.py`**: `LinkCreate`, `LinkRead`. Validates `http:`/`https:`, enforces `github.com` host when kind is `github`.
- **`backend/app/schemas/attachment.py`**: `AttachmentRead`, `AttachmentUpdate`. Excludes raw local filesystem paths.
- **`backend/app/schemas/project.py`**: `ProjectCreate`, `ProjectUpdate`, `ProjectRead`, `ProjectListItem`. Validates `end_date >= start_date`.
- **`backend/app/schemas/hackathon.py`**: `HackathonCreate`, `HackathonUpdate`, `HackathonRead`, `HackathonListItem`.
- **`backend/app/schemas/showcase.py`**: `ShowcaseRead` (`markdown`, `linkedin_text`).

#### Services (`backend/app/services/`)
- **`backend/app/services/task_service.py`**: Task database logic with ordering (`due_date ASC NULLS LAST, id DESC`).
- **`backend/app/services/journal_service.py`**: Journal CRUD, prevents duplicate date collisions (HTTP 409).
- **`backend/app/services/technology_service.py`**: Case-insensitive normalization (e.g. "python" -> "Python"), autocomplete search, conflict checking on delete (HTTP 409 if in use).
- **`backend/app/services/project_service.py`**: Project CRUD, filtering by status/category/technology/search, archive/restore, and deterministic markdown/LinkedIn showcase generators.
- **`backend/app/services/hackathon_service.py`**: Hackathon CRUD, validation of linked project existence (HTTP 422), filtering by result/year, and showcase generators.
- **`backend/app/services/attachment_service.py`**:
  - File security gate: Magic byte sniffing for JPEG, PNG, WebP, GIF, PDF (rejects SVG and HTML/executables).
  - Size enforcement: 5MB for images, 10MB for PDFs.
  - EXIF stripping: Uses Pillow to strip GPS, camera, and device metadata from uploaded images.
  - Thumbnails: Auto-generates WebP max-480px thumbnails.
  - Path traversal protection: Names files on disk `{uuid4().hex}.{ext}`.
  - Safely deletes disk files and thumbnails when attachments or parent projects are deleted.

#### Routers (`backend/app/routers/`)
- **`backend/app/api/health.py`**: `GET /health` - reports app status, database connectivity, and Alembic head status.
- **`backend/app/routers/tasks.py`**: Endpoints for `/tasks` (list, create, update, delete).
- **`backend/app/routers/journal.py`**: Endpoints for `/journal` (list with date range, get by id, create, update, delete).
- **`backend/app/routers/projects.py`**: Endpoints for `/projects` (list, create, update, delete, archive, restore, showcase).
- **`backend/app/routers/hackathons.py`**: Endpoints for `/hackathons` (list, create, update, delete, archive, restore, showcase).
- **`backend/app/routers/technologies.py`**: Endpoints for `/technologies` (autocomplete, delete).
- **`backend/app/routers/attachments.py`**: Endpoints for uploads, file serving (`/attachments/{id}/file`), thumbnails (`/attachments/{id}/thumbnail`), updates, and deletions with `X-Content-Type-Options: nosniff` and `Content-Disposition: inline`.

#### Backup & Restore Scripts (`backend/app/scripts/`)
- **`backend/app/scripts/backup.py`**: Uses SQLite online backup API to copy `jarvis.db` without locking, bundles it with `backend/data/uploads/` into `backend/data/backups/jarvis_backup_{timestamp}.zip`. Retains latest 10.
- **`backend/app/scripts/restore.py`**: Restores both database and uploads from `.zip` (or legacy `.db`). Requires `--confirm` flag to prevent accidental data loss.

#### Database Migrations (`backend/alembic/`)
- **`backend/alembic/env.py`**: Runs migrations in SQLite batch mode (`render_as_batch=True`).
- **`versions/baec398d041c_create_tasks_table.py`**: Creates `tasks` table with indexes.
- **`versions/40d033660923_create_journal_entries_table.py`**: Creates `journal_entries` table with unique date constraint.
- **`versions/e65ee763fca7_create_projects_and_hackathons_tables.py`**: Creates projects, hackathons, technologies, association tables, links, team_members, and attachments tables with CHECK constraints.

#### Tests (`backend/tests/` - 49 tests)
- `test_health.py`: Healthcheck status and migration reporting.
- `test_tasks.py`: Task CRUD, nullification of empty strings, validation.
- `test_journal.py`: Journal validation, date collision (409), date ranges, text section requirements.
- `test_projects.py`: Project lifecycle, date validation, safe URL validation, showcase generation.
- `test_hackathons.py`: Hackathon creation, linked project validation (422), cascade nullification, year/result filtering.
- `test_technologies.py`: Autocomplete, deduplication, conflict on delete when in use.
- `test_attachments_uploads.py`: Magic bytes verification, spoofed file rejection (422), oversize rejection, path traversal rejection, EXIF stripping, cover image swapping, disk deletion.
- `test_privacy_slice5.py`: Verifies zero sensitive text/notes/filenames leak into `app.log`, uploads directory not served as static.
- `test_cors_logging_migration.py`: CORS preflight checks for allowed/disallowed origins, logging privacy.

---

### Frontend (`frontend/`)

#### Configuration
- **`frontend/.env`**: Sets `VITE_API_URL=http://127.0.0.1:8000`.
- **`frontend/vite.config.ts`**: Configures Vite with `@` path alias resolving to `frontend/src`.
- **`frontend/tailwind.config.js`**: Configures theme colors, CSS variables, dark mode class, and typography.

#### API Gateway & State (`frontend/src/lib/` & `frontend/src/hooks/`)
- **`frontend/src/lib/api.ts`**: The central API client for the entire frontend. Contains:
  - `tasksApi`: list, create, update, remove.
  - `journalApi`: list, get, create, update, remove.
  - `projectsApi`: list, get, create, update, remove, archive, restore, getShowcase.
  - `hackathonsApi`: list, get, create, update, remove, archive, restore, getShowcase.
  - `technologiesApi`: list, remove.
  - `attachmentsApi`: uploadProjectAttachment, uploadHackathonAttachment, update, remove, fileUrl, thumbnailUrl.
- **`frontend/src/hooks/`**: TanStack Query custom hooks managing server state, caching, and auto-invalidation:
  - `useTasks.ts`: `useTasks`, `useCreateTask`, `useUpdateTask`, `useDeleteTask`.
  - `useJournal.ts`: `useJournalEntries`, `useJournalEntry`, `useCreateJournalEntry`, `useUpdateJournalEntry`, `useDeleteJournalEntry`.
  - `useProjects.ts`: `useProjects`, `useProject`, `useCreateProject`, `useUpdateProject`, `useDeleteProject`, `useArchiveProject`, `useRestoreProject`, `useProjectShowcase`.
  - `useHackathons.ts`: `useHackathons`, `useHackathon`, `useCreateHackathon`, `useUpdateHackathon`, `useDeleteHackathon`, `useArchiveHackathon`, `useRestoreHackathon`, `useHackathonShowcase`.
  - `useTechnologies.ts`: `useTechnologies`, `useDeleteTechnology`.
  - `useAttachments.ts`: `useUploadProjectAttachment`, `useUploadHackathonAttachment`, `useUpdateAttachment`, `useDeleteAttachment`.

#### Validation Schemas (`frontend/src/lib/`)
- **`task-schema.ts`**: Zod schema for task creation and validation.
- **`journal-schema.ts` & `.test.ts`**: Validates journal entries, enforces at least one non-empty section, rejects future dates.
- **`project-schema.ts` & `.test.ts`**: Validates project forms, links (http/https, github.com check), team members, dates (`end_date >= start_date`).
- **`hackathon-schema.ts` & `.test.ts`**: Validates hackathon forms, result enums, mode, and linked project ID.

#### Layout Components (`frontend/src/components/layout/`)
- **`AppShell.tsx`**: Main application shell with responsive sidebar navigation and sticky top bar.
- **`TopBar.tsx`**: Header with current system date, Quick Add modal button, backend HealthIndicator, and ThemeToggle.
- **`Sidebar.tsx`**: Left navigation bar showing icons and active links to all 14 modules.
- **`HealthIndicator.tsx`**: Queries `GET /health` every 15 seconds. Renders green **Backend online** or red **Backend offline** pill.
- **`QuickAddModal.tsx`**: Universal modal dialog triggered by `+` button in top bar or keyboard shortcut. Allows quick logging of Tasks, Journal Entries, Projects, or Hackathons.
- **`ThemeToggle.tsx`**: Dark/light theme toggle persisting preferences to `localStorage`.

#### Dashboard Widgets (`frontend/src/components/dashboard/`)
- **`DailyOverviewWidget.tsx`**: Real-time display of tasks due today and pending items.
- **`CareerOverviewWidget.tsx`**: Queries `useProjects()` to show real project counts (`X active, Y done`) and links to `/projects`.
- **`QuickActionsWidget.tsx`**: Grid of action buttons (Add task, Add project, Add hackathon, Add journal, etc.).
- **`JarvisSummaryWidget.tsx`**: Morning/evening greeting with system status.
- **`PersonalLifeWidget.tsx`**: Habit tracking and journal prompt.
- **`AcademicOverviewWidget.tsx`**: Academics placeholder widget.
- **`CustomizeWidgetsDialog.tsx` & `useWidgetVisibility.ts`**: Drag-and-drop or checkbox dialog allowing user to reorder and toggle dashboard widgets, saved in `localStorage`.

#### Module Components
- **Tasks (`components/tasks/`)**:
  - `TaskList.tsx`: Container with empty and loading states.
  - `TaskRow.tsx`: Individual task item with priority pill, status toggle checkbox, and delete button.
  - `TaskFilters.tsx`: Search and filter dropdowns (status, priority, category).
  - `TaskFormDialog.tsx`: Modal form to create or edit tasks.
  - `DeleteTaskDialog.tsx`: Confirmation modal before task deletion.
- **Journal (`components/journal/`)**:
  - `JournalList.tsx`: Timeline list of past reflections.
  - `JournalEntryCard.tsx`: Card showing reflection sections, mood/energy badges, and sleep hours.
  - `JournalEntryForm.tsx`: Modal dialog to write or edit today's entry with mood/energy rating inputs.
  - `DeleteJournalDialog.tsx`: Confirmation modal before entry deletion.
- **Projects (`components/projects/`)**:
  - `ProjectGrid.tsx`: Responsive card grid with empty state ("No projects yet").
  - `ProjectCard.tsx`: Card showing cover image thumbnail, title, headline, category, status pill, and tech chips.
  - `ProjectFiltersBar.tsx`: Search bar with status, category, technology, and archived filters.
  - `ProjectSectionsView.tsx`: Full showcase view with cover hero, photo gallery lightbox, team members, external links, and markdown/LinkedIn copy buttons.
- **Hackathons (`components/hackathons/`)**:
  - `HackathonTimeline.tsx`: Chronological timeline grouped by year.
  - `HackathonTimelineCard.tsx`: Timeline item displaying award badge, mode, organiser, and technologies.
  - `HackathonFiltersBar.tsx`: Search bar with result, year, technology, and archived filters.
  - `HackathonSectionsView.tsx`: Full competition showcase with linked project shortcut, problem statement, team roles, and certificates.
- **Showcase & Shared Utilities (`components/showcase/`)**:
  - `AttachmentDropzone.tsx`: Drag-and-drop file uploader supporting images (JPEG/PNG/WebP/GIF) and PDFs with size limits and cover photo selection.
  - `LightboxModal.tsx`: Fullscreen photo gallery modal with keyboard arrow navigation and thumbnail bar.
  - `ShowcaseCopyButtons.tsx`: One-click copy buttons for generated LinkedIn posts and Markdown documentation.
  - `TechChipsInput.tsx`: Input field with autocomplete from stored `technologies` table and removal tags.
  - `DynamicTeamSection.tsx`: Repeatable form row to add team members (name, role, LinkedIn URL).
  - `DynamicLinksSection.tsx`: Repeatable form row to add links (GitHub, demo, video, docs, certificate, dataset) with host validation.
  - `BrandIcons.tsx`: SVG components for `GithubIcon` and `LinkedinIcon`.

#### Pages (`frontend/src/pages/`)
- **`Dashboard.tsx`**: Main landing dashboard hosting all customized widgets.
- **`TasksPage.tsx`**: Full tasks management view.
- **`JournalPage.tsx`**: Daily reflection and journal history view.
- **`ProjectsPage.tsx`**: Portfolio projects grid (`/projects`).
- **`ProjectDetailPage.tsx`**: Single project showcase view (`/projects/:id`).
- **`ProjectFormPage.tsx`**: Create/edit project form (`/projects/new`, `/projects/:id/edit`).
- **`HackathonsPage.tsx`**: Hackathons timeline view (`/hackathons`).
- **`HackathonDetailPage.tsx`**: Single hackathon showcase view (`/hackathons/:id`).
- **`HackathonFormPage.tsx`**: Create/edit hackathon form (`/hackathons/new`, `/hackathons/:id/edit`).
- **`PlaceholderPage.tsx`**: Clean placeholder screen for unbuilt modules with title, description, and icon.

---

## 5. Architectural Standards for Building Future Slices

When implementing any future slice (e.g., Academics, Skills, Finance, Fitness):

### Step 1: Database Model & Alembic Migration
1. Create `backend/app/models/<domain>.py` inheriting from `Base`.
2. Register the model in `backend/app/models/__init__.py`.
3. Create a batch migration:
   ```powershell
   cd backend
   .\.venv\Scripts\alembic revision --autogenerate -m "create_<domain>_table"
   ```
4. Verify migration file has `batch_op` enabled and run:
   ```powershell
   .\.venv\Scripts\alembic upgrade head
   ```

### Step 2: Schemas & Services
1. Create `backend/app/schemas/<domain>.py` with Pydantic V2 models using `ConfigDict(from_attributes=True)`.
2. Register in `backend/app/schemas/__init__.py`.
3. Create `backend/app/services/<domain>_service.py` containing all database queries (routers must never make direct database queries).
4. Register in `backend/app/services/__init__.py`.

### Step 3: Routers & Main Registration
1. Create `backend/app/routers/<domain>.py` with FastAPI `APIRouter(prefix="/<domain>", tags=["<domain>"])`.
2. Register in `backend/app/routers/__init__.py`.
3. Add **EXACTLY ONE LINE** to register the router in `backend/app/main.py`:
   ```python
   app.include_router(<domain>.router)
   ```

### Step 4: Backend Tests
1. Create `backend/tests/test_<domain>.py` using `pytest` and `TestClient`.
2. Verify all CRUD endpoints, validations, and edge cases pass. Tests must run against in-memory SQLite and never alter `jarvis.db`.

### Step 5: Frontend Integration
1. Define TypeScript interfaces in `frontend/src/types/<domain>.ts`.
2. Add API client functions to `frontend/src/lib/api.ts`.
3. Create TanStack Query hooks in `frontend/src/hooks/use<Domain>.ts`.
4. Create Zod schema in `frontend/src/lib/<domain>-schema.ts` and test in `*-schema.test.ts`.
5. Build focused components in `frontend/src/components/<domain>/`.
6. Create page components in `frontend/src/pages/`.
7. Wire routes in `frontend/src/App.tsx`, replacing `PlaceholderPage`.
8. Verify frontend with `npm test` and `npm run build`.

---

## 6. Known Gotchas & Historical Solutions

1. **Windows Folder Spaces (`D:\Project One`)**:
   Never use nested double quotes in `cmd /k "cd /d "%~dp0" && ..."` inside batch files. Instead, use `scripts/launch.ps1` or `pushd "%~dp0"` which handles spaces natively.
2. **SQLite Batch Migrations**:
   SQLite does not support `ALTER TABLE DROP COLUMN` or complex constraint changes without rebuilding the table. `alembic/env.py` has `render_as_batch=True` enabled. Always verify migrations use `batch_alter_table`.
3. **Localhost IPv6 vs IPv4**:
   Backend binds to `127.0.0.1:8000`. Windows Chrome/Edge often resolve `localhost` to IPv6 `::1`. To eliminate connection failures, frontend `.env` explicitly sets `VITE_API_URL=http://127.0.0.1:8000`, and `backend/app/core/config.py` allows both `localhost` and `127.0.0.1` origins.
4. **Pydantic V2 Deprecations**:
   Always use `model_config = ConfigDict(from_attributes=True)` instead of `class Config: orm_mode = True`.
5. **Lucide React Brand Icons**:
   `lucide-react` does not export social brand icons (`Github`, `Linkedin`). Use the inline SVG components from `frontend/src/components/showcase/BrandIcons.tsx` instead of adding external icon packages.
6. **Zod Defaults vs React Hook Form**:
   When using `@hookform/resolvers/zod` with Zod schemas containing defaults or refinements, cast the resolver with `as any` (`resolver: zodResolver(schema) as any`) to prevent TypeScript parameter option mismatches.
