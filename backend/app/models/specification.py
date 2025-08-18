"""
Specification model for requirements management system.

Модель спецификации для управления документированием требований.
"""

from datetime import UTC, datetime
from typing import List, Optional, TYPE_CHECKING
from enum import Enum

from sqlalchemy import (
    DateTime, Foreig, Foreig, JSONnKeynKey,
    Integer,
    String,
    Text,
    Index,
    Enum as SQLEnum,
    Boolean,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .project import Project
    from .release import Release
    from .user import User
    from .requirement import Requirement
    from .comment import Comment

class SpecificationType(str, Enum):
    """Типы спецификаций."""

    FUNCTIONAL = "functional"  # Функциональная спецификация
    TECHNICAL = "technical"  # Техническая спецификация
    API = "api"  # API спецификация
    USER_STORY = "user_story"  # Пользовательские истории
    BUSINESS = "business"  # Бизнес спецификация
    TEST = "test"  # Тестовая спецификация
    INTEGRATION = "integration"  # Интеграционная спецификация

class SpecificationStatus(str, Enum):
    """Статусы спецификации."""

    DRAFT = "draft"  # Черновик
    IN_REVIEW = "in_review"  # На рассмотрении
    APPROVED = "approved"  # Утверждена
    PUBLISHED = "published"  # Опубликована
    ARCHIVED = "archived"  # Архивирована
    REJECTED = "rejected"  # Отклонена

class SpecificationFormat(str, Enum):
    """Форматы экспорта спецификации."""

    MARKDOWN = "markdown"
    HTML = "html"
    PDF = "pdf"
    DOCX = "docx"
    JSON = "json"

class Specification(Base, TimestampedMixin):
    """
    Модель спецификации.

    Представляет структурированный документ, содержащий набор требований
    и их детальное описание для проекта или релиза.
    """

    __tablename__ = "specifications"
    __table_args__ = (
        Index("ix_specifications_project_id", "project_id"),
        Index("ix_specifications_release_id", "release_id"),
        Index("ix_specifications_author_id", "author_id"),
        Index("ix_specifications_status", "status"),
        Index("ix_specifications_type", "type"),
        Index("ix_specifications_is_active", "is_active"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Основные поля
    title: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="Название спецификации"
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Описание спецификации"
    )

    # Тип и статус
    type: Mapped[SpecificationType] = mapped_column(
        SQLEnum(SpecificationType),
        nullable=False,
        default=SpecificationType.FUNCTIONAL,
        comment="Тип спецификации",
    )
    status: Mapped[SpecificationStatus] = mapped_column(
        SQLEnum(SpecificationStatus),
        nullable=False,
        default=SpecificationStatus.DRAFT,
        comment="Статус спецификации",
    )

    # Контент
    content: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Основное содержимое спецификации"
    )

    # Метаданные документа
    version: Mapped[str] = mapped_column(
        String(20), nullable=False, default="1.0.0", comment="Версия спецификации"
    )

    # Настройки экспорта/генерации
    template_config: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Конфигурация шаблона для генерации"
    )
    export_formats: Mapped[Optional[List[str]]] = mapped_column(
        JSON, nullable=True, comment="Доступные форматы экспорта"
    )

    # Флаги
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, comment="Активная спецификация"
    )
    is_template: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, comment="Является шаблоном"
    )
    auto_update: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="Автоматическое обновление при изменении требований",
    )

    # Связи
    project_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=True,
        comment="ID проекта (если спецификация на уровне проекта)",
    )
    release_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("releases.id", ondelete="CASCADE"),
        nullable=True,
        comment="ID релиза (если спецификация для конкретного релиза)",
    )
    author_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        comment="Автор спецификации",
    )

    # Даты и временные метки
    approved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, comment="Дата утверждения"
    )
    published_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, comment="Дата публикации"
    )

    # Дополнительные поля для аудита
    approved_by_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        comment="Кто утвердил спецификацию",
    )

    #     # Отношения
    # 
    project: Mapped[Optional["Project"]] = relationship(
        "Project", back_populates="specifications", lazy="select"
    )

    release: Mapped[Optional["Release"]] = relationship(
        "Release", back_populates="specifications", lazy="select"
    )

    author: Mapped["User"] = relationship(
        "User",
        foreign_keys=[author_id],
        back_populates="authored_specifications",
        lazy="select",
    )

    approved_by: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[approved_by_id],
        back_populates="approved_specifications",
        lazy="select",
    )

    # Связь many-to-many с требованиями через association table
    requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement",
        secondary="specification_requirements",
        back_populates="specifications",
        lazy="select",
    )

    comments: Mapped[List["Comment"]] = relationship(
        "Comment",
        back_populates="specification",
        cascade="all, delete-orphan",
        lazy="select",
    )

    #     # Методы
    # 
    def __repr__(self) -> str:
        return f"<Specification(id={self.id}, title='{self.title}', type={self.type}, status={self.status})>"

    @property
    def is_published(self) -> bool:
        """Проверка, опубликована ли спецификация."""
        return self.status == SpecificationStatus.PUBLISHED

    @property
    def is_editable(self) -> bool:
        """Проверка, можно ли редактировать спецификацию."""
        return self.status in [SpecificationStatus.DRAFT, SpecificationStatus.IN_REVIEW]

    @property
    def requirements_count(self) -> int:
        """Количество связанных требований."""
        return len(self.requirements) if self.requirements else 0

    def can_be_approved(self) -> bool:
        """Проверка возможности утверждения спецификации."""
        return (
            self.status == SpecificationStatus.IN_REVIEW
            and self.is_active
            and self.requirements_count > 0
        )

    def get_available_export_formats(self) -> List[SpecificationFormat]:
        """Получить доступные форматы экспорта."""
        if self.export_formats:
            return [SpecificationFormat(fmt) for fmt in self.export_formats]
        return [SpecificationFormat.PDF, SpecificationFormat.MARKDOWN]

# # Association Table для связи спецификаций и требований
# 
from sqlalchemy import (
    DateTime, Foreig, Foreig, JSONnKeyn, ForeignKey

specification_requirements = Table(
    "specification_requirements",
    Base.metadata,
    Column(
        "specification_id",
        ForeignKey("specifications.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "requirement_id",
        ForeignKey("requirements.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "order_index",
        Integer,
        nullable=False,
        default=0,
        comment="Порядок требования в спецификации",
    ),
    Column(
        "created_at",
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        comment="Дата добавления требования в спецификацию",
    ),
)
