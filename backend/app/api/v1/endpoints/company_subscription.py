"""
API endpoints для подписок компании.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

    AdminPermissions,
from app.api.dependencies import get_db, get_current_active_user, SessionDep,
from app.models.user import User
from app.services.company_subscription_service import company_subscription_service
from app.schemas.company_subscription import (
    CompanySubscriptionCreate,
    CompanySubscriptionUpdate,
    CompanySubscriptionResponse,
    SubscriptionPlan,
    SubscriptionStatus,
    BillingPeriod,
    SubscriptionPlanDetails,
    SubscriptionUsageStats,
)

router = APIRouter()


@router.get(
    "/company/{company_id}/subscription", response_model=CompanySubscriptionResponse
)
async def get_company_subscription(
    company_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanySubscriptionResponse:
    """
    Получить подписку компании.
    """
    subscription = company_subscription_service.get_company_subscription(
        db=db, company_id=company_id, current_user=current_user
    )

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company subscription not found",
        )

    # Добавить вычисляемые поля
    response = CompanySubscriptionResponse(**subscription.__dict__)
    response.is_trial_active = subscription.is_subscription_active
    response.is_subscription_active = subscription.is_subscription_active
    response.days_until_trial_end = subscription.days_until_trial_end
    response.is_trial_expired = subscription.is_trial_expired
    response.current_price = subscription.get_current_price()

    return response


@router.post(
    "/company/{company_id}/subscription",
    response_model=CompanySubscriptionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_company_subscription(
    *,
    company_id: int,
    subscription_in: CompanySubscriptionCreate,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanySubscriptionResponse:
    """
    Создать подписку для компании.

    Требует права на управление подписками компании.
    """
    subscription = company_subscription_service.create_subscription(
        db=db,
        company_id=company_id,
        subscription_data=subscription_in,
        current_user=current_user,
    )

    return CompanySubscriptionResponse(**subscription.__dict__)


@router.put(
    "/company/{company_id}/subscription", response_model=CompanySubscriptionResponse
)
async def update_company_subscription(
    *,
    company_id: int,
    subscription_in: CompanySubscriptionUpdate,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanySubscriptionResponse:
    """
    Обновить подписку компании.

    Требует права на управление подписками компании.
    """
    subscription = company_subscription_service.update_subscription(
        db=db,
        company_id=company_id,
        subscription_data=subscription_in,
        current_user=current_user,
    )

    return CompanySubscriptionResponse(**subscription.__dict__)


@router.post(
    "/company/{company_id}/subscription/upgrade",
    response_model=CompanySubscriptionResponse,
)
async def upgrade_subscription(
    *,
    company_id: int,
    new_plan: SubscriptionPlan,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanySubscriptionResponse:
    """
    Обновить план подписки компании.

    Требует права на управление подписками компании.
    """
    subscription = company_subscription_service.upgrade_subscription(
        db=db, company_id=company_id, new_plan=new_plan, current_user=current_user
    )

    return CompanySubscriptionResponse(**subscription.__dict__)


@router.post(
    "/company/{company_id}/subscription/activate",
    response_model=CompanySubscriptionResponse,
)
async def activate_subscription(
    company_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanySubscriptionResponse:
    """
    Активировать подписку компании.

    Требует права на управление подписками компании.
    """
    subscription = company_subscription_service.activate_subscription(
        db=db, company_id=company_id, current_user=current_user
    )

    return CompanySubscriptionResponse(**subscription.__dict__)


@router.post(
    "/company/{company_id}/subscription/suspend",
    response_model=CompanySubscriptionResponse,
)
async def suspend_subscription(
    company_id: int,
    reason: Optional[str] = Query(None, description="Причина приостановки"),
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanySubscriptionResponse:
    """
    Приостановить подписку компании.

    Доступно только системным администраторам.
    """
    subscription = company_subscription_service.suspend_subscription(
        db=db, company_id=company_id, reason=reason, current_user=current_user
    )

    return CompanySubscriptionResponse(**subscription.__dict__)


@router.post(
    "/company/{company_id}/subscription/cancel",
    response_model=CompanySubscriptionResponse,
)
async def cancel_subscription(
    company_id: int,
    immediate: bool = Query(
        False, description="Немедленная отмена или в конце периода"
    ),
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanySubscriptionResponse:
    """
    Отменить подписку компании.

    Требует права на управление подписками компании.
    По умолчанию отмена происходит в конце текущего периода.
    """
    subscription = company_subscription_service.cancel_subscription(
        db=db, company_id=company_id, immediate=immediate, current_user=current_user
    )

    return CompanySubscriptionResponse(**subscription.__dict__)


@router.post(
    "/company/{company_id}/subscription/renew",
    response_model=CompanySubscriptionResponse,
)
async def renew_subscription(
    company_id: int,
    billing_period: Optional[BillingPeriod] = Query(
        None, description="Новый период биллинга"
    ),
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanySubscriptionResponse:
    """
    Продлить подписку компании.

    Требует права на управление подписками компании.
    """
    subscription = company_subscription_service.renew_subscription(
        db=db,
        company_id=company_id,
        billing_period=billing_period,
        current_user=current_user,
    )

    return CompanySubscriptionResponse(**subscription.__dict__)


@router.get(
    "/company/{company_id}/subscription/usage", response_model=SubscriptionUsageStats
)
async def get_subscription_usage(
    company_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> SubscriptionUsageStats:
    """
    Получить статистику использования подписки компании.

    Показывает текущее использование лимитов и предупреждения.
    """
    return company_subscription_service.get_subscription_usage_stats(
        db=db, company_id=company_id, current_user=current_user
    )


@router.get("/subscription/plans", response_model=List[SubscriptionPlanDetails])
async def get_available_plans() -> List[SubscriptionPlanDetails]:
    """
    Получить доступные планы подписки.

    Возвращает информацию о всех доступных планах с ценами и возможностями.
    """
    return company_subscription_service.get_available_plans()


@router.get("/subscription/expiring", response_model=List[CompanySubscriptionResponse])
async def get_expiring_subscriptions(
    days_until_expiry: int = Query(7, ge=1, le=365, description="Дней до истечения"),
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(
        100, ge=1, le=1000, description="Максимальное количество записей"
    ),
) -> List[CompanySubscriptionResponse]:
    """
    Получить подписки, истекающие в ближайшее время.

    Доступно только системным администраторам.
    """
    subscriptions = company_subscription_service.get_expiring_subscriptions(
        db=db,
        days_until_expiry=days_until_expiry,
        current_user=current_user,
        skip=skip,
        limit=limit,
    )

    return [CompanySubscriptionResponse(**sub.__dict__) for sub in subscriptions]


@router.get("/subscription/statistics", response_model=Dict[str, Any])
async def get_subscription_statistics(
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Получить общую статистику по подпискам.

    Включает распределение по планам, доходы, конверсию.
    Доступно только системным администраторам.
    """
    return company_subscription_service.get_subscription_statistics(
        db=db, current_user=current_user
    )
