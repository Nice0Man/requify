from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from pydantic import BaseModel, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict

# Базовая директория проекта
BASE_DIR = Path(__file__).parent.parent.parent

# Загружаем переменные окружения
load_dotenv(dotenv_path=BASE_DIR / ".env")


class RunConfig(BaseModel):
    """Конфигурация запуска приложения"""
    env: str = "development"
    name: str = "Requify"
    version: str = "0.1.0"
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True


class ApiV1Prefix(BaseModel):
    """Префиксы для API v1 маршрутов"""
    prefix: str = "/v1"
    auth: str = "/auth"
    users: str = "/users"
    requirements: str = "/requirements"
    projects: str = "/projects"
    templates: str = "/templates"
    analysis: str = "/analysis"
    reports: str = "/reports"
    integrations: str = "/integrations"
    admin: str = "/admin"


class ApiConfig(BaseModel):
    """Конфигурация API"""
    prefix: str = "/api"
    v1_str: str = "/api/v1"
    v1: ApiV1Prefix = ApiV1Prefix()

    @property
    def bearer_token_url(self) -> str:
        """URL для получения bearer токена"""
        parts = (self.prefix, self.v1.prefix, self.v1.auth, "/login")
        path = "".join(parts)
        return path.removeprefix("/")


class SecurityConfig(BaseModel):
    """Конфигурация безопасности и JWT"""
    secret_key: str = "super-secret-key-change-in-production-minimum-32-characters"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # JWT сертификаты (опционально для RS256)
    private_key_path: Path = BASE_DIR / "certs" / "jwt-private.pem"
    public_key_path: Path = BASE_DIR / "certs" / "jwt-public.pem"
    jwt_public_key: Optional[str] = None
    jwt_private_key: Optional[str] = None
    
    # Дополнительные токены
    reset_password_token_secret: Optional[str] = None
    verification_token_secret: Optional[str] = None


class DatabaseConfig(BaseModel):
    """Конфигурация базы данных"""
    name: str = "requify-db"
    password: str = "postgres"
    user: str = "postgres"
    host: str = "localhost"
    port: int = 5432

    # Настройки пула соединений
    pool_size: int = 20
    max_overflow: int = 10
    pool_pre_ping: bool = True
    pool_recycle: int = 3600

    # Настройки логирования
    echo: bool = False
    echo_pool: bool = False

    # Naming convention для ограничений БД
    naming_convention: dict[str, str] = {
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_N_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s",
    }

    @property
    def sync_url(self) -> str:
        """Синхронное подключение к БД"""
        return f"postgresql+psycopg2://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"

    @property
    def async_url(self) -> str:
        """Асинхронное подключение к БД"""
        return f"postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"

    @property
    def url(self) -> str:
        """Основной URL (синхронный)"""
        return self.sync_url


class RedisConfig(BaseModel):
    """Конфигурация Redis"""
    host: str = "localhost"
    port: int = 6379
    db: int = 0
    password: Optional[str] = None

    @property
    def url(self) -> str:
        """URL подключения к Redis"""
        if self.password:
            return f"redis://:{self.password}@{self.host}:{self.port}/{self.db}"
        return f"redis://{self.host}:{self.port}/{self.db}"


class IntegrationsConfig(BaseModel):
    """Конфигурация внешних интеграций"""
    testing_system_api_url: str = "http://localhost:8001/api/v1"
    testing_system_api_key: str = "test-api-key-change-in-production"
    project_management_api_url: str = "http://localhost:8002/api/v1"
    project_management_api_key: str = "project-api-key-change-in-production"


class FileStorageConfig(BaseModel):
    """Конфигурация файлового хранилища"""
    upload_dir: str = "uploads"
    max_file_size: int = 10485760  # 10MB
    allowed_extensions: str = "pdf,doc,docx,txt,jpg,jpeg,png,gif"

    @property
    def allowed_extensions_list(self) -> List[str]:
        """Возвращает список разрешенных расширений файлов"""
        return [ext.strip() for ext in self.allowed_extensions.split(",")]


class EmailConfig(BaseModel):
    """Конфигурация Email"""
    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_tls: bool = True
    smtp_ssl: bool = False
    from_email: str = "noreply@requify.local"
    from_name: str = "Requify"


class LoggingConfig(BaseModel):
    """Конфигурация логирования"""
    level: str = "INFO"
    file: str = "logs/requify.log"
    max_size: int = 10485760
    backup_count: int = 5


class AdminConfig(BaseModel):
    """Конфигурация первого администратора"""
    email: str = "admin@requify.local"
    password: str = "admin123"
    name: str = "Admin User"


class CorsConfig(BaseModel):
    """Конфигурация CORS"""
    origins: str = '["http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:3000"]'

    @property
    def origins_list(self) -> List[str]:
        """Возвращает список CORS origins"""
        import json
        return json.loads(self.origins)


class Settings(BaseSettings):
    """Основные настройки приложения"""
    model_config = SettingsConfigDict(
        env_file=(".env.template", ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        env_nested_delimiter="__",
        env_prefix="APP_CONFIG__",
        extra="allow",  # Разрешаем дополнительные поля
    )

    # Основные настройки (APP_CONFIG__ENV, APP_CONFIG__NAME, etc.)
    env: str = "development"
    name: str = "Requify"
    version: str = "0.1.0"
    api_v1_str: str = "/api/v1"
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True

    # Конфигурации модулей (APP_CONFIG__DB__*, APP_CONFIG__REDIS__*, etc.)
    db: DatabaseConfig = DatabaseConfig()
    test_db: DatabaseConfig = DatabaseConfig(
        name="requify-test-db",
        port=5432  # в docker-compose тестовая БД слушает на 5433 снаружи, но внутри контейнера на 5432
    )
    redis: RedisConfig = RedisConfig()
    security: SecurityConfig = SecurityConfig()
    integrations: IntegrationsConfig = IntegrationsConfig()
    file_storage: FileStorageConfig = FileStorageConfig()
    email: EmailConfig = EmailConfig()
    logging: LoggingConfig = LoggingConfig()
    admin: AdminConfig = AdminConfig()

    # CORS origins (APP_CONFIG__CORS_ORIGINS)
    cors_origins: str = '["http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:3000"]'

    # Обратная совместимость с предыдущей версией
    @property
    def DATABASE_URI(self) -> PostgresDsn:
        return self.db.sync_url

    @property
    def ASYNC_DATABASE_URI(self) -> PostgresDsn:
        return self.db.async_url

    @property
    def TEST_DATABASE_URI(self) -> PostgresDsn:
        return self.test_db.sync_url

    @property
    def TEST_ASYNC_DATABASE_URI(self) -> PostgresDsn:
        return self.test_db.async_url

    @property
    def DEBUG(self) -> bool:
        return self.debug

    @property
    def cors_origins_list(self) -> List[str]:
        """Возвращает список CORS origins"""
        import json
        return json.loads(self.cors_origins)

    # Свойства для быстрого доступа к часто используемым настройкам
    @property
    def first_admin_email(self) -> str:
        return self.admin.email

    @property
    def first_admin_password(self) -> str:
        return self.admin.password

    @property
    def first_admin_name(self) -> str:
        return self.admin.name

    # Свойства для совместимости со старой структурой
    @property
    def run(self) -> RunConfig:
        """Конфигурация запуска (для совместимости)"""
        return RunConfig(
            env=self.env,
            name=self.name,
            version=self.version,
            host=self.host,
            port=self.port,
            debug=self.debug
        )

    @property
    def api(self) -> ApiConfig:
        """Конфигурация API (для совместимости)"""
        config = ApiConfig()
        config.v1_str = self.api_v1_str
        return config

    @property
    def cors(self) -> CorsConfig:
        """Конфигурация CORS (для совместимости)"""
        return CorsConfig(origins=self.cors_origins)


# Глобальный экземпляр настроек
settings = Settings()