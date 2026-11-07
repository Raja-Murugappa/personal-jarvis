import sys
import argparse
import sqlite3
import os
import zipfile
import shutil
import tempfile
from pathlib import Path
from app.core.config import settings
from app.scripts.backup import create_database_backup

def restore_database(source_file: Path | None = None, confirmed: bool = False) -> None:
    if not confirmed:
        print("ERROR: Restore operation aborted. You MUST provide the --confirm flag.")
        print("Usage: python -m app.scripts.restore --confirm [--file <path_to_backup.zip>]")
        sys.exit(1)

    # If no file specified, pick the newest backup
    if not source_file:
        backups = sorted(
            list(settings.backups_dir.glob("jarvis_backup_*.zip")) + list(settings.backups_dir.glob("jarvis_backup_*.db")),
            key=os.path.getmtime,
        )
        if not backups:
            print("ERROR: No backups found in backups directory.")
            sys.exit(1)
        source_file = backups[-1]

    if not source_file.exists():
        print(f"ERROR: Specified backup file not found: {source_file}")
        sys.exit(1)

    print("1. Taking pre-restore safety backup of current database and uploads...")
    pre_restore_backup = create_database_backup()
    if pre_restore_backup:
        print(f"   Safety copy saved to: {pre_restore_backup}")

    print(f"2. Restoring from: {source_file} ...")
    target_db_path = settings.database_path.resolve()
    target_uploads_dir = settings.uploads_dir.resolve()

    if source_file.suffix == ".zip":
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_extract = Path(temp_dir)
            with zipfile.ZipFile(source_file, "r") as zipf:
                zipf.extractall(temp_extract)

            extracted_db = temp_extract / "jarvis.db"
            if not extracted_db.exists():
                print("ERROR: Backup zip does not contain jarvis.db")
                sys.exit(1)

            # Restore database using SQLite backup API for transaction safety
            src_conn = sqlite3.connect(str(extracted_db))
            dest_conn = sqlite3.connect(str(target_db_path))
            try:
                src_conn.backup(dest_conn)
            finally:
                dest_conn.close()
                src_conn.close()

            # Restore uploads directory
            extracted_uploads = temp_extract / "uploads"
            if extracted_uploads.exists():
                if target_uploads_dir.exists():
                    shutil.rmtree(target_uploads_dir)
                shutil.copytree(extracted_uploads, target_uploads_dir)
        print("3. Database and uploads restored successfully from zip archive!")
    else:
        # Legacy .db backup restoration
        src_conn = sqlite3.connect(str(source_file))
        dest_conn = sqlite3.connect(str(target_db_path))
        try:
            src_conn.backup(dest_conn)
            print("3. Database restored successfully from SQLite .db file!")
        finally:
            dest_conn.close()
            src_conn.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Restore Personal JARVIS SQLite database and uploads.")
    parser.add_argument("--confirm", action="store_true", help="Explicit confirmation flag required to execute restore.")
    parser.add_argument("--file", type=str, default=None, help="Specific backup file to restore. Defaults to latest backup.")
    args = parser.parse_args()

    src_path = Path(args.file) if args.file else None
    restore_database(source_file=src_path, confirmed=args.confirm)
