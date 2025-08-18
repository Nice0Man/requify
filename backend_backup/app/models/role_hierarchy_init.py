"""
Инициализация отношений иерархии ролей.

Этот модуль добавляет отношения между EnhancedRole и RoleHierarchy
после того, как все модели импортированы, чтобы избежать циклических импортов.
"""

from sqlalchemy.orm import relationship


def initialize_role_hierarchy_relationships():
    """
    Инициализировать отношения между моделями иерархии ролей.

    Должна быть вызвана после импорта всех моделей для корректной
    настройки связей между EnhancedRole и RoleHierarchy.
    """
    from .enhanced_role_system import EnhancedRole
    from .role_hierarchy import RoleHierarchy

    # Добавляем отношения к EnhancedRole, если их еще нет
    if not hasattr(EnhancedRole, "parent_relationships"):
        EnhancedRole.parent_relationships = relationship(
            "RoleHierarchy",
            foreign_keys="RoleHierarchy.child_role_id",
            back_populates="child_role",
            cascade="all, delete-orphan",
            doc="Связи где эта роль является дочерней (наследующей)",
        )

    if not hasattr(EnhancedRole, "child_relationships"):
        EnhancedRole.child_relationships = relationship(
            "RoleHierarchy",
            foreign_keys="RoleHierarchy.parent_role_id",
            back_populates="parent_role",
            cascade="all, delete-orphan",
            doc="Связи где эта роль является родительской (наследуемой)",
        )

    # Также можем добавить удобные свойства для получения ID ролей
    if not hasattr(EnhancedRole, "parent_role_ids"):

        @property
        def parent_role_ids(self) -> set:
            """Получить ID всех родительских ролей (прямых)."""
            if not hasattr(self, "parent_relationships"):
                return set()
            return {
                rel.parent_role_id
                for rel in self.parent_relationships
                if rel.is_effective
            }

        EnhancedRole.parent_role_ids = parent_role_ids

    if not hasattr(EnhancedRole, "child_role_ids"):

        @property
        def child_role_ids(self) -> set:
            """Получить ID всех дочерних ролей (прямых)."""
            if not hasattr(self, "child_relationships"):
                return set()
            return {
                rel.child_role_id
                for rel in self.child_relationships
                if rel.is_effective
            }

        EnhancedRole.child_role_ids = child_role_ids
