from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    project_name: str = "BR Agendamento Interno"
    api_v1_prefix: str = "/api/v1"
    secret_key: str = "change-this-secret"
    access_token_expire_minutes: int = 480
    database_url: str = "sqlite:///./agendamento.db"
    frontend_url: str = "http://localhost:5173"

    therapist_1_name: str = "Barbará Rodrigues"
    therapist_1_email: str = "barbara@brmassoterapia.com"
    therapist_1_password: str = "troque-esta-senha"
    therapist_1_color: str = "#7c3aed"

    therapist_2_name: str = "Massoterapeuta 2"
    therapist_2_email: str = "terapeuta2@brmassoterapia.com"
    therapist_2_password: str = "troque-esta-senha"
    therapist_2_color: str = "#0d9488"

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
