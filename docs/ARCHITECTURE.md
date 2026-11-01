# Personal JARVIS Architecture

## Overview
Personal JARVIS is a single-user, local-first management system designed to operate completely on your Windows laptop.

## Core Pillars
- **Zero Cloud Leakage**: All application state resides locally in SQLite (`backend/data/jarvis.db`).
- **Strict Network Boundary**: Backend accepts requests solely from `http://localhost:5173` and binds to `127.0.0.1:8000`.
- **Truthful UI**: No placeholder mock data; explicit loading, empty, and error states across all widgets.
- **Central API Gate**: Frontend communicates with backend exclusively through `frontend/src/lib/api.ts`.
