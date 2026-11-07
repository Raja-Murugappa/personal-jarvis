import os
import tempfile
from pathlib import Path
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from alembic.config import Config
from alembic import command

from app.main import app
from app.core.config import settings
from app.core.database import Base, get_db

TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def get_test_client():
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    def override():
        try:
            yield session
        finally:
            pass
    app.dependency_overrides[get_db] = override
    client = TestClient(app)
    return client, session

def test_cors_preflight_allowed_origins():
    client = TestClient(app)
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
    ]
    methods = ["GET", "POST", "PUT", "DELETE"]

    for origin in allowed_origins:
        for method in methods:
            headers = {
                "Origin": origin,
                "Access-Control-Request-Method": method,
                "Access-Control-Request-Headers": "content-type",
            }
            res = client.options("/journal", headers=headers)
            assert res.status_code == 200, f"Failed for {origin} {method}"
            assert res.headers.get("access-control-allow-origin") == origin

def test_cors_preflight_disallowed_origin():
    client = TestClient(app)
    headers = {
        "Origin": "http://untrusted-site.com",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    }
    res = client.options("/journal", headers=headers)
    assert res.headers.get("access-control-allow-origin") != "http://untrusted-site.com"

def test_logging_privacy_no_journal_text_logged():
    client, session = get_test_client()
    try:
        secret_marker = "SUPER_SECRET_PRIVATE_REFLECTION_XYZ_777"
        payload = {
            "entry_date": date.today().isoformat(),
            "completed": secret_marker,
            "reflections": "My private thoughts should never be logged",
        }
        res = client.post("/journal", json=payload)
        assert res.status_code == 201

        # Check log file
        log_file = settings.logs_dir / "app.log"
        if log_file.exists():
            content = log_file.read_text(encoding="utf-8")
            assert secret_marker not in content, "Private journal content found in log file!"
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)
        app.dependency_overrides.clear()

def test_migration_on_fresh_temp_database():
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_db_path = Path(temp_dir) / "test_migration.db"
        temp_db_url = f"sqlite:///{temp_db_path.resolve().as_posix()}"

        backend_dir = Path(__file__).resolve().parent.parent
        alembic_ini_path = backend_dir / "alembic.ini"
        alembic_cfg = Config(str(alembic_ini_path))
        alembic_cfg.set_main_option("script_location", str(backend_dir / "alembic"))
        alembic_cfg.set_main_option("sqlalchemy.url", temp_db_url)

        # Run migration on fresh DB
        command.upgrade(alembic_cfg, "head")

        # Verify tables were created
        engine = create_engine(temp_db_url)
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        engine.dispose()

        assert "tasks" in tables
        assert "journal_entries" in tables
        assert "alembic_version" in tables
