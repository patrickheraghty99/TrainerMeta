# backend/settings.py
import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    DEMO_MODE: int = int(os.getenv("DEMO_MODE", "1"))
    DB_DSN: str | None = os.getenv("DB_DSN")
    POKEMONTCG_API_KEY: str | None = os.getenv("POKEMONTCG_API_KEY")
    API_SHARED_KEY: str | None = os.getenv("API_SHARED_KEY")
    ALLOWED_ORIGIN: str | None = os.getenv("ALLOWED_ORIGIN")

settings = Settings()
