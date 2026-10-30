"""Typed application settings loaded from environment variables / .env."""

from functools import lru_cache
from typing import Literal

from pydantic import AnyHttpUrl, Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore", case_sensitive=False
    )

    # Application
    app_name: str = "Invoice Intelligence API"
    app_version: str = "1.0.0"
    environment: Literal["development", "staging", "production"] = "development"
    log_level: str = "INFO"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # n8n integration (no defaults on URLs: the app refuses to start when they are missing)
    n8n_extract_webhook_url: AnyHttpUrl
    n8n_save_webhook_url: AnyHttpUrl
    n8n_list_webhook_url: AnyHttpUrl
    n8n_auth_header_name: str = "X-Webhook-Secret"
    n8n_auth_token: SecretStr | None = None
    n8n_extract_timeout_seconds: float = Field(default=90.0, gt=0)
    n8n_default_timeout_seconds: float = Field(default=20.0, gt=0)

    # Upload limits
    max_upload_size_mb: int = Field(default=10, ge=1, le=100)
    max_pdf_pages: int = Field(default=20, ge=1, le=500)

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip().rstrip("/") for o in self.cors_origins.split(",") if o.strip()]

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
