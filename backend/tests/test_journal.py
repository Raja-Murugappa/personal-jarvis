from datetime import date, timedelta
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

def test_create_journal_entry(client):
    today = date.today().isoformat()
    payload = {
        "entry_date": today,
        "completed": "Finished Slice 4 backend",
        "learned": "FastAPI with Pydantic v2 model_validator",
        "went_wrong": "Nothing major",
        "could_improve": "Earlier testing",
        "important_events": "Team sync at 10 AM",
        "reflections": "Very productive session",
        "tomorrow_priorities": "Review frontend components",
        "mood": 4,
        "energy": 5,
        "sleep_hours": 7.5,
    }
    response = client.post("/journal", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["entry_date"] == today
    assert data["completed"] == payload["completed"]
    assert data["learned"] == payload["learned"]
    assert data["mood"] == 4
    assert data["energy"] == 5
    assert data["sleep_hours"] == 7.5
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data

def test_duplicate_entry_date_returns_409(client):
    today = date.today().isoformat()
    payload = {
        "entry_date": today,
        "completed": "First entry",
    }
    res1 = client.post("/journal", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/journal", json={"entry_date": today, "completed": "Duplicate entry"})
    assert res2.status_code == 409
    data = res2.json()
    assert "already exists" in data["detail"]
    assert data.get("code") == "CONFLICT"

def test_list_and_date_range_filtering(client):
    d1 = (date.today() - timedelta(days=5)).isoformat()
    d2 = (date.today() - timedelta(days=2)).isoformat()
    d3 = date.today().isoformat()

    client.post("/journal", json={"entry_date": d1, "completed": "Day 1"})
    client.post("/journal", json={"entry_date": d2, "completed": "Day 2"})
    client.post("/journal", json={"entry_date": d3, "completed": "Day 3"})

    # All entries (newest first)
    res = client.get("/journal")
    assert res.status_code == 200
    items = res.json()
    assert len(items) == 3
    assert items[0]["entry_date"] == d3
    assert items[1]["entry_date"] == d2
    assert items[2]["entry_date"] == d1

    # Filter with 'from'
    res_from = client.get(f"/journal?from={d2}")
    assert res_from.status_code == 200
    items_from = res_from.json()
    assert len(items_from) == 2
    assert [i["entry_date"] for i in items_from] == [d3, d2]

    # Filter with 'to'
    res_to = client.get(f"/journal?to={d2}")
    assert res_to.status_code == 200
    items_to = res_to.json()
    assert len(items_to) == 2
    assert [i["entry_date"] for i in items_to] == [d2, d1]

    # Filter with both 'from' and 'to'
    res_both = client.get(f"/journal?from={d2}&to={d2}")
    assert res_both.status_code == 200
    items_both = res_both.json()
    assert len(items_both) == 1
    assert items_both[0]["entry_date"] == d2

def test_get_by_id_and_404(client):
    today = date.today().isoformat()
    res = client.post("/journal", json={"entry_date": today, "completed": "Testing get"})
    entry_id = res.json()["id"]

    get_res = client.get(f"/journal/{entry_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == entry_id

    not_found = client.get("/journal/99999")
    assert not_found.status_code == 404
    assert not_found.json().get("code") == "NOT_FOUND"

def test_update_journal_entry(client):
    today = date.today().isoformat()
    res = client.post("/journal", json={"entry_date": today, "completed": "Original"})
    entry_id = res.json()["id"]

    update_res = client.put(f"/journal/{entry_id}", json={"completed": "Updated text", "mood": 5})
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["completed"] == "Updated text"
    assert data["mood"] == 5

    # Update nonexistent
    nf = client.put("/journal/99999", json={"completed": "Ghost"})
    assert nf.status_code == 404

def test_update_duplicate_date_conflict(client):
    d1 = (date.today() - timedelta(days=2)).isoformat()
    d2 = (date.today() - timedelta(days=1)).isoformat()
    client.post("/journal", json={"entry_date": d1, "completed": "Day 1"})
    res2 = client.post("/journal", json={"entry_date": d2, "completed": "Day 2"})
    id2 = res2.json()["id"]

    # Try changing entry 2's date to d1
    conflict_res = client.put(f"/journal/{id2}", json={"entry_date": d1})
    assert conflict_res.status_code == 409

def test_delete_journal_entry(client):
    today = date.today().isoformat()
    res = client.post("/journal", json={"entry_date": today, "completed": "To be deleted"})
    entry_id = res.json()["id"]

    del_res = client.delete(f"/journal/{entry_id}")
    assert del_res.status_code == 204

    # Verify deleted
    get_res = client.get(f"/journal/{entry_id}")
    assert get_res.status_code == 404

    # Delete again returns 404
    del_again = client.delete(f"/journal/{entry_id}")
    assert del_again.status_code == 404

def test_validation_invalid_ranges(client):
    today = date.today().isoformat()

    # Mood > 5
    res = client.post("/journal", json={"entry_date": today, "completed": "Valid", "mood": 6})
    assert res.status_code == 422
    assert "Mood" in res.json()["detail"]

    # Mood < 1
    res = client.post("/journal", json={"entry_date": today, "completed": "Valid", "mood": 0})
    assert res.status_code == 422

    # Energy > 5
    res = client.post("/journal", json={"entry_date": today, "completed": "Valid", "energy": 7})
    assert res.status_code == 422

    # Sleep hours > 24
    res = client.post("/journal", json={"entry_date": today, "completed": "Valid", "sleep_hours": 25.0})
    assert res.status_code == 422

    # Sleep hours < 0
    res = client.post("/journal", json={"entry_date": today, "completed": "Valid", "sleep_hours": -1.0})
    assert res.status_code == 422

    # Entry date > 1 day in the future
    future_date = (date.today() + timedelta(days=2)).isoformat()
    res = client.post("/journal", json={"entry_date": future_date, "completed": "Future plan"})
    assert res.status_code == 422

def test_empty_entry_rejected_and_message(client):
    today = date.today().isoformat()

    # No content fields provided
    res1 = client.post("/journal", json={"entry_date": today})
    assert res1.status_code == 422
    assert "Write at least one section" in res1.json()["detail"]

    # Whitespace only
    res2 = client.post("/journal", json={"entry_date": today, "completed": "   ", "reflections": ""})
    assert res2.status_code == 422
    assert "Write at least one section" in res2.json()["detail"]

    # Mood/energy provided but no text sections
    res3 = client.post("/journal", json={"entry_date": today, "mood": 4, "energy": 5})
    assert res3.status_code == 422
    assert "Write at least one section" in res3.json()["detail"]

def test_string_numbers_and_empty_strings_handled(client):
    today = date.today().isoformat()
    payload = {
        "entry_date": today,
        "completed": "  Trimmed task  ",
        "learned": "",
        "went_wrong": "   ",
        "mood": "4",
        "energy": "5",
        "sleep_hours": "7.5",
    }
    res = client.post("/journal", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["completed"] == "Trimmed task"
    assert data["learned"] is None
    assert data["went_wrong"] is None
    assert data["mood"] == 4
    assert data["energy"] == 5
    assert data["sleep_hours"] == 7.5
