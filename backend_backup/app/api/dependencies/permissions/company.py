"""
Company management permission dependencies.

Специализированные dependencies для управления компаниями.
Следует стандартизированному интерфейсу.
"""

from typing import Callable
from app.core.constants import Permission
from .factory import PermissionDependencyFactory
from ._standard import StandardPermissionClass
from ._interface import DOMAIN_CONFIGS


class CompanyPermissions(StandardPermissionClass):
    """
    Company management permission dependencies.

    Стандартизированные permissions для управления компаниями
    с дополнительными специфичными методами.
    """

    # Конфигурация домена
    DOMAIN_CONFIG = DOMAIN_CONFIGS["Company"]

    # Специфичные методы для компаний
    @staticmethod
    def settings() -> Callable:
        """Dependency for company settings management."""
        return PermissionDependencyFactory.create_simple(
            Permission.MANAGE_COMPANY_SETTINGS, ["company:settings"]
        )

    @staticmethod
    def branding() -> Callable:
        """Dependency for company branding management."""
        return PermissionDependencyFactory.create_simple(
            Permission.MANAGE_PROJECT, ["company:branding"]
        )

    @staticmethod
    def subscription() -> Callable:
        """Dependency for company subscription management."""
        return PermissionDependencyFactory.create_simple(
            Permission.MANAGE_COMPANY, ["company:subscription"]
        )

    @staticmethod
    def contact() -> Callable:
        """Dependency for company contact management."""
        return PermissionDependencyFactory.create_simple(
            Permission.MANAGE_PROJECT, ["company:contact"]
        )


# Экспорты для обратной совместимости и современного использования
_exports = CompanyPermissions.get_exports()
_legacy_functions = CompanyPermissions.get_legacy_functions()

# Основные exports
company_read_required = _exports.get("companypermissions_read")
company_write_required = _exports.get("companypermissions_write")
company_admin_required = _exports.get("companypermissions_admin")

# Специфичные exports
company_settings_required = CompanyPermissions.settings()
company_branding_required = CompanyPermissions.branding()
company_subscription_required = CompanyPermissions.subscription()
company_contact_required = CompanyPermissions.contact()
