"""
Схемы для настроек пользователя.
Соответствуют структуре в frontend/src/entities/settings/api/settingsDAO.ts
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from datetime import datetime
from typing import Optional, Dict, Any, List, Literal
from pydantic import Field, EmailStr, field_validator

from .base import (
    BaseSchema,
    CreateSchema,
    UpdateSchema,
    ResponseSchema,
    ValidationMixin,
    FieldLimits,
    StandardDescriptions,
)


# =============================================================================
# Базовые схемы настроек
# =============================================================================


class UserProfileSettings(BaseSchema):
    """Настройки профиля пользователя"""

    firstName: Optional[str] = Field(None, max_length=50, description="Имя")
    lastName: Optional[str] = Field(None, max_length=50, description="Фамилия")
    email: EmailStr = Field(..., description="Email пользователя")
    phone: Optional[str] = Field(None, max_length=20, description="Телефон")
    position: Optional[str] = Field(None, max_length=100, description="Должность")
    bio: Optional[str] = Field(None, max_length=500, description="О себе")
    avatar_url: Optional[str] = Field(None, description="URL аватара")
    timezone: str = Field("Europe/Moscow", description="Часовой пояс")

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        if v and not v.startswith("+"):
            # Добавляем + если не указан
            v = "+" + v.strip()
        return v


class NotificationSettings(BaseSchema):
    """Настройки уведомлений"""

    email_notifications: bool = Field(True, description="Email уведомления")
    push_notifications: bool = Field(True, description="Push уведомления")
    project_updates: bool = Field(True, description="Обновления проектов")
    requirement_changes: bool = Field(True, description="Изменения требований")
    release_notifications: bool = Field(True, description="Уведомления о релизах")
    team_invitations: bool = Field(True, description="Приглашения в команду")
    system_notifications: bool = Field(False, description="Системные уведомления")
    weekly_digest: bool = Field(True, description="Еженедельная сводка")
    mention_notifications: bool = Field(True, description="Уведомления об упоминаниях")


class InterfaceSettings(BaseSchema):
    """Настройки интерфейса"""

    theme: Literal["light", "dark", "auto"] = Field(
        "light", description="Тема интерфейса"
    )
    language: Literal["ru", "en"] = Field("ru", description="Язык интерфейса")
    timezone: str = Field("Europe/Moscow", description="Часовой пояс")
    date_format: Literal["DD.MM.YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] = Field(
        "DD.MM.YYYY", description="Формат даты"
    )
    time_format: Literal["24h", "12h"] = Field("24h", description="Формат времени")
    compact_mode: bool = Field(False, description="Компактный режим")
    sidebar_collapsed: bool = Field(False, description="Сжатый сайдбар")
    show_hints: bool = Field(True, description="Показывать подсказки")
    animations_enabled: bool = Field(True, description="Включить анимации")


class SecuritySettings(BaseSchema):
    """Настройки безопасности"""

    two_factor_auth: bool = Field(False, description="Двухфакторная аутентификация")
    login_notifications: bool = Field(True, description="Уведомления о входе")
    session_timeout: int = Field(
        30, ge=5, le=480, description="Тайм-аут сессии (минуты)"
    )
    allow_multiple_sessions: bool = Field(
        True, description="Разрешить множественные сессии"
    )
    auto_logout: bool = Field(False, description="Автоматический выход")


class PrivacySettings(BaseSchema):
    """Настройки приватности"""

    profile_visibility: Literal["public", "team", "private"] = Field(
        "team", description="Видимость профиля"
    )
    show_email: bool = Field(False, description="Показывать email")
    show_phone: bool = Field(False, description="Показывать телефон")
    activity_visibility: bool = Field(True, description="Показывать активность")


# =============================================================================
# Комплексные схемы
# =============================================================================


class UserSettings(BaseSchema):
    """Полные настройки пользователя (соответствует frontend)

    ВАЖНО: Профильные данные (profile) всегда берутся из User модели,
    а настройки поведения (notifications, interface, security, privacy)
    из отдельной таблицы user_settings.
    """

    profile: UserProfileSettings = Field(
        ..., description="Настройки профиля (из User модели)"
    )
    notifications: NotificationSettings = Field(
        ..., description="Настройки уведомлений"
    )
    interface: InterfaceSettings = Field(..., description="Настройки интерфейса")
    security: SecuritySettings = Field(..., description="Настройки безопасности")
    privacy: PrivacySettings = Field(..., description="Настройки приватности")


class UserSettingsUpdate(UpdateSchema):
    """Схема для обновления настроек (частичное обновление)

    ВАЖНО:
    - profile - используйте update_profile_settings() напрямую для обновления User модели
    - остальные поля сохраняются в user_settings таблице
    """

    profile: Optional[UserProfileSettings] = Field(
        None,
        description="Настройки профиля (ВНИМАНИЕ: обновляется в User модели, НЕ в UserSettings!)",
    )
    notifications: Optional[NotificationSettings] = Field(
        None, description="Настройки уведомлений"
    )
    interface: Optional[InterfaceSettings] = Field(
        None, description="Настройки интерфейса"
    )
    security: Optional[SecuritySettings] = Field(
        None, description="Настройки безопасности"
    )
    privacy: Optional[PrivacySettings] = Field(
        None, description="Настройки приватности"
    )


# =============================================================================
# Схемы ответов
# =============================================================================


class SettingsResponse(BaseSchema):
    """Ответ на операции с настройками"""

    success: bool = Field(..., description="Успешность операции")
    message: str = Field(..., description="Сообщение")
    data: Optional[Dict[str, Any]] = Field(None, description="Дополнительные данные")


class UserSettingsRead(BaseSchema):
    """Схема для чтения настроек пользователя"""

    user_id: int = Field(..., description="ID пользователя")
    settings: UserSettings = Field(..., description="Настройки пользователя")
    updated_at: Optional[datetime] = Field(None, description="Дата обновления")
    created_at: Optional[datetime] = Field(None, description="Дата создания")


# =============================================================================
# Схемы для сессий
# =============================================================================


class UserSession(BaseSchema):
    """Схема пользовательской сессии"""

    session_id: str = Field(..., description="ID сессии")
    device_info: Optional[str] = Field(None, description="Информация об устройстве")
    ip_address: Optional[str] = Field(None, description="IP адрес")
    location: Optional[str] = Field(None, description="Местоположение")
    created_at: datetime = Field(..., description="Дата создания")
    last_active: datetime = Field(..., description="Последняя активность")
    is_current: bool = Field(False, description="Текущая сессия")


class UserSessionsResponse(BaseSchema):
    """Ответ со списком сессий"""

    sessions: List[UserSession] = Field(..., description="Список сессий")
    total_count: int = Field(..., description="Общее количество")


class RevokeSessionsRequest(BaseSchema):
    """Запрос на отзыв сессий"""

    session_ids: Optional[List[str]] = Field(
        None,
        description="ID сессий для отзыва (если None - отзывать все кроме текущей)",
    )


# =============================================================================
# Схемы для смены пароля
# =============================================================================


class ChangePasswordRequest(BaseSchema):
    """Запрос на смену пароля"""

    current_password: str = Field(..., min_length=8, description="Текущий пароль")
    new_password: str = Field(..., min_length=8, description="Новый пароль")
    confirm_password: str = Field(..., min_length=8, description="Подтверждение пароля")

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, v):
        """Валидация силы пароля"""
        if len(v) < 8:
            raise ValueError("Пароль должен содержать минимум 8 символов")

        # Проверка на наличие цифр, букв верхнего и нижнего регистра
        has_digit = any(c.isdigit() for c in v)
        has_upper = any(c.isupper() for c in v)
        has_lower = any(c.islower() for c in v)

        if not (has_digit and has_upper and has_lower):
            raise ValueError(
                "Пароль должен содержать цифры, буквы верхнего и нижнего регистра"
            )

        return v

    @classmethod
    def validate_passwords_match(cls, values):
        """Проверка совпадения паролей"""
        if isinstance(values, dict):
            new_password = values.get("new_password")
            confirm_password = values.get("confirm_password")
        else:
            new_password = values.new_password
            confirm_password = values.confirm_password

        if new_password != confirm_password:
            raise ValueError("Пароли не совпадают")
        return values


# =============================================================================
# Схемы для импорта/экспорта настроек
# =============================================================================


class ExportSettingsResponse(BaseSchema):
    """Ответ на экспорт настроек"""

    export_url: str = Field(..., description="URL для скачивания файла")
    filename: str = Field(..., description="Имя файла")
    expires_at: datetime = Field(..., description="Время истечения ссылки")


class ImportSettingsRequest(BaseSchema):
    """Запрос на импорт настроек"""

    settings_data: UserSettings = Field(..., description="Данные настроек для импорта")
    overwrite_existing: bool = Field(
        False, description="Перезаписать существующие настройки"
    )
