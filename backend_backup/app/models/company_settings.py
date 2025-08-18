"""
Модель настроек компании (4NF декомпозиция).
Содержит все настройки и конфигурации, вынесенные из основной модели Company.
"""

from typing import TYPE_CHECKING, Optional

from sqlalchemy import Foreig, JSONnKey, String, Boolean, Integer, Index, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .company import Company

class CompanySettings(Base, TimestampedMixin):
    """
    Настройки компании.

    Вынесены из Company согласно 4NF для устранения многозначных зависимостей.
    Содержит все конфигурации, которые влияют на поведение системы для компании.
    """

    __tablename__ = "company_settings"
    __table_args__ = (
        Index("ix_company_settings_company_id", "company_id"),
        Index("ix_company_settings_domain", "domain"),
        Index("ix_company_settings_allow_domain_signup", "allow_domain_signup"),
        Index("ix_company_settings_enable_sso", "enable_sso"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID компании",
    )

    #     # Домен и безопасность
    # 
    domain: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Корпоративный домен (для SSO)"
    )
    allow_domain_signup: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Разрешить регистрацию по корпоративному домену",
    )
    require_email_verification: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Требовать подтверждение email"
    )

    # Single Sign-On (SSO)
    enable_sso: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="Включить единый вход (SSO)"
    )
    sso_provider: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Провайдер SSO (google, microsoft, okta, auth0)",
    )
    sso_config: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Конфигурация SSO (JSON)"
    )

    # Дополнительная безопасность
    enforce_2fa: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Обязательная двухфакторная аутентификация",
    )
    password_policy: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Политика паролей (JSON)"
    )
    session_timeout_minutes: Mapped[int] = mapped_column(
        Integer,
        default=480,
        nullable=False,
        comment="Таймаут сессии в минутах (8 часов)",
    )

    #     # Локализация и форматирование
    # 
    default_language: Mapped[str] = mapped_column(
        String(10), nullable=False, default="ru", comment="Язык по умолчанию"
    )
    default_currency: Mapped[str] = mapped_column(
        String(3), nullable=False, default="RUB", comment="Валюта по умолчанию"
    )
    default_timezone: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="Europe/Moscow",
        comment="Часовой пояс по умолчанию",
    )
    date_format: Mapped[str] = mapped_column(
        String(20), nullable=False, default="DD.MM.YYYY", comment="Формат даты"
    )
    time_format: Mapped[str] = mapped_column(
        String(20), nullable=False, default="HH:mm", comment="Формат времени"
    )
    number_format: Mapped[str] = mapped_column(
        String(20), nullable=False, default="1 234,56", comment="Формат чисел"
    )

    #     # Настройки приложения
    # 
    # Уведомления
    enable_email_notifications: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Включить email уведомления"
    )
    enable_browser_notifications: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Включить browser уведомления"
    )
    enable_slack_integration: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="Включить интеграцию со Slack"
    )
    notification_settings: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Настройки уведомлений (JSON)"
    )

    # Интеграции
    allowed_integrations: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Разрешенные интеграции (JSON)"
    )
    webhook_settings: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Настройки webhooks (JSON)"
    )

    # API настройки
    api_rate_limit: Mapped[int] = mapped_column(
        Integer, default=1000, nullable=False, comment="Лимит API запросов в час"
    )
    api_allowed_ips: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Разрешенные IP для API (через запятую)"
    )

    #     # Рабочие процессы
    # 
    # Процессы утверждения
    require_requirement_approval: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Требовать утверждение требований",
    )
    require_release_approval: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Требовать утверждение релизов"
    )
    auto_assign_requirements: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Автоматически назначать требования",
    )

    # Настройки проектов
    default_project_visibility: Mapped[str] = mapped_column(
        String(20),
        default="company",
        nullable=False,
        comment="Видимость проектов по умолчанию (public, company, department, team, private)",
    )
    allow_external_collaborators: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Разрешить внешних коллабораторов",
    )

    # Настройки команд
    max_team_size: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, comment="Максимальный размер команды"
    )
    allow_cross_department_teams: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Разрешить межотдельские команды"
    )

    #     # Аналитика и отчеты
    # 
    enable_analytics: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Включить аналитику"
    )
    analytics_retention_days: Mapped[int] = mapped_column(
        Integer, default=90, nullable=False, comment="Срок хранения аналитики (дни)"
    )
    enable_usage_tracking: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Отслеживать использование"
    )

    # Экспорт данных
    allow_data_export: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Разрешить экспорт данных"
    )
    export_formats: Mapped[Optional[str]] = mapped_column(
        String(200),
        default="pdf,xlsx,csv",
        nullable=False,
        comment="Разрешенные форматы экспорта",
    )

    #     # Кастомизация
    # 
    # Кастомные поля
    custom_user_fields: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Кастомные поля пользователей (JSON)"
    )
    custom_project_fields: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Кастомные поля проектов (JSON)"
    )
    custom_requirement_fields: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Кастомные поля требований (JSON)"
    )

    # Метки и категории
    custom_labels: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Кастомные метки (JSON)"
    )
    custom_workflows: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Кастомные рабочие процессы (JSON)"
    )

    #     # Хранение и бэкапы
    # 
    # Хранение файлов
    file_storage_provider: Mapped[str] = mapped_column(
        String(50),
        default="local",
        nullable=False,
        comment="Провайдер хранения файлов (local, aws_s3, google_cloud, azure)",
    )
    max_file_size_mb: Mapped[int] = mapped_column(
        Integer, default=100, nullable=False, comment="Максимальный размер файла (МБ)"
    )
    allowed_file_types: Mapped[str] = mapped_column(
        String(500),
        default="pdf,doc,docx,xls,xlsx,ppt,pptx,txt,jpg,jpeg,png,gif",
        nullable=False,
        comment="Разрешенные типы файлов",
    )

    # Резервное копирование
    auto_backup_enabled: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Автоматические бэкапы"
    )
    backup_frequency_hours: Mapped[int] = mapped_column(
        Integer, default=24, nullable=False, comment="Частота бэкапов (часы)"
    )
    backup_retention_days: Mapped[int] = mapped_column(
        Integer, default=30, nullable=False, comment="Срок хранения бэкапов (дни)"
    )

    #     # Дополнительные настройки
    # 
    custom_settings: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Дополнительные кастомные настройки (JSON)"
    )

    #     # Отношения
    # 
    company: Mapped["Company"] = relationship(
        "Company", back_populates="settings", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<CompanySettings(id={self.id}, company_id={self.company_id}, domain='{self.domain}')>"

    #     # Business Logic Methods
    # 
    def is_domain_allowed(self, email: str) -> bool:
        """Проверить, разрешен ли домен email"""
        if not self.domain or not self.allow_domain_signup:
            return False

        email_domain = email.split("@")[-1].lower()
        return email_domain == self.domain.lower()

    def get_password_policy(self) -> dict:
        """Получить политику паролей"""
        default_policy = {
            "min_length": 8,
            "require_uppercase": True,
            "require_lowercase": True,
            "require_numbers": True,
            "require_special_chars": True,
            "max_age_days": 90,
            "prevent_reuse_count": 5,
        }

        if self.password_policy:
            default_policy.update(self.password_policy)

        return default_policy

    def get_notification_settings(self) -> dict:
        """Получить настройки уведомлений"""
        default_settings = {
            "requirement_created": True,
            "requirement_updated": True,
            "requirement_approved": True,
            "project_invitation": True,
            "team_invitation": True,
            "release_published": True,
            "test_failed": True,
            "deadline_approaching": True,
        }

        if self.notification_settings:
            default_settings.update(self.notification_settings)

        return default_settings

    def get_allowed_integrations(self) -> list:
        """Получить список разрешенных интеграций"""
        if not self.allowed_integrations:
            return ["slack", "jira", "github", "gitlab", "figma"]

        return self.allowed_integrations.get("enabled", [])

    def can_use_integration(self, integration_name: str) -> bool:
        """Проверить, разрешена ли интеграция"""
        return integration_name in self.get_allowed_integrations()

    def get_export_formats(self) -> list:
        """Получить разрешенные форматы экспорта"""
        if not self.export_formats:
            return ["pdf", "xlsx", "csv"]

        return [fmt.strip() for fmt in self.export_formats.split(",")]

    def can_export_format(self, format_name: str) -> bool:
        """Проверить, разрешен ли формат экспорта"""
        return format_name.lower() in [fmt.lower() for fmt in self.get_export_formats()]

    def get_allowed_file_types(self) -> list:
        """Получить разрешенные типы файлов"""
        return [ext.strip() for ext in self.allowed_file_types.split(",")]

    def can_upload_file_type(self, file_extension: str) -> bool:
        """Проверить, разрешен ли тип файла"""
        return file_extension.lower() in [
            ext.lower() for ext in self.get_allowed_file_types()
        ]

    def is_file_size_allowed(self, size_bytes: int) -> bool:
        """Проверить, разрешен ли размер файла"""
        max_size_bytes = self.max_file_size_mb * 1024 * 1024
        return size_bytes <= max_size_bytes

    def update_custom_setting(self, key: str, value: any) -> None:
        """Обновить кастомную настройку"""
        if not self.custom_settings:
            self.custom_settings = {}

        self.custom_settings[key] = value

    def get_custom_setting(self, key: str, default=None):
        """Получить кастомную настройку"""
        if not self.custom_settings:
            return default

        return self.custom_settings.get(key, default)

    def validate_sso_config(self) -> bool:
        """Проверить корректность конфигурации SSO"""
        if not self.enable_sso or not self.sso_provider:
            return True

        if not self.sso_config:
            return False

        # Базовая валидация конфигурации SSO
        required_fields = {
            "google": ["client_id", "client_secret"],
            "microsoft": ["client_id", "client_secret", "tenant_id"],
            "okta": ["domain", "client_id", "client_secret"],
            "auth0": ["domain", "client_id", "client_secret"],
        }

        required = required_fields.get(self.sso_provider, [])
        return all(field in self.sso_config for field in required)
