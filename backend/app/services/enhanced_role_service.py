"""
Сервис для бизнес-логики расширенной системы ролей.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timezone, timedelta

from app.crud.enhanced_role import (
    enhanced_role as role_crud,
    user_role_assignment as assignment_crud,
)
from app.models.enhanced_role_system import EnhancedRole, UserRoleAssignment
from app.models.user import User
from app.schemas.enhanced_role import (
    EnhancedRoleCreate,
    EnhancedRoleUpdate,
    EnhancedRoleResponse,
    UserRoleAssignmentCreate,
    UserRoleAssignmentUpdate,
    UserRoleAssignmentResponse,
    UserRoleAssignmentWithDetails,
    RoleScope,
    RoleFilter,
    AssignmentFilter,
)


class EnhancedRoleService:
    """Сервис для работы с расширенной системой ролей"""

    def __init__(self):
        self.role_crud = role_crud
        self.assignment_crud = assignment_crud

    # Методы для работы с ролями

    def create_role(
        self, db: Session, *, role_data: EnhancedRoleCreate, current_user: User
    ) -> EnhancedRole:
        """Создать новую роль"""

        # Проверить права на создание ролей
        if not self._can_create_roles(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to create roles",
            )

        # Проверить уникальность имени роли
        existing_role = self.role_crud.get_by_name(db, name=role_data.name)
        if existing_role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role with this name already exists",
            )

        return self.role_crud.create(db, obj_in=role_data)

    def get_role(
        self, db: Session, *, role_id: int, current_user: User
    ) -> Optional[EnhancedRole]:
        """Получить роль по ID"""

        role = self.role_crud.get(db, id=role_id)
        if not role:
            return None

        # Проверить права доступа
        if not self._can_access_role(current_user, role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
            )

        return role

    def update_role(
        self,
        db: Session,
        *,
        role_id: int,
        role_data: EnhancedRoleUpdate,
        current_user: User,
    ) -> EnhancedRole:
        """Обновить роль"""

        role = self.role_crud.get(db, id=role_id)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Role not found"
            )

        # Проверить права на редактирование
        if not self._can_edit_role(current_user, role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to edit role",
            )

        # Проверить уникальность имени при изменении
        if role_data.name and role_data.name != role.name:
            existing_role = self.role_crud.get_by_name(db, name=role_data.name)
            if existing_role:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Role with this name already exists",
                )

        return self.role_crud.update(db, db_obj=role, obj_in=role_data)

    def delete_role(self, db: Session, *, role_id: int, current_user: User) -> bool:
        """Удалить роль"""

        role = self.role_crud.get(db, id=role_id)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Role not found"
            )

        # Проверить права на удаление
        if not self._can_delete_role(current_user, role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to delete role",
            )

        # Проверить, что роль не назначена пользователям
        assignments = self.assignment_crud.get_role_assignments(db, role_id=role_id)
        if assignments:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete role: it is assigned to {len(assignments)} users",
            )

        self.role_crud.remove(db, id=role_id)
        return True

    def get_roles_by_scope(
        self,
        db: Session,
        *,
        scope: RoleScope,
        current_user: User,
        skip: int = 0,
        limit: int = 100,
    ) -> List[EnhancedRole]:
        """Получить роли по области действия"""

        # Проверить права доступа к ролям
        if not self._can_view_roles(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to view roles",
            )

        return self.role_crud.get_by_scope(db, scope=scope, skip=skip, limit=limit)

    def get_assignable_roles(
        self, db: Session, *, scope: Optional[RoleScope], current_user: User
    ) -> List[EnhancedRole]:
        """Получить роли, которые можно назначать"""

        # Проверить права на назначение ролей
        if not self._can_assign_roles(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to assign roles",
            )

        return self.role_crud.get_assignable_roles(db, scope=scope)

    def search_roles(
        self,
        db: Session,
        *,
        query: str,
        scope: Optional[RoleScope],
        current_user: User,
        skip: int = 0,
        limit: int = 100,
    ) -> List[EnhancedRole]:
        """Поиск ролей"""

        # Проверить права доступа к ролям
        if not self._can_view_roles(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to view roles",
            )

        return self.role_crud.search(
            db, query=query, scope=scope, skip=skip, limit=limit
        )

    # Методы для работы с назначениями ролей

    def assign_role(
        self,
        db: Session,
        *,
        assignment_data: UserRoleAssignmentCreate,
        current_user: User,
    ) -> UserRoleAssignment:
        """Назначить роль пользователю"""

        # Проверить права на назначение ролей
        if not self._can_assign_roles(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to assign roles",
            )

        # Проверить существование роли
        role = self.role_crud.get(db, id=assignment_data.role_id)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Role not found"
            )

        # Проверить, что роль можно назначать
        if not role.is_assignable:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This role cannot be assigned",
            )

        # Проверить существование назначения
        has_assignment = self.assignment_crud.has_assignment(
            db,
            user_id=assignment_data.user_id,
            role_id=assignment_data.role_id,
            company_id=assignment_data.company_id,
            department_id=assignment_data.department_id,
            team_id=assignment_data.team_id,
            project_id=assignment_data.project_id,
        )

        if has_assignment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has this role in the specified context",
            )

        # Создать назначение
        assignment_data_dict = assignment_data.dict()
        assignment_data_dict["assigned_by"] = current_user.id

        # Если роль требует одобрения, установить статус неактивный
        if role.requires_approval:
            assignment_data_dict["is_active"] = False

        assignment = self.assignment_crud.create(db, obj_in=assignment_data_dict)
        return assignment

    def revoke_role_assignment(
        self,
        db: Session,
        *,
        assignment_id: int,
        reason: Optional[str],
        current_user: User,
    ) -> UserRoleAssignment:
        """Отозвать назначение роли"""

        assignment = self.assignment_crud.get(db, id=assignment_id)
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role assignment not found",
            )

        # Проверить права на отзыв роли
        if not self._can_revoke_role_assignment(current_user, assignment):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to revoke role assignment",
            )

        revoked_assignment = self.assignment_crud.revoke_assignment(
            db, assignment_id=assignment_id, revoked_by=current_user.id, reason=reason
        )

        if not revoked_assignment:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to revoke role assignment",
            )

        return revoked_assignment

    def approve_role_assignment(
        self, db: Session, *, assignment_id: int, current_user: User
    ) -> UserRoleAssignment:
        """Одобрить назначение роли"""

        assignment = self.assignment_crud.get(db, id=assignment_id)
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role assignment not found",
            )

        # Проверить права на одобрение
        if not self._can_approve_role_assignment(current_user, assignment):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to approve role assignment",
            )

        approved_assignment = self.assignment_crud.approve_assignment(
            db, assignment_id=assignment_id, approved_by=current_user.id
        )

        if not approved_assignment:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to approve role assignment",
            )

        return approved_assignment

    def get_user_role_assignments(
        self, db: Session, *, user_id: int, current_user: User, active_only: bool = True
    ) -> List[UserRoleAssignment]:
        """Получить назначения ролей пользователя"""

        # Проверить права доступа
        if not self._can_view_user_assignments(current_user, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to user role assignments",
            )

        return self.assignment_crud.get_user_assignments(
            db, user_id=user_id, active_only=active_only
        )

    def get_assignments_by_context(
        self,
        db: Session,
        *,
        scope: RoleScope,
        context_id: int,
        current_user: User,
        active_only: bool = True,
    ) -> List[UserRoleAssignment]:
        """Получить назначения ролей в определенном контексте"""

        # Проверить права доступа к контексту
        if not self._can_access_context(current_user, scope, context_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to context"
            )

        return self.assignment_crud.get_assignments_by_scope(
            db, scope=scope, context_id=context_id, active_only=active_only
        )

    def extend_role_assignment(
        self, db: Session, *, assignment_id: int, days: int, current_user: User
    ) -> UserRoleAssignment:
        """Продлить назначение роли"""

        assignment = self.assignment_crud.get(db, id=assignment_id)
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role assignment not found",
            )

        # Проверить права на продление
        if not self._can_extend_role_assignment(current_user, assignment):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to extend role assignment",
            )

        extended_assignment = self.assignment_crud.extend_assignment(
            db, assignment_id=assignment_id, days=days
        )

        if not extended_assignment:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to extend role assignment",
            )

        return extended_assignment

    def cleanup_expired_assignments(
        self, db: Session, *, current_user: User
    ) -> Dict[str, int]:
        """Очистить истекшие назначения ролей"""

        # Только системные администраторы могут очищать назначения
        if not current_user.is_system_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only system administrators can cleanup expired assignments",
            )

        count = self.assignment_crud.cleanup_expired_assignments(db)

        return {
            "cleaned_assignments": count,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    # Приватные методы для проверки прав доступа

    def _can_create_roles(self, user: User) -> bool:
        """Проверить права на создание ролей"""
        if user.is_system_admin:
            return True

        # TODO: Проверить права через Enhanced Role System
        return False

    def _can_view_roles(self, user: User) -> bool:
        """Проверить права на просмотр ролей"""
        if user.is_system_admin:
            return True

        # Company Admin может просматривать роли своей компании
        if user.is_company_admin:
            return True

        # TODO: Проверить права через Enhanced Role System
        return False

    def _can_access_role(self, user: User, role: EnhancedRole) -> bool:
        """Проверить права доступа к роли"""
        return self._can_view_roles(user)

    def _can_edit_role(self, user: User, role: EnhancedRole) -> bool:
        """Проверить права на редактирование роли"""
        if user.is_system_admin:
            return True

        # Системные роли может редактировать только System Admin
        if role.is_system:
            return False

        # TODO: Проверить права через Enhanced Role System
        return False

    def _can_delete_role(self, user: User, role: EnhancedRole) -> bool:
        """Проверить права на удаление роли"""
        return self._can_edit_role(user, role)

    def _can_assign_roles(self, user: User) -> bool:
        """Проверить права на назначение ролей"""
        if user.is_system_admin:
            return True

        if user.is_company_admin:
            return True

        # TODO: Проверить права через Enhanced Role System
        return False

    def _can_revoke_role_assignment(
        self, user: User, assignment: UserRoleAssignment
    ) -> bool:
        """Проверить права на отзыв назначения роли"""
        if user.is_system_admin:
            return True

        # Пользователь может отозвать назначения, которые сам создал
        if assignment.assigned_by == user.id:
            return True

        # TODO: Проверить права через Enhanced Role System
        return False

    def _can_approve_role_assignment(
        self, user: User, assignment: UserRoleAssignment
    ) -> bool:
        """Проверить права на одобрение назначения роли"""
        if user.is_system_admin:
            return True

        # TODO: Проверить права через Enhanced Role System
        return False

    def _can_view_user_assignments(self, user: User, user_id: int) -> bool:
        """Проверить права на просмотр назначений пользователя"""
        if user.is_system_admin:
            return True

        # Пользователь может просматривать свои назначения
        if user.id == user_id:
            return True

        # TODO: Проверить права через Enhanced Role System
        return False

    def _can_access_context(
        self, user: User, scope: RoleScope, context_id: int
    ) -> bool:
        """Проверить права доступа к контексту"""
        if user.is_system_admin:
            return True

        # TODO: Проверить права через Enhanced Role System
        return False

    def _can_extend_role_assignment(
        self, user: User, assignment: UserRoleAssignment
    ) -> bool:
        """Проверить права на продление назначения роли"""
        return self._can_revoke_role_assignment(user, assignment)


# Создаем экземпляр сервиса
enhanced_role_service = EnhancedRoleService()
