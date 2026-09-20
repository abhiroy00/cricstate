from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ENV: str = "development"
    APP_NAME: str = "Cricket Ecosystem API"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://cricstate:cricstate@localhost:5432/cricstate"
    )

    REDIS_URL: str = Field(default="redis://localhost:6379/0")

    JWT_SECRET: str = Field(default="change-me-in-env")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_EXPIRE_DAYS: int = 30

    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174"

    RATE_LIMIT_LOGIN_MAX: int = 10
    RATE_LIMIT_LOGIN_WINDOW_SECONDS: int = 60

    BOOTSTRAP_SUPER_ADMIN_EMAIL: str | None = None
    BOOTSTRAP_SUPER_ADMIN_USERNAME: str | None = None
    BOOTSTRAP_SUPER_ADMIN_PASSWORD: str | None = None

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
