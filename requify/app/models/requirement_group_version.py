from datetime import datetime, UTC

from sqlalchemy import DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class RequirementGroupVersion(Base):
    """
    Модель версии группы требований.
    """
    __tablename__ = "requirement_group_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    group_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("requirement_groups.id"), nullable=False
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    snapshot_data: Mapped[dict] = mapped_column(
        JSON, nullable=False, comment="Снимок группы требований и связей"
    )
    created_by: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(UTC), nullable=False
    )

    # Отношения
    group: Mapped["RequirementGroup"] = relationship(
        "RequirementGroup", back_populates="versions"
    )

    created_by_user: Mapped["User"] = relationship(
        "User", back_populates="group_versions"
    )
