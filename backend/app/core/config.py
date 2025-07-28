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


class SMTP(BaseModel):
    host: str = "localhost"
    port: int = 1025
    user: str = "user"
    password: str = "password"
    from_email: str = "noreply@requify.local"
    from_name: str = "Requify"


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

    # Connection pool settings - optimized for stability
    pool_size: int = 5  # Reduced from 20 to be more conservative
    max_overflow: int = 5  # Reduced from 10
    pool_pre_ping: bool = True
    pool_recycle: int = 3600
    echo: bool = False
    echo_pool: bool = False

    # Additional connection parameters for stability
    connect_timeout: int = 10
    command_timeout: int = 60
    pool_timeout: int = 30

    @property
    def sync_url(self) -> str:
        return f"postgresql+psycopg2://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"

    @property
    def async_url(self) -> str:
        return f"postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}?command_timeout={self.command_timeout}"

    naming_convention: dict[str, str] = {
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s",
    }


class TestDatabaseConfig(BaseModel):
    name: str = "requify-test-db"
    password: str = "postgres"
    user: str = "postgres"
    host: str = "localhost"
    port: int = 5432  # Use same port as main DB for testing

    # Connection pool settings - smaller for testing
    pool_size: int = 3
    max_overflow: int = 2
    pool_pre_ping: bool = True
    pool_recycle: int = 3600
    echo: bool = False
    echo_pool: bool = False

    # Additional connection parameters for stability
    connect_timeout: int = 10
    command_timeout: int = 60
    pool_timeout: int = 30

    @property
    def sync_url(self) -> str:
        return f"postgresql+psycopg2://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"

    @property
    def async_url(self) -> str:
        return f"postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}?command_timeout={self.command_timeout}"


class Auth0Config(BaseModel):
    """Настройки Auth0 OAuth2."""

    domain: str = ""
    client_id: str = ""
    client_secret: str = ""
    audience: str = "https://api.requify.com"
    algorithms: list[str] = ["RS256"]
    issuer: str = ""  # Will be set based on domain

    # Настройки для управления пользователями
    management_client_id: str = ""
    management_client_secret: str = ""

    # Включение/выключение Auth0
    enabled: bool = False

    def model_post_init(self, __context):
        """Автоматически устанавливает issuer на основе domain."""
        if self.domain and not self.issuer:
            self.issuer = f"https://{self.domain}/"


class SecurityConfig(BaseModel):
    """Настройки безопасности."""

    # Основные настройки
    secret_key: str = "super-secret-key-change-in-production-minimum-32-characters"
    algorithm: str = "HS256"

    # URL фронтенда для ссылок в email
    frontend_url: str = "http://localhost"

    # Настройки access токенов
    access_token_expire_minutes: int = 30
    access_token_algorithm: str = "HS256"

    # Настройки refresh токенов
    refresh_token_expire_days: int = 7
    refresh_token_algorithm: str = "HS256"
    refresh_token_rotate: bool = (
        True  # Ротация refresh токенов для дополнительной безопасности
    )

    # Настройки паролей
    password_min_length: int = 8
    password_require_uppercase: bool = True
    password_require_lowercase: bool = True
    password_require_digits: bool = True
    password_require_special: bool = False

    # Настройки сессий
    max_refresh_tokens_per_user: int = (
        5  # Максимум активных refresh токенов на пользователя
    )
    cleanup_expired_tokens_hours: int = 24  # Частота очистки истекших токенов

    # Настройки сброса пароля
    password_reset_token_expire_minutes: int = 60
    password_reset_secret: str = "password-reset-secret-change-in-production"

    # Настройки верификации email
    email_verification_token_expire_hours: int = 24
    email_verification_secret: str = "email-verification-secret-change-in-production"

    # Настройки безопасности
    bcrypt_rounds: int = 12  # Количество раундов для bcrypt
    failed_login_attempts_limit: int = 5
    account_lockout_duration_minutes: int = 30

    # CORS настройки
    cors_allow_credentials: bool = True
    cors_allow_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost",  # Added for Nginx reverse proxy
        "http://127.0.0.1",  # Added for Nginx reverse proxy
    ]
    cors_allow_methods: list[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    cors_allow_headers: list[str] = ["*"]


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
    # Local storage settings
    upload_dir: str = "uploads"
    max_file_size: int = 10485760  # 10MB default
    allowed_extensions: str = "pdf,doc,docx,txt,jpg,jpeg,png,gif,webp,svg"

    # Avatar specific settings
    avatar_max_size: int = 2097152  # 2MB for avatars
    avatar_allowed_extensions: str = "jpg,jpeg,png,webp"
    avatar_resize_dimensions: str = (
        "128x128,256x256,512x512"  # Multiple sizes for optimization
    )

    # MinIO Object Storage settings
    use_minio: bool = True  # Enable MinIO by default
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "admin"
    minio_secret_key: str = "minioadmin123"
    minio_secure: bool = False  # True for HTTPS
    minio_region: str = "us-east-1"

    # MinIO bucket configuration
    minio_bucket_uploads: str = "requify-uploads"
    minio_bucket_avatars: str = "requify-avatars"
    minio_bucket_documents: str = "requify-documents"

    # CDN Configuration
    cdn_enabled: bool = True
    cdn_base_url: str = (
        "http://localhost"  # NGINX CDN proxy (изменил порт с 8080 на 80)
    )
    cdn_avatar_path: str = "/cdn/avatars"
    cdn_uploads_path: str = "/cdn/uploads"
    cdn_documents_path: str = "/cdn/documents"
    cdn_static_path: str = "/cdn/static"  # Добавил новый путь для статических файлов
    cdn_images_path: str = "/cdn/images"  # Добавил новый путь для изображений

    # Legacy blob storage settings (for Azure/AWS migration)
    use_blob_storage: bool = False
    blob_storage_container: str = "requify-uploads"
    blob_storage_cdn_url: str = ""
    blob_storage_connection_string: str = ""

    # File organization
    organize_by_date: bool = True  # uploads/2025/01/28/file.jpg
    organize_by_user: bool = True  # uploads/users/{user_id}/avatar.jpg

    # Security settings
    enable_virus_scan: bool = True  # Включаем по умолчанию
    quarantine_dir: str = "quarantine"

    # Антивирусные настройки
    virus_scan_engine: str = "clamav"  # clamav, pattern_match, both
    clamav_socket_path: str = "/var/run/clamav/clamd.ctl"  # Unix socket для ClamAV
    clamav_host: str = "localhost"
    clamav_port: int = 3310
    clamav_timeout: int = 30

    # Настройки проверки паттернов
    scan_patterns_enabled: bool = True
    scan_magic_bytes: bool = True  # Проверка магических байтов
    scan_embedded_content: bool = True  # Проверка встроенного контента

    # Логирование безопасности
    security_log_enabled: bool = True
    security_log_file: str = "logs/security.log"
    security_log_level: str = "WARNING"

    # Уведомления администратора
    admin_notifications_enabled: bool = True
    admin_notification_methods: str = "email,log"  # email, log, webhook
    admin_notification_threshold: int = 3  # Количество инцидентов для уведомления
    admin_notification_webhook_url: str = ""

    # Карантин
    quarantine_retention_days: int = 30  # Сколько дней хранить файлы в карантине
    auto_delete_quarantine: bool = True

    # Cache and performance
    cache_control_max_age: int = 86400  # 24 hours
    avatar_cache_max_age: int = 604800  # 7 days
    enable_compression: bool = True


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

    # Auth0 OAuth2
    auth0: Auth0Config = Field(default_factory=Auth0Config)

    # CORS origins
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://localhost",  # Added for Nginx reverse proxy
        "http://127.0.0.1",  # Added for Nginx reverse proxy
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
        from urllib.parse import urlparse

        # Handle legacy database URIs if they exist
        if self.database_uri:
            # Parse legacy URI format for main DB
            parsed = urlparse(self.database_uri)
            if parsed.hostname:
                self.db.host = parsed.hostname
            if parsed.port:
                self.db.port = parsed.port
            if parsed.username:
                self.db.user = parsed.username
            if parsed.password:
                self.db.password = parsed.password
            if parsed.path and len(parsed.path) > 1:
                self.db.name = parsed.path[1:]  # Remove leading '/'

        if self.async_database_uri:
            # Parse legacy URI format for main DB (async)
            parsed = urlparse(self.async_database_uri)
            if parsed.hostname:
                self.db.host = parsed.hostname
            if parsed.port:
                self.db.port = parsed.port
            if parsed.username:
                self.db.user = parsed.username
            if parsed.password:
                self.db.password = parsed.password
            if parsed.path and len(parsed.path) > 1:
                self.db.name = parsed.path[1:]

        if self.test_database_uri:
            # Parse legacy URI format for test DB
            parsed = urlparse(self.test_database_uri)
            if parsed.hostname:
                self.test_db.host = parsed.hostname
            if parsed.port:
                self.test_db.port = parsed.port
            if parsed.username:
                self.test_db.user = parsed.username
            if parsed.password:
                self.test_db.password = parsed.password
            if parsed.path and len(parsed.path) > 1:
                self.test_db.name = parsed.path[1:]

        if self.test_async_database_uri:
            # Parse legacy URI format for test DB (async)
            parsed = urlparse(self.test_async_database_uri)
            if parsed.hostname:
                self.test_db.host = parsed.hostname
            if parsed.port:
                self.test_db.port = parsed.port
            if parsed.username:
                self.test_db.user = parsed.username
            if parsed.password:
                self.test_db.password = parsed.password
            if parsed.path and len(parsed.path) > 1:
                self.test_db.name = parsed.path[1:]

        # Validate critical settings
        self._validate_security_settings()
        self._validate_database_settings()
        self._validate_email_settings()
        self._validate_file_storage_settings()

    def _validate_security_settings(self) -> None:
        """Validate security configuration"""
        # Check secret key strength
        if len(self.security.secret_key) < 32:
            raise ValueError("Security secret key must be at least 32 characters long")

        # Check if using default secrets in production
        if self.app_config.env == "production":
            dangerous_defaults = [
                "super-secret-key-change-in-production-minimum-32-characters",
                "password-reset-secret-change-in-production",
                "email-verification-secret-change-in-production",
            ]

            if self.security.secret_key in dangerous_defaults:
                raise ValueError("Must change default secret key in production")
            if self.security.password_reset_secret in dangerous_defaults:
                raise ValueError(
                    "Must change default password reset secret in production"
                )
            if self.security.email_verification_secret in dangerous_defaults:
                raise ValueError(
                    "Must change default email verification secret in production"
                )

        # Validate password requirements
        if self.security.password_min_length < 8:
            raise ValueError("Password minimum length must be at least 8 characters")

        if self.security.bcrypt_rounds < 10 or self.security.bcrypt_rounds > 15:
            raise ValueError("BCrypt rounds must be between 10 and 15")

    def _validate_database_settings(self) -> None:
        """Validate database configuration"""
        # Check connection pool settings
        if self.db.pool_size < 1:
            raise ValueError("Database pool size must be at least 1")

        if self.db.max_overflow < 0:
            raise ValueError("Database max overflow cannot be negative")

        if self.db.pool_recycle < 3600:  # 1 hour minimum
            raise ValueError(
                "Database pool recycle time should be at least 3600 seconds"
            )

        # Validate database names
        if not self.db.name.strip():
            raise ValueError("Database name cannot be empty")

        if not self.test_db.name.strip():
            raise ValueError("Test database name cannot be empty")

        # Ensure test DB is different from main DB
        if (
            self.db.name == self.test_db.name
            and self.db.host == self.test_db.host
            and self.db.port == self.test_db.port
        ):
            raise ValueError("Test database must be different from main database")

    def _validate_email_settings(self) -> None:
        """Validate email configuration"""
        # Check SMTP settings if email is configured
        if self.email.smtp_host:
            if not self.email.smtp_user or not self.email.smtp_password:
                if self.app_config.env == "production":
                    raise ValueError(
                        "SMTP user and password are required in production"
                    )

            # Allow standard SMTP ports and common development/testing ports
            allowed_ports = [
                25,
                465,
                587,
                2525,
                1025,
                1587,
                2526,
            ]  # Added development ports
            if self.email.smtp_port not in allowed_ports:
                raise ValueError(
                    f"SMTP port should be one of: {', '.join(map(str, allowed_ports))}"
                )

            # Validate email format
            import re

            email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
            if not re.match(email_pattern, self.email.from_email):
                raise ValueError("Invalid from_email format")

    def _validate_file_storage_settings(self) -> None:
        """Validate file storage configuration"""
        # Check file size limits
        if self.file_storage.max_file_size < 1024:  # 1KB minimum
            raise ValueError("Max file size must be at least 1KB")

        if self.file_storage.max_file_size > 100 * 1024 * 1024:  # 100MB maximum
            raise ValueError("Max file size cannot exceed 100MB")

        # Validate allowed extensions
        extensions = [
            ext.strip().lower()
            for ext in self.file_storage.allowed_extensions.split(",")
        ]
        if not extensions or not any(ext for ext in extensions):
            raise ValueError("At least one file extension must be allowed")

        # Check for potentially dangerous extensions
        dangerous_extensions = ["exe", "bat", "cmd", "com", "pif", "scr", "vbs", "js"]
        if any(ext in dangerous_extensions for ext in extensions):
            raise ValueError(
                f"Dangerous file extensions not allowed: {dangerous_extensions}"
            )

        # Validate upload directory
        if not self.file_storage.upload_dir.strip():
            raise ValueError("Upload directory cannot be empty")

    def get_database_url(self, async_: bool = True, test: bool = False) -> str:
        """
        Get database URL for the specified configuration.

        Args:
            async_: Whether to return async URL
            test: Whether to return test database URL

        Returns:
            str: Database URL
        """
        db_config = self.test_db if test else self.db
        return db_config.async_url if async_ else db_config.sync_url

    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.app_config.env.lower() in ("development", "dev", "local")

    def is_production(self) -> bool:
        """Check if running in production mode"""
        return self.app_config.env.lower() in ("production", "prod")

    def is_testing(self) -> bool:
        """Check if running in testing mode"""
        return self.app_config.env.lower() in ("testing", "test")


settings = Settings()
