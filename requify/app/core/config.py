from pathlib import Path
from typing import List

from dotenv import load_dotenv
from pydantic import BaseModel, Field, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).parent.parent.parent.parent

load_dotenv(dotenv_path=BASE_DIR)


class RunConfig(BaseModel):
    env: str = "development"
    name: str = "Requify"
    version: str = "0.1.0"
    api_v1_str: str = "/api/v1"
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True


class ApiV1Prefix(BaseModel):
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


class JWT(BaseModel):
    private_key_path: Path = BASE_DIR / "certs" / "jwt-private.pem"
    public_key_path: Path = BASE_DIR / "certs" / "jwt-public.pem"
    JWT_PUBLIC_KEY: str = "guess-me"
    JWT_PRIVATE_KEY: str = "guess-me"
    JWT_ALGORITHM: str = "HS256"
    TOKEN_EXPIRES_MINUTES: int = 30
    TOKEN_URLSAFE_LEN: int = 32
    SUB: str = "requify-user"


class ApiConfig(BaseModel):
    prefix: str = "/api"
    v1: ApiV1Prefix = ApiV1Prefix()

    @property
    def bearer_token_url(self) -> str:
        # api/v1/auth/login
        parts = (self.prefix, self.v1.prefix, self.v1.auth, "/login")
        path = "".join(parts)
        return path.removeprefix("/")


class DatabaseConfig(BaseModel):
    name: str = "requify-db"
    password: str = "postgres"
    user: str = "postgres"
    host: str = "localhost"
    port: int = 5432

    # Connection pool settings
    pool_size: int = 20
    max_overflow: int = 10
    pool_pre_ping: bool = True
    pool_recycle: int = 3600
    echo: bool = False
    echo_pool: bool = False

    @property
    def sync_url(self) -> str:
        return f"postgresql+psycopg2://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"

    @property
    def async_url(self) -> str:
        return f"postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"

    naming_convention: dict[str, str] = {
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_N_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s",
    }


class TestDatabaseConfig(BaseModel):
    name: str = "requify-test-db"
    password: str = "postgres"
    user: str = "postgres"
    host: str = "localhost"
    port: int = 5433

    # Connection pool settings
    pool_size: int = 20
    max_overflow: int = 10
    pool_pre_ping: bool = True
    pool_recycle: int = 3600
    echo: bool = False
    echo_pool: bool = False

    @property
    def sync_url(self) -> str:
        return f"postgresql+psycopg2://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"

    @property
    def async_url(self) -> str:
        return f"postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"


class SecurityConfig(BaseModel):
    secret_key: str = "super-secret-key-change-in-production-minimum-32-characters"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30


class AdminConfig(BaseModel):
    email: str = "admin@requify.local"
    password: str = "admin123"
    name: str = "Admin User"


class IntegrationsConfig(BaseModel):
    testing_system_api_url: str = "http://localhost:8001/api/v1"
    testing_system_api_key: str = "test-api-key-change-in-production"
    project_management_api_url: str = "http://localhost:8002/api/v1"
    project_management_api_key: str = "project-api-key-change-in-production"


class LoggingConfig(BaseModel):
    level: str = "INFO"
    file: str = "logs/requify.log"
    max_size: int = 10485760
    backup_count: int = 5


class RedisConfig(BaseModel):
    host: str = "localhost"
    port: int = 6379
    db: int = 0
    password: str = ""


class EmailConfig(BaseModel):
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_tls: bool = True
    smtp_ssl: bool = False
    from_email: str = "noreply@requify.local"
    from_name: str = "Requify"


class FileStorageConfig(BaseModel):
    upload_dir: str = "uploads"
    max_file_size: int = 10485760
    allowed_extensions: str = "pdf,doc,docx,txt,jpg,jpeg,png,gif"


class AccessToken(BaseModel):
    lifetime_seconds: int = 1800  # 30 minutes (30 * 60)
    reset_password_token_secret: str = "reset-password-secret-change-in-production"
    verification_token_secret: str = "verification-secret-change-in-production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        env_nested_delimiter="__",
        env_prefix="APP_CONFIG__",
        extra="allow",
    )

    # Main app config
    app_config: RunConfig = Field(default_factory=RunConfig)

    # Database configs
    db: DatabaseConfig = Field(default_factory=DatabaseConfig)
    test_db: TestDatabaseConfig = Field(default_factory=TestDatabaseConfig)

    # Security
    security: SecurityConfig = Field(default_factory=SecurityConfig)

    # CORS origins
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
    ]

    # Admin user
    admin: AdminConfig = Field(default_factory=AdminConfig)

    # Integrations
    integrations: IntegrationsConfig = Field(default_factory=IntegrationsConfig)

    # Logging
    logging: LoggingConfig = Field(default_factory=LoggingConfig)

    # Redis
    redis: RedisConfig = Field(default_factory=RedisConfig)

    # Email
    email: EmailConfig = Field(default_factory=EmailConfig)

    # File storage
    file_storage: FileStorageConfig = Field(default_factory=FileStorageConfig)

    # Legacy support - backward compatibility with old DATABASE_URI format
    database_uri: str = ""
    async_database_uri: str = ""
    test_database_uri: str = ""
    test_async_database_uri: str = ""

    jwt: JWT = JWT()
    access_token: AccessToken = AccessToken()

    def model_post_init(self, __context):
        """Post-initialization to handle legacy variables and setup derived fields"""
        # Handle legacy database URIs if they exist
        if self.database_uri:
            # Parse legacy URI format for main DB
            pass
        if self.async_database_uri:
            # Parse legacy URI format for main DB
            pass
        if self.test_database_uri:
            # Parse legacy URI format for test DB
            pass
        if self.test_async_database_uri:
            # Parse legacy URI format for test DB
            pass


settings = Settings()
