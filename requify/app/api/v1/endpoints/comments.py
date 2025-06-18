"""
API эндпоинты для работы с комментариями к требованиям.

Включает операции CRUD для комментариев и уведомления.
"""

from datetime import datetime, UTC
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from requify.app.api.deps import (
    get_db,
    get_current_active_user,
    get_requirements_read_user,
    get_requirements_write_user,
)
from requify.app.core.config import settings
from requify.app import crud, schemas
from requify.app.models.user import User
from requify.app.services.notification_service import notification_service

router = APIRouter()


@router.get("/", response_model=List[schemas.CommentWithAuthor])
async def get_comments(
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(
        100, ge=1, le=1000, description="Максимальное количество записей"
    ),
    requirement_id: Optional[int] = Query(None, description="Фильтр по ID требования"),
    author_id: Optional[int] = Query(None, description="Фильтр по автору"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_read_user),
):
    """
    Получить список комментариев с фильтрацией.

    Args:
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        requirement_id: Фильтр по ID требования
        author_id: Фильтр по автору
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.CommentWithAuthor]: Список комментариев с информацией об авторах
    """
    filters = {}
    if requirement_id:
        filters["requirement_id"] = requirement_id
    if author_id:
        filters["author_id"] = author_id

    comments = await crud.comment.get_multi_with_filters(
        db, skip=skip, limit=limit, **filters
    )

    # Получаем информацию об авторах
    comments_with_authors = []
    for comment in comments:
        author = await crud.user.get(db, id=comment.author_id)
        comment_data = schemas.CommentWithAuthor.model_validate(comment)
        if author:
            comment_data.author_name = author.name or author.username
            comment_data.author_email = author.email
        comments_with_authors.append(comment_data)

    return comments_with_authors


@router.post("/", response_model=schemas.Comment, status_code=status.HTTP_201_CREATED)
async def create_comment(
    comment_in: schemas.CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_write_user),
):
    """
    Создать новый комментарий к требованию.

    Args:
        comment_in: Данные создаваемого комментария
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Comment: Созданный комментарий

    Raises:
        HTTPException: Если требование не найдено
    """
    # Проверяем существование требования
    requirement = await crud.requirement.get(db, id=comment_in.requirement_id)
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Требование не найдено",
        )

    # Устанавливаем автора комментария
    comment_data = comment_in.model_copy()
    comment_data.author_id = current_user.id

    # Создаем комментарий
    comment = await crud.comment.create(db, obj_in=comment_data)

    # Отправляем уведомления заинтересованным пользователям
    try:
        await notification_service.notify_comment_added(
            db=db,
            requirement=requirement,
            comment_text=comment.content,
            comment_author=current_user,
        )
    except Exception as e:
        # Логируем ошибку уведомления, но не прерываем создание комментария
        print(f"Failed to send comment notification: {e}")

    return comment


@router.get("/{comment_id}", response_model=schemas.CommentWithAuthor)
async def get_comment(
    comment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_read_user),
):
    """
    Получить комментарий по ID.

    Args:
        comment_id: ID комментария
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.CommentWithAuthor: Данные комментария с информацией об авторе

    Raises:
        HTTPException: Если комментарий не найден
    """
    comment = await crud.comment.get(db, id=comment_id)
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Комментарий не найден",
        )

    # Получаем информацию об авторе
    author = await crud.user.get(db, id=comment.author_id)
    comment_data = schemas.CommentWithAuthor.model_validate(comment)
    if author:
        comment_data.author_name = author.name or author.username
        comment_data.author_email = author.email

    return comment_data


@router.put("/{comment_id}", response_model=schemas.Comment)
async def update_comment(
    comment_id: int,
    comment_in: schemas.CommentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_write_user),
):
    """
    Обновить комментарий.

    Args:
        comment_id: ID комментария
        comment_in: Данные для обновления
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Comment: Обновленный комментарий

    Raises:
        HTTPException: Если комментарий не найден или у пользователя нет прав
    """
    comment = await crud.comment.get(db, id=comment_id)
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Комментарий не найден",
        )

    # Проверяем права: можно редактировать только свой комментарий или админ
    if comment.author_id != current_user.id and not current_user.is_superuser:
        # Проверяем, есть ли права администратора
        user_scopes = current_user.scopes if hasattr(current_user, "scopes") else []
        if "admin:write" not in user_scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Нет прав для редактирования этого комментария",
            )

    comment = await crud.comment.update(db, db_obj=comment, obj_in=comment_in)
    return comment


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_write_user),
):
    """
    Удалить комментарий.

    Args:
        comment_id: ID комментария
        db: Сессия базы данных
        current_user: Текущий пользователь

    Raises:
        HTTPException: Если комментарий не найден или у пользователя нет прав
    """
    comment = await crud.comment.get(db, id=comment_id)
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Комментарий не найден",
        )

    # Проверяем права: можно удалять только свой комментарий или админ
    if comment.author_id != current_user.id and not current_user.is_superuser:
        # Проверяем, есть ли права администратора
        user_scopes = current_user.scopes if hasattr(current_user, "scopes") else []
        if "admin:write" not in user_scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Нет прав для удаления этого комментария",
            )

    await crud.comment.remove(db, id=comment_id)


# Эндпоинты для работы с комментариями конкретного требования


@router.get(
    "/requirements/{requirement_id}/comments",
    response_model=List[schemas.CommentWithAuthor],
)
async def get_requirement_comments(
    requirement_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    order_by: str = Query("created_at", description="Поле для сортировки"),
    order_desc: bool = Query(True, description="Сортировка по убыванию"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_read_user),
):
    """
    Получить комментарии к конкретному требованию.

    Args:
        requirement_id: ID требования
        skip: Количество пропускаемых записей
        limit: Максимальное количество записей
        order_by: Поле для сортировки
        order_desc: Сортировка по убыванию
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.CommentWithAuthor]: Список комментариев к требованию

    Raises:
        HTTPException: Если требование не найдено
    """
    # Проверяем существование требования
    requirement = await crud.requirement.get(db, id=requirement_id)
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Требование не найдено",
        )

    comments = await crud.comment.get_by_requirement(
        db,
        requirement_id=requirement_id,
        skip=skip,
        limit=limit,
        order_by=order_by,
        order_desc=order_desc,
    )

    # Получаем информацию об авторах
    comments_with_authors = []
    for comment in comments:
        author = await crud.user.get(db, id=comment.author_id)
        comment_data = schemas.CommentWithAuthor.model_validate(comment)
        if author:
            comment_data.author_name = author.name or author.username
            comment_data.author_email = author.email
        comments_with_authors.append(comment_data)

    return comments_with_authors


@router.post("/requirements/{requirement_id}/comments", response_model=schemas.Comment)
async def create_requirement_comment(
    requirement_id: int,
    comment_in: schemas.CommentCreateForRequirement,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_write_user),
):
    """
    Создать комментарий к конкретному требованию.

    Args:
        requirement_id: ID требования
        comment_in: Данные комментария (без requirement_id)
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Comment: Созданный комментарий
    """
    # Создаем полную схему комментария
    full_comment = schemas.CommentCreate(
        requirement_id=requirement_id,
        content=comment_in.content,
        author_id=current_user.id,
    )

    # Используем основную функцию создания комментария
    return await create_comment(full_comment, db, current_user)


@router.get("/recent", response_model=List[schemas.CommentWithAuthor])
async def get_recent_comments(
    limit: int = Query(
        50, ge=1, le=100, description="Количество последних комментариев"
    ),
    project_id: Optional[int] = Query(None, description="Фильтр по проекту"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_read_user),
):
    """
    Получить последние комментарии.

    Args:
        limit: Количество последних комментариев
        project_id: Фильтр по проекту
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.CommentWithAuthor]: Список последних комментариев
    """
    comments = await crud.comment.get_recent_comments(
        db, limit=limit, project_id=project_id
    )

    # Получаем информацию об авторах
    comments_with_authors = []
    for comment in comments:
        author = await crud.user.get(db, id=comment.author_id)
        requirement = await crud.requirement.get(db, id=comment.requirement_id)

        comment_data = schemas.CommentWithAuthor.model_validate(comment)
        if author:
            comment_data.author_name = author.name or author.username
            comment_data.author_email = author.email
        if requirement:
            comment_data.requirement_title = requirement.title

        comments_with_authors.append(comment_data)

    return comments_with_authors


@router.get("/statistics", response_model=schemas.CommentStatistics)
async def get_comments_statistics(
    project_id: Optional[int] = Query(None, description="Фильтр по проекту"),
    requirement_id: Optional[int] = Query(None, description="Фильтр по требованию"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_read_user),
):
    """
    Получить статистику комментариев.

    Args:
        project_id: Фильтр по проекту
        requirement_id: Фильтр по требованию
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Статистика комментариев
    """
    stats = await crud.comment.get_comment_statistics(
        db, project_id=project_id, requirement_id=requirement_id
    )

    return schemas.CommentStatistics(
        total_comments=stats.get("total_comments", 0),
        comments_today=stats.get("comments_today", 0),
        comments_this_week=stats.get("comments_this_week", 0),
        comments_this_month=stats.get("comments_this_month", 0),
        most_active_authors=stats.get("most_active_authors", []),
        most_commented_requirements=stats.get("most_commented_requirements", []),
        average_comments_per_requirement=stats.get(
            "average_comments_per_requirement", 0.0
        ),
        generated_at=datetime.now(UTC).isoformat() + "Z",
    )
