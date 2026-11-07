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

def test_create_project_full_and_read(client):
    payload = {
        "title": "Personal JARVIS",
        "headline": "Local-first personal intelligence system",
        "description": "Full-stack offline management vault",
        "problem_statement": "Cloud-dependent systems leak personal data",
        "category": "AI / Systems",
        "status": "in_progress",
        "start_date": "2026-01-01",
        "end_date": "2026-12-31",
        "my_contribution": "Designed end-to-end architecture and local database",
        "challenges": "Fast SQLite concurrency and batch migrations",
        "lessons_learned": "Local-first delivers immense performance and privacy",
        "future_improvements": "Add voice interaction sidecar",
        "notes": "Keep offline at all costs",
        "is_featured": True,
        "technologies": ["Python", "FastAPI", "React", "SQLite", "python "],  # Duplicate test
        "team_members": [
            {"name": "Alice Smith", "role": "Frontend Architect", "linkedin_url": "https://linkedin.com/in/alicesmith"}
        ],
        "links": [
            {"label": "GitHub Repo", "url": "https://github.com/user/jarvis", "kind": "github", "sort_order": 0},
            {"label": "Live Demo", "url": "http://localhost:5173", "kind": "demo", "sort_order": 1},
        ],
    }

    resp = client.post("/projects", json=payload)
    assert resp.status_code == 201
    data = resp.json()

    assert data["id"] is not None
    assert data["title"] == "Personal JARVIS"
    assert data["is_featured"] is True
    # Verify deduplicated technologies (Python, FastAPI, React, SQLite)
    tech_names = [t["name"] for t in data["technologies"]]
    assert len(tech_names) == 4
    assert "Python" in tech_names

    # Verify team members and links
    assert len(data["team_members"]) == 1
    assert data["team_members"][0]["name"] == "Alice Smith"
    assert len(data["links"]) == 2
    assert data["links"][0]["kind"] == "github"

def test_create_project_date_validation_error(client):
    payload = {
        "title": "Time Traveler",
        "start_date": "2026-12-01",
        "end_date": "2026-01-01",  # Invalid: end before start
    }
    resp = client.post("/projects", json=payload)
    assert resp.status_code == 422
    assert "End date cannot be earlier than start date" in resp.json()["detail"]

def test_link_validation_rejects_unsafe_and_spoofed_hosts(client):
    # Javascript URL
    resp1 = client.post("/projects", json={
        "title": "Unsafe Link",
        "links": [{"url": "javascript:alert(1)", "kind": "other"}],
    })
    assert resp1.status_code == 422
    assert "Only http and https URLs are permitted" in resp1.json()["detail"]

    # GitHub kind with non-github host
    resp2 = client.post("/projects", json={
        "title": "Phishing Link",
        "links": [{"url": "https://evil.com/fake-repo", "kind": "github"}],
    })
    assert resp2.status_code == 422
    assert "GitHub links must have host github.com" in resp2.json()["detail"]

def test_list_and_filter_projects(client):
    client.post("/projects", json={
        "title": "Machine Learning Vision",
        "category": "AI",
        "status": "completed",
        "is_featured": True,
        "technologies": ["PyTorch", "Python"],
    })
    client.post("/projects", json={
        "title": "React Dashboard",
        "category": "Web",
        "status": "in_progress",
        "is_featured": False,
        "technologies": ["React", "TypeScript"],
    })

    # Filter by category
    resp = client.get("/projects?category=AI")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["title"] == "Machine Learning Vision"

    # Filter by technology
    resp_tech = client.get("/projects?technology=react")
    assert resp_tech.status_code == 200
    assert len(resp_tech.json()) == 1
    assert resp_tech.json()[0]["title"] == "React Dashboard"

    # Search
    resp_search = client.get("/projects?search=vision")
    assert resp_search.status_code == 200
    assert len(resp_search.json()) == 1

def test_update_project_and_replace_collections(client):
    create_resp = client.post("/projects", json={
        "title": "Alpha Project",
        "technologies": ["Go", "Docker"],
        "team_members": [{"name": "Bob"}],
    })
    proj_id = create_resp.json()["id"]

    # Update title and replace technologies and team members
    update_resp = client.put(f"/projects/{proj_id}", json={
        "title": "Alpha Project v2",
        "technologies": ["Rust", "Kubernetes"],
        "team_members": [{"name": "Charlie", "role": "DevOps"}],
    })
    assert update_resp.status_code == 200
    updated_data = update_resp.json()
    assert updated_data["title"] == "Alpha Project v2"

    tech_names = [t["name"] for t in updated_data["technologies"]]
    assert set(tech_names) == {"Rust", "Kubernetes"}
    assert len(updated_data["team_members"]) == 1
    assert updated_data["team_members"][0]["name"] == "Charlie"

def test_archive_restore_and_delete_project(client):
    create_resp = client.post("/projects", json={"title": "To Be Archived"})
    proj_id = create_resp.json()["id"]

    # Archive
    arch_resp = client.post(f"/projects/{proj_id}/archive")
    assert arch_resp.status_code == 200
    assert arch_resp.json()["archived_at"] is not None

    # Excluded from default list
    list_resp = client.get("/projects")
    assert not any(p["id"] == proj_id for p in list_resp.json())

    # Included when include_archived=True
    list_arch = client.get("/projects?include_archived=true")
    assert any(p["id"] == proj_id for p in list_arch.json())

    # Restore
    rest_resp = client.post(f"/projects/{proj_id}/restore")
    assert rest_resp.status_code == 200
    assert rest_resp.json()["archived_at"] is None

    # Delete
    del_resp = client.delete(f"/projects/{proj_id}")
    assert del_resp.status_code == 204

    # 404 after delete
    get_resp = client.get(f"/projects/{proj_id}")
    assert get_resp.status_code == 404

def test_project_showcase_generator(client):
    payload = {
        "title": "Quantum Simulator",
        "headline": "Browser-based qubit circuit simulation",
        "my_contribution": "Implemented statevector matrix mathematics",
        "technologies": ["WebAssembly", "C++", "React"],
        "links": [
            {"label": "Live Circuit", "url": "https://quantum-sim.demo", "kind": "demo"},
            {"label": "GitHub", "url": "https://github.com/user/quantum", "kind": "github"},
        ],
    }
    create_resp = client.post("/projects", json=payload)
    proj_id = create_resp.json()["id"]

    showcase_resp = client.get(f"/projects/{proj_id}/showcase")
    assert showcase_resp.status_code == 200
    data = showcase_resp.json()

    assert "Quantum Simulator" in data["linkedin_text"]
    assert "Browser-based qubit circuit simulation" in data["linkedin_text"]
    assert "Implemented statevector matrix mathematics" in data["linkedin_text"]
    assert "WebAssembly" in data["linkedin_text"]
    assert "https://github.com/user/quantum" in data["linkedin_text"]

    assert "# Quantum Simulator" in data["markdown"]
    assert "`WebAssembly`" in data["markdown"]

