"""
Activity Model.

Модель для отслеживания активности пользователей в системе.
"""

from typing import TYPE_CHECKING, Optional, Dict, Any

from sqlalchemy import Foreig, JSONnKey, Integer, String, ForeignKey, Index, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .user import User
    from .project import Project

class Activity(Base, TimestampedMixin):
    """
    Модель активности пользователей.

    Отслеживает различные действия пользователей в системе
    для построения лент активности и аналитики.
    """

    __tablename__ = "activities"
    __table_args__ = (
        Index("ix_activities_user_id", "user_id"),
        Index("ix_activities_project_id", "project_id"),
        Index("ix_activities_activity_type", "activity_type"),
        Index("ix_activities_target_type", "target_type"),
        Index("ix_activities_created_at", "created_at"),
        Index("ix_activities_user_project", "user_id", "project_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Основные поля
    activity_type: Mapped[str] = mapped_column(
        String(50), nullable=False, comment="Тип активности"
    )
    target_type: Mapped[str] = mapped_column(
        String(50), nullable=False, comment="Тип объекта"
    )
    target_id: Mapped[str] = mapped_column(
        String(100), nullable=False, comment="ID объекта"
    )

    # Метаданные
    activity_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON, nullable=True, comment="Дополнительные данные"
    )

    # Связи
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="Пользователь, совершивший действие",
    )
    project_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=True,
        comment="Проект (если применимо)",
    )

    #     # Отношения
    # 
    user: Mapped["User"] = relationship(
        "User", back_populates="activities", lazy="select"
    )

    project: Mapped[Optional["Project"]] = relationship(
        "Project", back_populates="activities", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<Activity(id={self.id}, type={self.activity_type}, user_id={self.user_id})>"

    @property
    def metadata_dict(self) -> Dict[str, Any]:
        """Получить метаданные как словарь."""
        return self.activity_metadata or {}

    def set_metadata(self, data: Dict[str, Any]) -> None:
        """Установить метаданные."""
        self.activity_metadata = data

    def update_metadata(self, **kwargs) -> None:
        """Обновить метаданные."""
        if self.activity_metadata is None:
            self.activity_metadata = {}
        self.activity_metadata.update(kwargs)
