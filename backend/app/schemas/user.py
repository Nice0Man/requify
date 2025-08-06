"""
Схемы для модели User.
Мигрировано на новую архитектуру SQLModel с базовыми классами.
Поддерживает Enhanced Role System, связи с UserProfile, UserSettings, Dashboard, Teams.
"""

from datetime import datetime
from typing import Optional, Dict, Any, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field
from pydantic import EmailStr, field_validator, model_validator
from enum import Enum
import re

from .base import (
    BaseSchema,
    CreateSchema,
    UpdateSchema,
    ResponseSchema,
    ListResponseSchema,
    StatisticsSchema,
    ValidationMixin,
    FieldLimits,
    StandardDescriptions,
)
from .common import SearchRequest, DateRangeFilter

# Условные импорты для избежания циклических зависимостей
if TYPE_CHECKING:
    from .user_profile import UserProfile, UserProfileResponse
    from .company import Company, CompanyResponse
    from .enhanced_role import UserRoleAssignmentResponse, EnhancedRoleResponse
    from .dashboard import UserDashboardPreferences, DashboardNotification
    from .team import TeamResponse, TeamMemberResponse
    from .settings import UserSettings, UserSettingsResponse


# === Перечисления ===


class UserStatus(str, Enum):
    """Статусы пользователя"""

    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"
    BLOCKED = "blocked"
    ARCHIVED = "archived"


class AuthProvider(str, Enum):
    """Провайдеры аутентификации"""

    LOCAL = "local"
    AUTH0 = "auth0"
    GOOGLE = "google"
    MICROSOFT = "microsoft"
    GITHUB = "github"
    SSO = "sso"


# === Базовые схемы ===


class UserBase(BaseSchema, ValidationMixin):
    """
    Базовая схема пользователя.
    Содержит основные поля без служебных данных.
    
    NOTE: Поле user_type было удалено, так как система использует Enhanced Role System
    для управления ролями пользователей через UserRoleAssignment и EnhancedRole.
    """

    username: str = Field(
        ...,
        min_length=2,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Имя пользователя (уникальное)",
    )
    email: EmailStr = Field(..., description="Email пользователя (уникальный)")
    status: UserStatus = Field(UserStatus.ACTIVE, description="Статус пользователя")
    auth_provider: AuthProvider = Field(
        AuthProvider.LOCAL, description="Провайдер аутентификации"
    )
    auth_provider_id: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="ID пользователя у внешнего провайдера",
    )
    company_id: Optional[int] = Field(
        None, gt=0, description="ID основной компании пользователя"
    )
    is_email_verified: bool = Field(False, description="Подтвержден ли email")
    email_verified_at: Optional[datetime] = Field(
        None, description="Дата подтверждения email"
    )
    last_login_at: Optional[datetime] = Field(None, description="Дата последнего входа")
    login_attempts: int = Field(
        0, ge=0, description="Количество неудачных попыток входа"
    )
    locked_until: Optional[datetime] = Field(
        None, description="Заблокирован до (после множественных неудачных попыток)"
    )
    password_changed_at: Optional[datetime] = Field(
        None, description="Дата последней смены пароля"
    )
    terms_accepted_at: Optional[datetime] = Field(
        None, description="Дата принятия условий использования"
    )
    privacy_policy_accepted_at: Optional[datetime] = Field(
        None, description="Дата принятия политики конфиденциальности"
    )
    preferences: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Пользовательские настройки"
    )
    user_metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Дополнительные метаданные"
    )
    is_active: bool = Field(True, description=StandardDescriptions.IS_ACTIVE)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Валидация имени пользователя"""
        v = cls.validate_non_empty_string(v, "username")
        v = v.strip().lower()

        # Имя пользователя может содержать только буквы, цифры, точки, дефисы и подчеркивания
        if not re.match(r"^[a-zA-Z0-9._-]+$", v):
            raise ValueError(
                "Username can only contain letters, numbers, dots, hyphens and underscores"
            )

        # Не должно начинаться или заканчиваться специальными символами
        if v.startswith((".", "-", "_")) or v.endswith((".", "-", "_")):
            raise ValueError(
                "Username cannot start or end with dot, hyphen or underscore"
            )

        # Не должно содержать последовательные специальные символы
        if any(combo in v for combo in ["..", "--", "__", ".-", "-_", "_."]):
            raise ValueError("Username cannot contain consecutive special characters")

        # Проверка зарезервированных имен
        reserved_usernames = [
            "admin",
            "root",
            "administrator",
            "superuser",
            "api",
            "www",
            "mail",
            "support",
            "help",
            "service",
            "system",
            "null",
            "undefined",
        ]
        if v in reserved_usernames:
            raise ValueError(f"Username '{v}' is reserved")

        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: EmailStr) -> str:
        """Дополнительная валидация email"""
        email_str = str(v).lower()

        # Проверяем на запрещенные домены
        forbidden_domains = [
            "temp-mail.org",
            "10minutemail.com",
            "guerrillamail.com",
            "mailinator.com",
            "tempmail.email",
            "throwaway.email",
        ]  # TODO add from forbidden email databese table (create table)
        domain = email_str.split("@")[1] if "@" in email_str else ""

        if domain in forbidden_domains:
            raise ValueError(f"Email domain {domain} is not allowed")

        # Проверяем длину локальной части
        local_part = email_str.split("@")[0] if "@" in email_str else ""
        if len(local_part) > 64:
            raise ValueError("Email local part cannot exceed 64 characters")

        return email_str

    @field_validator("auth_provider_id")
    @classmethod
    def validate_auth_provider_id(cls, v: Optional[str]) -> Optional[str]:
        """Валидация ID внешнего провайдера"""
        if v is not None:
            v = v.strip()
            if not v:
                return None
            if len(v) > FieldLimits.MEDIUM_STRING_MAX:
                raise ValueError(
                    f"Auth provider ID cannot exceed {FieldLimits.MEDIUM_STRING_MAX} characters"
                )
        return v

    @field_validator("company_id")
    @classmethod
    def validate_company_id(cls, v: Optional[int]) -> Optional[int]:
        """Валидация ID компании"""
        if v is not None and v <= 0:
            raise ValueError("Company ID must be a positive integer")
        return v

    @model_validator(mode="after")
    def validate_auth_consistency(self):
        """Валидация согласованности данных аутентификации"""
        # Для внешних провайдеров должен быть указан auth_provider_id
        if self.auth_provider != AuthProvider.LOCAL and not self.auth_provider_id:
            raise ValueError(
                f"auth_provider_id is required for {self.auth_provider} provider"
            )

        # Для локального провайдера auth_provider_id не нужен
        if self.auth_provider == AuthProvider.LOCAL and self.auth_provider_id:
            self.auth_provider_id = None

        return self


# === CRUD схемы ===


class UserCreate(UserBase, CreateSchema):
    """
    Схема для создания пользователя.
    """

    password: Optional[str] = Field(
        None,
        min_length=8,
        max_length=128,
        description="Пароль пользователя (для локальной аутентификации)",
    )
    confirm_password: Optional[str] = Field(None, description="Подтверждение пароля")
    invite_token: Optional[str] = Field(
        None, description="Токен приглашения (если создание по приглашению)"
    )

    # Начальные настройки профиля (опционально)
    first_name: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Имя (будет сохранено в UserProfile)",
    )
    last_name: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Фамилия (будет сохранено в UserProfile)",
    )
    timezone: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Часовой пояс пользователя",
    )
    language: Optional[str] = Field(
        "en", max_length=10, description="Предпочитаемый язык"
    )

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: Optional[str]) -> Optional[str]:
        """Валидация пароля"""
        if v is None:
            return v

        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")

        # Проверка сложности пароля
        has_upper = any(c.isupper() for c in v)
        has_lower = any(c.islower() for c in v)
        has_digit = any(c.isdigit() for c in v)
        has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in v)

        if not (has_upper and has_lower and has_digit and has_special):
            raise ValueError(
                "Password must contain at least one uppercase letter, "
                "one lowercase letter, one digit, and one special character"
            )

        # Проверка на общие пароли
        common_passwords = [
            "password",
            "12345678",
            "qwerty123",
            "admin123",
            "password123",
            "welcome123",
            "letmein123",
            "monkey123",
            "123456789",
            "football123",
        ]  # TODO add from forbidden password databese table (create table)

        if v.lower() in common_passwords:
            raise ValueError(
                "Password is too common, please choose a more secure password"
            )

        # Проверка на последовательности
        if any(seq in v.lower() for seq in ["123456", "abcdef", "qwerty"]):
            raise ValueError("Password should not contain common sequences")

        return v

    @model_validator(mode="before")
    @classmethod
    def validate_user_creation(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Дополнительная валидация при создании пользователя"""
        if isinstance(data, dict):
            username = data.get("username", "")
            email = data.get("email", "")
            password = data.get("password", "")
            confirm_password = data.get("confirm_password", "")
            auth_provider = data.get("auth_provider", AuthProvider.LOCAL)

            # Проверка подтверждения пароля
            if password and confirm_password and password != confirm_password:
                raise ValueError("Password and confirm_password do not match")

            # Для локальной аутентификации пароль обязателен
            if auth_provider == AuthProvider.LOCAL and not password:
                raise ValueError("Password is required for local authentication")

            # Проверяем, что пароль не содержит имя пользователя или email
            if password and username and len(username) > 3:
                if username.lower() in password.lower():
                    raise ValueError("Password should not contain username")

            if password and email and len(email) > 5:
                email_local = email.split("@")[0] if "@" in email else email
                if len(email_local) > 3 and email_local.lower() in password.lower():
                    raise ValueError("Password should not contain email address")

        return data


class UserUpdate(UpdateSchema, ValidationMixin):
    """
    Схема для обновления пользователя.
    Все поля опциональны для частичных обновлений.
    """

    username: Optional[str] = Field(
        None,
        min_length=2,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Имя пользователя",
    )
    email: Optional[EmailStr] = Field(None, description="Email пользователя")
    status: Optional[UserStatus] = Field(None, description="Статус пользователя")
    company_id: Optional[int] = Field(None, gt=0, description="ID основной компании")
    is_email_verified: Optional[bool] = Field(None, description="Подтвержден ли email")
    preferences: Optional[Dict[str, Any]] = Field(
        None, description="Пользовательские настройки"
    )
    user_metadata: Optional[Dict[str, Any]] = Field(
        None, description="Дополнительные метаданные"
    )
    is_active: Optional[bool] = Field(None, description=StandardDescriptions.IS_ACTIVE)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: Optional[str]) -> Optional[str]:
        """Валидация имени пользователя при обновлении"""
        if v is not None:
            v = cls.validate_non_empty_string(v, "username")
            v = v.strip().lower()

            if not re.match(r"^[a-zA-Z0-9._-]+$", v):
                raise ValueError(
                    "Username can only contain letters, numbers, dots, hyphens and underscores"
                )

            if v.startswith((".", "-", "_")) or v.endswith((".", "-", "_")):
                raise ValueError(
                    "Username cannot start or end with dot, hyphen or underscore"
                )

        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: Optional[EmailStr]) -> Optional[str]:
        """Валидация email при обновлении"""
        if v is not None:
            email_str = str(v).lower()

            forbidden_domains = [
                "temp-mail.org",
                "10minutemail.com",
                "guerrillamail.com",
            ]  # TODO add from forbidden email databese table (create table)
            domain = email_str.split("@")[1] if "@" in email_str else ""

            if domain in forbidden_domains:
                raise ValueError(f"Email domain {domain} is not allowed")

        return str(v) if v else None

    @model_validator(mode="before")
    @classmethod
    def validate_at_least_one_field(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Проверка, что хотя бы одно поле указано для обновления"""
        if isinstance(data, dict):
            if not any(v is not None for v in data.values()):
                raise ValueError("At least one field must be provided for update")
        return data


class UserResponse(UserBase, ResponseSchema):
    """
    Схема ответа для пользователя.
    Включает все данные из БД кроме чувствительных.
    """

    # Исключаем чувствительные поля из ответа
    model_config = {"exclude": {"login_attempts", "locked_until"}}


# === Расширенные схемы ===


class UserWithRelations(UserResponse):
    """
    Схема пользователя с информацией о связанных сущностях.
    """

    company_name: Optional[str] = Field(None, description="Название компании")
    profile: Optional[Dict[str, Any]] = Field(None, description="Данные профиля")
    roles: List[Dict[str, Any]] = Field(
        default_factory=list, description="Назначенные роли"
    )
    teams: List[Dict[str, Any]] = Field(
        default_factory=list, description="Команды пользователя"
    )


class UserDetailed(UserWithRelations):
    """
    Детальная схема пользователя с полной информацией.
    """

    # Статистика активности
    projects_count: int = Field(0, ge=0, description="Количество проектов")
    requirements_count: int = Field(0, ge=0, description="Количество требований")
    teams_count: int = Field(0, ge=0, description="Количество команд")

    # Последняя активность
    last_activity_at: Optional[datetime] = Field(
        None, description="Дата последней активности"
    )

    # Настройки и предпочтения
    settings: Optional[Dict[str, Any]] = Field(
        None, description="Пользовательские настройки"
    )

    # Права доступа для текущего пользователя
    can_edit: bool = Field(False, description="Можно ли редактировать")
    can_delete: bool = Field(False, description="Можно ли удалить")
    can_assign_roles: bool = Field(False, description="Можно ли назначать роли")
    can_reset_password: bool = Field(False, description="Можно ли сбросить пароль")


# === Списки и пагинация ===


class UserListResponse(ListResponseSchema[UserWithRelations]):
    """Список пользователей с пагинацией"""

    pass


class UserDetailedListResponse(ListResponseSchema[UserDetailed]):
    """Детальный список пользователей с пагинацией"""

    pass


# === Поиск и фильтрация ===


class UserSearchRequest(SearchRequest):
    """
    Запрос поиска пользователей.
    """

    statuses: Optional[List[UserStatus]] = Field(None, description="Фильтр по статусам")
    auth_providers: Optional[List[AuthProvider]] = Field(
        None, description="Фильтр по провайдерам аутентификации"
    )
    company_ids: Optional[List[int]] = Field(None, description="Фильтр по компаниям")
    is_email_verified: Optional[bool] = Field(None, description="Подтвержден ли email")
    is_active: Optional[bool] = Field(None, description="Активные пользователи")
    role_names: Optional[List[str]] = Field(
        None, description="Фильтр по названиям ролей"
    )
    team_ids: Optional[List[int]] = Field(None, description="Фильтр по командам")


class UserFilter(BaseSchema):
    """
    Расширенный фильтр для пользователей.
    """

    registration_date_range: Optional[DateRangeFilter] = Field(
        None, description="Диапазон дат регистрации"
    )
    last_login_range: Optional[DateRangeFilter] = Field(
        None, description="Диапазон дат последнего входа"
    )
    projects_count_min: Optional[int] = Field(
        None, ge=0, description="Минимальное количество проектов"
    )
    projects_count_max: Optional[int] = Field(
        None, ge=0, description="Максимальное количество проектов"
    )
    has_profile: Optional[bool] = Field(None, description="Есть ли заполненный профиль")
    never_logged_in: Optional[bool] = Field(
        None, description="Никогда не входили в систему"
    )
    inactive_days: Optional[int] = Field(
        None, ge=0, description="Неактивен более N дней"
    )


# === Аутентификация ===


class UserLogin(BaseSchema):
    """
    Схема для входа пользователя.
    """

    username_or_email: str = Field(..., description="Имя пользователя или email")
    password: str = Field(..., description="Пароль")
    remember_me: bool = Field(False, description="Запомнить меня")
    device_info: Optional[Dict[str, Any]] = Field(
        None, description="Информация об устройстве"
    )


class UserRegistration(UserCreate):
    """
    Схема для регистрации пользователя.
    Расширяет UserCreate дополнительными полями.
    """

    accept_terms: bool = Field(..., description="Принятие условий использования")
    accept_privacy: bool = Field(
        ..., description="Принятие политики конфиденциальности"
    )
    marketing_consent: bool = Field(
        False, description="Согласие на маркетинговые коммуникации"
    )
    referral_code: Optional[str] = Field(
        None, max_length=50, description="Реферальный код"
    )

    @model_validator(mode="after")
    def validate_registration(self):
        """Валидация данных регистрации"""
        if not self.accept_terms:
            raise ValueError("Terms of service must be accepted")

        if not self.accept_privacy:
            raise ValueError("Privacy policy must be accepted")

        return self


# === Операции с паролем ===


class PasswordChangeRequest(BaseSchema):
    """
    Запрос на смену пароля.
    """

    current_password: str = Field(..., description="Текущий пароль")
    new_password: str = Field(
        ..., min_length=8, max_length=128, description="Новый пароль"
    )
    confirm_password: str = Field(..., description="Подтверждение нового пароля")

    @model_validator(mode="after")
    def validate_passwords(self):
        """Валидация паролей"""
        if self.new_password != self.confirm_password:
            raise ValueError("New password and confirmation do not match")

        if self.current_password == self.new_password:
            raise ValueError("New password must be different from current password")

        return self


class PasswordResetRequest(BaseSchema):
    """
    Запрос на сброс пароля.
    """

    email: EmailStr = Field(..., description="Email пользователя")
    reset_url: Optional[str] = Field(
        None, description="URL для перенаправления после сброса"
    )


class PasswordResetConfirm(BaseSchema):
    """
    Подтверждение сброса пароля.
    """

    token: str = Field(..., description="Токен сброса пароля")
    new_password: str = Field(
        ..., min_length=8, max_length=128, description="Новый пароль"
    )
    confirm_password: str = Field(..., description="Подтверждение нового пароля")

    @model_validator(mode="after")
    def validate_passwords(self):
        """Валидация паролей"""
        if self.new_password != self.confirm_password:
            raise ValueError("Password and confirmation do not match")

        return self


# === Верификация email ===


class EmailVerificationRequest(BaseSchema):
    """
    Запрос на отправку кода верификации email.
    """

    email: EmailStr = Field(..., description="Email для верификации")
    redirect_url: Optional[str] = Field(
        None, description="URL для перенаправления после верификации"
    )


class EmailVerificationConfirm(BaseSchema):
    """
    Подтверждение верификации email.
    """

    token: str = Field(..., description="Токен верификации")


# === Статистика ===


class UserStatistics(StatisticsSchema):
    """
    Схема статистики пользователей.
    """

    total_users: int = Field(0, ge=0, description="Общее количество пользователей")
    active_users: int = Field(0, ge=0, description="Активных пользователей")
    verified_users: int = Field(0, ge=0, description="Верифицированных пользователей")
    new_users_month: int = Field(0, ge=0, description="Новых пользователей за месяц")

    by_status: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по статусам"
    )
    by_type: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по типам"
    )
    by_auth_provider: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по провайдерам аутентификации"
    )
    by_company: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по компаниям"
    )

    registration_trends: List[Dict[str, Any]] = Field(
        default_factory=list, description="Тренды регистрации"
    )
    activity_trends: List[Dict[str, Any]] = Field(
        default_factory=list, description="Тренды активности"
    )
    login_patterns: List[Dict[str, Any]] = Field(
        default_factory=list, description="Паттерны входов в систему"
    )


# === Массовые операции ===


class UserBulkUpdate(BaseSchema):
    """
    Схема для массового обновления пользователей.
    """

    user_ids: List[int] = Field(
        ..., min_length=1, description="Список ID пользователей"
    )
    update_data: UserUpdate = Field(..., description="Данные для обновления")
    reason: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Причина массового обновления",
    )


class UserBulkStatusChange(BaseSchema):
    """
    Схема для массового изменения статуса пользователей.
    """

    user_ids: List[int] = Field(
        ..., min_length=1, description="Список ID пользователей"
    )
    new_status: UserStatus = Field(..., description="Новый статус")
    reason: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Причина изменения статуса",
    )


# === Экспорт и импорт ===


class UserExportRequest(BaseSchema):
    """
    Запрос на экспорт пользователей.
    """

    format: str = Field(
        "xlsx", regex="^(xlsx|csv|pdf|json)$", description="Формат экспорта"
    )
    filter: Optional[UserFilter] = Field(None, description="Фильтр для экспорта")
    include_profile: bool = Field(False, description="Включить данные профиля")
    include_roles: bool = Field(False, description="Включить роли")
    include_statistics: bool = Field(False, description="Включить статистику")
    anonymize: bool = Field(False, description="Анонимизировать персональные данные")


# === Константы и утилиты ===


class UserConfig:
    """
    Конфигурация схем пользователей.
    """

    # Схемы для различных контекстов
    MINIMAL = UserResponse
    STANDARD = UserWithRelations
    DETAILED = UserDetailed
    LIST = UserListResponse
    SEARCH = UserSearchRequest

    # Ограничения
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_DURATION_MINUTES = 30
    PASSWORD_HISTORY_COUNT = 5
    EMAIL_VERIFICATION_TIMEOUT_HOURS = 24
    PASSWORD_RESET_TIMEOUT_HOURS = 2

    # Настройки безопасности
    STRONG_PASSWORD_ENABLED = True
    REQUIRE_EMAIL_VERIFICATION = True
    ALLOW_SELF_REGISTRATION = True
    ALLOW_SOCIAL_LOGIN = True

    # Права доступа
    ADMIN_PERMISSIONS = [
        "create_user",
        "edit_user",
        "delete_user",
        "view_all_users",
        "assign_roles",
        "reset_password",
        "export_users",
    ]

    USER_PERMISSIONS = ["view_own_profile", "edit_own_profile", "change_own_password"]


# === Дополнительные схемы ===


class UserComplete(UserDetailed):
    """
    Псевдоним для UserDetailed с полной информацией о пользователе.
    Используется для обратной совместимости в auth схемах.
    """
    
    pass


class UserWithProfile(UserWithRelations):
    """
    Псевдоним для UserWithRelations с профилем пользователя.
    Используется для обратной совместимости в auth схемах.
    """
    
    pass


# === Псевдонимы для обратной совместимости ===

User = UserResponse  # Базовый пользователь
UserInDB = UserDetailed  # Пользователь из БД с полной информацией
UserWithStats = UserDetailed  # Пользователь со статистикой
UserStats = UserStatistics  # Статистика пользователя
UserActivity = UserDetailed  # Активность пользователя (временный псевдоним)
UserValidation = UserResponse  # Валидация пользователя (временный псевдоним)
UserAvailability = UserResponse  # Доступность пользователя (временный псевдоним)
UserAudit = UserDetailed  # Аудит пользователя (временный псевдоним)
UserPublicProfile = UserWithRelations  # Публичный профиль пользователя
