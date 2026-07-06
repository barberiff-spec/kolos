from functools import lru_cache
from typing import Annotated, List

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "KOLOS"
    app_version: str = "1.0.0"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    database_url: str = "postgresql+psycopg2://kolos:kolos_secret@localhost:5433/kolos_lms"

    secret_key: str = "change-me-to-a-long-random-secret-key-in-production"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    algorithm: str = "HS256"

    cors_origins: Annotated[List[str], NoDecode] = ["http://localhost:3001"]

    cookie_secure: bool = False
    cookie_samesite: str = "lax"
    cookie_domain: str | None = None

    frontend_url: str = "http://localhost:3001"

    upload_dir: str = "uploads"

    # Email (optional — logs to console if not configured)
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_from: str = "KOLOS <noreply@kolos.bar>"
    smtp_use_tls: bool = True

    # YooKassa (optional — falls back to mock checkout)
    yookassa_shop_id: str | None = None
    yookassa_secret_key: str | None = None

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | List[str]) -> List[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        # Railway/Heroku отдают postgres:// — SQLAlchemy + psycopg2 требует postgresql+psycopg2://
        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+psycopg2://", 1)
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+psycopg2://", 1)
        return value

    @property
    def yookassa_enabled(self) -> bool:
        return bool(self.yookassa_shop_id and self.yookassa_secret_key)

    @property
    def email_enabled(self) -> bool:
        return bool(self.smtp_host and self.smtp_user and self.smtp_password)


@lru_cache
def get_settings() -> Settings:
    return Settings()
