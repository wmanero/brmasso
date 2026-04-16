from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    project_name: str = "BR Massoterapia CRM"
    api_v1_prefix: str = "/api/v1"
    secret_key: str = "change-this-secret"
    access_token_expire_minutes: int = 1440
    first_superuser_email: str = "admin@brmassoterapia.com"
    first_superuser_password: str = "admin123"
    database_url: str = "sqlite:///./br_massoterapia.db"
    frontend_url: str = "http://localhost:5173"
    google_calendar_id: str = "primary"
    google_form_url: str = "https://forms.gle/exemplo"
    google_service_account_file: str | None = None
    payment_provider: str = "mock"
    payment_webhook_secret: str = "changeme"
    pix_key: str = "contato@brmassoterapia.com"
    card_provider_public_key: str = "public_test_key"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)


@lru_cache
def get_settings() -> Settings:
    return Settings()
