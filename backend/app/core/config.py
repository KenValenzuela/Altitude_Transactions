from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ root (two parents up from this file: app/core/config.py -> app -> backend)
BACKEND_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Application settings, loaded from environment / .env."""

    database_url: str = f"sqlite:///{BACKEND_ROOT / 'altitude.db'}"
    frontend_origin: str = "http://localhost:3000"
    app_version: str = "0.1.0"

    # Directory where uploaded document bytes are stored.
    upload_dir: str = str(BACKEND_ROOT / "uploads")

    # Seeded broker account — override via environment for each deployment.
    seed_broker_name: str = "Broker"
    seed_broker_email: str = "broker@altitude.app"
    seed_broker_brokerage: str = ""
    seed_broker_license: str = ""

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
