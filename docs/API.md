# Personal JARVIS API Documentation

All backend endpoints bind to `http://127.0.0.1:8000`. Cross-origin access is strictly restricted to `http://localhost:5173`, `http://127.0.0.1:5173`, and fallback port `5174`.

---

## Error Response Standard

All error responses return a standardized JSON structure with a human-readable `detail` string and an error `code`:

```json
{
  "detail": "Descriptive error message",
  "code": "VALIDATION_ERROR"
}
```

Common error codes:
- `VALIDATION_ERROR` (422): Input validation failed.
- `NOT_FOUND` (404): Requested entity does not exist.
- `CONFLICT` (409): Unique constraint violation (e.g., duplicate journal date).
- `INTERNAL_SERVER_ERROR` (500): Sanitized internal server failure.

---

## 1. System Health

### `GET /health`
Checks application health, local SQLite connectivity, and migration status.

- **Status Code**: `200 OK`
- **Response**:
```json
{
  "status": "ok",
  "app_name": "Personal JARVIS API",
  "app_version": "0.1.0",
  "environment": "development",
  "database_reachable": true,
  "migration_status": "head",
  "migration_detail": "current: 40d033660923, head: 40d033660923"
}
```
If the database is unreachable or pending migrations exist, `status` returns `"degraded"`.

---

## 2. Tasks Module

### `GET /tasks`
Lists stored tasks with stable ordering (`due_date ASC NULLS LAST, id DESC`).

- **Query Parameters**:
  - `status` (*optional*): `"todo"` | `"in_progress"` | `"done"`
  - `priority` (*optional*): `"low"` | `"medium"` | `"high"`
  - `category` (*optional*): string
- **Response**: `200 OK`
```json
[
  {
    "id": 1,
    "title": "Complete Algorithms problem set",
    "description": "Chapter 4 Dynamic Programming",
    "priority": "high",
    "category": "Academics",
    "due_date": "2026-11-15",
    "status": "todo",
    "created_at": "2026-11-01T22:30:00Z",
    "updated_at": "2026-11-01T22:30:00Z"
  }
]
```

### `POST /tasks`
Creates a new task.

- **Request Body**:
  - `title` (*required*, 1–200 chars, trimmed)
  - `description` (*optional*, string or null)
  - `priority` (*optional*, default `"medium"`): `"low"` | `"medium"` | `"high"`
  - `category` (*optional*, string max 100 chars or null)
  - `due_date` (*optional*, `YYYY-MM-DD` or null)
- **Response**: `201 Created`

### `PUT /tasks/{id}`
Updates an existing task.

- **Request Body**: Partial task fields (`title`, `description`, `priority`, `category`, `due_date`, `status`).
- **Response**: `200 OK` (or `404 Not Found`).

### `DELETE /tasks/{id}`
Removes a task.

- **Response**: `204 No Content` (or `404 Not Found`).

---

## 3. Daily Journal Module

Strict privacy rule: Journal entry content is never printed to server or access logs.

### `GET /journal`
Retrieves journal entries sorted newest first (`entry_date DESC, id DESC`).

- **Query Parameters**:
  - `from` (*optional*, `YYYY-MM-DD`): start date filter.
  - `to` (*optional*, `YYYY-MM-DD`): end date filter.
- **Response**: `200 OK`
```json
[
  {
    "id": 1,
    "entry_date": "2026-11-04",
    "completed": "Finished API audit and tests",
    "learned": "Strict SQLite WAL and PRAGMA settings",
    "went_wrong": null,
    "could_improve": "Start review earlier",
    "important_events": "Team sync at 10am",
    "reflections": "Very productive day",
    "tomorrow_priorities": "Deploy Slice 5",
    "mood": 5,
    "energy": 4,
    "sleep_hours": 8.0,
    "created_at": "2026-11-04T18:00:00Z",
    "updated_at": "2026-11-04T18:00:00Z"
  }
]
```

### `GET /journal/{id}`
Retrieves a specific journal entry by its primary key ID.

- **Response**: `200 OK` (or `404 Not Found`).

### `POST /journal`
Creates a new journal entry. Exactly one entry is permitted per date.

- **Request Body**:
  - `entry_date` (*required*, `YYYY-MM-DD`, not > 1 day in future).
  - `completed`, `learned`, `went_wrong`, `could_improve`, `important_events`, `reflections`, `tomorrow_priorities` (*optional strings*; empty strings stored as `null`).
  - `mood` (*optional*, 1–5, string or number, empty string converted to `null`).
  - `energy` (*optional*, 1–5, string or number, empty string converted to `null`).
  - `sleep_hours` (*optional*, 0.0–24.0, string or number, empty string converted to `null`).
- **Validation Rule**: At least ONE of the seven text sections must be non-empty after trimming, otherwise returns `422 Unprocessable Entity` (`"Write at least one section"`).
- **Conflict Rule**: If an entry for `entry_date` already exists, returns `409 Conflict` (`"An entry for this date already exists"`).
- **Response**: `201 Created`.

### `PUT /journal/{id}`
Partially updates an existing journal entry.

- **Request Body**: Partial fields.
- **Validation Rule**: The resulting entry after partial update must retain at least one non-empty text section. Changing `entry_date` to an existing conflicting date returns `409 Conflict`.
- **Response**: `200 OK` (or `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`).

### `DELETE /journal/{id}`
Permanently deletes a journal entry.

- **Response**: `204 No Content` (or `404 Not Found`).

