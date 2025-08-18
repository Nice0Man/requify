"""
Comments Management Router.

Роутер для управления комментариями к требованиям.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.api.dependencies import SessionDep, CurrentUserDep
from app.api.dependencies.permissions.base import PermissionChecker
from app.core.constants import Permission
from app.services.comment_service import comment_service
from app.services.permission_service import permission_service
from .schemas import (
    CommentAuthor,
    CommentCreateRequest,
    CommentRequirement,
    CommentUpdateRequest,
    CommentResponse,
    CommentListResponse,
    CommentSearchRequest,
    CommentStatisticsResponse,
)

permission_checker = PermissionChecker()
router = APIRouter()


@router.get(
    "/",
    response_model=CommentListResponse,
    summary="Get Comments",
    description="Get comments with filtering and pagination",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_REQUIREMENT))
    ],
)
async def get_comments(
    db: SessionDep,
    current_user: CurrentUserDep,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
    search: Optional[str] = Query(None, description="Search query"),
    requirement_id: Optional[int] = Query(None, description="Filter by requirement"),
    author_id: Optional[int] = Query(None, description="Filter by author"),
):
    """
    Получить список комментариев с фильтрацией и поиском.
    """
    if search:
        # Использовать поиск
        result = await comment_service.search_comments(
            db=db,
            search_query=search,
            user=current_user,
            requirement_id=requirement_id,
            author_id=author_id,
            page=page,
            size=size,
        )
    elif requirement_id:
        # Получить комментарии к конкретному требованию
        result = await comment_service.get_requirement_comments(
            db=db,
            requirement_id=requirement_id,
            user=current_user,
            page=page,
            size=size,
        )
    else:
        # Общий список комментариев для администраторов
        result = await comment_service.get_all_comments_for_admin(
            db=db,
            user=current_user,
            page=page,
            size=size,
            search=search,
            author_id=author_id,
        )

    return CommentListResponse(
        comments=result["comments"],
        total=result["total"],
        page=result["page"],
        pages=result["pages"],
        size=result["size"],
    )


@router.post(
    "/",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Comment",
    description="Create a new comment on a requirement",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_REQUIREMENT))
    ],
)
async def create_comment(
    comment_data: CommentCreateRequest,
    db: SessionDep,
    current_user: CurrentUserDep,
):
    """
    Создать новый комментарий к требованию.
    """
    comment = await comment_service.create_comment(
        db=db,
        requirement_id=comment_data.requirement_id,
        content=comment_data.content,
        author=current_user,
    )

    return CommentResponse(
        id=comment.id,
        content=comment.content,
        requirement_id=comment.requirement_id,
        author_id=comment.author_id,
        author=CommentAuthor(
            id=comment.author.id,
            email=comment.author.email,
            full_name=comment.author.full_name,
        ),
        requirement=(
            CommentRequirement(
                id=comment.requirement.id,
                title=comment.requirement.title,
                project_id=comment.requirement.project_id,
            )
            if comment.requirement
            else None
        ),
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


@router.get(
    "/{comment_id}",
    response_model=CommentResponse,
    summary="Get Comment",
    description="Get comment by ID",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_REQUIREMENT))
    ],
)
async def get_comment(
    comment_id: int,
    db: SessionDep,
    current_user: CurrentUserDep,
):
    """
    Получить комментарий по ID.
    """
    # Получаем комментарий из базы данных
    comment = await comment_service.crud.get(db, id=comment_id)
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
        )

    # Проверяем права доступа к требованию
    has_permission = await permission_service.check_permission(
        user=current_user,
        permission=Permission.VIEW_REQUIREMENT,
        resource_id=comment.requirement_id,
        db=db,
    )

    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this comment",
        )

    # Загружаем связанные данные
    await db.refresh(comment, ["author", "requirement"])

    return CommentResponse(
        id=comment.id,
        content=comment.content,
        requirement_id=comment.requirement_id,
        author_id=comment.author_id,
        author=CommentAuthor(
            id=comment.author.id,
            email=comment.author.email,
            full_name=comment.author.full_name,
        ),
        requirement=(
            CommentRequirement(
                id=comment.requirement.id,
                title=comment.requirement.title,
                project_id=comment.requirement.project_id,
            )
            if comment.requirement
            else None
        ),
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


@router.put(
    "/{comment_id}",
    response_model=CommentResponse,
    summary="Update Comment",
    description="Update comment content",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_REQUIREMENT))
    ],
)
async def update_comment(
    comment_id: int,
    comment_data: CommentUpdateRequest,
    db: SessionDep,
    current_user: CurrentUserDep,
):
    """
    Обновить содержание комментария.
    """
    comment = await comment_service.update_comment(
        db=db,
        comment_id=comment_id,
        content=comment_data.content,
        user=current_user,
    )

    return CommentResponse(
        id=comment.id,
        content=comment.content,
        requirement_id=comment.requirement_id,
        author_id=comment.author_id,
        author=CommentAuthor(
            id=comment.author.id,
            email=comment.author.email,
            full_name=comment.author.full_name,
        ),
        requirement=(
            CommentRequirement(
                id=comment.requirement.id,
                title=comment.requirement.title,
                project_id=comment.requirement.project_id,
            )
            if comment.requirement
            else None
        ),
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


@router.delete(
    "/{comment_id}",
    summary="Delete Comment",
    description="Delete comment",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_REQUIREMENT))
    ],
)
async def delete_comment(
    comment_id: int,
    db: SessionDep,
    current_user: CurrentUserDep,
):
    """
    Удалить комментарий.
    """
    success = await comment_service.delete_comment(
        db=db,
        comment_id=comment_id,
        user=current_user,
    )

    return {"success": success, "message": "Comment deleted successfully"}


@router.get(
    "/requirements/{requirement_id}/comments",
    response_model=CommentListResponse,
    summary="Get Requirement Comments",
    description="Get comments for a specific requirement",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_REQUIREMENT))
    ],
)
async def get_requirement_comments(
    requirement_id: int,
    db: SessionDep,
    current_user: CurrentUserDep,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
):
    """
    Получить комментарии к конкретному требованию.
    """
    result = await comment_service.get_requirement_comments(
        db=db,
        requirement_id=requirement_id,
        user=current_user,
        page=page,
        size=size,
    )

    return CommentListResponse(
        comments=result["comments"],
        total=result["total"],
        page=result["page"],
        pages=result["pages"],
        size=result["size"],
    )


@router.post(
    "/requirements/{requirement_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Requirement Comment",
    description="Create a comment on a specific requirement",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.VIEW_REQUIREMENT))
    ],
)
async def create_requirement_comment(
    requirement_id: int,
    content: str,
    db: SessionDep,
    current_user: CurrentUserDep,
):
    """
    Создать комментарий к конкретному требованию.
    """
    comment = await comment_service.create_comment(
        db=db,
        requirement_id=requirement_id,
        content=content,
        author=current_user,
    )

    return CommentResponse(
        id=comment.id,
        content=comment.content,
        requirement_id=comment.requirement_id,
        author_id=comment.author_id,
        author=CommentAuthor(
            id=comment.author.id,
            email=comment.author.email,
            full_name=comment.author.full_name,
        ),
        requirement=(
            CommentRequirement(
                id=comment.requirement.id,
                title=comment.requirement.title,
                project_id=comment.requirement.project_id,
            )
            if comment.requirement
            else None
        ),
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


@router.get(
    "/recent",
    response_model=List[CommentResponse],
    summary="Get Recent Comments",
    description="Get user's recent comments",
)
async def get_recent_comments(
    db: SessionDep,
    current_user: CurrentUserDep,
    limit: int = Query(10, ge=1, le=50, description="Number of comments to return"),
):
    """
    Получить последние комментарии пользователя.
    """
    comments = await comment_service.get_recent_comments(
        db=db,
        user=current_user,
        limit=limit,
    )

    return [
        CommentResponse(
            id=comment.id,
            content=comment.content,
            requirement_id=comment.requirement_id,
            author_id=comment.author_id,
            author=CommentAuthor(
                id=current_user.id,
                email=current_user.email,
                full_name=current_user.full_name,
            ),
            requirement=(
                CommentRequirement(
                    id=comment.requirement.id,
                    title=comment.requirement.title,
                    project_id=comment.requirement.project_id,
                )
                if comment.requirement
                else None
            ),
            created_at=comment.created_at,
            updated_at=comment.updated_at,
        )
        for comment in comments
    ]


@router.get(
    "/statistics",
    response_model=CommentStatisticsResponse,
    summary="Get Comment Statistics",
    description="Get comment statistics",
)
async def get_comment_statistics(
    db: SessionDep,
    current_user: CurrentUserDep,
    requirement_id: Optional[int] = Query(None, description="Filter by requirement"),
):
    """
    Получить статистику по комментариям.
    """
    stats = await comment_service.get_comment_statistics(
        db=db,
        user=current_user,
        requirement_id=requirement_id,
    )

    return CommentStatisticsResponse(
        total_comments=stats["total_comments"],
        user_comments=stats["user_comments"],
        requirement_id=stats["requirement_id"],
    )
