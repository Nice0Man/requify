from datetime import datetime, UTC
from typing import List, Optional

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class User(Base):
    """
    Модель пользователя системы.
    """

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(UTC), nullable=False
    )

    # Отношения
    authored_requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement", foreign_keys="Requirement.author_id", back_populates="author"
    )

    modified_requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement",
        foreign_keys="Requirement.last_modified_by",
        back_populates="last_modifier",
    )

    comments: Mapped[List["Comment"]] = relationship("Comment", back_populates="author")

    group_versions: Mapped[List["RequirementGroupVersion"]] = relationship(
        "RequirementGroupVersion", back_populates="created_by"
    )
