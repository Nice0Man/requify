"""
Схемы для модели CompanySettings.
"""

from typing import Optional, List, Dict, Any
from pydantic import field_validator, EmailStr
from datetime import datetime
from enum import Enum

from .base import (
    BaseSchema,
    CreateSchema,
    UpdateSchema,
    ResponseSchema,
    ValidationMixin,
    FieldLimits,
    StandardDescriptions,
)


class SSOProvider(str, Enum):
    """Провайдеры SSO"""

    GOOGLE = "google"
    MICROSOFT = "microsoft"
    OKTA = "okta"
    AUTH0 = "auth0"


class FileStorageProvider(str, Enum):
    """Провайдеры хранения файлов"""

    LOCAL = "local"
    AWS_S3 = "aws_s3"
    GOOGLE_CLOUD = "google_cloud"
    AZURE = "azure"


class ProjectVisibility(str, Enum):
    """Уровни видимости проектов"""

    PUBLIC = "public"
    COMPANY = "company"
    DEPARTMENT = "department"
    TEAM = "team"
    PRIVATE = "private"


class CompanySettingsBase(BaseSchema):
    """Базовая схема для настроек компании"""

    # Домен и безопасность
    domain: Optional[str] = None
    allow_domain_signup: bool = False
    require_email_verification: bool = True

    # Single Sign-On (SSO)
    enable_sso: bool = False
    sso_provider: Optional[SSOProvider] = None
    sso_config: Optional[Dict[str, Any]] = None

    # Дополнительная безопасность
    enforce_2fa: bool = False
    password_policy: Optional[Dict[str, Any]] = None
    session_timeout_minutes: int = 480

    # Локализация и форматирование
    default_language: str = "ru"
    default_currency: str = "RUB"
    default_timezone: str = "Europe/Moscow"
    date_format: str = "DD.MM.YYYY"
    time_format: str = "HH:mm"
    number_format: str = "1 234,56"

    # Уведомления
    enable_email_notifications: bool = True
    enable_browser_notifications: bool = True
    enable_slack_integration: bool = False
    notification_settings: Optional[Dict[str, Any]] = None

    # Интеграции
    allowed_integrations: Optional[Dict[str, Any]] = None
    webhook_settings: Optional[Dict[str, Any]] = None

    # API настройки
    api_rate_limit: int = 1000
    api_allowed_ips: Optional[str] = None

    # Рабочие процессы
    require_requirement_approval: bool = False
    require_release_approval: bool = True
    auto_assign_requirements: bool = False

    # Настройки проектов
    default_project_visibility: ProjectVisibility = ProjectVisibility.COMPANY
    allow_external_collaborators: bool = False

    # Настройки команд
    max_team_size: Optional[int] = None
    allow_cross_department_teams: bool = True

    # Аналитика и отчеты
    enable_analytics: bool = True
    analytics_retention_days: int = 90
    enable_usage_tracking: bool = True

    # Экспорт данных
    allow_data_export: bool = True
    export_formats: str = "pdf,xlsx,csv"

    # Кастомизация
    custom_user_fields: Optional[Dict[str, Any]] = None
    custom_project_fields: Optional[Dict[str, Any]] = None
    custom_requirement_fields: Optional[Dict[str, Any]] = None
    custom_labels: Optional[Dict[str, Any]] = None
    custom_workflows: Optional[Dict[str, Any]] = None

    # Хранение файлов
    file_storage_provider: FileStorageProvider = FileStorageProvider.LOCAL
    max_file_size_mb: int = 100
    allowed_file_types: str = "pdf,doc,docx,xls,xlsx,ppt,pptx,txt,jpg,jpeg,png,gif"

    # Резервное копирование
    auto_backup_enabled: bool = True
    backup_frequency_hours: int = 24
    backup_retention_days: int = 30

    # Дополнительные настройки
    custom_settings: Optional[Dict[str, Any]] = None

    @field_validator("domain")
    def validate_domain(cls, v):
        if v and not v.replace(".", "").replace("-", "").isalnum():
            raise ValueError("Invalid domain format")
        return v

    @field_validator("default_language")
    def validate_language(cls, v):
        allowed_languages = ["ru", "en", "de", "fr", "es", "zh", "ja"]
        if v not in allowed_languages:
            raise ValueError(f"Language must be one of: {', '.join(allowed_languages)}")
        return v

    @field_validator("default_currency")
    def validate_currency(cls, v):
        if len(v) != 3 or not v.isupper():
            raise ValueError(
                "Currency must be 3-letter uppercase code (e.g., USD, EUR, RUB)"
            )
        return v

    @field_validator("session_timeout_minutes")
    def validate_session_timeout(cls, v):
        if not 15 <= v <= 1440:  # 15 минут - 24 часа
            raise ValueError("Session timeout must be between 15 and 1440 minutes")
        return v

    @field_validator("api_rate_limit")
    def validate_api_rate_limit(cls, v):
        if not 1 <= v <= 10000:
            raise ValueError(
                "API rate limit must be between 1 and 10000 requests per hour"
            )
        return v

    @field_validator("max_file_size_mb")
    def validate_file_size(cls, v):
        if not 1 <= v <= 1000:
            raise ValueError("Max file size must be between 1 and 1000 MB")
        return v

    @field_validator("analytics_retention_days")
    def validate_analytics_retention(cls, v):
        if not 7 <= v <= 365:
            raise ValueError("Analytics retention must be between 7 and 365 days")
        return v

    @field_validator("backup_frequency_hours")
    def validate_backup_frequency(cls, v):
        if not 1 <= v <= 168:  # 1 час - 1 неделя
            raise ValueError("Backup frequency must be between 1 and 168 hours")
        return v

    @field_validator("backup_retention_days")
    def validate_backup_retention(cls, v):
        if not 1 <= v <= 365:
            raise ValueError("Backup retention must be between 1 and 365 days")
        return v


class CompanySettingsCreate(CompanySettingsBase):
    """Схема для создания настроек компании"""

    pass


class CompanySettingsUpdate(BaseSchema):
    """Схема для обновления настроек компании"""

    # Все поля опциональны для обновления
    domain: Optional[str] = None
    allow_domain_signup: Optional[bool] = None
    require_email_verification: Optional[bool] = None

    enable_sso: Optional[bool] = None
    sso_provider: Optional[SSOProvider] = None
    sso_config: Optional[Dict[str, Any]] = None

    enforce_2fa: Optional[bool] = None
    password_policy: Optional[Dict[str, Any]] = None
    session_timeout_minutes: Optional[int] = None

    default_language: Optional[str] = None
    default_currency: Optional[str] = None
    default_timezone: Optional[str] = None
    date_format: Optional[str] = None
    time_format: Optional[str] = None
    number_format: Optional[str] = None

    enable_email_notifications: Optional[bool] = None
    enable_browser_notifications: Optional[bool] = None
    enable_slack_integration: Optional[bool] = None
    notification_settings: Optional[Dict[str, Any]] = None

    allowed_integrations: Optional[Dict[str, Any]] = None
    webhook_settings: Optional[Dict[str, Any]] = None

    api_rate_limit: Optional[int] = None
    api_allowed_ips: Optional[str] = None

    require_requirement_approval: Optional[bool] = None
    require_release_approval: Optional[bool] = None
    auto_assign_requirements: Optional[bool] = None

    default_project_visibility: Optional[ProjectVisibility] = None
    allow_external_collaborators: Optional[bool] = None

    max_team_size: Optional[int] = None
    allow_cross_department_teams: Optional[bool] = None

    enable_analytics: Optional[bool] = None
    analytics_retention_days: Optional[int] = None
    enable_usage_tracking: Optional[bool] = None

    allow_data_export: Optional[bool] = None
    export_formats: Optional[str] = None

    custom_user_fields: Optional[Dict[str, Any]] = None
    custom_project_fields: Optional[Dict[str, Any]] = None
    custom_requirement_fields: Optional[Dict[str, Any]] = None
    custom_labels: Optional[Dict[str, Any]] = None
    custom_workflows: Optional[Dict[str, Any]] = None

    file_storage_provider: Optional[FileStorageProvider] = None
    max_file_size_mb: Optional[int] = None
    allowed_file_types: Optional[str] = None

    auto_backup_enabled: Optional[bool] = None
    backup_frequency_hours: Optional[int] = None
    backup_retention_days: Optional[int] = None

    custom_settings: Optional[Dict[str, Any]] = None


class CompanySettingsInDB(CompanySettingsBase):
    """Схема для данных из базы данных"""

    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CompanySettingsResponse(CompanySettingsInDB):
    """Схема для ответа API"""

    # Добавляем вычисляемые поля
    is_sso_configured: Optional[bool] = None
    password_policy_strength: Optional[str] = None
    total_integrations_count: Optional[int] = None
    storage_usage_mb: Optional[float] = None


class CompanySettingsProfile(BaseSchema):
    """Схема для профиля настроек (упрощенная)"""

    domain: Optional[str]
    enable_sso: bool
    enforce_2fa: bool
    default_language: str
    default_currency: str
    default_timezone: str
    enable_email_notifications: bool
    enable_slack_integration: bool
    default_project_visibility: ProjectVisibility
    allow_external_collaborators: bool
    enable_analytics: bool
    allow_data_export: bool
    file_storage_provider: FileStorageProvider
    max_file_size_mb: int


class PasswordPolicySettings(BaseSchema):
    """Схема для настроек политики паролей"""

    min_length: int = 8
    require_uppercase: bool = True
    require_lowercase: bool = True
    require_numbers: bool = True
    require_special_chars: bool = True
    max_age_days: int = 90
    prevent_reuse_count: int = 5

    @field_validator("min_length")
    def validate_min_length(cls, v):
        if not 6 <= v <= 50:
            raise ValueError(
                "Password minimum length must be between 6 and 50 characters"
            )
        return v

    @field_validator("max_age_days")
    def validate_max_age(cls, v):
        if not 1 <= v <= 365:
            raise ValueError("Password max age must be between 1 and 365 days")
        return v

    @field_validator("prevent_reuse_count")
    def validate_reuse_count(cls, v):
        if not 0 <= v <= 20:
            raise ValueError("Password reuse prevention count must be between 0 and 20")
        return v


class NotificationSettings(BaseSchema):
    """Схема для настроек уведомлений"""

    requirement_created: bool = True
    requirement_updated: bool = True
    requirement_approved: bool = True
    project_invitation: bool = True
    team_invitation: bool = True
    release_published: bool = True
    test_failed: bool = True
    deadline_approaching: bool = True

    # Дополнительные настройки
    email_digest_frequency: str = "daily"  # daily, weekly, monthly, never
    quiet_hours_start: Optional[str] = "22:00"
    quiet_hours_end: Optional[str] = "08:00"


class SSOConfiguration(BaseSchema):
    """Схема для конфигурации SSO"""

    provider: SSOProvider
    client_id: str
    client_secret: str
    domain: Optional[str] = None  # Для Okta, Auth0
    tenant_id: Optional[str] = None  # Для Microsoft

    # Дополнительные настройки
    auto_create_users: bool = True
    sync_user_attributes: bool = True
    required_groups: Optional[List[str]] = None

    @field_validator("client_id", "client_secret")
    def validate_required_fields(cls, v):
        if not v or len(v.strip()) < 10:
            raise ValueError("Client ID and secret must be at least 10 characters")
        return v.strip()


class IntegrationSettings(BaseSchema):
    """Схема для настроек интеграций"""

    enabled: List[str] = []
    slack_webhook_url: Optional[str] = None
    jira_server_url: Optional[str] = None
    github_organization: Optional[str] = None
    gitlab_group_id: Optional[int] = None


class CustomFieldDefinition(BaseSchema):
    """Схема для определения кастомного поля"""

    name: str
    type: str  # text, number, boolean, date, select, multiselect
    required: bool = False
    default_value: Optional[Any] = None
    options: Optional[List[str]] = None  # Для select/multiselect
    validation_rules: Optional[Dict[str, Any]] = None

    @field_validator("type")
    def validate_field_type(cls, v):
        allowed_types = [
            "text",
            "number",
            "boolean",
            "date",
            "select",
            "multiselect",
            "email",
            "url",
        ]
        if v not in allowed_types:
            raise ValueError(f"Field type must be one of: {', '.join(allowed_types)}")
        return v

    @field_validator("name")
    def validate_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError("Field name must be at least 2 characters")
        return v.strip()


class CompanySettingsValidation(BaseSchema):
    """Схема для валидации настроек"""

    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []
    recommendations: List[str] = []
