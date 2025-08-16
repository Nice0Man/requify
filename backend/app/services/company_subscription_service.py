"""
Company Subscription Service.

Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

from typing import List, Optional, Dict, Any
from abc import ABC, abstractmethod
from enum import Enum
from dataclasses import dataclass
from datetime import datetime, timezone, timedelta
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status

from app.models.user import User
from app.models.company import Company
from app.crud.company_subscription import company_subscription as subscription_crud
from app.utils.logger import logger
from .base import BaseService, ServiceError


class SubscriptionServiceError(ServiceError):
    """Ошибки сервиса подписок."""

    pass


class SubscriptionNotFoundError(SubscriptionServiceError):
    """Ошибка - подписка не найдена."""

    pass


class SubscriptionValidationError(SubscriptionServiceError):
    """Ошибка валидации подписки."""

    pass


class SubscriptionStatus(str, Enum):
    """Статусы подписки."""

    ACTIVE = "active"
    EXPIRED = "expired"
    SUSPENDED = "suspended"
    CANCELLED = "cancelled"
    TRIAL = "trial"


class SubscriptionPlan(str, Enum):
    """Планы подписки."""

    FREE = "free"
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class BillingPeriod(str, Enum):
    """Периоды биллинга."""

    MONTHLY = "monthly"
    YEARLY = "yearly"


@dataclass
class SubscriptionInfo:
    """Информация о подписке."""

    id: int
    company_id: int
    plan: SubscriptionPlan
    status: SubscriptionStatus
    billing_period: BillingPeriod
    start_date: datetime
    end_date: Optional[datetime]
    price: Decimal
    currency: str = "USD"


@dataclass
class UsageStats:
    """Статистика использования."""

    users_count: int
    projects_count: int
    storage_used: int
    api_calls_count: int
    plan_limits: Dict[str, Any]


# Абстрактные интерфейсы
class ISubscriptionRepository(ABC):
    """Интерфейс репозитория подписок."""

    @abstractmethod
    async def get_company_subscription(
        self, db: AsyncSession, company_id: int
    ) -> Optional[Any]:
        """Получить подписку компании."""
        pass

    @abstractmethod
    async def create_subscription(
        self, db: AsyncSession, subscription_data: Dict[str, Any]
    ) -> Any:
        """Создать подписку."""
        pass


class ISubscriptionValidator(ABC):
    """Интерфейс валидатора подписок."""

    @abstractmethod
    async def validate_subscription_change(
        self, db: AsyncSession, company_id: int, new_plan: SubscriptionPlan, user: User
    ) -> bool:
        """Валидировать изменение подписки."""
        pass


class IPlanManager(ABC):
    """Интерфейс менеджера планов."""

    @abstractmethod
    def get_plan_limits(self, plan: SubscriptionPlan) -> Dict[str, Any]:
        """Получить лимиты плана."""
        pass

    @abstractmethod
    def calculate_price(
        self, plan: SubscriptionPlan, billing_period: BillingPeriod
    ) -> Decimal:
        """Рассчитать стоимость."""
        pass


# Конкретные реализации
class DatabaseSubscriptionRepository(ISubscriptionRepository):
    """Репозиторий подписок в базе данных."""

    async def get_company_subscription(
        self, db: AsyncSession, company_id: int
    ) -> Optional[Any]:
        """Получить подписку компании."""
        return await subscription_crud.get_by_company_id(db, company_id=company_id)

    async def create_subscription(
        self, db: AsyncSession, subscription_data: Dict[str, Any]
    ) -> Any:
        """Создать подписку."""
        return await subscription_crud.create(db, obj_in=subscription_data)

    async def update_subscription(
        self, db: AsyncSession, subscription_id: int, update_data: Dict[str, Any]
    ) -> Any:
        """Обновить подписку."""
        subscription = await subscription_crud.get(db, id=subscription_id)
        if not subscription:
            raise SubscriptionNotFoundError(f"Subscription {subscription_id} not found")

        return await subscription_crud.update(
            db, db_obj=subscription, obj_in=update_data
        )


class StandardSubscriptionValidator(ISubscriptionValidator):
    """Стандартный валидатор подписок."""

    async def validate_subscription_change(
        self, db: AsyncSession, company_id: int, new_plan: SubscriptionPlan, user: User
    ) -> bool:
        """Валидировать изменение подписки."""
        # Проверка прав пользователя
        if not user.is_superuser:
            # Здесь должна быть проверка прав на управление подпиской компании
            pass

        # Проверка, что новый план отличается от текущего
        current_subscription = await subscription_crud.get_by_company_id(
            db, company_id=company_id
        )
        if current_subscription and current_subscription.plan == new_plan.value:
            raise SubscriptionValidationError("New plan is the same as current")

        return True


class StandardPlanManager(IPlanManager):
    """Стандартный менеджер планов."""

    def __init__(self):
        self._plan_configs = {
            SubscriptionPlan.FREE: {
                "max_users": 3,
                "max_projects": 5,
                "max_storage_gb": 1,
                "api_calls_per_month": 1000,
                "support_level": "community",
            },
            SubscriptionPlan.BASIC: {
                "max_users": 10,
                "max_projects": 20,
                "max_storage_gb": 10,
                "api_calls_per_month": 10000,
                "support_level": "email",
            },
            SubscriptionPlan.PROFESSIONAL: {
                "max_users": 50,
                "max_projects": 100,
                "max_storage_gb": 100,
                "api_calls_per_month": 100000,
                "support_level": "priority",
            },
            SubscriptionPlan.ENTERPRISE: {
                "max_users": -1,  # unlimited
                "max_projects": -1,
                "max_storage_gb": -1,
                "api_calls_per_month": -1,
                "support_level": "dedicated",
            },
        }

        self._pricing = {
            SubscriptionPlan.FREE: {
                BillingPeriod.MONTHLY: Decimal("0"),
                BillingPeriod.YEARLY: Decimal("0"),
            },
            SubscriptionPlan.BASIC: {
                BillingPeriod.MONTHLY: Decimal("29"),
                BillingPeriod.YEARLY: Decimal("290"),
            },
            SubscriptionPlan.PROFESSIONAL: {
                BillingPeriod.MONTHLY: Decimal("99"),
                BillingPeriod.YEARLY: Decimal("990"),
            },
            SubscriptionPlan.ENTERPRISE: {
                BillingPeriod.MONTHLY: Decimal("299"),
                BillingPeriod.YEARLY: Decimal("2990"),
            },
        }

    def get_plan_limits(self, plan: SubscriptionPlan) -> Dict[str, Any]:
        """Получить лимиты плана."""
        return self._plan_configs.get(plan, {})

    def calculate_price(
        self, plan: SubscriptionPlan, billing_period: BillingPeriod
    ) -> Decimal:
        """Рассчитать стоимость."""
        return self._pricing.get(plan, {}).get(billing_period, Decimal("0"))


class CompanySubscriptionService(BaseService):
    """
    Основной сервис подписок компании.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Repository (для работы с данными)
    - Strategy (разные валидаторы)
    - Template Method (процесс обновления подписки)
    """

    def __init__(self):
        self._repository: ISubscriptionRepository = DatabaseSubscriptionRepository()
        self._validator: ISubscriptionValidator = StandardSubscriptionValidator()
        self._plan_manager: IPlanManager = StandardPlanManager()
        super().__init__()

    def get_service_name(self) -> str:
        return "CompanySubscriptionService"

    def set_repository(self, repository: ISubscriptionRepository):
        """Установить репозиторий подписок."""
        self._repository = repository
        self._log_operation("set_repository", {"repository": type(repository).__name__})

    def set_validator(self, validator: ISubscriptionValidator):
        """Установить валидатор подписок."""
        self._validator = validator
        self._log_operation("set_validator", {"validator": type(validator).__name__})

    async def get_company_subscription(
        self, db: AsyncSession, company_id: int, user: User
    ) -> Optional[SubscriptionInfo]:
        """Получить подписку компании."""
        try:
            self._log_operation(
                "get_company_subscription",
                {"company_id": company_id, "user_id": user.id},
            )

            subscription = await self._repository.get_company_subscription(
                db, company_id
            )

            if not subscription:
                return None

            return SubscriptionInfo(
                id=subscription.id,
                company_id=subscription.company_id,
                plan=SubscriptionPlan(subscription.plan),
                status=SubscriptionStatus(subscription.status),
                billing_period=BillingPeriod(subscription.billing_period),
                start_date=subscription.start_date,
                end_date=subscription.end_date,
                price=subscription.price,
                currency=subscription.currency,
            )

        except Exception as e:
            raise self._handle_error(e, "get_company_subscription")

    async def create_subscription(
        self,
        db: AsyncSession,
        company_id: int,
        plan: SubscriptionPlan,
        billing_period: BillingPeriod,
        user: User,
    ) -> SubscriptionInfo:
        """Создать подписку."""
        try:
            self._log_operation(
                "create_subscription",
                {
                    "company_id": company_id,
                    "plan": plan.value,
                    "billing_period": billing_period.value,
                    "user_id": user.id,
                },
            )

            # Валидация
            await self._validator.validate_subscription_change(
                db, company_id, plan, user
            )

            # Расчет стоимости
            price = self._plan_manager.calculate_price(plan, billing_period)

            # Создание подписки
            start_date = datetime.now(timezone.utc)
            end_date = self._calculate_end_date(start_date, billing_period)

            subscription_data = {
                "company_id": company_id,
                "plan": plan.value,
                "status": SubscriptionStatus.ACTIVE.value,
                "billing_period": billing_period.value,
                "start_date": start_date,
                "end_date": end_date,
                "price": price,
                "currency": "USD",
                "created_by": user.id,
            }

            subscription = await self._repository.create_subscription(
                db, subscription_data
            )

            return SubscriptionInfo(
                id=subscription.id,
                company_id=subscription.company_id,
                plan=plan,
                status=SubscriptionStatus.ACTIVE,
                billing_period=billing_period,
                start_date=start_date,
                end_date=end_date,
                price=price,
                currency="USD",
            )

        except Exception as e:
            raise self._handle_error(e, "create_subscription")

    async def get_usage_stats(
        self, db: AsyncSession, company_id: int, user: User
    ) -> UsageStats:
        """Получить статистику использования."""
        try:
            self._log_operation(
                "get_usage_stats", {"company_id": company_id, "user_id": user.id}
            )

            # Получение текущей подписки
            subscription = await self.get_company_subscription(db, company_id, user)
            if not subscription:
                raise SubscriptionNotFoundError("No active subscription found")

            # Получение лимитов плана
            plan_limits = self._plan_manager.get_plan_limits(subscription.plan)

            # Здесь должна быть реальная логика подсчета использования
            # Для примера используем заглушки
            return UsageStats(
                users_count=5,  # Реальный подсчет из БД
                projects_count=10,  # Реальный подсчет из БД
                storage_used=512,  # MB
                api_calls_count=2500,  # За текущий месяц
                plan_limits=plan_limits,
            )

        except Exception as e:
            raise self._handle_error(e, "get_usage_stats")

    def get_available_plans(self) -> List[Dict[str, Any]]:
        """Получить доступные планы."""
        plans = []

        for plan in SubscriptionPlan:
            limits = self._plan_manager.get_plan_limits(plan)
            monthly_price = self._plan_manager.calculate_price(
                plan, BillingPeriod.MONTHLY
            )
            yearly_price = self._plan_manager.calculate_price(
                plan, BillingPeriod.YEARLY
            )

            plans.append(
                {
                    "plan": plan.value,
                    "limits": limits,
                    "pricing": {
                        "monthly": float(monthly_price),
                        "yearly": float(yearly_price),
                    },
                }
            )

        return plans

    def _calculate_end_date(
        self, start_date: datetime, billing_period: BillingPeriod
    ) -> datetime:
        """Рассчитать дату окончания подписки."""
        if billing_period == BillingPeriod.MONTHLY:
            return start_date + timedelta(days=30)
        elif billing_period == BillingPeriod.YEARLY:
            return start_date + timedelta(days=365)
        else:
            return start_date + timedelta(days=30)


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("company_subscription", CompanySubscriptionService)

# Singleton instance
company_subscription_service = CompanySubscriptionService()
