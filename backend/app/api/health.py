from pathlib import Path
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from alembic.config import Config
from alembic.script import ScriptDirectory
from alembic.migration import MigrationContext

from app.core.config import settings
from app.core.database import get_db, engine

router = APIRouter(tags=["health"])

def get_migration_status() -> tuple[bool, str]:
    """Check whether the database is migrated to alembic head."""
    try:
        backend_dir = Path(__file__).resolve().parent.parent.parent
        alembic_ini_path = backend_dir / "alembic.ini"
        alembic_cfg = Config(str(alembic_ini_path))
        alembic_cfg.set_main_option("script_location", str(backend_dir / "alembic"))
        
        script = ScriptDirectory.from_config(alembic_cfg)
        head_rev = script.get_current_head()

        with engine.connect() as connection:
            context = MigrationContext.configure(connection)
            current_rev = context.get_current_revision()

        is_current = (current_rev == head_rev)
        return is_current, f"current: {current_rev}, head: {head_rev}"
    except Exception as e:
        return False, f"error checking migration: {e}"

@router.get("/health")
def get_health(db: Session = Depends(get_db)):
    db_reachable = False
    try:
        db.execute(text("SELECT 1"))
        db_reachable = True
    except Exception:
        db_reachable = False

    is_head, migration_info = get_migration_status()

    is_healthy = db_reachable and is_head
    overall_status = "ok" if is_healthy else "degraded"

    response = {
        "status": overall_status,
        "app_name": settings.app_name,
        "app_version": settings.app_version,
        "environment": settings.environment,
        "database_reachable": db_reachable,
        "migration_status": "head" if is_head else "behind",
        "migration_detail": migration_info,
    }

    if not is_healthy:
        issues = []
        if not db_reachable:
            issues.append("Database is unreachable")
        if not is_head:
            issues.append(f"Migrations not at head ({migration_info})")
        response["detail"] = "; ".join(issues)

    return response
