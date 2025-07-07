from datetime import UTC, datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .project import Project
    from .requirement import Requirement


class Spec(Base):
    """
    Модель спецификации.
    """

    __tablename__ = "specs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("projects.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Описание спецификации"
    )
    version: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True, default="1.0", comment="Версия спецификации"
    )
    content: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Содержимое спецификации в JSON формате"
    )
    format: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True, default="pdf", comment="Формат документа"
    )
    language: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True, default="ru", comment="Язык спецификации"
    )
    status: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True, default="draft", comment="Статус спецификации"
    )
    generated_by: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True, comment="Создана пользователем"
    )
    template_id: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, comment="Шаблон спецификации"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(UTC).replace(tzinfo=None), nullable=False
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        default=lambda: datetime.now(UTC).replace(tzinfo=None),
        onupdate=lambda: datetime.now(UTC).replace(tzinfo=None),
        nullable=True,
        comment="Время последнего обновления",
    )

    # Отношения
    project: Mapped["Project"] = relationship("Project", back_populates="specs")
    generated_by_user: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[generated_by]
    )

    requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement", back_populates="spec"
    )
