import io
import tempfile
import pytest
from pathlib import Path
from PIL import Image
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
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

@event.listens_for(test_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="function")
def test_uploads_dir(monkeypatch):
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        monkeypatch.setattr(settings, "uploads_dir", tmp_path)
        yield tmp_path

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
def client(db_session, test_uploads_dir):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

def create_sample_png_bytes(width=800, height=600):
    img = Image.new("RGB", (width, height), color=(73, 109, 137))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def create_sample_jpeg_bytes_with_exif():
    img = Image.new("RGB", (600, 400), color=(200, 100, 50))
    exif = img.getexif()
    exif[0x010e] = "Test Image Description"  # ImageDescription tag
    buf = io.BytesIO()
    img.save(buf, format="JPEG", exif=exif)
    return buf.getvalue()

def test_valid_image_and_pdf_uploads(client, test_uploads_dir):
    # 1. Create project
    proj_resp = client.post("/projects", json={"title": "Photo Vault"})
    proj_id = proj_resp.json()["id"]

    # 2. Upload valid PNG
    png_bytes = create_sample_png_bytes(800, 600)
    upload_resp = client.post(
        f"/projects/{proj_id}/attachments",
        files={"file": ("screenshot.png", png_bytes, "image/png")},
        data={"kind": "image", "caption": "Dashboard Preview"},
    )
    assert upload_resp.status_code == 201
    att_data = upload_resp.json()
    assert att_data["id"] is not None
    assert att_data["kind"] == "image"
    assert att_data["mime_type"] == "image/png"
    assert att_data["width"] == 800
    assert att_data["height"] == 600
    assert att_data["is_cover"] is True  # First image becomes cover
    assert att_data["file_url"] == f"/attachments/{att_data['id']}/file"
    assert att_data["thumbnail_url"] == f"/attachments/{att_data['id']}/thumbnail"

    # Verify physical file and thumbnail on disk
    project_dir = test_uploads_dir / "projects" / str(proj_id)
    assert (project_dir / att_data["stored_name"]).exists()
    name_parts = att_data["stored_name"].rsplit(".", 1)
    thumb_path = project_dir / f"{name_parts[0]}_thumb.{name_parts[1]}"
    assert thumb_path.exists()

    # Check thumbnail size
    with Image.open(thumb_path) as thumb_img:
        assert thumb_img.width <= 480

    # 3. Upload valid PDF document
    pdf_bytes = b"%PDF-1.4 sample pdf content for document testing %%EOF"
    pdf_resp = client.post(
        f"/projects/{proj_id}/attachments",
        files={"file": ("architecture.pdf", pdf_bytes, "application/pdf")},
        data={"kind": "document", "caption": "Architecture Spec"},
    )
    assert pdf_resp.status_code == 201
    assert pdf_resp.json()["mime_type"] == "application/pdf"
    assert pdf_resp.json()["thumbnail_url"] is None

def test_spoofed_file_and_svg_rejected_with_422(client):
    proj_resp = client.post("/projects", json={"title": "Security Test"})
    proj_id = proj_resp.json()["id"]

    # Spoofed file: Plain text content renamed as .png
    fake_png = b"This is plain text pretending to be a PNG executable script"
    resp1 = client.post(
        f"/projects/{proj_id}/attachments",
        files={"file": ("malicious.png", fake_png, "image/png")},
        data={"kind": "image"},
    )
    assert resp1.status_code == 422
    assert "Invalid or unsupported file format" in resp1.json()["detail"]

    # SVG upload attempt
    svg_content = b"<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>"
    resp2 = client.post(
        f"/projects/{proj_id}/attachments",
        files={"file": ("vector.svg", svg_content, "image/svg+xml")},
        data={"kind": "image"},
    )
    assert resp2.status_code == 422
    assert "Invalid or unsupported file format" in resp2.json()["detail"]

def test_oversize_file_rejected_with_422(client):
    proj_resp = client.post("/projects", json={"title": "Oversize Test"})
    proj_id = proj_resp.json()["id"]

    # Image > 5 MB
    large_bytes = b"\xFF\xD8\xFF" + (b"0" * (6 * 1024 * 1024))
    resp = client.post(
        f"/projects/{proj_id}/attachments",
        files={"file": ("giant.jpg", large_bytes, "image/jpeg")},
        data={"kind": "image"},
    )
    assert resp.status_code == 422
    assert "File exceeds maximum allowed size" in resp.json()["detail"]

def test_path_traversal_filename_sanitization(client, test_uploads_dir):
    proj_resp = client.post("/projects", json={"title": "Traversal Test"})
    proj_id = proj_resp.json()["id"]

    png_bytes = create_sample_png_bytes(100, 100)
    resp = client.post(
        f"/projects/{proj_id}/attachments",
        files={"file": ("../../../../etc/evil.png", png_bytes, "image/png")},
        data={"kind": "image"},
    )
    assert resp.status_code == 201
    att = resp.json()
    assert att["original_name"] == "evil.png"  # Path traversal stripped

    # Stored file is strictly inside project's folder with UUID name
    project_dir = test_uploads_dir / "projects" / str(proj_id)
    assert (project_dir / att["stored_name"]).exists()

def test_exif_metadata_is_stripped(client, test_uploads_dir):
    proj_resp = client.post("/projects", json={"title": "EXIF Test"})
    proj_id = proj_resp.json()["id"]

    jpeg_with_exif = create_sample_jpeg_bytes_with_exif()
    resp = client.post(
        f"/projects/{proj_id}/attachments",
        files={"file": ("photo.jpg", jpeg_with_exif, "image/jpeg")},
        data={"kind": "image"},
    )
    assert resp.status_code == 201
    stored_name = resp.json()["stored_name"]

    saved_file = test_uploads_dir / "projects" / str(proj_id) / stored_name
    with Image.open(saved_file) as img:
        exif = img.getexif()
        # EXIF tags must be completely empty/stripped
        assert len(exif.keys()) == 0

def test_cover_invariance_and_update(client):
    proj_resp = client.post("/projects", json={"title": "Cover Test"})
    proj_id = proj_resp.json()["id"]

    png1 = create_sample_png_bytes(200, 200)
    png2 = create_sample_png_bytes(200, 200)

    att1 = client.post(
        f"/projects/{proj_id}/attachments",
        files={"file": ("img1.png", png1, "image/png")},
    ).json()
    att2 = client.post(
        f"/projects/{proj_id}/attachments",
        files={"file": ("img2.png", png2, "image/png")},
    ).json()

    # First is cover by default, second is not
    assert att1["is_cover"] is True
    assert att2["is_cover"] is False

    # Set second as cover
    client.put(f"/attachments/{att2['id']}", json={"is_cover": True})

    # Fetch project details to verify att2 is now cover and att1 is not
    proj_detail = client.get(f"/projects/{proj_id}").json()
    att_map = {a["id"]: a["is_cover"] for a in proj_detail["attachments"]}
    assert att_map[att2["id"]] is True
    assert att_map[att1["id"]] is False

def test_deleting_attachment_and_project_removes_files(client, test_uploads_dir):
    proj_resp = client.post("/projects", json={"title": "Deletion Test"})
    proj_id = proj_resp.json()["id"]

    png = create_sample_png_bytes(200, 200)
    att = client.post(
        f"/projects/{proj_id}/attachments",
        files={"file": ("to_delete.png", png, "image/png")},
    ).json()

    project_dir = test_uploads_dir / "projects" / str(proj_id)
    file_path = project_dir / att["stored_name"]
    assert file_path.exists()

    # Delete attachment
    del_resp = client.delete(f"/attachments/{att['id']}")
    assert del_resp.status_code == 204
    assert not file_path.exists()

    # Upload another and delete the whole project
    att2 = client.post(
        f"/projects/{proj_id}/attachments",
        files={"file": ("survivor.png", png, "image/png")},
    ).json()
    assert (project_dir / att2["stored_name"]).exists()

    del_proj = client.delete(f"/projects/{proj_id}")
    assert del_proj.status_code == 204
    assert not project_dir.exists()

def test_serving_headers_security(client):
    proj_resp = client.post("/projects", json={"title": "Headers Test"})
    proj_id = proj_resp.json()["id"]

    png = create_sample_png_bytes(200, 200)
    att = client.post(
        f"/projects/{proj_id}/attachments",
        files={"file": ("my_design.png", png, "image/png")},
    ).json()

    resp = client.get(f"/attachments/{att['id']}/file")
    assert resp.status_code == 200
    assert resp.headers.get("X-Content-Type-Options") == "nosniff"
    assert resp.headers.get("Content-Type") == "image/png"
    assert 'inline; filename="my_design.png"' in resp.headers.get("Content-Disposition")

