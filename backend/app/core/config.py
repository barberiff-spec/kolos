from functools import lru_cache
from typing import Annotated, List

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

# Always allowed in production regardless of the CORS_ORIGINS env var, so a
# missing/incomplete env config can't accidentally lock out the real
# frontend deployments. Extend this list (or just set CORS_ORIGINS) when a
# new deployment target is added.
KNOWN_PRODUCTION_ORIGINS = [
    "https://kolos-academy.ru",
    "https://www.kolos-academy.ru",
    "https://kolos-academy.vercel.app",
    "https://kolos-barberiff-spec.vercel.app",
    "https://frontend-barberiff-spec.vercel.app",
    "https://frontend-blond-one-25.vercel.app",
]


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
        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+psycopg2://", 1)
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+psycopg2://", 1)
        return value

    @model_validator(mode="after")
    def apply_production_defaults(self) -> "Settings":
        merged = list(self.cors_origins)
        for origin in KNOWN_PRODUCTION_ORIGINS:
            if origin not in merged:
                merged.append(origin)
        # Settings is effectively frozen after construction under pydantic v2,
        # so mutating cors_origins/cookie_* here requires bypassing __setattr__.
        object.__setattr__(self, "cors_origins", merged)

        # Frontend and API are on different hosts → cookies must be SameSite=None; Secure
        # or browsers will not send them on XHR/fetch from kolos-academy.ru to amvera.io.
        cross_site = any(
            "kolos-academy.ru" in o or "vercel.app" in o for o in merged
        )
        if cross_site and not self.debug:
            object.__setattr__(self, "cookie_secure", True)
            if self.cookie_samesite.lower() != "none":
                object.__setattr__(self, "cookie_samesite", "none")
            # API host cannot set Cookie Domain for the frontend domain.
            if self.cookie_domain and "amvera" not in self.cookie_domain:
                object.__setattr__(self, "cookie_domain", None)

        if (
            not self.debug
            and self.frontend_url.startswith("http://localhost")
        ):
            object.__setattr__(self, "frontend_url", "https://kolos-academy.ru")

        return self

    @property
    def yookassa_enabled(self) -> bool:
        return bool(self.yookassa_shop_id and self.yookassa_secret_key)

    @property
    def email_enabled(self) -> bool:
        return bool(self.smtp_host and self.smtp_user and self.smtp_password)


@lru_cache
def get_settings() -> Settings:
    return Settings()
