# backend/settings.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DEMO_MODE: int = 1
    DB_DSN: str | None = None
    POKEMONTCG_API_KEY: str | None = None
    API_SHARED_KEY: str | None = None
    ALLOWED_ORIGIN: str | None = None

settings = Settings()  # values auto-loaded from environment

