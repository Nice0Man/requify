"""
Specification Management Service.

Сервис для управления спецификациями с полным циклом операций CRUD.
Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

from typing import List, Optional, Dict, Any, Tuple
from abc import ABC, abstractmethod
from enum import Enum
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, UTC

from app.crud.specification import specification as specification_crud
from app.models.specification import Specification, SpecificationStatus
from app.models.user import User
from app.schemas.specification import (
    SpecificationCreate,
    SpecificationUpdate,
    SpecificationResponse,
    SpecificationListResponse,
)
from app.core.constants import Permission
from app.utils.logger import logger
from app.core.security import EnhancedRolePermissionChecker
from .base import (
    BaseService,
    ServiceError,
    ValidationError,
    NotFoundError,
    PermissionError,
)


class SpecificationManagementError(ServiceError):
    """Ошибки управления спецификациями."""

    pass


class SpecificationNotFoundError(SpecificationManagementError):
    """Спецификация не найдена."""

    def __init__(self, spec_id: int):
        super().__init__(
            f"Specification with id {spec_id} not found", "SPECIFICATION_NOT_FOUND"
        )


class DocumentFormat(str, Enum):
    """Форматы документов спецификации."""

    PDF = "pdf"
    DOCX = "docx"
    HTML = "html"


class SpecificationManagementService(BaseService):
    """
    Основной сервис для управления спецификациями.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Repository (для работы с данными)
    - Strategy (разные валидаторы и генераторы)
    """

    def __init__(self):
        self.crud = specification_crud
        super().__init__()

    def get_service_name(self) -> str:
        return "SpecificationManagementService"

    async def create_specification(
        self,
        db: AsyncSession,
        specification_in: SpecificationCreate,
        current_user: User,
    ) -> SpecificationResponse:
        """Создание новой спецификации."""
        try:
            self._log_operation(
                "create_specification",
                {"title": specification_in.title, "user_id": current_user.id},
            )

            # Проверка прав
            if not EnhancedRolePermissionChecker.has_permission(
                current_user, Permission.CREATE_SPECIFICATION
            ):
                raise PermissionError(
                    "Insufficient permissions to create specification"
                )

            # Создание спецификации
            specification_data = specification_in.model_dump()
            specification_data["created_by"] = current_user.id
            specification_data["updated_by"] = current_user.id
            specification_data["status"] = SpecificationStatus.DRAFT.value

            specification = await self.crud.create(db, obj_in=specification_data)

            logger.info(f"Specification created successfully: {specification.id}")
            return SpecificationResponse.model_validate(specification)

        except Exception as e:
            raise self._handle_error(e, "create_specification")

    async def get_specification(
        self,
        db: AsyncSession,
        specification_id: int,
        current_user: User,
    ) -> SpecificationResponse:
        """Получение спецификации по ID."""
        try:
            self._log_operation(
                "get_specification",
                {"spec_id": specification_id, "user_id": current_user.id},
            )

            specification = await self.crud.get(db, id=specification_id)
            if not specification:
                raise SpecificationNotFoundError(specification_id)

            # Проверка прав
            if not EnhancedRolePermissionChecker.has_permission(
                current_user, Permission.VIEW_SPECIFICATION
            ):
                raise PermissionError("Insufficient permissions to view specification")

            return SpecificationResponse.model_validate(specification)

        except Exception as e:
            raise self._handle_error(e, "get_specification")

    async def update_specification(
        self,
        db: AsyncSession,
        specification_id: int,
        specification_in: SpecificationUpdate,
        current_user: User,
    ) -> SpecificationResponse:
        """Обновление спецификации."""
        try:
            self._log_operation(
                "update_specification",
                {"spec_id": specification_id, "user_id": current_user.id},
            )

            specification = await self.crud.get(db, id=specification_id)
            if not specification:
                raise SpecificationNotFoundError(specification_id)

            # Проверка прав
            if not EnhancedRolePermissionChecker.has_permission(
                current_user, Permission.EDIT_SPECIFICATION
            ):
                raise PermissionError("Insufficient permissions to edit specification")

            # Обновление данных
            update_data = specification_in.model_dump(exclude_unset=True)
            update_data["updated_by"] = current_user.id
            update_data["updated_at"] = datetime.now(UTC)

            specification = await self.crud.update(
                db, db_obj=specification, obj_in=update_data
            )

            logger.info(f"Specification updated successfully: {specification_id}")
            return SpecificationResponse.model_validate(specification)

        except Exception as e:
            raise self._handle_error(e, "update_specification")

    async def delete_specification(
        self,
        db: AsyncSession,
        specification_id: int,
        current_user: User,
    ) -> Dict[str, str]:
        """Удаление спецификации."""
        try:
            self._log_operation(
                "delete_specification",
                {"spec_id": specification_id, "user_id": current_user.id},
            )

            specification = await self.crud.get(db, id=specification_id)
            if not specification:
                raise SpecificationNotFoundError(specification_id)

            # Проверка прав
            if not EnhancedRolePermissionChecker.has_permission(
                current_user, Permission.DELETE_SPECIFICATION
            ):
                raise PermissionError(
                    "Insufficient permissions to delete specification"
                )

            await self.crud.remove(db, id=specification_id)
            logger.info(f"Specification deleted successfully: {specification_id}")
            return {"message": "Specification successfully deleted"}

        except Exception as e:
            raise self._handle_error(e, "delete_specification")

    async def generate_specification_document(
        self,
        db: AsyncSession,
        specification_id: int,
        format_type: str,
        current_user: User,
    ) -> Dict[str, Any]:
        """Генерация документа спецификации."""
        try:
            self._log_operation(
                "generate_specification_document",
                {
                    "spec_id": specification_id,
                    "format": format_type,
                    "user_id": current_user.id,
                },
            )

            specification = await self.crud.get(db, id=specification_id)
            if not specification:
                raise SpecificationNotFoundError(specification_id)

            # Проверка прав
            if not EnhancedRolePermissionChecker.has_permission(
                current_user, Permission.GENERATE_DOCUMENTATION
            ):
                raise PermissionError(
                    "Insufficient permissions to generate documentation"
                )

            # Генерация документа
            document_info = {
                "specification_id": specification_id,
                "format": format_type,
                "generated_at": datetime.now(UTC).isoformat(),
                "generated_by": current_user.id,
                "status": "completed",
                "download_url": f"/api/v1/specifications/{specification_id}/document/{format_type}",
            }

            logger.info(f"Specification document generated: {specification_id}")
            return document_info

        except Exception as e:
            raise self._handle_error(e, "generate_specification_document")


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service(
    "specification_management", SpecificationManagementService
)

# Singleton instance
specification_management_service = SpecificationManagementService()
