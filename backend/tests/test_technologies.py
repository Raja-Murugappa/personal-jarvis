import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.models.technology import Technology
from app.models.project import Project

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

def test_technologies_autocomplete(client, db_session):
    db_session.add(Technology(name="Python"))
    db_session.add(Technology(name="PyTorch"))
    db_session.add(Technology(name="React"))
    db_session.commit()

    resp = client.get("/technologies?search=py")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    names = [t["name"] for t in data]
    assert "Python" in names
    assert "PyTorch" in names

def test_delete_technology_success_when_unused(client, db_session):
    tech = Technology(name="Rust")
    db_session.add(tech)
    db_session.commit()

    resp = client.delete(f"/technologies/{tech.id}")
    assert resp.status_code == 204

    # Verify deleted
    assert db_session.query(Technology).filter(Technology.id == tech.id).first() is None

def test_delete_technology_conflict_when_in_use(client):
    # Create project using technology "TypeScript"
    resp = client.post("/projects", json={
        "title": "Portfolio Web",
        "technologies": ["TypeScript", "Tailwind CSS"],
    })
    assert resp.status_code == 201
    project_data = resp.json()
    tech_id = project_data["technologies"][0]["id"]

    # Try to delete TypeScript
    del_resp = client.delete(f"/technologies/{tech_id}")
    assert del_resp.status_code == 409
    assert "Cannot delete technology" in del_resp.json()["detail"]

