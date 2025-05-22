from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, PostgresDsn, field_validator

# В pydantic v2 BaseSettings переехал в отдельный пакет
try:
    from pydantic_settings import BaseSettings
except ImportError:
    # Для обратной совместимости с pydantic v1
    from pydantic import BaseSettings


class Settings(BaseSettings):
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

    # Основные настройки приложения
    APP_ENV: str = "development"
    APP_NAME: str = "Requify"
    APP_VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    DEBUG: bool = True

    # Настройки CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"]

    # Настройки базы данных
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "requify"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"

    DATABASE_URI: Optional[PostgresDsn] = None

    @field_validator("DATABASE_URI", mode="before")
    @classmethod  # Используем classmethod для валидатора
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v

        return PostgresDsn.build(
            scheme="postgresql+psycopg2",
            username=values.get("POSTGRES_USER"),
            password=values.get("POSTGRES_PASSWORD"),
            host=values.get("POSTGRES_SERVER"),
            port=int(values.get("POSTGRES_PORT", 5432)),
            path=f"{values.get('POSTGRES_DB') or ''}",
        )

    # Настройки безопасности
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Настройки первого администратора
    FIRST_ADMIN_EMAIL: str = "admin@requify.local"
    FIRST_ADMIN_PASSWORD: str = "admin123"
    FIRST_ADMIN_NAME: str = "Admin User"

    # Настройки интеграций
    TESTING_SYSTEM_API_URL: Optional[str] = None
    TESTING_SYSTEM_API_KEY: Optional[str] = None
    PROJECT_MANAGEMENT_API_URL: Optional[str] = None
    PROJECT_MANAGEMENT_API_KEY: Optional[str] = None


settings = Settings()
