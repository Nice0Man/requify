"""
Specification Management Service.

Сервис для управления спецификациями с полным циклом операций CRUD.
Следует принципам SOLID и архитектуре FSD.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
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
from app.core.constants import Permission, RoleScope
from app.utils.logger import logger
from app.core.security import EnhancedRolePermissionChecker


class SpecificationManagementService:
    """
    Сервис для управления спецификациями.
    
    Следует принципам SOLID:
    - Single Responsibility: отвечает только за управление спецификациями
    - Open/Closed: легко расширяется новыми операциями
    - Liskov Substitution: может быть заменен другой реализацией
    - Interface Segregation: четкий интерфейс для операций со спецификациями
    - Dependency Inversion: зависит от абстракций CRUD
    """

    def __init__(self):
        self.crud = specification_crud

    async def create_specification(
        self,
        db: AsyncSession,
        *,
        specification_in: SpecificationCreate,
        current_user: User,
    ) -> SpecificationResponse:
        """
        Создание новой спецификации.
        
        Args:
            db: Асинхронная сессия базы данных
            specification_in: Данные для создания спецификации
            current_user: Текущий пользователь
            
        Returns:
            SpecificationResponse: Созданная спецификация
            
        Raises:
            HTTPException: При отсутствии прав или ошибке валидации
        """
        logger.info(f"Creating specification: {specification_in.title}")
        
        # Проверка прав на создание спецификации
        if not EnhancedRolePermissionChecker.has_permission(
            current_user, Permission.CREATE_SPECIFICATION
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав для создания спецификации"
            )

        try:
            # Создание спецификации
            specification_data = specification_in.model_dump()
            specification_data["created_by"] = current_user.id
            specification_data["updated_by"] = current_user.id
            specification_data["status"] = SpecificationStatus.DRAFT.value

            specification = await self.crud.create(db, obj_in=specification_data)
            
            logger.info(f"Specification created successfully: {specification.id}")
            return SpecificationResponse.model_validate(specification)
            
        except Exception as e:
            logger.error(f"Error creating specification: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при создании спецификации"
            )

    async def get_specification(
        self,
        db: AsyncSession,
        *,
        specification_id: int,
        current_user: User,
    ) -> SpecificationResponse:
        """
        Получение спецификации по ID.
        
        Args:
            db: Асинхронная сессия базы данных
            specification_id: ID спецификации
            current_user: Текущий пользователь
            
        Returns:
            SpecificationResponse: Данные спецификации
            
        Raises:
            HTTPException: При отсутствии прав или спецификации
        """
        logger.info(f"Getting specification: {specification_id}")
        
        specification = await self.crud.get(db, id=specification_id)
        if not specification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Спецификация не найдена"
            )

        # Проверка прав на просмотр спецификации
        if not EnhancedRolePermissionChecker.has_permission(
            current_user, Permission.VIEW_SPECIFICATION
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав для просмотра спецификации"
            )

        return SpecificationResponse.model_validate(specification)

    async def update_specification(
        self,
        db: AsyncSession,
        *,
        specification_id: int,
        specification_in: SpecificationUpdate,
        current_user: User,
    ) -> SpecificationResponse:
        """
        Обновление спецификации.
        
        Args:
            db: Асинхронная сессия базы данных
            specification_id: ID спецификации
            specification_in: Данные для обновления
            current_user: Текущий пользователь
            
        Returns:
            SpecificationResponse: Обновленная спецификация
            
        Raises:
            HTTPException: При отсутствии прав или спецификации
        """
        logger.info(f"Updating specification: {specification_id}")
        
        specification = await self.crud.get(db, id=specification_id)
        if not specification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Спецификация не найдена"
            )

        # Проверка прав на редактирование спецификации
        if not EnhancedRolePermissionChecker.has_permission(
            current_user, Permission.EDIT_SPECIFICATION
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав для редактирования спецификации"
            )

        try:
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
            logger.error(f"Error updating specification: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при обновлении спецификации"
            )

    async def delete_specification(
        self,
        db: AsyncSession,
        *,
        specification_id: int,
        current_user: User,
    ) -> Dict[str, str]:
        """
        Удаление спецификации.
        
        Args:
            db: Асинхронная сессия базы данных
            specification_id: ID спецификации
            current_user: Текущий пользователь
            
        Returns:
            Dict[str, str]: Сообщение об успешном удалении
            
        Raises:
            HTTPException: При отсутствии прав или спецификации
        """
        logger.info(f"Deleting specification: {specification_id}")
        
        specification = await self.crud.get(db, id=specification_id)
        if not specification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Спецификация не найдена"
            )

        # Проверка прав на удаление спецификации
        if not EnhancedRolePermissionChecker.has_permission(
            current_user, Permission.DELETE_SPECIFICATION
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав для удаления спецификации"
            )

        try:
            await self.crud.remove(db, id=specification_id)
            logger.info(f"Specification deleted successfully: {specification_id}")
            return {"message": "Спецификация успешно удалена"}
            
        except Exception as e:
            logger.error(f"Error deleting specification: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при удалении спецификации"
            )

    async def get_specifications(
        self,
        db: AsyncSession,
        *,
        current_user: User,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        status: Optional[str] = None,
        project_id: Optional[int] = None,
    ) -> SpecificationListResponse:
        """
        Получение списка спецификаций с фильтрацией.
        
        Args:
            db: Асинхронная сессия базы данных
            current_user: Текущий пользователь
            skip: Количество записей для пропуска
            limit: Максимальное количество записей
            search: Поисковый запрос
            status: Фильтр по статусу
            project_id: Фильтр по проекту
            
        Returns:
            SpecificationListResponse: Список спецификаций с метаданными
            
        Raises:
            HTTPException: При отсутствии прав
        """
        logger.info("Getting specifications list")
        
        # Проверка прав на просмотр спецификаций
        if not EnhancedRolePermissionChecker.has_permission(
            current_user, Permission.VIEW_SPECIFICATION
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав для просмотра спецификаций"
            )

        try:
            specifications, total = await self.crud.get_multi_with_filters(
                db,
                skip=skip,
                limit=limit,
                search=search,
                status=status,
                project_id=project_id,
            )
            
            return SpecificationListResponse(
                specifications=[
                    SpecificationResponse.model_validate(spec) for spec in specifications
                ],
                total=total,
                skip=skip,
                limit=limit,
            )
            
        except Exception as e:
            logger.error(f"Error getting specifications: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при получении списка спецификаций"
            )

    async def generate_specification_document(
        self,
        db: AsyncSession,
        *,
        specification_id: int,
        current_user: User,
        format_type: str = "pdf",
    ) -> Dict[str, Any]:
        """
        Генерация документа спецификации.
        
        Args:
            db: Асинхронная сессия базы данных
            specification_id: ID спецификации
            current_user: Текущий пользователь
            format_type: Формат документа (pdf, docx, html)
            
        Returns:
            Dict[str, Any]: Информация о сгенерированном документе
            
        Raises:
            HTTPException: При отсутствии прав или спецификации
        """
        logger.info(f"Generating specification document: {specification_id}")
        
        specification = await self.crud.get(db, id=specification_id)
        if not specification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Спецификация не найдена"
            )

        # Проверка прав на генерацию документации
        if not EnhancedRolePermissionChecker.has_permission(
            current_user, Permission.GENERATE_DOCUMENTATION
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав для генерации документации"
            )

        try:
            # TODO: Реализовать генерацию документа
            # Здесь должна быть логика генерации документа в зависимости от format_type
            
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
            logger.error(f"Error generating specification document: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при генерации документа спецификации"
            )

    async def approve_specification(
        self,
        db: AsyncSession,
        *,
        specification_id: int,
        current_user: User,
    ) -> SpecificationResponse:
        """
        Утверждение спецификации.
        
        Args:
            db: Асинхронная сессия базы данных
            specification_id: ID спецификации
            current_user: Текущий пользователь
            
        Returns:
            SpecificationResponse: Утвержденная спецификация
            
        Raises:
            HTTPException: При отсутствии прав или спецификации
        """
        logger.info(f"Approving specification: {specification_id}")
        
        specification = await self.crud.get(db, id=specification_id)
        if not specification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Спецификация не найдена"
            )

        # Проверка прав на утверждение спецификации
        if not EnhancedRolePermissionChecker.has_permission(
            current_user, Permission.APPROVE_SPECIFICATION
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав для утверждения спецификации"
            )

        try:
            # Обновление статуса
            update_data = {
                "status": SpecificationStatus.APPROVED.value,
                "approved_by": current_user.id,
                "approved_at": datetime.now(UTC),
                "updated_by": current_user.id,
                "updated_at": datetime.now(UTC),
            }

            specification = await self.crud.update(
                db, db_obj=specification, obj_in=update_data
            )
            
            logger.info(f"Specification approved successfully: {specification_id}")
            return SpecificationResponse.model_validate(specification)
            
        except Exception as e:
            logger.error(f"Error approving specification: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при утверждении спецификации"
            )

    async def get_specification_requirements(
        self,
        db: AsyncSession,
        *,
        specification_id: int,
        current_user: User,
        skip: int = 0,
        limit: int = 100,
    ) -> Dict[str, Any]:
        """
        Получение требований спецификации.
        
        Args:
            db: Асинхронная сессия базы данных
            specification_id: ID спецификации
            current_user: Текущий пользователь
            skip: Количество записей для пропуска
            limit: Максимальное количество записей
            
        Returns:
            Dict[str, Any]: Список требований с метаданными
            
        Raises:
            HTTPException: При отсутствии прав или спецификации
        """
        logger.info(f"Getting specification requirements: {specification_id}")
        
        specification = await self.crud.get(db, id=specification_id)
        if not specification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Спецификация не найдена"
            )

        # Проверка прав на просмотр спецификации
        if not EnhancedRolePermissionChecker.has_permission(
            current_user, Permission.VIEW_SPECIFICATION
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав для просмотра спецификации"
            )

        try:
            # Получаем требования спецификации с использованием нового CRUD метода
            requirements = await self.crud.get_specification_requirements(
                db,
                specification_id=specification_id,
                skip=skip,
                limit=limit
            )
            
            # Получаем статистику спецификации
            stats = await self.crud.get_specification_stats(
                db,
                specification_id=specification_id
            )
            
            requirements_info = {
                "specification_id": specification_id,
                "requirements": [
                    {
                        "id": req.id,
                        "title": req.title,
                        "description": req.description,
                        "type_id": req.type_id,
                        "priority_id": req.priority_id,
                        "status_id": req.status_id,
                        "created_at": req.created_at.isoformat() if req.created_at else None,
                        "updated_at": req.updated_at.isoformat() if req.updated_at else None,
                    }
                    for req in requirements
                ],
                "total": stats["requirements_count"],
                "skip": skip,
                "limit": limit,
                "statistics": stats,
            }
            
            logger.info(f"Specification requirements retrieved: {specification_id}, total: {stats['requirements_count']}")
            return requirements_info
            
        except Exception as e:
            logger.error(f"Error getting specification requirements: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при получении требований спецификации"
            )

    async def add_requirements_to_specification(
        self,
        db: AsyncSession,
        *,
        specification_id: int,
        requirement_ids: List[int],
        current_user: User,
    ) -> Dict[str, Any]:
        """
        Добавление требований к спецификации.
        
        Args:
            db: Асинхронная сессия базы данных
            specification_id: ID спецификации
            requirement_ids: Список ID требований для добавления
            current_user: Текущий пользователь
            
        Returns:
            Dict[str, Any]: Результат операции
            
        Raises:
            HTTPException: При отсутствии прав или спецификации
        """
        logger.info(f"Adding requirements to specification: {specification_id}")
        
        specification = await self.crud.get(db, id=specification_id)
        if not specification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Спецификация не найдена"
            )

        # Проверка прав на редактирование спецификации
        if not EnhancedRolePermissionChecker.has_permission(
            current_user, Permission.EDIT_SPECIFICATION
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав для редактирования спецификации"
            )

        try:
            await self.crud.add_requirements_to_specification(
                db,
                specification_id=specification_id,
                requirement_ids=requirement_ids
            )
            
            logger.info(f"Requirements added to specification: {specification_id}")
            return {
                "specification_id": specification_id,
                "added_requirements": requirement_ids,
                "message": "Требования успешно добавлены к спецификации"
            }
            
        except Exception as e:
            logger.error(f"Error adding requirements to specification: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при добавлении требований к спецификации"
            )

    async def remove_requirements_from_specification(
        self,
        db: AsyncSession,
        *,
        specification_id: int,
        requirement_ids: List[int],
        current_user: User,
    ) -> Dict[str, Any]:
        """
        Удаление требований из спецификации.
        
        Args:
            db: Асинхронная сессия базы данных
            specification_id: ID спецификации
            requirement_ids: Список ID требований для удаления
            current_user: Текущий пользователь
            
        Returns:
            Dict[str, Any]: Результат операции
            
        Raises:
            HTTPException: При отсутствии прав или спецификации
        """
        logger.info(f"Removing requirements from specification: {specification_id}")
        
        specification = await self.crud.get(db, id=specification_id)
        if not specification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Спецификация не найдена"
            )

        # Проверка прав на редактирование спецификации
        if not EnhancedRolePermissionChecker.has_permission(
            current_user, Permission.EDIT_SPECIFICATION
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав для редактирования спецификации"
            )

        try:
            await self.crud.remove_requirements_from_specification(
                db,
                specification_id=specification_id,
                requirement_ids=requirement_ids
            )
            
            logger.info(f"Requirements removed from specification: {specification_id}")
            return {
                "specification_id": specification_id,
                "removed_requirements": requirement_ids,
                "message": "Требования успешно удалены из спецификации"
            }
            
        except Exception as e:
            logger.error(f"Error removing requirements from specification: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при удалении требований из спецификации"
            )

    async def reorder_requirements_in_specification(
        self,
        db: AsyncSession,
        *,
        specification_id: int,
        requirement_order: List[int],
        current_user: User,
    ) -> Dict[str, Any]:
        """
        Изменение порядка требований в спецификации.
        
        Args:
            db: Асинхронная сессия базы данных
            specification_id: ID спецификации
            requirement_order: Список ID требований в новом порядке
            current_user: Текущий пользователь
            
        Returns:
            Dict[str, Any]: Результат операции
            
        Raises:
            HTTPException: При отсутствии прав или спецификации
        """
        logger.info(f"Reordering requirements in specification: {specification_id}")
        
        specification = await self.crud.get(db, id=specification_id)
        if not specification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Спецификация не найдена"
            )

        # Проверка прав на редактирование спецификации
        if not EnhancedRolePermissionChecker.has_permission(
            current_user, Permission.EDIT_SPECIFICATION
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав для редактирования спецификации"
            )

        try:
            await self.crud.reorder_requirements_in_specification(
                db,
                specification_id=specification_id,
                requirement_order=requirement_order
            )
            
            logger.info(f"Requirements reordered in specification: {specification_id}")
            return {
                "specification_id": specification_id,
                "new_order": requirement_order,
                "message": "Порядок требований успешно изменен"
            }
            
        except Exception as e:
            logger.error(f"Error reordering requirements in specification: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при изменении порядка требований"
            )

    async def duplicate_specification(
        self,
        db: AsyncSession,
        *,
        specification_id: int,
        new_title: str,
        copy_requirements: bool = True,
        current_user: User,
    ) -> SpecificationResponse:
        """
        Дублирование спецификации.
        
        Args:
            db: Асинхронная сессия базы данных
            specification_id: ID исходной спецификации
            new_title: Название новой спецификации
            copy_requirements: Копировать ли требования
            current_user: Текущий пользователь
            
        Returns:
            SpecificationResponse: Новая спецификация
            
        Raises:
            HTTPException: При отсутствии прав или спецификации
        """
        logger.info(f"Duplicating specification: {specification_id}")
        
        specification = await self.crud.get(db, id=specification_id)
        if not specification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Спецификация не найдена"
            )

        # Проверка прав на создание спецификации
        if not EnhancedRolePermissionChecker.has_permission(
            current_user, Permission.CREATE_SPECIFICATION
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав для создания спецификации"
            )

        try:
            new_specification = await self.crud.duplicate_specification(
                db,
                specification_id=specification_id,
                new_title=new_title,
                copy_requirements=copy_requirements
            )
            
            logger.info(f"Specification duplicated: {specification_id} -> {new_specification.id}")
            return SpecificationResponse.from_orm(new_specification)
            
        except Exception as e:
            logger.error(f"Error duplicating specification: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при дублировании спецификации"
            )

    async def generate_specification_content(
        self,
        db: AsyncSession,
        *,
        specification_id: int,
        template: Optional[str] = None,
        current_user: User,
    ) -> Dict[str, Any]:
        """
        Генерация содержимого спецификации.
        
        Args:
            db: Асинхронная сессия базы данных
            specification_id: ID спецификации
            template: Шаблон для генерации (опционально)
            current_user: Текущий пользователь
            
        Returns:
            Dict[str, Any]: Сгенерированное содержимое
            
        Raises:
            HTTPException: При отсутствии прав или спецификации
        """
        logger.info(f"Generating specification content: {specification_id}")
        
        specification = await self.crud.get(db, id=specification_id)
        if not specification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Спецификация не найдена"
            )

        # Проверка прав на просмотр спецификации
        if not EnhancedRolePermissionChecker.has_permission(
            current_user, Permission.VIEW_SPECIFICATION
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав для просмотра спецификации"
            )

        try:
            content = await self.crud.generate_specification_content(
                db,
                specification_id=specification_id,
                template=template
            )
            
            logger.info(f"Specification content generated: {specification_id}")
            return {
                "specification_id": specification_id,
                "generated_content": content,
                "template_used": template is not None,
                "message": "Содержимое спецификации успешно сгенерировано"
            }
            
        except Exception as e:
            logger.error(f"Error generating specification content: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при генерации содержимого спецификации"
            )


# Создание экземпляра сервиса
specification_management_service = SpecificationManagementService()
