import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    """
    Модель пользователя системы.
    """

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Отношения
    created_requirements: Mapped[List["Requirement"]] = relationship(
        "Requirement", foreign_keys="Requirement.creator_id", back_populates="creator"
    )
    created_releases: Mapped[List["Release"]] = relationship(
        "Release", foreign_keys="Release.creator_id", back_populates="creator"
    )
    test_results: Mapped[List["TestResult"]] = relationship(
        "TestResult", foreign_keys="TestResult.tester_id", back_populates="tester"
    )
