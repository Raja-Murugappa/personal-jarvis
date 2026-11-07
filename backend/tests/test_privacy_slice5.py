import pytest
import subprocess
import sys
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.core.config import settings

TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

def test_project_privacy_no_notes_or_filenames_in_logs(client):
    log_file = settings.logs_dir / "app.log"
    marker_note = "SECRET_SUPER_CONFIDENTIAL_PATENT_ALGORITHM_9981"
    marker_file = "confidential_whitepaper_2026.png"

    client.post("/projects", json={
        "title": "Stealth AI",
        "notes": marker_note,
        "description": "Stealth confidential project",
    })

    if log_file.exists():
        content = log_file.read_text(encoding="utf-8")
        assert marker_note not in content
        assert marker_file not in content

def test_uploads_folder_not_served_as_static(client):
    # Attempting to fetch directly from /uploads/ or /data/uploads/ must return 404
    resp = client.get("/uploads/projects/1/test.png")
    assert resp.status_code == 404

def test_restore_script_requires_confirm_flag():
    # Calling restore without --confirm must exit with code 1
    result = subprocess.run(
        [sys.executable, "-m", "app.scripts.restore"],
        cwd=str(settings.database_path.resolve().parent.parent),
        capture_output=True,
        text=True,
    )
    assert result.returncode != 0
    assert "You MUST provide the --confirm flag" in result.stdout or "You MUST provide the --confirm flag" in result.stderr

