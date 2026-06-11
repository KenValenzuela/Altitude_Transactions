from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ root (two parents up from this file: app/core/config.py -> app -> backend)
BACKEND_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Application settings, loaded from environment / .env."""

    database_url: str = f"sqlite:///{BACKEND_ROOT / 'altitude.db'}"
    frontend_origin: str = "http://localhost:3000"
    app_version: str = "0.2.0"

    # --- Auth ---
    secret_key: str = "dev-secret-change-me-before-any-real-deployment"
    access_token_expire_minutes: int = 60 * 24
    jwt_algorithm: str = "HS256"

    # --- Seeded accounts (first startup only) ---
    seed_org_name: str = "Altitude Group"
    seed_admin_name: str = "Brett Predmore"
    seed_admin_email: str = "brett@altitude.app"
    seed_admin_password: str = "altitude-admin"
    seed_agent_name: str = "Demo Agent"
    seed_agent_email: str = "agent@altitude.app"
    seed_agent_password: str = "altitude-agent"
    seed_demo_transaction: bool = True

    # --- File storage ---
    # "local" (default) or "s3". S3 requires the `s3` extra (boto3) and the vars below.
    storage_backend: str = "local"
    upload_dir: str = str(BACKEND_ROOT / "uploads")
    max_upload_bytes: int = 25 * 1024 * 1024
    s3_bucket: str = ""
    s3_endpoint_url: str = ""
    s3_region: str = "us-east-1"

    # --- AI extraction ---
    # "mock" (default; deterministic fixtures) or "anthropic".
    extraction_provider: str = "mock"
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-opus-4-8"
    extraction_schema_version: str = "altitude-extract-v2"
    # Max extraction jobs a single user may start per minute.
    extraction_rate_limit_per_minute: int = 10

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
