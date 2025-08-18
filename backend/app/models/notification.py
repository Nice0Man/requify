"""
Notification Model.

Модель для уведомлений пользователей.
"""

from datetime import datetime, UTC
from typing import TYPE_CHECKING, Optional, Dict, Any

from sqlalchemy import Integer, String, Text, Boolean, DateTime, ForeignKey, Index, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .user import User

class Notification(Base, TimestampedMixin):
    """
    Модель уведомлений пользователей.

    Хранит уведомления о различных событиях в системе
    для конкретных пользователей.
    """

    __tablename__ = "notifications"
    __table_args__ = (
        Index("ix_notifications_user_id", "user_id"),
        Index("ix_notifications_notification_type", "notification_type"),
        Index("ix_notifications_read", "is_read"),
        Index("ix_notifications_created_at", "created_at"),
        Index("ix_notifications_user_read", "user_id", "is_read"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Основные поля
    notification_type: Mapped[str] = mapped_column(
        String(50), nullable=False, comment="Тип уведомления"
    )
    title: Mapped[str] = mapped_column(
        String(200), nullable=False, comment="Заголовок уведомления"
    )
    message: Mapped[str] = mapped_column(
        Text, nullable=False, comment="Текст уведомления"
    )

    # Статус
    is_read: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="Прочитано ли уведомление"
    )
    read_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Время прочтения"
    )

    # Метаданные
    data: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON, nullable=True, comment="Дополнительные данные"
    )

    # Связи
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="Получатель уведомления",
    )

    #     # Отношения
    # 
    user: Mapped["User"] = relationship(
        "User", back_populates="user_notifications", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<Notification(id={self.id}, type={self.notification_type}, user_id={self.user_id})>"

    @property
    def data_dict(self) -> Dict[str, Any]:
        """Получить данные как словарь."""
        return self.data or {}

    def set_data(self, data: Dict[str, Any]) -> None:
        """Установить данные."""
        self.data = data

    def update_data(self, **kwargs) -> None:
        """Обновить данные."""
        if self.data is None:
            self.data = {}
        self.data.update(kwargs)

    def mark_as_read(self) -> None:
        """Отметить уведомление как прочитанное."""
        self.is_read = True
        self.read_at = datetime.now(UTC).replace(tzinfo=None)

    def mark_as_unread(self) -> None:
        """Отметить уведомление как непрочитанное."""
        self.is_read = False
        self.read_at = None
