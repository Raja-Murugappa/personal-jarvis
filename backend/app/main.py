import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from alembic.config import Config
from alembic import command

from app.core.config import settings
from app.core.logging import setup_logging, RequestLoggingMiddleware
from app.core.errors import setup_exception_handlers
from app.scripts.backup import create_database_backup

from app.api.health import router as health_router
from app.routers.tasks import router as tasks_router
from app.routers.journal import router as journal_router
from app.routers.technologies import router as technologies_router
from app.routers.attachments import router as attachments_router
from app.routers.projects import router as projects_router
from app.routers.hackathons import router as hackathons_router

setup_logging()
logger = logging.getLogger("app.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Safety point-in-time backup on startup (keeping latest 10)
    try:
        backup_path = create_database_backup(retention_count=10)
        if backup_path:
            logger.info(f"Startup database safety backup taken: {backup_path.name}")
    except Exception as e:
        logger.warning(f"Could not take startup database backup: {e}")

    # 2. Programmatic alembic migration to head
    try:
        backend_dir = Path(__file__).resolve().parent.parent
        alembic_ini_path = backend_dir / "alembic.ini"
        alembic_cfg = Config(str(alembic_ini_path))
        alembic_cfg.set_main_option("script_location", str(backend_dir / "alembic"))
        alembic_cfg.set_main_option("sqlalchemy.url", settings.database_url)
        command.upgrade(alembic_cfg, "head")
        logger.info("Database schema verified at alembic head.")
    except Exception as e:
        logger.critical(f"CRITICAL: Programmatic database migration failed: {e}")
        raise RuntimeError(f"Database migration to head failed: {e}") from e

    yield

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
)

# 1. Request logging & timing middleware (zero payload logging)
app.add_middleware(RequestLoggingMiddleware)

# 2. Strict CORS policy: explicit origins, explicit methods, explicit headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type"],
)

# 3. Normalized exception handlers
setup_exception_handlers(app)

# 4. Route registrations
app.include_router(health_router)
app.include_router(tasks_router)
app.include_router(journal_router)
app.include_router(technologies_router)
app.include_router(attachments_router)
app.include_router(projects_router)
app.include_router(hackathons_router)
