from datetime import datetime, UTC
from typing import List, Optional

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Project(Base):
    """
    Модель проекта.
    """

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, comment="Кодировка проекта"
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(UTC), nullable=False
    )

    # Отношения
    requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement", back_populates="project", cascade="all, delete-orphan"
    )

    releases: Mapped[List["Release"]] = relationship(
        "Release", back_populates="project", cascade="all, delete-orphan"
    )

    specs: Mapped[List["Spec"]] = relationship(
        "Spec", back_populates="project", cascade="all, delete-orphan"
    )

    requirement_groups: Mapped[List["RequirementGroup"]] = relationship(
        "RequirementGroup", back_populates="project", cascade="all, delete-orphan"
    )
