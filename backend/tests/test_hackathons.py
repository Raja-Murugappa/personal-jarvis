import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db

TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

@event.listens_for(test_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

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

def test_create_hackathon_linked_to_project(client):
    # 1. Create project first
    proj_resp = client.post("/projects", json={"title": "Solaris Energy Grid"})
    assert proj_resp.status_code == 201
    proj_id = proj_resp.json()["id"]

    # 2. Create hackathon linked to project
    hack_payload = {
        "name": "Global Climate Hack 2026",
        "organiser": "GreenTech Global",
        "start_date": "2026-03-10",
        "end_date": "2026-03-12",
        "mode": "hybrid",
        "location": "Berlin, Germany",
        "team_name": "Solaris Team",
        "my_role": "Backend Lead",
        "submission_summary": "Decentralized solar energy distribution protocol",
        "result": "winner",
        "result_detail": "First Prize in Sustainable Infrastructure Track",
        "project_id": proj_id,
        "technologies": ["Python", "FastAPI", "WebSockets"],
    }

    hack_resp = client.post("/hackathons", json=hack_payload)
    assert hack_resp.status_code == 201
    hack_data = hack_resp.json()
    assert hack_data["id"] is not None
    assert hack_data["name"] == "Global Climate Hack 2026"
    assert hack_data["result"] == "winner"
    assert hack_data["project"] is not None
    assert hack_data["project"]["id"] == proj_id
    assert hack_data["project"]["title"] == "Solaris Energy Grid"

def test_create_hackathon_invalid_project_id_returns_422(client):
    resp = client.post("/hackathons", json={
        "name": "Phantom Hackathon",
        "project_id": 99999,  # Does not exist
    })
    assert resp.status_code == 422
    assert "Specified project_id does not exist" in resp.json()["detail"]

def test_delete_project_sets_hackathon_project_id_to_null(client):
    proj_resp = client.post("/projects", json={"title": "Temporary Project"})
    proj_id = proj_resp.json()["id"]

    hack_resp = client.post("/hackathons", json={
        "name": "Independence Hackathon",
        "project_id": proj_id,
    })
    hack_id = hack_resp.json()["id"]

    # Delete the project
    del_proj = client.delete(f"/projects/{proj_id}")
    assert del_proj.status_code == 204

    # Hackathon still exists, but project_id is now None
    get_hack = client.get(f"/hackathons/{hack_id}")
    assert get_hack.status_code == 200
    assert get_hack.json()["project"] is None
    assert get_hack.json()["project_id"] is None

def test_list_and_filter_hackathons_by_result_and_year(client):
    client.post("/hackathons", json={
        "name": "Hack 2025 Winter",
        "start_date": "2025-11-20",
        "result": "finalist",
    })
    client.post("/hackathons", json={
        "name": "Hack 2026 Spring",
        "start_date": "2026-04-15",
        "result": "winner",
    })

    # Filter by result
    resp_winner = client.get("/hackathons?result=winner")
    assert resp_winner.status_code == 200
    assert len(resp_winner.json()) == 1
    assert resp_winner.json()[0]["name"] == "Hack 2026 Spring"

    # Filter by year
    resp_year = client.get("/hackathons?year=2025")
    assert resp_year.status_code == 200
    assert len(resp_year.json()) == 1
    assert resp_year.json()[0]["name"] == "Hack 2025 Winter"

def test_hackathon_showcase_generator(client):
    resp = client.post("/hackathons", json={
        "name": "AI Safety Hack",
        "organiser": "Alignment Foundation",
        "result": "runner_up",
        "my_role": "Red Team Evaluator",
        "submission_summary": "Adversarial benchmark for local models",
        "technologies": ["PyTorch", "Python"],
    })
    hack_id = resp.json()["id"]

    showcase = client.get(f"/hackathons/{hack_id}/showcase")
    assert showcase.status_code == 200
    data = showcase.json()

    assert "AI Safety Hack" in data["linkedin_text"]
    assert "Runner up" in data["linkedin_text"]
    assert "Alignment Foundation" in data["linkedin_text"]
    assert "Red Team Evaluator" in data["linkedin_text"]
    assert "Adversarial benchmark for local models" in data["linkedin_text"]
    assert "PyTorch" in data["linkedin_text"]

