"""
Notifications Management Router.

Роутер для управления уведомлениями пользователей.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.api.dependencies import SessionDep, CurrentUserDep
from app.api.dependencies.permissions.base import PermissionChecker
from app.core.constants import Permission
from app.crud.notification import notification as notification_crud
from .schemas import (
    NotificationResponse,
    NotificationListResponse,
    MarkNotificationReadRequest,
)

permission_checker = PermissionChecker()
router = APIRouter()


@router.get(
    "/my",
    response_model=NotificationListResponse,
    summary="Get My Notifications",
    description="Get current user's notifications",
)
async def get_my_notifications(
    db: SessionDep,
    current_user: CurrentUserDep,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
    unread_only: bool = Query(False, description="Show only unread notifications"),
):
    """
    Получить уведомления текущего пользователя.
    """
    # Получаем уведомления из базы данных
    skip = (page - 1) * size
    notifications_db = await notification_crud.get_user_notifications(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=size,
        unread_only=unread_only,
    )

    # Получаем общее количество
    total = await notification_crud.count_user_notifications(
        db=db,
        user_id=current_user.id,
        unread_only=unread_only,
    )

    # Конвертируем в формат API
    notifications = [
        NotificationResponse(
            id=notif.id,
            type=notif.notification_type,
            title=notif.title,
            message=notif.message,
            read=notif.is_read,
            created_at=notif.created_at,
            data=notif.data_dict,
        )
        for notif in notifications_db
    ]

    return NotificationListResponse(
        notifications=notifications,
        total=total,
        page=page,
        pages=(total + size - 1) // size,
        size=size,
    )


@router.put(
    "/{notification_id}/read",
    summary="Mark Notification as Read",
    description="Mark notification as read or unread",
)
async def mark_notification_read(
    notification_id: int,
    request: MarkNotificationReadRequest,
    db: SessionDep,
    current_user: CurrentUserDep,
):
    """
    Отметить уведомление как прочитанное/непрочитанное.
    """
    # Обновляем статус уведомления в базе данных
    if request.read:
        notification = await notification_crud.mark_as_read(
            db=db,
            notification_id=notification_id,
            user_id=current_user.id,
        )
    else:
        notification = await notification_crud.mark_as_unread(
            db=db,
            notification_id=notification_id,
            user_id=current_user.id,
        )

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or access denied",
        )

    return {
        "success": True,
        "message": f"Notification {notification_id} marked as {'read' if request.read else 'unread'}",
        "notification_id": notification_id,
        "read": request.read,
    }


@router.post(
    "/mark-all-read",
    summary="Mark All Notifications as Read",
    description="Mark all user's notifications as read",
)
async def mark_all_notifications_read(
    db: SessionDep,
    current_user: CurrentUserDep,
):
    """
    Отметить все уведомления пользователя как прочитанные.
    """
    # Массовое обновление статуса уведомлений
    updated_count = await notification_crud.mark_all_as_read(
        db=db,
        user_id=current_user.id,
    )

    return {
        "success": True,
        "message": f"Marked {updated_count} notifications as read",
        "user_id": current_user.id,
        "updated_count": updated_count,
    }


@router.get(
    "/unread-count",
    summary="Get Unread Notifications Count",
    description="Get count of unread notifications",
)
async def get_unread_count(
    db: SessionDep,
    current_user: CurrentUserDep,
):
    """
    Получить количество непрочитанных уведомлений.
    """
    # Получаем количество непрочитанных уведомлений из базы данных
    unread_count = await notification_crud.get_unread_count(
        db=db,
        user_id=current_user.id,
    )

    return {
        "unread_count": unread_count,
        "user_id": current_user.id,
    }
