"""
API endpoints для расширенной системы ролей.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.services.enhanced_role_service import enhanced_role_service
from app.schemas.enhanced_role import (
    EnhancedRoleCreate,
    EnhancedRoleUpdate,
    EnhancedRoleResponse,
    UserRoleAssignmentCreate,
    UserRoleAssignmentUpdate,
    UserRoleAssignmentResponse,
    UserRoleAssignmentWithDetails,
    RoleListResponse,
    UserRoleAssignmentListResponse,
    RoleScope,
    RoleFilter,
    AssignmentFilter,
)

router = APIRouter()


# Endpoints для управления ролями


@router.post(
    "/roles", response_model=EnhancedRoleResponse, status_code=status.HTTP_201_CREATED
)
def create_role(
    *,
    role_in: EnhancedRoleCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> EnhancedRoleResponse:
    """
    Создать новую роль.

    Требует права на создание ролей (системный администратор).
    """
    role = enhanced_role_service.create_role(
        db=db, role_data=role_in, current_user=current_user
    )

    return EnhancedRoleResponse(**role.__dict__)


@router.get("/roles/{role_id}", response_model=EnhancedRoleResponse)
def get_role(
    role_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> EnhancedRoleResponse:
    """
    Получить роль по ID.
    """
    role = enhanced_role_service.get_role(
        db=db, role_id=role_id, current_user=current_user
    )

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Role not found"
        )

    return EnhancedRoleResponse(**role.__dict__)


@router.put("/roles/{role_id}", response_model=EnhancedRoleResponse)
def update_role(
    *,
    role_id: int,
    role_in: EnhancedRoleUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> EnhancedRoleResponse:
    """
    Обновить роль.

    Требует права на редактирование ролей.
    """
    role = enhanced_role_service.update_role(
        db=db, role_id=role_id, role_data=role_in, current_user=current_user
    )

    return EnhancedRoleResponse(**role.__dict__)


@router.delete("/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(
    role_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Удалить роль.

    Требует права на удаление ролей.
    Роль не может быть удалена, если она назначена пользователям.
    """
    enhanced_role_service.delete_role(db=db, role_id=role_id, current_user=current_user)


@router.get("/roles", response_model=List[EnhancedRoleResponse])
def list_roles(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    scope: Optional[RoleScope] = Query(None, description="Фильтр по области действия"),
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(
        100, ge=1, le=1000, description="Максимальное количество записей"
    ),
) -> List[EnhancedRoleResponse]:
    """
    Получить список ролей.

    Можно фильтровать по области действия.
    """
    if scope:
        roles = enhanced_role_service.get_roles_by_scope(
            db=db, scope=scope, current_user=current_user, skip=skip, limit=limit
        )
    else:
        # Получить все роли (требует реализации в сервисе)
        roles = enhanced_role_service.get_roles_by_scope(
            db=db,
            scope=RoleScope.SYSTEM,  # Пример, нужно доработать
            current_user=current_user,
            skip=skip,
            limit=limit,
        )

    return [EnhancedRoleResponse(**role.__dict__) for role in roles]


@router.get("/roles/assignable", response_model=List[EnhancedRoleResponse])
def get_assignable_roles(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    scope: Optional[RoleScope] = Query(None, description="Фильтр по области действия"),
) -> List[EnhancedRoleResponse]:
    """
    Получить роли, которые можно назначать.

    Возвращает только активные роли с флагом is_assignable=True.
    """
    roles = enhanced_role_service.get_assignable_roles(
        db=db, scope=scope, current_user=current_user
    )

    return [EnhancedRoleResponse(**role.__dict__) for role in roles]


@router.get("/roles/search", response_model=List[EnhancedRoleResponse])
def search_roles(
    q: str = Query(..., min_length=1, description="Поисковый запрос"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    scope: Optional[RoleScope] = Query(None, description="Фильтр по области действия"),
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(
        100, ge=1, le=1000, description="Максимальное количество записей"
    ),
) -> List[EnhancedRoleResponse]:
    """
    Поиск ролей по названию и описанию.
    """
    roles = enhanced_role_service.search_roles(
        db=db, query=q, scope=scope, current_user=current_user, skip=skip, limit=limit
    )

    return [EnhancedRoleResponse(**role.__dict__) for role in roles]


# Endpoints для управления назначениями ролей


@router.post(
    "/assignments",
    response_model=UserRoleAssignmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def assign_role(
    *,
    assignment_in: UserRoleAssignmentCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> UserRoleAssignmentResponse:
    """
    Назначить роль пользователю в определенном контексте.

    Требует права на назначение ролей.
    """
    assignment = enhanced_role_service.assign_role(
        db=db, assignment_data=assignment_in, current_user=current_user
    )

    return UserRoleAssignmentResponse(**assignment.__dict__)


@router.delete(
    "/assignments/{assignment_id}", response_model=UserRoleAssignmentResponse
)
def revoke_role_assignment(
    assignment_id: int,
    reason: Optional[str] = Query(None, description="Причина отзыва роли"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> UserRoleAssignmentResponse:
    """
    Отозвать назначение роли.

    Требует права на отзыв назначений ролей.
    """
    assignment = enhanced_role_service.revoke_role_assignment(
        db=db, assignment_id=assignment_id, reason=reason, current_user=current_user
    )

    return UserRoleAssignmentResponse(**assignment.__dict__)


@router.post(
    "/assignments/{assignment_id}/approve", response_model=UserRoleAssignmentResponse
)
def approve_role_assignment(
    assignment_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> UserRoleAssignmentResponse:
    """
    Одобрить назначение роли.

    Используется для ролей, которые требуют одобрения.
    """
    assignment = enhanced_role_service.approve_role_assignment(
        db=db, assignment_id=assignment_id, current_user=current_user
    )

    return UserRoleAssignmentResponse(**assignment.__dict__)


@router.post(
    "/assignments/{assignment_id}/extend", response_model=UserRoleAssignmentResponse
)
def extend_role_assignment(
    assignment_id: int,
    days: int = Query(..., ge=1, le=365, description="Количество дней для продления"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> UserRoleAssignmentResponse:
    """
    Продлить назначение роли.

    Продлевает срок действия роли на указанное количество дней.
    """
    assignment = enhanced_role_service.extend_role_assignment(
        db=db, assignment_id=assignment_id, days=days, current_user=current_user
    )

    return UserRoleAssignmentResponse(**assignment.__dict__)


@router.get(
    "/users/{user_id}/assignments", response_model=List[UserRoleAssignmentResponse]
)
def get_user_role_assignments(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    active_only: bool = Query(True, description="Показать только активные назначения"),
) -> List[UserRoleAssignmentResponse]:
    """
    Получить назначения ролей пользователя.

    Пользователь может просматривать свои назначения,
    администраторы могут просматривать назначения любых пользователей.
    """
    assignments = enhanced_role_service.get_user_role_assignments(
        db=db, user_id=user_id, current_user=current_user, active_only=active_only
    )

    return [
        UserRoleAssignmentResponse(**assignment.__dict__) for assignment in assignments
    ]


@router.get(
    "/assignments/context/{scope}/{context_id}",
    response_model=List[UserRoleAssignmentResponse],
)
def get_assignments_by_context(
    scope: RoleScope,
    context_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    active_only: bool = Query(True, description="Показать только активные назначения"),
) -> List[UserRoleAssignmentResponse]:
    """
    Получить назначения ролей в определенном контексте.

    Например, все роли в конкретной компании, департаменте, команде или проекте.
    """
    assignments = enhanced_role_service.get_assignments_by_context(
        db=db,
        scope=scope,
        context_id=context_id,
        current_user=current_user,
        active_only=active_only,
    )

    return [
        UserRoleAssignmentResponse(**assignment.__dict__) for assignment in assignments
    ]


# Административные endpoints


@router.post("/assignments/cleanup", response_model=Dict[str, Any])
def cleanup_expired_assignments(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Очистить истекшие назначения ролей.

    Удаляет все назначения ролей с истекшим сроком действия.
    Доступно только системным администраторам.
    """
    return enhanced_role_service.cleanup_expired_assignments(
        db=db, current_user=current_user
    )


# Endpoints для получения информации о разрешениях


@router.get("/scopes", response_model=List[str])
def get_available_scopes() -> List[str]:
    """
    Получить доступные области действия ролей.
    """
    return [scope.value for scope in RoleScope]


@router.get(
    "/permissions/user/{user_id}/context/{scope}/{context_id}", response_model=List[str]
)
def get_user_permissions_in_context(
    user_id: int,
    scope: RoleScope,
    context_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> List[str]:
    """
    Получить разрешения пользователя в определенном контексте.

    Возвращает список всех разрешений, которые пользователь имеет
    в указанном контексте через назначенные роли.
    """
    # TODO: Реализовать логику получения разрешений
    # Это требует дополнительной логики в сервисе
    return []


@router.get("/permissions/check", response_model=Dict[str, bool])
def check_permissions(
    user_id: int,
    permissions: List[str] = Query(..., description="Список разрешений для проверки"),
    scope: Optional[RoleScope] = Query(None, description="Область действия"),
    context_id: Optional[int] = Query(None, description="ID контекста"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, bool]:
    """
    Проверить наличие разрешений у пользователя.

    Возвращает словарь с результатами проверки каждого разрешения.
    """
    # TODO: Реализовать логику проверки разрешений
    # Это требует дополнительной логики в сервисе
    return {permission: False for permission in permissions}
