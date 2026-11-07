import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
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

def test_create_task(client):
    payload = {
        "title": "  Study Linear Algebra  ",
        "description": "Review Chapter 3 eigenvalues",
        "priority": "high",
        "category": "Academics",
        "due_date": "2026-11-15",
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Study Linear Algebra"  # trimmed
    assert data["description"] == payload["description"]
    assert data["priority"] == "high"
    assert data["category"] == "Academics"
    assert data["status"] == "todo"
    assert data["due_date"] == "2026-11-15"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data

def test_create_task_empty_strings_become_null(client):
    payload = {
        "title": "Clean room",
        "description": "   ",
        "category": "",
    }
    response = client.post("/tasks", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["description"] is None
    assert data["category"] is None

def test_create_task_validation_error(client):
    # Missing required title
    response = client.post("/tasks", json={"priority": "high"})
    assert response.status_code == 422
    assert "title" in response.json()["detail"].lower()

    # Invalid priority
    response = client.post("/tasks", json={"title": "Test", "priority": "urgent"})
    assert response.status_code == 422

    # Whitespace only title
    response = client.post("/tasks", json={"title": "   "})
    assert response.status_code == 422

def test_list_and_filter_tasks(client):
    client.post("/tasks", json={"title": "Task A", "priority": "low", "category": "Work"})
    client.post("/tasks", json={"title": "Task B", "priority": "high", "category": "Personal"})
    client.post("/tasks", json={"title": "Task C", "priority": "high", "category": "Work"})

    # List all
    res = client.get("/tasks")
    assert res.status_code == 200
    assert len(res.json()) == 3

    # Filter by priority
    res = client.get("/tasks?priority=high")
    assert res.status_code == 200
    assert len(res.json()) == 2
    assert all(t["priority"] == "high" for t in res.json())

    # Filter by category
    res = client.get("/tasks?category=Personal")
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["title"] == "Task B"

    # Filter by invalid status returns 422
    res = client.get("/tasks?status=not_a_status")
    assert res.status_code == 422

def test_update_task(client):
    create_res = client.post("/tasks", json={"title": "Initial Task", "priority": "low"})
    task_id = create_res.json()["id"]

    update_payload = {
        "title": "Updated Task",
        "priority": "medium",
        "status": "in_progress",
    }
    update_res = client.put(f"/tasks/{task_id}", json=update_payload)
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["title"] == "Updated Task"
    assert updated_data["priority"] == "medium"
    assert updated_data["status"] == "in_progress"

def test_update_task_not_found(client):
    res = client.put("/tasks/9999", json={"title": "Missing"})
    assert res.status_code == 404
    assert res.json().get("code") == "NOT_FOUND"

def test_delete_task(client):
    create_res = client.post("/tasks", json={"title": "To Delete"})
    task_id = create_res.json()["id"]

    delete_res = client.delete(f"/tasks/{task_id}")
    assert delete_res.status_code == 204

    # Verify deleted
    get_res = client.get("/tasks")
    assert len(get_res.json()) == 0

def test_delete_task_not_found(client):
    res = client.delete("/tasks/9999")
    assert res.status_code == 404
    assert res.json().get("code") == "NOT_FOUND"
