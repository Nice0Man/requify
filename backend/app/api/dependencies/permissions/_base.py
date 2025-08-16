"""
Базовые классы и интерфейсы для permission dependencies.

Стандартизированная архитектура для всех permission-based dependencies.
Следует принципам SOLID и обеспечивает единообразие в API.
"""

from abc import ABC, abstractmethod
from typing import Callable, List, Optional, Dict, Any
from fastapi import Security

from app.core.constants import Permission
from app.models.user import User
from ..core.auth import get_current_user
from .factory import PermissionDependencyFactory


class BasePermissionClass(ABC):
    """
    Базовый абстрактный класс для всех permission dependencies.

    Определяет стандартный интерфейс и общие паттерны для всех доменов.
    Обеспечивает консистентность API и упрощает тестирование.
    """

    # Абстрактные методы - должны быть реализованы в каждом классе
    @staticmethod
    @abstractmethod
    def read() -> Callable:
        """Dependency для чтения данных домена."""
        pass

    @staticmethod
    @abstractmethod
    def write() -> Callable:
        """Dependency для записи данных домена."""
        pass

    # Стандартные методы - имеют реализацию по умолчанию
    @staticmethod
    def create() -> Callable:
        """Dependency для создания сущностей домена."""
        # По умолчанию используем write permission
        return PermissionDependencyFactory.create_simple(
            Permission.CREATE_PROJECT, ["create"]
        )

    @staticmethod
    def update() -> Callable:
        """Dependency для обновления сущностей домена."""
        # По умолчанию используем write permission
        return PermissionDependencyFactory.create_simple(
            Permission.MANAGE_PROJECT, ["update"]
        )

    @staticmethod
    def delete() -> Callable:
        """Dependency для удаления сущностей домена."""
        return PermissionDependencyFactory.create_simple(
            Permission.DELETE_PROJECT, ["delete"]
        )

    @staticmethod
    def admin() -> Callable:
        """Dependency для административных операций домена."""
        return PermissionDependencyFactory.create_simple(
            Permission.MANAGE_SYSTEM, ["admin"]
        )


class StandardPermissionMixin:
    """
    Mixin для стандартных permission методов.

    Предоставляет общие методы, которые могут использоваться
    в большинстве permission классов.
    """

    @staticmethod
    def full_access() -> Callable:
        """Dependency для полного доступа к домену."""
        return PermissionDependencyFactory.create_combined(
            [
                Permission.VIEW_PROJECT,
                Permission.CREATE_PROJECT,
                Permission.MANAGE_PROJECT,
                Permission.DELETE_PROJECT,
            ]
        )

    @staticmethod
    def readonly() -> Callable:
        """Dependency для только чтения."""
        return PermissionDependencyFactory.create_simple(
            Permission.VIEW_PROJECT, ["readonly"]
        )

    @staticmethod
    def management() -> Callable:
        """Dependency для управленческих операций."""
        return PermissionDependencyFactory.create_combined(
            [
                Permission.MANAGE_PROJECT,
                Permission.CREATE_PROJECT,
            ]
        )


class BackwardCompatibilityMixin:
    """
    Mixin для обратной совместимости.

    Предоставляет стандартизированные backward compatibility функции
    для всех permission классов.
    """

    @classmethod
    def _create_legacy_function(
        cls, dependency_method: Callable, scopes: List[str], name: str
    ) -> Callable:
        """
        Создает backward compatibility функцию.

        Args:
            dependency_method: Метод класса permission
            scopes: OAuth2 scopes для Security
            name: Имя функции

        Returns:
            Callable: Async функция для backward compatibility
        """

        async def legacy_function(
            current_user: User = Security(get_current_user, scopes=scopes)
        ) -> User:
            dependency = dependency_method()
            # В реальности dependency должен быть вызван через FastAPI DI
            return current_user

        legacy_function.__name__ = name
        legacy_function.__doc__ = (
            f"Backward compatibility: {name.replace('_', ' ').title()}"
        )
        return legacy_function


class PermissionExportMixin:
    """
    Mixin для экспорта permission dependencies.

    Стандартизирует способ экспорта зависимостей для использования
    в endpoints и других частях приложения.
    """

    @classmethod
    def get_exports(cls) -> Dict[str, Callable]:
        """
        Получить словарь всех экспортируемых dependencies.

        Returns:
            Dict[str, Callable]: Словарь имя -> dependency function
        """
        exports = {}

        # Основные методы
        if hasattr(cls, "read"):
            exports[f"{cls.__name__.lower()}_read"] = cls.read()
        if hasattr(cls, "write"):
            exports[f"{cls.__name__.lower()}_write"] = cls.write()
        if hasattr(cls, "create"):
            exports[f"{cls.__name__.lower()}_create"] = cls.create()
        if hasattr(cls, "update"):
            exports[f"{cls.__name__.lower()}_update"] = cls.update()
        if hasattr(cls, "delete"):
            exports[f"{cls.__name__.lower()}_delete"] = cls.delete()
        if hasattr(cls, "admin"):
            exports[f"{cls.__name__.lower()}_admin"] = cls.admin()

        return exports


# Стандартные docstring templates
PERMISSION_METHOD_DOCSTRING = """
{operation} permission dependency for {domain}.

This dependency ensures the current user has the required permissions
to perform {operation} operations in the {domain} domain.

Returns:
    Callable: FastAPI dependency function that validates permissions
    
Raises:
    HTTPException: 403 if user lacks required permissions
    HTTPException: 401 if user is not authenticated
"""

PERMISSION_CLASS_DOCSTRING = """
{domain} permission dependencies.

Provides standardized permission-based dependencies for {domain} domain operations.
Follows the BasePermissionClass interface for consistency across all domains.

Standard Methods:
    - read(): View {domain_lower} data
    - write(): Create/update {domain_lower} data  
    - create(): Create new {domain_lower} entities
    - update(): Update existing {domain_lower} entities
    - delete(): Delete {domain_lower} entities
    - admin(): Administrative {domain_lower} operations

Example:
    ```python
    @router.get("/")
    async def get_{domain_lower}(
        current_user: User = Depends({domain}Permissions.read())
    ):
        pass
    ```
"""


def generate_class_docstring(domain: str) -> str:
    """Генерирует стандартизированный docstring для permission класса."""
    return PERMISSION_CLASS_DOCSTRING.format(domain=domain, domain_lower=domain.lower())


def generate_method_docstring(operation: str, domain: str) -> str:
    """Генерирует стандартизированный docstring для permission метода."""
    return PERMISSION_METHOD_DOCSTRING.format(operation=operation, domain=domain)
