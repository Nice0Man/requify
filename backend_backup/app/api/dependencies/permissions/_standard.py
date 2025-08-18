"""
Стандартизированные permission классы.

Базовые реализации для всех доменов с единообразным API.
"""

from typing import Callable, List, Dict, Any
from fastapi import Security

from app.core.constants import Permission
from app.models.user import User
from ..core.auth import get_current_user
from .factory import PermissionDependencyFactory
from ._base import (
    BasePermissionClass,
    StandardPermissionMixin,
    BackwardCompatibilityMixin,
    PermissionExportMixin,
    generate_class_docstring,
    generate_method_docstring,
)
from ._interface import get_domain_config, PermissionConfig


class StandardPermissionClass(
    BasePermissionClass,
    StandardPermissionMixin,
    BackwardCompatibilityMixin,
    PermissionExportMixin,
):
    """
    Стандартная реализация permission класса.

    Предоставляет полную функциональность для любого домена
    с минимальной настройкой.
    """

    # Это должно быть переопределено в каждом наследнике
    DOMAIN_CONFIG: PermissionConfig = None

    @classmethod
    def _get_config(cls) -> PermissionConfig:
        """Получить конфигурацию домена."""
        if cls.DOMAIN_CONFIG is None:
            # Попытаться определить по имени класса
            domain_name = cls.__name__.replace("Permissions", "")
            cls.DOMAIN_CONFIG = get_domain_config(domain_name)
        return cls.DOMAIN_CONFIG

    @classmethod
    def read(cls) -> Callable:
        """Dependency для чтения данных домена."""
        config = cls._get_config()
        permission = config.get_permission("read")
        scopes = [config.get_scope("read")]

        return PermissionDependencyFactory.create_simple(permission, scopes)

    @classmethod
    def write(cls) -> Callable:
        """Dependency для записи данных домена."""
        config = cls._get_config()
        permission = config.get_permission("write")
        scopes = [config.get_scope("write")]

        return PermissionDependencyFactory.create_simple(permission, scopes)

    @classmethod
    def create(cls) -> Callable:
        """Dependency для создания сущностей домена."""
        config = cls._get_config()
        permission = config.get_permission("create")
        scopes = [config.get_scope("create")]

        return PermissionDependencyFactory.create_simple(permission, scopes)

    @classmethod
    def update(cls) -> Callable:
        """Dependency для обновления сущностей домена."""
        config = cls._get_config()
        permission = config.get_permission("update")
        scopes = [config.get_scope("update")]

        return PermissionDependencyFactory.create_simple(permission, scopes)

    @classmethod
    def delete(cls) -> Callable:
        """Dependency для удаления сущностей домена."""
        config = cls._get_config()
        permission = config.get_permission("delete")
        scopes = [config.get_scope("delete")]

        return PermissionDependencyFactory.create_simple(permission, scopes)

    @classmethod
    def admin(cls) -> Callable:
        """Dependency для административных операций домена."""
        config = cls._get_config()
        permission = config.get_permission("admin")
        scopes = [config.get_scope("admin")]

        return PermissionDependencyFactory.create_simple(permission, scopes)

    @classmethod
    def get_legacy_functions(cls) -> Dict[str, Callable]:
        """
        Получить все backward compatibility функции.

        Returns:
            Dict[str, Callable]: Словарь legacy функций
        """
        config = cls._get_config()
        domain_lower = config.domain_name.lower()

        functions = {}

        # Стандартные legacy функции
        if hasattr(cls, "read"):
            functions[f"get_{domain_lower}_read_user"] = cls._create_legacy_function(
                cls.read, [config.get_scope("read")], f"get_{domain_lower}_read_user"
            )

        if hasattr(cls, "write"):
            functions[f"get_{domain_lower}_write_user"] = cls._create_legacy_function(
                cls.write, [config.get_scope("write")], f"get_{domain_lower}_write_user"
            )

        if hasattr(cls, "delete"):
            functions[f"get_{domain_lower}_delete_user"] = cls._create_legacy_function(
                cls.delete,
                [config.get_scope("delete")],
                f"get_{domain_lower}_delete_user",
            )

        return functions


def create_permission_class(
    domain_name: str,
    config: PermissionConfig = None,
    extra_methods: Dict[str, Callable] = None,
) -> type:
    """
    Фабрика для создания permission классов.

    Args:
        domain_name: Имя домена (например, "User", "Project")
        config: Конфигурация домена
        extra_methods: Дополнительные методы для класса

    Returns:
        type: Готовый permission класс
    """
    if config is None:
        config = get_domain_config(domain_name)

    class_name = f"{domain_name}Permissions"

    # Создаем базовые атрибуты класса
    class_attrs = {
        "DOMAIN_CONFIG": config,
        "__doc__": generate_class_docstring(domain_name),
        "__module__": __name__,
    }

    # Добавляем дополнительные методы если есть
    if extra_methods:
        class_attrs.update(extra_methods)

    # Создаем класс динамически
    permission_class = type(class_name, (StandardPermissionClass,), class_attrs)

    return permission_class


# Утилитарные функции для создания специфичных permission методов
def create_special_permission_method(
    permission: Permission, scopes: List[str], method_name: str, domain_name: str
) -> Callable:
    """
    Создать специальный permission метод.

    Args:
        permission: Permission enum
        scopes: OAuth2 scopes
        method_name: Имя метода
        domain_name: Имя домена для документации

    Returns:
        Callable: Статический метод permission
    """

    @staticmethod
    def special_method() -> Callable:
        return PermissionDependencyFactory.create_simple(permission, scopes)

    special_method.__name__ = method_name
    special_method.__doc__ = generate_method_docstring(method_name, domain_name)

    return special_method


def create_contextual_permission_method(
    permission: Permission,
    context_extractor: Callable[[Any], Dict],
    scopes: List[str],
    method_name: str,
    domain_name: str,
) -> Callable:
    """
    Создать контекстный permission метод.

    Args:
        permission: Permission enum
        context_extractor: Функция извлечения контекста
        scopes: OAuth2 scopes
        method_name: Имя метода
        domain_name: Имя домена для документации

    Returns:
        Callable: Статический метод permission
    """

    @staticmethod
    def contextual_method() -> Callable:
        return PermissionDependencyFactory.create_contextual(
            permission, context_extractor, scopes
        )

    contextual_method.__name__ = method_name
    contextual_method.__doc__ = generate_method_docstring(method_name, domain_name)

    return contextual_method
