"""
API endpoints для управления иерархией ролей (DAG).
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.core.auth import get_current_user
from app.api.dependencies.core.database import get_async_session
from app.api.dependencies.permissions.base import require_permission
from app.core.constants import Permission
from app.models.user import User
from app.models.role_hierarchy import InheritanceType
from app.schemas.role_hierarchy import (
    RoleHierarchyCreate,
    RoleHierarchyUpdate,
    RoleHierarchyResponse,
    RoleHierarchyValidationRequest,
    RoleHierarchyValidationResponse,
    RoleInheritanceInfo,
    InheritancePathResponse,
    RoleHierarchyStatsResponse,
    BulkRoleHierarchyCreate,
    BulkRoleHierarchyResponse,
    RoleConflictInfo,
)
from app.schemas.enhanced_role import EnhancedRoleResponse
from app.services.role_service import role_service
from app.services.role_hierarchy_service import role_hierarchy_service
from app.crud.role_hierarchy import role_hierarchy

router = APIRouter(prefix="/hierarchy", tags=["Role Hierarchy"])


@router.post(
    "/create",
    response_model=RoleHierarchyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Создать связь наследования ролей",
    description="Создает новую связь наследования между родительской и дочерней ролью",
)
async def create_role_inheritance(
    hierarchy_data: RoleHierarchyCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_permission(Permission.ROLE_MANAGE)),
) -> RoleHierarchyResponse:
    """Создать связь наследования ролей."""
    try:
        hierarchy = await role_service.create_role_inheritance(
            db=db,
            parent_role_id=hierarchy_data.parent_role_id,
            child_role_id=hierarchy_data.child_role_id,
            inheritance_type=hierarchy_data.inheritance_type,
            conditions=hierarchy_data.conditions,
            priority=hierarchy_data.priority,
            created_by=current_user.id,
        )

        # Преобразуем в ответ
        response = RoleHierarchyResponse.model_validate(hierarchy)
        response.is_effective = hierarchy.is_effective

        # Добавляем названия ролей
        if hasattr(hierarchy, "parent_role") and hierarchy.parent_role:
            response.parent_role_name = hierarchy.parent_role.name
        if hasattr(hierarchy, "child_role") and hierarchy.child_role:
            response.child_role_name = hierarchy.child_role.name

        return response

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка создания связи наследования: {str(e)}",
        )


@router.delete(
    "/{parent_role_id}/{child_role_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Удалить связь наследования ролей",
    description="Удаляет связь наследования между родительской и дочерней ролью",
)
async def remove_role_inheritance(
    parent_role_id: int,
    child_role_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_permission(Permission.ROLE_MANAGE)),
):
    """Удалить связь наследования ролей."""
    try:
        success = await role_service.remove_role_inheritance(
            db=db,
            parent_role_id=parent_role_id,
            child_role_id=child_role_id,
            removed_by=current_user.id,
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Связь наследования не найдена",
            )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка удаления связи наследования: {str(e)}",
        )


@router.get(
    "/role/{role_id}/ancestors",
    response_model=List[EnhancedRoleResponse],
    summary="Получить предков роли",
    description="Возвращает список всех родительских ролей (предков) для указанной роли",
)
async def get_role_ancestors(
    role_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_permission(Permission.ROLE_READ)),
) -> List[EnhancedRoleResponse]:
    """Получить предков роли."""
    try:
        ancestors = await role_service.get_role_ancestors(db, role_id)
        return [EnhancedRoleResponse.model_validate(role) for role in ancestors]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка получения предков роли: {str(e)}",
        )


@router.get(
    "/role/{role_id}/descendants",
    response_model=List[EnhancedRoleResponse],
    summary="Получить потомков роли",
    description="Возвращает список всех дочерних ролей (потомков) для указанной роли",
)
async def get_role_descendants(
    role_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_permission(Permission.ROLE_READ)),
) -> List[EnhancedRoleResponse]:
    """Получить потомков роли."""
    try:
        descendants = await role_service.get_role_descendants(db, role_id)
        return [EnhancedRoleResponse.model_validate(role) for role in descendants]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка получения потомков роли: {str(e)}",
        )


@router.get(
    "/role/{role_id}/info",
    response_model=RoleInheritanceInfo,
    summary="Получить информацию о наследовании роли",
    description="Возвращает полную информацию о наследовании роли, включая эффективные разрешения",
)
async def get_role_inheritance_info(
    role_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_permission(Permission.ROLE_READ)),
) -> RoleInheritanceInfo:
    """Получить информацию о наследовании роли."""
    try:
        # Получаем роль
        from app.crud.enhanced_role import enhanced_role

        role = await enhanced_role.get(db, id=role_id)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Роль не найдена"
            )

        # Получаем разрешения
        effective_permissions = await role_service.get_role_effective_permissions(
            db, role_id
        )
        direct_permissions = role.get_permissions()
        inherited_permissions = effective_permissions - direct_permissions

        # Получаем предков и потомков
        ancestor_ids = await role_hierarchy_service.get_role_ancestors(db, role_id)
        descendant_ids = await role_hierarchy_service.get_role_descendants(db, role_id)

        return RoleInheritanceInfo(
            role_id=role_id,
            role_name=role.name,
            effective_permissions=effective_permissions,
            direct_permissions=direct_permissions,
            inherited_permissions=inherited_permissions,
            parent_roles=ancestor_ids,
            child_roles=descendant_ids,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка получения информации о роли: {str(e)}",
        )


@router.get(
    "/path/{source_role_id}/{target_role_id}",
    response_model=Optional[InheritancePathResponse],
    summary="Найти путь наследования между ролями",
    description="Находит путь наследования от исходной роли к целевой роли",
)
async def find_inheritance_path(
    source_role_id: int,
    target_role_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_permission(Permission.ROLE_READ)),
) -> Optional[InheritancePathResponse]:
    """Найти путь наследования между ролями."""
    try:
        path_data = await role_service.find_inheritance_path(
            db, source_role_id, target_role_id
        )

        if not path_data:
            return InheritancePathResponse(
                source_role_id=source_role_id,
                target_role_id=target_role_id,
                path_exists=False,
                path_steps=[],
                effective_permissions=set(),
            )

        # Преобразуем в схему ответа
        from app.schemas.role_hierarchy import InheritancePathStep

        path_steps = []
        for i, role_id in enumerate(path_data["path"]):
            if i < len(path_data["inheritance_rules"]):
                rule = path_data["inheritance_rules"][i]
                path_steps.append(
                    InheritancePathStep(
                        role_id=role_id,
                        role_name=f"Role_{role_id}",  # TODO: получить реальное имя
                        inheritance_type=InheritanceType(rule["inheritance_type"]),
                        priority=rule["priority"],
                    )
                )

        return InheritancePathResponse(
            source_role_id=source_role_id,
            target_role_id=target_role_id,
            path_exists=True,
            path_steps=path_steps,
            effective_permissions=set(path_data["effective_permissions"]),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка поиска пути наследования: {str(e)}",
        )


@router.post(
    "/validate",
    response_model=RoleHierarchyValidationResponse,
    summary="Валидировать связь наследования",
    description="Проверяет, можно ли создать связь наследования между ролями",
)
async def validate_role_inheritance(
    validation_request: RoleHierarchyValidationRequest,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_permission(Permission.ROLE_READ)),
) -> RoleHierarchyValidationResponse:
    """Валидировать связь наследования."""
    try:
        is_valid, errors = await role_service.validate_role_inheritance(
            db=db,
            parent_role_id=validation_request.parent_role_id,
            child_role_id=validation_request.child_role_id,
        )

        return RoleHierarchyValidationResponse(
            is_valid=is_valid, errors=errors, warnings=[]
        )

    except Exception as e:
        return RoleHierarchyValidationResponse(
            is_valid=False, errors=[f"Ошибка валидации: {str(e)}"], warnings=[]
        )


@router.get(
    "/conflicts",
    response_model=List[RoleConflictInfo],
    summary="Получить конфликты в иерархии ролей",
    description="Возвращает список обнаруженных конфликтов в иерархии ролей",
)
async def get_hierarchy_conflicts(
    role_id: Optional[int] = Query(
        None, description="ID роли для проверки (если не указан, проверяются все роли)"
    ),
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_permission(Permission.ROLE_READ)),
) -> List[RoleConflictInfo]:
    """Получить конфликты в иерархии ролей."""
    try:
        conflicts_data = await role_service.get_hierarchy_conflicts(db, role_id)

        conflicts = []
        for conflict in conflicts_data:
            conflicts.append(
                RoleConflictInfo(
                    conflict_type=conflict["type"],
                    description=conflict["description"],
                    affected_roles=conflict.get("affected_relationships", []),
                    severity="medium",  # TODO: вычислять серьезность
                    suggested_fix=None,  # TODO: добавить предложения по исправлению
                )
            )

        return conflicts

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка получения конфликтов: {str(e)}",
        )


@router.get(
    "/stats",
    response_model=RoleHierarchyStatsResponse,
    summary="Получить статистику иерархии ролей",
    description="Возвращает статистику по иерархии ролей",
)
async def get_hierarchy_stats(
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_permission(Permission.ROLE_READ)),
) -> RoleHierarchyStatsResponse:
    """Получить статистику иерархии ролей."""
    try:
        # Получаем базовую статистику
        from app.crud.enhanced_role import enhanced_role

        all_roles = await enhanced_role.get_multi(db)
        all_relationships = await role_hierarchy.get_effective_relationships(db)

        # Подсчитываем статистику
        total_roles = len(all_roles)
        total_relationships = len(all_relationships)
        active_relationships = len([r for r in all_relationships if r.is_active])

        # Распределение типов наследования
        inheritance_types_distribution = {}
        for rel in all_relationships:
            itype = rel.inheritance_type.value
            inheritance_types_distribution[itype] = (
                inheritance_types_distribution.get(itype, 0) + 1
            )

        # Вычисляем максимальную глубину
        max_depth = 0
        for role in all_roles:
            ancestors = await role_hierarchy_service.get_role_ancestors(db, role.id)
            depth = len(ancestors)
            max_depth = max(max_depth, depth)

        # Роли с множественными родителями
        roles_with_multiple_parents = 0
        for role in all_roles:
            parent_count = len(
                await role_hierarchy.get_child_relationships(db, role_id=role.id)
            )
            if parent_count > 1:
                roles_with_multiple_parents += 1

        # Сиротские роли (без родителей и детей)
        orphaned_roles = 0
        for role in all_roles:
            parents = await role_hierarchy.get_child_relationships(db, role_id=role.id)
            children = await role_hierarchy.get_parent_relationships(
                db, role_id=role.id
            )
            if not parents and not children:
                orphaned_roles += 1

        # Получаем конфликты
        conflicts_data = await role_service.get_hierarchy_conflicts(db)
        potential_conflicts = [
            RoleConflictInfo(
                conflict_type=conflict["type"],
                description=conflict["description"],
                affected_roles=conflict.get("affected_relationships", []),
                severity="medium",
                suggested_fix=None,
            )
            for conflict in conflicts_data
        ]

        return RoleHierarchyStatsResponse(
            total_roles=total_roles,
            total_relationships=total_relationships,
            active_relationships=active_relationships,
            inheritance_types_distribution=inheritance_types_distribution,
            max_depth=max_depth,
            roles_with_multiple_parents=roles_with_multiple_parents,
            orphaned_roles=orphaned_roles,
            potential_conflicts=potential_conflicts,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка получения статистики: {str(e)}",
        )


@router.post(
    "/bulk-create",
    response_model=BulkRoleHierarchyResponse,
    summary="Массовое создание связей наследования",
    description="Создает множественные связи наследования за одну операцию",
)
async def bulk_create_role_inheritance(
    bulk_data: BulkRoleHierarchyCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_permission(Permission.ROLE_MANAGE)),
) -> BulkRoleHierarchyResponse:
    """Массовое создание связей наследования."""
    created_count = 0
    skipped_count = 0
    errors = []
    created_relationships = []

    for hierarchy_data in bulk_data.relationships:
        try:
            # Валидация, если включена
            if bulk_data.validate_dag:
                is_valid, validation_errors = (
                    await role_service.validate_role_inheritance(
                        db=db,
                        parent_role_id=hierarchy_data.parent_role_id,
                        child_role_id=hierarchy_data.child_role_id,
                    )
                )

                if not is_valid:
                    if bulk_data.skip_conflicts:
                        skipped_count += 1
                        errors.append(
                            f"Пропущена связь {hierarchy_data.parent_role_id}->{hierarchy_data.child_role_id}: {'; '.join(validation_errors)}"
                        )
                        continue
                    else:
                        errors.append(
                            f"Ошибка валидации {hierarchy_data.parent_role_id}->{hierarchy_data.child_role_id}: {'; '.join(validation_errors)}"
                        )
                        continue

            # Создаем связь
            hierarchy = await role_service.create_role_inheritance(
                db=db,
                parent_role_id=hierarchy_data.parent_role_id,
                child_role_id=hierarchy_data.child_role_id,
                inheritance_type=hierarchy_data.inheritance_type,
                conditions=hierarchy_data.conditions,
                priority=hierarchy_data.priority,
                created_by=current_user.id,
            )

            created_count += 1
            created_relationships.append(
                RoleHierarchyResponse.model_validate(hierarchy)
            )

        except Exception as e:
            if bulk_data.skip_conflicts:
                skipped_count += 1
                errors.append(
                    f"Пропущена связь {hierarchy_data.parent_role_id}->{hierarchy_data.child_role_id}: {str(e)}"
                )
            else:
                errors.append(
                    f"Ошибка создания {hierarchy_data.parent_role_id}->{hierarchy_data.child_role_id}: {str(e)}"
                )

    return BulkRoleHierarchyResponse(
        created_count=created_count,
        skipped_count=skipped_count,
        errors=errors,
        created_relationships=created_relationships,
    )
