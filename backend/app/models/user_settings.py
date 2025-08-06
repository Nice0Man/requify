"""
Модель настроек пользователя.
Выделена в отдельную модель для лучшей структуры данных.
ИСПРАВЛЕНО: Убрано дублирование профильных данных - профиль хранится в User модели.
"""

from datetime import UTC, datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Integer, JSON, DateTime, Text, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .user import User


class UserSettings(Base, TimestampedMixin):
    """
    Модель настроек пользователя.

    ВАЖНО: Профильные данные (firstName, lastName, email, phone, position, bio, avatar_url, timezone)
    хранятся в User модели, а НЕ здесь. Здесь только настройки поведения системы.

    Отдельная таблица для настроек позволяет:
    - Лучшую нормализацию данных
    - Версионирование настроек
    - Более гибкую структуру
    """

    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        comment="ID пользователя",
    )

    # Настройки поведения системы (НЕ профильные данные!)
    notification_settings: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Настройки уведомлений в JSON формате"
    )
    interface_settings: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Настройки интерфейса в JSON формате"
    )
    security_settings: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Настройки безопасности в JSON формате"
    )
    privacy_settings: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Настройки приватности в JSON формате"
    )

    # Метаданные настроек
    version: Mapped[int] = mapped_column(
        Integer, nullable=False, default=1, comment="Версия настроек"
    )

    # Связь с пользователем
    user: Mapped["User"] = relationship(
        "User", uselist=False
    )

    def __repr__(self) -> str:
        return f"<UserSettings(user_id={self.user_id}, version={self.version})>"


class UserSettingsHistory(Base, TimestampedMixin):
    """
    История изменений настроек пользователя.
    Позволяет отслеживать изменения и восстанавливать предыдущие версии.

    ВАЖНО: Сохраняет только настройки поведения, НЕ профильные данные.
    """

    __tablename__ = "user_settings_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID пользователя",
    )

    # Снимок настроек на момент изменения (только настройки, НЕ профиль)
    settings_snapshot: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
        comment="Снимок настроек поведения (БЕЗ профильных данных)",
    )

    # Метаданные изменения
    version: Mapped[int] = mapped_column(
        Integer, nullable=False, comment="Версия настроек"
    )
    change_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Тип изменения (create, update, import, etc.)",
    )
    change_reason: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Причина изменения"
    )

    # Связь с пользователем
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])

    def __repr__(self) -> str:
        return f"<UserSettingsHistory(user_id={self.user_id}, version={self.version})>"
