"""
Модель иерархии ролей на основе направленного ациклического графа (DAG).

Реализует систему наследования ролей где:
- Узлы: Роли
- Ребра: Отношения наследования (родитель -> потомок)
- DAG: Исключает циклы в наследовании
- Наследование: Потомок получает все разрешения родителя + свои собственные
"""

from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Dict, Set, Optional, Any
from enum import Enum

from sqlalchemy import (
    String,
    Boolean,
    DateTime,
    Integer,
    Index,
    ForeignKey,
    Text,
    JSON,
    UniqueConstraint,
    CheckConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .enhanced_role_system import EnhancedRole

class InheritanceType(str, Enum):
    """Типы наследования ролей."""

    FULL = "full"  # Полное наследование всех разрешений
    PARTIAL = "partial"  # Частичное наследование (только указанные разрешения)
    OVERRIDE = "override"  # Переопределение разрешений родителя
    RESTRICT = "restrict"  # Ограничение разрешений родителя

class RoleHierarchy(Base, TimestampedMixin):
    """
    Модель иерархии ролей (DAG).

    Представляет связь родитель-потомок между ролями:
    - parent_role_id: Родительская роль (наследуемая)
    - child_role_id: Дочерняя роль (наследующая)
    - inheritance_type: Тип наследования
    - conditions: Условия наследования (JSON)
    """

    __tablename__ = "role_hierarchy"
    __table_args__ = (
        # Уникальность связи
        UniqueConstraint(
            "parent_role_id", "child_role_id", name="uq_role_hierarchy_parent_child"
        ),
        # Предотвращение самонаследования
        CheckConstraint(
            "parent_role_id != child_role_id",
            name="ck_role_hierarchy_no_self_reference",
        ),
        # Индексы для производительности
        Index("ix_role_hierarchy_parent_role_id", "parent_role_id"),
        Index("ix_role_hierarchy_child_role_id", "child_role_id"),
        Index("ix_role_hierarchy_inheritance_type", "inheritance_type"),
        Index("ix_role_hierarchy_is_active", "is_active"),
        Index("ix_role_hierarchy_priority", "priority"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    #     # Основные связи
    # 
    parent_role_id: Mapped[int] = mapped_column(
        ForeignKey("enhanced_roles.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID родительской роли",
    )
    child_role_id: Mapped[int] = mapped_column(
        ForeignKey("enhanced_roles.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID дочерней роли",
    )

    #     # Конфигурация наследования
    # 
    inheritance_type: Mapped[InheritanceType] = mapped_column(
        String(20),
        default=InheritanceType.FULL,
        nullable=False,
        comment="Тип наследования разрешений",
    )

    priority: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
        comment="Приоритет наследования (при множественном наследовании)",
    )

    #     # Условия и ограничения
    # 
    conditions: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON, nullable=True, comment="Условия наследования (JSON)"
    )

    # Какие разрешения наследовать (для PARTIAL)
    inherited_permissions: Mapped[Optional[List[str]]] = mapped_column(
        JSON, nullable=True, comment="Список наследуемых разрешений (для PARTIAL)"
    )

    # Какие разрешения исключить (для RESTRICT)
    excluded_permissions: Mapped[Optional[List[str]]] = mapped_column(
        JSON, nullable=True, comment="Список исключаемых разрешений (для RESTRICT)"
    )

    # Переопределения разрешений (для OVERRIDE)
    permission_overrides: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON, nullable=True, comment="Переопределения разрешений (для OVERRIDE)"
    )

    #     # Метаданные
    # 
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Активна ли связь наследования"
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Описание связи наследования"
    )

    # Временные ограничения
    effective_from: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Дата начала действия наследования",
    )
    effective_until: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Дата окончания действия наследования",
    )

    # Аудит
    created_by: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id"), nullable=True, comment="Кем создана связь"
    )

    #     # Отношения
    # 
    parent_role: Mapped["EnhancedRole"] = relationship(
        "EnhancedRole",
        foreign_keys=[parent_role_id],
        back_populates="child_relationships",
    )
    child_role: Mapped["EnhancedRole"] = relationship(
        "EnhancedRole",
        foreign_keys=[child_role_id],
        back_populates="parent_relationships",
    )

    def __repr__(self) -> str:
        return (
            f"<RoleHierarchy("
            f"parent={self.parent_role_id}, "
            f"child={self.child_role_id}, "
            f"type={self.inheritance_type}"
            f")>"
        )

    #     # Business Logic Methods
    # 
    @property
    def is_effective(self) -> bool:
        """Проверить, действует ли наследование в данный момент."""
        if not self.is_active:
            return False

        now = datetime.now(timezone.utc)

        if self.effective_from and now < self.effective_from:
            return False

        if self.effective_until and now > self.effective_until:
            return False

        return True

    def get_inherited_permissions(self, parent_permissions: Set[str]) -> Set[str]:
        """
        Получить разрешения, которые должны быть унаследованы.

        Args:
            parent_permissions: Разрешения родительской роли

        Returns:
            Набор разрешений для наследования
        """
        if not self.is_effective:
            return set()

        if self.inheritance_type == InheritanceType.FULL:
            return parent_permissions.copy()

        elif self.inheritance_type == InheritanceType.PARTIAL:
            if self.inherited_permissions:
                return parent_permissions.intersection(set(self.inherited_permissions))
            return set()

        elif self.inheritance_type == InheritanceType.RESTRICT:
            if self.excluded_permissions:
                return parent_permissions - set(self.excluded_permissions)
            return parent_permissions.copy()

        elif self.inheritance_type == InheritanceType.OVERRIDE:
            # Логика переопределения зависит от конкретной реализации
            # Здесь возвращаем базовые разрешения
            return parent_permissions.copy()

        return set()

    def validate_inheritance(self) -> bool:
        """
        Валидировать корректность настроек наследования.

        Returns:
            True если настройки корректны
        """
        if self.inheritance_type == InheritanceType.PARTIAL:
            return self.inherited_permissions is not None

        elif self.inheritance_type == InheritanceType.RESTRICT:
            return self.excluded_permissions is not None

        elif self.inheritance_type == InheritanceType.OVERRIDE:
            return self.permission_overrides is not None

        return True

class RoleHierarchyCache(Base, TimestampedMixin):
    """
    Кеш вычисленных путей в иерархии ролей для производительности.

    Хранит предвычисленные данные о:
    - Всех предках роли
    - Всех потомках роли
    - Эффективных разрешениях
    """

    __tablename__ = "role_hierarchy_cache"
    __table_args__ = (
        Index("ix_role_hierarchy_cache_role_id", "role_id"),
        Index("ix_role_hierarchy_cache_cache_type", "cache_type"),
        Index("ix_role_hierarchy_cache_is_valid", "is_valid"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    role_id: Mapped[int] = mapped_column(
        ForeignKey("enhanced_roles.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID роли",
    )

    cache_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Тип кеша (ancestors, descendants, permissions)",
    )

    cache_data: Mapped[Dict[str, Any]] = mapped_column(
        JSON, nullable=False, comment="Кешированные данные"
    )

    is_valid: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Валиден ли кеш"
    )

    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, comment="Дата истечения кеша"
    )

    def __repr__(self) -> str:
        return f"<RoleHierarchyCache(role_id={self.role_id}, type={self.cache_type})>"

    @property
    def is_expired(self) -> bool:
        """Проверить, истек ли кеш."""
        if not self.is_valid:
            return True

        if self.expires_at and datetime.now(timezone.utc) > self.expires_at:
            return True

        return False

# Добавляем обратные связи к EnhancedRole (через отдельный файл обновления)
def add_hierarchy_relationships():
    """
    Добавляет отношения иерархии к модели EnhancedRole.
    Должно быть вызвано после импорта всех моделей.
    """
    from .enhanced_role_system import EnhancedRole

    # Добавляем отношения к EnhancedRole
    if not hasattr(EnhancedRole, "parent_relationships"):
        EnhancedRole.parent_relationships = relationship(
            "RoleHierarchy",
            foreign_keys="RoleHierarchy.child_role_id",
            back_populates="child_role",
        )

    if not hasattr(EnhancedRole, "child_relationships"):
        EnhancedRole.child_relationships = relationship(
            "RoleHierarchy",
            foreign_keys="RoleHierarchy.parent_role_id",
            back_populates="parent_role",
        )
