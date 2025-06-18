from datetime import UTC, datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, Integer, String, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .requirement import Requirement
    from .comment import Comment
    from .requirement_group_version import RequirementGroupVersion
    from .test_result import TestResult


class User(Base, TimestampedMixin):
    """
    Модель пользователя системы.
    
    Представляет пользователя с его ролями, созданными требованиями,
    комментариями и другими связанными сущностями.
    """
    
    __tablename__ = "users"
    __table_args__ = (
        Index('ix_users_email_unique', 'email', unique=True),
        Index('ix_users_username_unique', 'username', unique=True),
        Index('ix_users_role_created', 'role', 'created_at'),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(
        String(50), 
        unique=True, 
        nullable=False,
        comment="Уникальное имя пользователя"
    )
    role: Mapped[str] = mapped_column(
        String(20), 
        nullable=False,
        comment="Роль пользователя (admin, manager, analyst, developer, tester)"
    )
    email: Mapped[str] = mapped_column(
        String(100), 
        unique=True, 
        nullable=False,
        comment="Email адрес пользователя"
    )
    hashed_password: Mapped[str] = mapped_column(
        String(128), 
        nullable=False,
        comment="Хэшированный пароль"
    )

    # Отношения
    authored_requirements: Mapped[List["Requirement"]] = relationship(  
        "Requirement", 
        foreign_keys="Requirement.author_id", 
        back_populates="author",
        lazy="select"
    )

    modified_requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement",
        foreign_keys="Requirement.last_modified_by",
        back_populates="last_modifier",
        lazy="select"
    )

    comments: Mapped[List["Comment"]] = relationship(
        "Comment", 
        back_populates="author",
        lazy="select"
    )

    group_versions: Mapped[List["RequirementGroupVersion"]] = relationship(
        "RequirementGroupVersion", 
        back_populates="created_by_user",
        lazy="select"
    )

    test_results: Mapped[List["TestResult"]] = relationship(
        "TestResult", 
        back_populates="tester",
        lazy="select"
    )
