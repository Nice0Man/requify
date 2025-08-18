"""
Relationships Management Router.

Роутер для управления отношениями между требованиями.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.api.dependencies import SessionDep, CurrentUserDep
from app.api.dependencies.permissions.base import PermissionChecker
from app.core.constants import Permission
from app.services.relationship_service import relationship_service
from .schemas import (
    RelationshipTypeEnum,
    RelationshipCreateRequest,
    RelationshipResponse,
    RelationshipListResponse,
    RequirementRef,
    RequirementDependenciesResponse,
    RequirementTraceMatrixResponse,
)

permission_checker = PermissionChecker()
router = APIRouter()


@router.get(
    "/",
    response_model=List[RelationshipResponse],
    summary="Get Relationships",
    description="Get relationships with filtering",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_REQUIREMENT))
    ],
)
async def get_relationships(
    db: SessionDep,
    current_user: CurrentUserDep,
    requirement_id: Optional[int] = Query(None, description="Filter by requirement"),
    relationship_types: Optional[List[RelationshipTypeEnum]] = Query(
        None, description="Filter by relationship types"
    ),
):
    """
    Получить список отношений с фильтрацией.
    """
    if requirement_id:
        # Получить отношения для конкретного требования
        result = await relationship_service.get_requirement_relationships(
            db=db,
            requirement_id=requirement_id,
            user=current_user,
            relationship_types=(
                [rt.value for rt in relationship_types] if relationship_types else None
            ),
        )

        all_relationships = result.get("relationships", [])

        # Преобразуем в формат API
        relationships = [
            RelationshipResponse(
                relationship_type=(
                    rel.type.name if hasattr(rel, "type") and rel.type else "unknown"
                ),
                source=(
                    RequirementRef(
                        id=rel.source.id,
                        title=rel.source.title,
                        status=rel.source.status.name if rel.source.status else None,
                        project_id=rel.source.project_id,
                    )
                    if hasattr(rel, "source") and rel.source
                    else None
                ),
                target=(
                    RequirementRef(
                        id=rel.target.id,
                        title=rel.target.title,
                        status=rel.target.status.name if rel.target.status else None,
                        project_id=rel.target.project_id,
                    )
                    if hasattr(rel, "target") and rel.target
                    else None
                ),
                created_at=rel.created_at,
            )
            for rel in all_relationships
        ]
    else:
        # Общий список отношений для администраторов
        admin_result = await relationship_service.get_all_relationships_for_admin(
            db=db,
            user=current_user,
            page=1,  # Можно добавить параметры пагинации
            size=100,
            relationship_types=(
                [rt.value for rt in relationship_types] if relationship_types else None
            ),
        )

        # Преобразуем в формат API
        all_relationships = admin_result["relationships"]

        relationships = [
            RelationshipResponse(
                relationship_type=(
                    rel.type.name if hasattr(rel, "type") and rel.type else "unknown"
                ),
                source=(
                    RequirementRef(
                        id=rel.source.id,
                        title=rel.source.title,
                        status=rel.source.status.name if rel.source.status else None,
                        project_id=rel.source.project_id,
                    )
                    if hasattr(rel, "source") and rel.source
                    else None
                ),
                target=(
                    RequirementRef(
                        id=rel.target.id,
                        title=rel.target.title,
                        status=rel.target.status.name if rel.target.status else None,
                        project_id=rel.target.project_id,
                    )
                    if hasattr(rel, "target") and rel.target
                    else None
                ),
                created_at=rel.created_at,
            )
            for rel in all_relationships
        ]

    return relationships


@router.post(
    "/",
    response_model=RelationshipResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Relationship",
    description="Create a new relationship between requirements",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.EDIT_REQUIREMENT))
    ],
)
async def create_relationship(
    relationship_data: RelationshipCreateRequest,
    db: SessionDep,
    current_user: CurrentUserDep,
):
    """
    Создать новое отношение между требованиями.
    """
    relationship = await relationship_service.create_relationship(
        db=db,
        source_id=relationship_data.source_id,
        target_id=relationship_data.target_id,
        relationship_type=relationship_data.relationship_type,
        user=current_user,
    )

    # Загружаем связанные данные
    await db.refresh(relationship, ["source", "target", "type"])

    return RelationshipResponse(
        relationship_type=relationship.type.name,
        source=RequirementRef(
            id=relationship.source.id,
            title=relationship.source.title,
            status=(
                relationship.source.status.name if relationship.source.status else None
            ),
            project_id=relationship.source.project_id,
        ),
        target=RequirementRef(
            id=relationship.target.id,
            title=relationship.target.title,
            status=(
                relationship.target.status.name if relationship.target.status else None
            ),
            project_id=relationship.target.project_id,
        ),
        created_at=relationship.created_at,
    )


@router.delete(
    "/",
    summary="Delete Relationship",
    description="Delete relationship between requirements",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.EDIT_REQUIREMENT))
    ],
)
async def delete_relationship(
    db: SessionDep,
    current_user: CurrentUserDep,
    source_id: int = Query(..., description="Source requirement ID"),
    target_id: int = Query(..., description="Target requirement ID"),
    relationship_type: str = Query(..., description="Relationship type"),
):
    """
    Удалить отношение между требованиями.
    """
    success = await relationship_service.delete_relationship(
        db=db,
        source_id=source_id,
        target_id=target_id,
        relationship_type=relationship_type,
        user=current_user,
    )

    return {"success": success, "message": "Relationship deleted successfully"}


@router.get(
    "/requirements/{requirement_id}/dependencies",
    response_model=RequirementDependenciesResponse,
    summary="Get Requirement Dependencies",
    description="Get dependencies and dependents for a requirement",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_REQUIREMENT))
    ],
)
async def get_requirement_dependencies(
    requirement_id: int,
    db: SessionDep,
    current_user: CurrentUserDep,
    include_transitive: bool = Query(
        False, description="Include transitive dependencies"
    ),
):
    """
    Получить зависимости и зависимых для требования.
    """
    dependencies = await relationship_service.get_requirement_dependencies(
        db=db,
        requirement_id=requirement_id,
        user=current_user,
        dependency_types=["depends_on", "blocks"],  # Можно сделать настраиваемым
        include_transitive=include_transitive,
    )

    dependents = await relationship_service.get_requirement_dependents(
        db=db,
        requirement_id=requirement_id,
        user=current_user,
        dependency_types=["depends_on", "blocks"],
        include_transitive=include_transitive,
    )

    # Получаем транзитивные зависимости если требуется
    transitive_dependencies = []
    transitive_dependents = []

    if include_transitive:
        transitive_dependencies = (
            await relationship_service.get_requirement_dependencies(
                db=db,
                requirement_id=requirement_id,
                user=current_user,
                dependency_types=["depends_on", "blocks"],
                include_transitive=True,
            )
        )

        transitive_dependents = await relationship_service.get_requirement_dependents(
            db=db,
            requirement_id=requirement_id,
            user=current_user,
            dependency_types=["depends_on", "blocks"],
            include_transitive=True,
        )

    return RequirementDependenciesResponse(
        requirement_id=requirement_id,
        dependencies=[
            RequirementRef(
                id=req.id,
                title=req.title,
                status=req.status.name if req.status else None,
                project_id=req.project_id,
            )
            for req in dependencies
        ],
        dependents=[
            RequirementRef(
                id=req.id,
                title=req.title,
                status=req.status.name if req.status else None,
                project_id=req.project_id,
            )
            for req in dependents
        ],
        transitive_dependencies=[
            RequirementRef(
                id=req.id,
                title=req.title,
                status=req.status.name if req.status else None,
                project_id=req.project_id,
            )
            for req in transitive_dependencies
        ],
        transitive_dependents=[
            RequirementRef(
                id=req.id,
                title=req.title,
                status=req.status.name if req.status else None,
                project_id=req.project_id,
            )
            for req in transitive_dependents
        ],
    )


@router.get(
    "/requirements/{requirement_id}/trace-matrix",
    response_model=RequirementTraceMatrixResponse,
    summary="Get Requirement Trace Matrix",
    description="Get trace matrix for a requirement",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_REQUIREMENT))
    ],
)
async def get_requirement_trace_matrix(
    requirement_id: int,
    db: SessionDep,
    current_user: CurrentUserDep,
):
    """
    Получить матрицу трассировки для требования.
    """
    trace_matrix = await relationship_service.get_requirement_trace_matrix(
        db=db,
        requirement_id=requirement_id,
        user=current_user,
    )

    return RequirementTraceMatrixResponse(
        requirement_id=requirement_id,
        trace_matrix=trace_matrix.get("matrix", {}),
        total_relationships=trace_matrix.get("total_relationships", 0),
    )
