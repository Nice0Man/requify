"""
CRUD операции для модели CompanySubscription.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from datetime import datetime, timezone, timedelta

from app.crud.base import CRUDBase
from app.models.company_subscription import CompanySubscription
from app.schemas.company_subscription import (
    CompanySubscriptionCreate,
    CompanySubscriptionUpdate,
    SubscriptionStatus,
    SubscriptionPlan,
    BillingPeriod,
)


class CRUDCompanySubscription(
    CRUDBase[CompanySubscription, CompanySubscriptionCreate, CompanySubscriptionUpdate]
):
    """CRUD операции для подписок компании"""

    def get_by_company(
        self, db: Session, *, company_id: int
    ) -> Optional[CompanySubscription]:
        """Получить подписку компании"""
        return db.query(self.model).filter(self.model.company_id == company_id).first()

    def create_for_company(
        self, db: Session, *, obj_in: CompanySubscriptionCreate, company_id: int
    ) -> CompanySubscription:
        """Создать подписку для компании"""
        # Проверить, нет ли уже подписки для этой компании
        existing = self.get_by_company(db, company_id=company_id)
        if existing:
            # Обновить существующую подписку
            return self.update(db, db_obj=existing, obj_in=obj_in)

        # Создать новую подписку
        db_obj = self.model(company_id=company_id, **obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_status(
        self,
        db: Session,
        *,
        status: SubscriptionStatus,
        skip: int = 0,
        limit: int = 100
    ) -> List[CompanySubscription]:
        """Получить подписки по статусу"""
        return (
            db.query(self.model)
            .filter(self.model.status == status.value)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_plan(
        self, db: Session, *, plan: SubscriptionPlan, skip: int = 0, limit: int = 100
    ) -> List[CompanySubscription]:
        """Получить подписки по плану"""
        return (
            db.query(self.model)
            .filter(self.model.plan == plan.value)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_expiring_trials(
        self,
        db: Session,
        *,
        days_until_expiry: int = 7,
        skip: int = 0,
        limit: int = 100
    ) -> List[CompanySubscription]:
        """Получить триальные подписки, истекающие в ближайшие дни"""
        cutoff_date = datetime.now(timezone.utc) + timedelta(days=days_until_expiry)

        return (
            db.query(self.model)
            .filter(
                and_(
                    self.model.status == SubscriptionStatus.TRIAL.value,
                    self.model.trial_end_date <= cutoff_date,
                    self.model.trial_end_date > datetime.now(timezone.utc),
                )
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_expiring_subscriptions(
        self,
        db: Session,
        *,
        days_until_expiry: int = 7,
        skip: int = 0,
        limit: int = 100
    ) -> List[CompanySubscription]:
        """Получить подписки, истекающие в ближайшие дни"""
        cutoff_date = datetime.now(timezone.utc) + timedelta(days=days_until_expiry)

        return (
            db.query(self.model)
            .filter(
                and_(
                    self.model.status == SubscriptionStatus.ACTIVE.value,
                    self.model.subscription_end_date <= cutoff_date,
                    self.model.subscription_end_date > datetime.now(timezone.utc),
                )
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_overdue_subscriptions(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[CompanySubscription]:
        """Получить просроченные подписки"""
        return (
            db.query(self.model)
            .filter(
                and_(
                    self.model.status == SubscriptionStatus.ACTIVE.value,
                    self.model.subscription_end_date < datetime.now(timezone.utc),
                )
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_auto_renew_subscriptions(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[CompanySubscription]:
        """Получить подписки с автопродлением"""
        return (
            db.query(self.model)
            .filter(
                and_(
                    self.model.auto_renew == True,
                    self.model.status == SubscriptionStatus.ACTIVE.value,
                )
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_subscription_status(
        self, db: Session, *, company_id: int, status: SubscriptionStatus
    ) -> Optional[CompanySubscription]:
        """Обновить статус подписки"""
        subscription = self.get_by_company(db, company_id=company_id)
        if not subscription:
            return None

        subscription.status = status.value
        db.commit()
        db.refresh(subscription)
        return subscription

    def activate_subscription(
        self,
        db: Session,
        *,
        company_id: int,
        subscription_start_date: Optional[datetime] = None,
        subscription_end_date: Optional[datetime] = None
    ) -> Optional[CompanySubscription]:
        """Активировать подписку"""
        subscription = self.get_by_company(db, company_id=company_id)
        if not subscription:
            return None

        subscription.status = SubscriptionStatus.ACTIVE.value
        subscription.subscription_start_date = subscription_start_date or datetime.now(
            timezone.utc
        )

        if subscription_end_date:
            subscription.subscription_end_date = subscription_end_date
        elif subscription.billing_period == BillingPeriod.MONTHLY.value:
            subscription.subscription_end_date = (
                subscription.subscription_start_date + timedelta(days=30)
            )
        elif subscription.billing_period == BillingPeriod.QUARTERLY.value:
            subscription.subscription_end_date = (
                subscription.subscription_start_date + timedelta(days=90)
            )
        elif subscription.billing_period == BillingPeriod.YEARLY.value:
            subscription.subscription_end_date = (
                subscription.subscription_start_date + timedelta(days=365)
            )

        # Обновить дату следующего биллинга
        subscription.next_billing_date = subscription.subscription_end_date

        db.commit()
        db.refresh(subscription)
        return subscription

    def suspend_subscription(
        self, db: Session, *, company_id: int, reason: Optional[str] = None
    ) -> Optional[CompanySubscription]:
        """Приостановить подписку"""
        subscription = self.get_by_company(db, company_id=company_id)
        if not subscription:
            return None

        subscription.status = SubscriptionStatus.SUSPENDED.value
        # Можно добавить поле для причины приостановки

        db.commit()
        db.refresh(subscription)
        return subscription

    def cancel_subscription(
        self, db: Session, *, company_id: int, immediate: bool = False
    ) -> Optional[CompanySubscription]:
        """Отменить подписку"""
        subscription = self.get_by_company(db, company_id=company_id)
        if not subscription:
            return None

        if immediate:
            subscription.status = SubscriptionStatus.CANCELLED.value
            subscription.subscription_end_date = datetime.now(timezone.utc)
        else:
            # Отключить автопродление, но оставить активной до окончания периода
            subscription.auto_renew = False

        db.commit()
        db.refresh(subscription)
        return subscription

    def renew_subscription(
        self,
        db: Session,
        *,
        company_id: int,
        billing_period: Optional[BillingPeriod] = None
    ) -> Optional[CompanySubscription]:
        """Продлить подписку"""
        subscription = self.get_by_company(db, company_id=company_id)
        if not subscription:
            return None

        if billing_period:
            subscription.billing_period = billing_period.value

        # Продлить на соответствующий период
        if subscription.billing_period == BillingPeriod.MONTHLY.value:
            extension = timedelta(days=30)
        elif subscription.billing_period == BillingPeriod.QUARTERLY.value:
            extension = timedelta(days=90)
        elif subscription.billing_period == BillingPeriod.YEARLY.value:
            extension = timedelta(days=365)
        else:
            extension = timedelta(days=30)  # По умолчанию месяц

        if subscription.subscription_end_date:
            subscription.subscription_end_date += extension
        else:
            subscription.subscription_end_date = datetime.now(timezone.utc) + extension

        subscription.next_billing_date = subscription.subscription_end_date
        subscription.status = SubscriptionStatus.ACTIVE.value

        db.commit()
        db.refresh(subscription)
        return subscription

    def upgrade_plan(
        self,
        db: Session,
        *,
        company_id: int,
        new_plan: SubscriptionPlan,
        monthly_price: Optional[float] = None,
        yearly_price: Optional[float] = None
    ) -> Optional[CompanySubscription]:
        """Обновить план подписки"""
        subscription = self.get_by_company(db, company_id=company_id)
        if not subscription:
            return None

        subscription.plan = new_plan.value

        if monthly_price is not None:
            subscription.monthly_price = monthly_price

        if yearly_price is not None:
            subscription.yearly_price = yearly_price

        db.commit()
        db.refresh(subscription)
        return subscription

    def get_subscription_stats(self, db: Session) -> Dict[str, Any]:
        """Получить статистику по подпискам"""
        total_subscriptions = db.query(func.count(self.model.id)).scalar()

        active_subscriptions = (
            db.query(func.count(self.model.id))
            .filter(self.model.status == SubscriptionStatus.ACTIVE.value)
            .scalar()
        )

        trial_subscriptions = (
            db.query(func.count(self.model.id))
            .filter(self.model.status == SubscriptionStatus.TRIAL.value)
            .scalar()
        )

        expired_subscriptions = (
            db.query(func.count(self.model.id))
            .filter(self.model.status == SubscriptionStatus.EXPIRED.value)
            .scalar()
        )

        cancelled_subscriptions = (
            db.query(func.count(self.model.id))
            .filter(self.model.status == SubscriptionStatus.CANCELLED.value)
            .scalar()
        )

        # Статистика по планам
        plan_stats = (
            db.query(self.model.plan, func.count(self.model.id).label("count"))
            .group_by(self.model.plan)
            .all()
        )

        # Доходы (примерная оценка)
        monthly_revenue = (
            db.query(func.sum(self.model.monthly_price))
            .filter(
                and_(
                    self.model.status == SubscriptionStatus.ACTIVE.value,
                    self.model.billing_period == BillingPeriod.MONTHLY.value,
                )
            )
            .scalar()
            or 0
        )

        yearly_revenue = (
            db.query(func.sum(self.model.yearly_price))
            .filter(
                and_(
                    self.model.status == SubscriptionStatus.ACTIVE.value,
                    self.model.billing_period == BillingPeriod.YEARLY.value,
                )
            )
            .scalar()
            or 0
        )

        return {
            "total_subscriptions": total_subscriptions,
            "active_subscriptions": active_subscriptions,
            "trial_subscriptions": trial_subscriptions,
            "expired_subscriptions": expired_subscriptions,
            "cancelled_subscriptions": cancelled_subscriptions,
            "plan_distribution": {plan: count for plan, count in plan_stats},
            "estimated_monthly_revenue": monthly_revenue,
            "estimated_yearly_revenue": yearly_revenue,
            "conversion_rate": (
                round((active_subscriptions / total_subscriptions * 100), 2)
                if total_subscriptions > 0
                else 0
            ),
        }

    def get_companies_by_usage_limit(
        self,
        db: Session,
        *,
        limit_type: str,  # 'users', 'projects', 'storage', 'api_calls'
        threshold_percent: float = 80.0,
        skip: int = 0,
        limit: int = 100
    ) -> List[CompanySubscription]:
        """Получить компании, близкие к превышению лимитов"""
        # Это требует дополнительной логики для подсчета текущего использования
        # Здесь базовая реализация
        return (
            db.query(self.model)
            .filter(self.model.status == SubscriptionStatus.ACTIVE.value)
            .offset(skip)
            .limit(limit)
            .all()
        )


# Создаем экземпляр CRUD
company_subscription = CRUDCompanySubscription(CompanySubscription)
