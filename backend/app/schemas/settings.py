"""
Схемы для настроек пользователя.
Соответствуют структуре в frontend/src/entities/settings/api/settingsDAO.ts
"""

from datetime import datetime
from typing import Optional, Dict, Any, List, Literal
from pydantic import BaseModel, Field, EmailStr, field_validator


# =============================================================================
# Базовые схемы настроек
# =============================================================================


class UserProfileSettings(BaseModel):
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

    class Config:
        json_schema_extra = {
            "example": {
                "firstName": "Иван",
                "lastName": "Петров",
                "email": "ivan.petrov@example.com",
                "phone": "+7 900 123-45-67",
                "position": "Менеджер проектов",
                "bio": "Опытный специалист в области управления проектами",
                "avatar_url": "http://cdn.requify.local/avatars/user123.jpg",
                "timezone": "Europe/Moscow",
            }
        }


class NotificationSettings(BaseModel):
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

    class Config:
        json_schema_extra = {
            "example": {
                "email_notifications": True,
                "push_notifications": True,
                "project_updates": True,
                "requirement_changes": True,
                "release_notifications": True,
                "team_invitations": True,
                "system_notifications": False,
                "weekly_digest": True,
                "mention_notifications": True,
            }
        }


class InterfaceSettings(BaseModel):
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

    class Config:
        json_schema_extra = {
            "example": {
                "theme": "light",
                "language": "ru",
                "timezone": "Europe/Moscow",
                "date_format": "DD.MM.YYYY",
                "time_format": "24h",
                "compact_mode": False,
                "sidebar_collapsed": False,
                "show_hints": True,
                "animations_enabled": True,
            }
        }


class SecuritySettings(BaseModel):
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

    class Config:
        json_schema_extra = {
            "example": {
                "two_factor_auth": False,
                "login_notifications": True,
                "session_timeout": 30,
                "allow_multiple_sessions": True,
                "auto_logout": False,
            }
        }


class PrivacySettings(BaseModel):
    """Настройки приватности"""

    profile_visibility: Literal["public", "team", "private"] = Field(
        "team", description="Видимость профиля"
    )
    show_email: bool = Field(False, description="Показывать email")
    show_phone: bool = Field(False, description="Показывать телефон")
    activity_visibility: bool = Field(True, description="Показывать активность")

    class Config:
        json_schema_extra = {
            "example": {
                "profile_visibility": "team",
                "show_email": False,
                "show_phone": False,
                "activity_visibility": True,
            }
        }


# =============================================================================
# Комплексные схемы
# =============================================================================


class UserSettings(BaseModel):
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

    class Config:
        json_schema_extra = {
            "example": {
                "profile": UserProfileSettings.Config.json_schema_extra["example"],
                "notifications": NotificationSettings.Config.json_schema_extra[
                    "example"
                ],
                "interface": InterfaceSettings.Config.json_schema_extra["example"],
                "security": SecuritySettings.Config.json_schema_extra["example"],
                "privacy": PrivacySettings.Config.json_schema_extra["example"],
            }
        }


class UserSettingsUpdate(BaseModel):
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


class SettingsResponse(BaseModel):
    """Ответ на операции с настройками"""

    success: bool = Field(..., description="Успешность операции")
    message: str = Field(..., description="Сообщение")
    data: Optional[Dict[str, Any]] = Field(None, description="Дополнительные данные")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Настройки успешно обновлены",
                "data": None,
            }
        }


class UserSettingsRead(BaseModel):
    """Схема для чтения настроек пользователя"""

    user_id: int = Field(..., description="ID пользователя")
    settings: UserSettings = Field(..., description="Настройки пользователя")
    updated_at: Optional[datetime] = Field(None, description="Дата обновления")
    created_at: Optional[datetime] = Field(None, description="Дата создания")

    class Config:
        from_attributes = True


# =============================================================================
# Схемы для сессий
# =============================================================================


class UserSession(BaseModel):
    """Схема пользовательской сессии"""

    session_id: str = Field(..., description="ID сессии")
    device_info: Optional[str] = Field(None, description="Информация об устройстве")
    ip_address: Optional[str] = Field(None, description="IP адрес")
    location: Optional[str] = Field(None, description="Местоположение")
    created_at: datetime = Field(..., description="Дата создания")
    last_active: datetime = Field(..., description="Последняя активность")
    is_current: bool = Field(False, description="Текущая сессия")

    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "sess_123456789",
                "device_info": "Chrome 120.0.0 on Windows 11",
                "ip_address": "192.168.1.100",
                "location": "Москва, Россия",
                "created_at": "2025-01-29T10:00:00Z",
                "last_active": "2025-01-29T14:30:00Z",
                "is_current": True,
            }
        }


class UserSessionsResponse(BaseModel):
    """Ответ со списком сессий"""

    sessions: List[UserSession] = Field(..., description="Список сессий")
    total_count: int = Field(..., description="Общее количество")

    class Config:
        json_schema_extra = {
            "example": {
                "sessions": [UserSession.Config.json_schema_extra["example"]],
                "total_count": 1,
            }
        }


class RevokeSessionsRequest(BaseModel):
    """Запрос на отзыв сессий"""

    session_ids: Optional[List[str]] = Field(
        None,
        description="ID сессий для отзыва (если None - отзывать все кроме текущей)",
    )

    class Config:
        json_schema_extra = {
            "example": {"session_ids": ["sess_123456789", "sess_987654321"]}
        }


# =============================================================================
# Схемы для смены пароля
# =============================================================================


class ChangePasswordRequest(BaseModel):
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

    class Config:
        json_schema_extra = {
            "example": {
                "current_password": "OldPassword123!",
                "new_password": "NewPassword123!",
                "confirm_password": "NewPassword123!",
            }
        }


# =============================================================================
# Схемы для импорта/экспорта настроек
# =============================================================================


class ExportSettingsResponse(BaseModel):
    """Ответ на экспорт настроек"""

    export_url: str = Field(..., description="URL для скачивания файла")
    filename: str = Field(..., description="Имя файла")
    expires_at: datetime = Field(..., description="Время истечения ссылки")

    class Config:
        json_schema_extra = {
            "example": {
                "export_url": "http://cdn.requify.local/exports/settings_user123_20250129.json",
                "filename": "settings_user123_20250129.json",
                "expires_at": "2025-01-30T14:30:00Z",
            }
        }


class ImportSettingsRequest(BaseModel):
    """Запрос на импорт настроек"""

    settings_data: UserSettings = Field(..., description="Данные настроек для импорта")
    overwrite_existing: bool = Field(
        False, description="Перезаписать существующие настройки"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "settings_data": UserSettings.Config.json_schema_extra["example"],
                "overwrite_existing": False,
            }
        }
