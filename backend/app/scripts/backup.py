import os
import sqlite3
import datetime
import zipfile
import tempfile
from pathlib import Path
from app.core.config import settings

def create_database_backup(retention_count: int = 10) -> Path | None:
    """Create a point-in-time backup containing SQLite database and uploads directory in a zip archive."""
    settings.backups_dir.mkdir(parents=True, exist_ok=True)
    db_path = settings.database_path.resolve()

    if not db_path.exists():
        return None

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_zip = settings.backups_dir / f"jarvis_backup_{timestamp}.zip"

    # Use a temporary directory for safe atomic backup
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_db = Path(temp_dir) / "jarvis.db"

        # Online SQLite snapshot
        source_conn = sqlite3.connect(str(db_path))
        dest_conn = sqlite3.connect(str(temp_db))
        try:
            source_conn.backup(dest_conn)
        finally:
            dest_conn.close()
            source_conn.close()

        # Build zip bundle with database and uploads
        with zipfile.ZipFile(backup_zip, "w", zipfile.ZIP_DEFLATED) as zipf:
            zipf.write(temp_db, arcname="jarvis.db")

            uploads_dir = settings.uploads_dir.resolve()
            if uploads_dir.exists():
                for root, _, files in os.walk(uploads_dir):
                    for file in files:
                        full_path = Path(root) / file
                        rel_path = full_path.relative_to(uploads_dir)
                        zipf.write(full_path, arcname=f"uploads/{rel_path.as_posix()}")

    # Enforce retention policy: keep only latest retention_count backups
    backups = sorted(
        list(settings.backups_dir.glob("jarvis_backup_*.zip")) + list(settings.backups_dir.glob("jarvis_backup_*.db")),
        key=os.path.getmtime,
    )
    if len(backups) > retention_count:
        for old_backup in backups[:-retention_count]:
            try:
                old_backup.unlink()
            except OSError:
                pass

    return backup_zip

if __name__ == "__main__":
    path = create_database_backup()
    if path:
        print(f"Backup bundle created successfully: {path}")
    else:
        print("Database file does not exist yet. No backup created.")
