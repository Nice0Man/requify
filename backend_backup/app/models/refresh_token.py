"""
Модель для хранения refresh токенов.

Содержит модель RefreshToken для управления токенами обновления в базе данных.
"""

from datetime import UTC, datetime
from typing import TYPE_CHECKING, Optional
from uuid import uuid4

from sqlalchemy import Boolea, ForeignKeyn, DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .user import User


class RefreshToken(Base):
    """
    Модель для хранения refresh токенов в базе данных.

    Обеспечивает безопасное управление токенами обновления с возможностью
    отзыва и отслеживания активности пользователя.
    """

    __tablename__ = "refresh_tokens"
    __table_args__ = (
        Index("ix_refresh_tokens_token_unique", "token", unique=True),
        Index("ix_refresh_tokens_user_id", "user_id"),
        Index("ix_refresh_tokens_expires_at", "expires_at"),
        Index("ix_refresh_tokens_is_active", "is_active"),
        Index("ix_refresh_tokens_user_active", "user_id", "is_active"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Токен (уникальный идентификатор)
    token: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        default=lambda: str(uuid4()),
        comment="Уникальный токен обновления",
    )

    # Связь с пользователем
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID пользователя",
    )
    # Связь с компанией
    company_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=True,
        comment="ID компании",
    )
    # Временные метки
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(UTC).replace(tzinfo=None),
        nullable=False,
        comment="Время создания токена",
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, comment="Время истечения токена"
    )

    last_used_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Время последнего использования токена"
    )

    # Статус и метаданные
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Активен ли токен"
    )

    # Информация о клиенте (для аудита и безопасности)
    user_agent: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="User-Agent клиента"
    )

    ip_address: Mapped[Optional[str]] = mapped_column(
        String(45),  # IPv6 максимум 45 символов
        nullable=True,
        comment="IP адрес клиента",
    )

    # Дополнительные метаданные
    revoked_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Время отзыва токена"
    )

    revoked_by: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True, comment="Причина отзыва токена"
    )

    # Отношения
    user: Mapped["User"] = relationship(
        "User", back_populates="refresh_tokens", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<RefreshToken(id={self.id}, user_id={self.user_id}, active={self.is_active})>"

    @property
    def is_expired(self) -> bool:
        """Проверить, истек ли токен."""
        return datetime.now(UTC).replace(tzinfo=None) > self.expires_at

    @property
    def is_valid(self) -> bool:
        """Проверить, валиден ли токен (активен и не истек)."""
        return self.is_active and not self.is_expired

    def revoke(self, reason: Optional[str] = None) -> None:
        """
        Отозвать токен.

        Args:
            reason: Причина отзыва токена
        """
        self.is_active = False
        self.revoked_at = datetime.now(UTC).replace(tzinfo=None)
        self.revoked_by = reason

    def mark_used(self) -> None:
        """Отметить токен как использованный."""
        self.last_used_at = datetime.now(UTC).replace(tzinfo=None)
