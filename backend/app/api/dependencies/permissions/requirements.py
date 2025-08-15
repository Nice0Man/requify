"""
Requirements management permission dependencies.
"""

from typing import Callable
from app.core.constants import Permission
from .factory import PermissionDependencyFactory
from ._standard import StandardPermissionClass
from ._interface import DOMAIN_CONFIGS


class RequirementPermissions(StandardPermissionClass):
    """
    Requirements management permission dependencies.

    Стандартизированные permissions для управления требованиями.
    """

    # Конфигурация домена
    DOMAIN_CONFIG = DOMAIN_CONFIGS["Requirement"]

    # Специфичные методы для требований
    @staticmethod
    def approve() -> Callable:
        """Dependency for approving requirements."""
        return PermissionDependencyFactory.create_simple(
            Permission.APPROVE_REQUIREMENT, ["requirement:approve"]
        )


# Экспорты для обратной совместимости и современного использования
_exports = RequirementPermissions.get_exports()
_legacy_functions = RequirementPermissions.get_legacy_functions()

# Backward compatibility
get_requirements_read_user = _legacy_functions.get("get_requirement_read_user")
get_requirements_write_user = _legacy_functions.get("get_requirement_write_user")
get_requirements_delete_user = _legacy_functions.get("get_requirement_delete_user")
get_requirement_creator_user = RequirementPermissions.create()
get_requirement_approver_user = RequirementPermissions.approve()

# Modern exports
requirement_read_required = _exports.get("requirementpermissions_read")
requirement_write_required = _exports.get("requirementpermissions_write")
requirement_create_required = _exports.get("requirementpermissions_create")
requirement_delete_required = _exports.get("requirementpermissions_delete")
requirement_admin_required = _exports.get("requirementpermissions_admin")

# Специфичные exports
requirement_approve_required = RequirementPermissions.approve()
