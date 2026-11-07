from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

# Anchored strictly to the location of this code file, never CWD
CORE_DIR = Path(__file__).resolve().parent
APP_DIR = CORE_DIR.parent
BACKEND_DIR = APP_DIR.parent
DEFAULT_DATA_DIR = BACKEND_DIR / "data"
DEFAULT_DB_PATH = DEFAULT_DATA_DIR / "jarvis.db"

class Settings(BaseSettings):
    app_name: str = "Personal JARVIS API"
    app_version: str = "0.1.0"
    environment: str = "development"
    log_level: str = "INFO"
    
    database_path: Path = DEFAULT_DB_PATH
    uploads_dir: Path = DEFAULT_DATA_DIR / "uploads"
    allowed_origins: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
    ]

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def database_url(self) -> str:
        # Resolve to standard forward-slash format for SQLite URI
        resolved_path = self.database_path.resolve()
        return f"sqlite:///{resolved_path.as_posix()}"

    @property
    def data_dir(self) -> Path:
        return self.database_path.resolve().parent

    @property
    def backups_dir(self) -> Path:
        return self.data_dir / "backups"

    @property
    def logs_dir(self) -> Path:
        return BACKEND_DIR / "logs"

settings = Settings()

# Ensure directories exist
settings.data_dir.mkdir(parents=True, exist_ok=True)
settings.backups_dir.mkdir(parents=True, exist_ok=True)
settings.uploads_dir.mkdir(parents=True, exist_ok=True)
settings.logs_dir.mkdir(parents=True, exist_ok=True)

