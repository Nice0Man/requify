"""
Сервис для бизнес-логики подписок компании.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timezone, timedelta
from decimal import Decimal

from app.crud.company_subscription import company_subscription as subscription_crud
from app.crud.company import company as company_crud
from app.models.company_subscription import CompanySubscription
from app.models.user import User
from app.schemas.company_subscription import (
    CompanySubscriptionCreate,
    CompanySubscriptionUpdate,
    CompanySubscriptionResponse,
    SubscriptionStatus,
    SubscriptionPlan,
    BillingPeriod,
    SubscriptionPlanDetails,
    SubscriptionUsageStats,
    SubscriptionBillingInfo,
)


class CompanySubscriptionService:
    """Сервис для работы с подписками компании"""

    def __init__(self):
        self.crud = subscription_crud
        # Конфигурация планов подписки
        self.plan_configs = self._get_plan_configurations()

    def get_company_subscription(
        self, db: Session, *, company_id: int, current_user: User
    ) -> Optional[CompanySubscription]:
        """Получить подписку компании"""

        # Проверить права доступа к компании
        if not self._can_access_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
            )

        return self.crud.get_by_company(db, company_id=company_id)

    def create_subscription(
        self,
        db: Session,
        *,
        company_id: int,
        subscription_data: CompanySubscriptionCreate,
        current_user: User,
    ) -> CompanySubscription:
        """Создать подписку для компании"""

        # Проверить права на управление подписками
        if not self._can_manage_company_subscription(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to manage company subscription",
            )

        # Проверить существование компании
        company = company_crud.get(db, id=company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Company not found"
            )

        # Применить конфигурацию плана
        subscription_data = self._apply_plan_configuration(subscription_data)

        # Создать подписку
        subscription = self.crud.create_for_company(
            db, obj_in=subscription_data, company_id=company_id
        )

        return subscription

    def update_subscription(
        self,
        db: Session,
        *,
        company_id: int,
        subscription_data: CompanySubscriptionUpdate,
        current_user: User,
    ) -> CompanySubscription:
        """Обновить подписку компании"""

        # Проверить права на управление подписками
        if not self._can_manage_company_subscription(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to manage company subscription",
            )

        # Получить существующую подписку
        subscription = self.crud.get_by_company(db, company_id=company_id)
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company subscription not found",
            )

        # Обновить подписку
        updated_subscription = self.crud.update(
            db, db_obj=subscription, obj_in=subscription_data
        )

        return updated_subscription

    def upgrade_subscription(
        self,
        db: Session,
        *,
        company_id: int,
        new_plan: SubscriptionPlan,
        current_user: User,
    ) -> CompanySubscription:
        """Обновить план подписки"""

        # Проверить права на управление подписками
        if not self._can_manage_company_subscription(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to upgrade subscription",
            )

        # Получить конфигурацию нового плана
        plan_config = self.plan_configs.get(new_plan)
        if not plan_config:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid subscription plan",
            )

        # Обновить план
        subscription = self.crud.upgrade_plan(
            db,
            company_id=company_id,
            new_plan=new_plan,
            monthly_price=plan_config["monthly_price"],
            yearly_price=plan_config["yearly_price"],
        )

        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company subscription not found",
            )

        return subscription

    def activate_subscription(
        self, db: Session, *, company_id: int, current_user: User
    ) -> CompanySubscription:
        """Активировать подписку"""

        # Проверить права на управление подписками
        if not self._can_manage_company_subscription(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to activate subscription",
            )

        subscription = self.crud.activate_subscription(db, company_id=company_id)

        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company subscription not found",
            )

        return subscription

    def suspend_subscription(
        self, db: Session, *, company_id: int, reason: Optional[str], current_user: User
    ) -> CompanySubscription:
        """Приостановить подписку"""

        # Только системные администраторы могут приостанавливать подписки
        if not current_user.is_system_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only system administrators can suspend subscriptions",
            )

        subscription = self.crud.suspend_subscription(
            db, company_id=company_id, reason=reason
        )

        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company subscription not found",
            )

        return subscription

    def cancel_subscription(
        self,
        db: Session,
        *,
        company_id: int,
        immediate: bool = False,
        current_user: User,
    ) -> CompanySubscription:
        """Отменить подписку"""

        # Проверить права на управление подписками
        if not self._can_manage_company_subscription(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to cancel subscription",
            )

        subscription = self.crud.cancel_subscription(
            db, company_id=company_id, immediate=immediate
        )

        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company subscription not found",
            )

        return subscription

    def renew_subscription(
        self,
        db: Session,
        *,
        company_id: int,
        billing_period: Optional[BillingPeriod],
        current_user: User,
    ) -> CompanySubscription:
        """Продлить подписку"""

        # Проверить права на управление подписками
        if not self._can_manage_company_subscription(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to renew subscription",
            )

        subscription = self.crud.renew_subscription(
            db, company_id=company_id, billing_period=billing_period
        )

        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company subscription not found",
            )

        return subscription

    def get_subscription_usage_stats(
        self, db: Session, *, company_id: int, current_user: User
    ) -> SubscriptionUsageStats:
        """Получить статистику использования подписки"""

        # Проверить права доступа к компании
        if not self._can_access_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
            )

        subscription = self.crud.get_by_company(db, company_id=company_id)
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company subscription not found",
            )

        # Получить текущую статистику использования
        company = company_crud.get(db, id=company_id)

        # Подсчитать текущее использование
        current_users = company.current_user_count if company else 0
        current_projects = 0  # TODO: Подсчитать из проектов
        current_departments = company.current_department_count if company else 0
        current_teams = 0  # TODO: Подсчитать из команд
        storage_used_gb = 0.0  # TODO: Подсчитать использование хранилища
        api_calls_this_month = 0  # TODO: Подсчитать API вызовы
        integrations_count = 0  # TODO: Подсчитать интеграции

        # Вычислить процент использования
        usage_stats = SubscriptionUsageStats(
            subscription_id=subscription.id,
            company_id=company_id,
            current_users=current_users,
            current_projects=current_projects,
            current_departments=current_departments,
            current_teams=current_teams,
            storage_used_gb=storage_used_gb,
            api_calls_this_month=api_calls_this_month,
            integrations_count=integrations_count,
            max_users=subscription.max_users,
            max_projects=subscription.max_projects,
            max_departments=subscription.max_departments,
            max_teams=subscription.max_teams,
            max_storage_gb=subscription.max_storage_gb,
            max_api_calls_per_month=subscription.max_api_calls_per_month,
            max_integrations=subscription.max_integrations,
            users_usage_percent=self._calculate_usage_percent(
                current_users, subscription.max_users
            ),
            projects_usage_percent=self._calculate_usage_percent(
                current_projects, subscription.max_projects
            ),
            departments_usage_percent=self._calculate_usage_percent(
                current_departments, subscription.max_departments
            ),
            teams_usage_percent=self._calculate_usage_percent(
                current_teams, subscription.max_teams
            ),
            storage_usage_percent=self._calculate_usage_percent(
                storage_used_gb, subscription.max_storage_gb
            ),
            api_usage_percent=self._calculate_usage_percent(
                api_calls_this_month, subscription.max_api_calls_per_month
            ),
        )

        # Проверить превышения лимитов
        warnings = []
        if usage_stats.users_usage_percent > 80:
            warnings.append(
                f"User limit almost reached: {usage_stats.users_usage_percent:.1f}%"
            )
        if usage_stats.storage_usage_percent > 80:
            warnings.append(
                f"Storage limit almost reached: {usage_stats.storage_usage_percent:.1f}%"
            )

        usage_stats.warnings = warnings
        usage_stats.is_over_limit = any(
            usage > 100
            for usage in [
                usage_stats.users_usage_percent,
                usage_stats.projects_usage_percent,
                usage_stats.storage_usage_percent,
                usage_stats.api_usage_percent,
            ]
        )

        return usage_stats

    def get_available_plans(self) -> List[SubscriptionPlanDetails]:
        """Получить доступные планы подписки"""
        plans = []

        for plan, config in self.plan_configs.items():
            plan_details = SubscriptionPlanDetails(
                plan=plan,
                name=config["name"],
                description=config["description"],
                monthly_price=config["monthly_price"],
                yearly_price=config["yearly_price"],
                currency=config["currency"],
                max_users=config["limits"]["max_users"],
                max_projects=config["limits"]["max_projects"],
                max_departments=config["limits"]["max_departments"],
                max_teams=config["limits"]["max_teams"],
                max_storage_gb=config["limits"]["max_storage_gb"],
                max_api_calls_per_month=config["limits"]["max_api_calls_per_month"],
                max_integrations=config["limits"]["max_integrations"],
                features=config["features"],
                can_export_data=config["capabilities"]["can_export_data"],
                can_use_api=config["capabilities"]["can_use_api"],
                can_use_integrations=config["capabilities"]["can_use_integrations"],
                can_use_advanced_analytics=config["capabilities"][
                    "can_use_advanced_analytics"
                ],
                can_use_custom_branding=config["capabilities"][
                    "can_use_custom_branding"
                ],
                priority_support=config["capabilities"]["priority_support"],
                is_popular=config.get("is_popular", False),
                is_recommended=config.get("is_recommended", False),
            )
            plans.append(plan_details)

        return plans

    def get_expiring_subscriptions(
        self,
        db: Session,
        *,
        days_until_expiry: int = 7,
        current_user: User,
        skip: int = 0,
        limit: int = 100,
    ) -> List[CompanySubscription]:
        """Получить истекающие подписки"""

        # Только системные администраторы могут просматривать все подписки
        if not current_user.is_system_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only system administrators can view all subscriptions",
            )

        return self.crud.get_expiring_subscriptions(
            db, days_until_expiry=days_until_expiry, skip=skip, limit=limit
        )

    def get_subscription_statistics(
        self, db: Session, *, current_user: User
    ) -> Dict[str, Any]:
        """Получить статистику подписок"""

        # Только системные администраторы могут просматривать статистику
        if not current_user.is_system_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only system administrators can view subscription statistics",
            )

        return self.crud.get_subscription_stats(db)

    # Приватные методы

    def _get_plan_configurations(self) -> Dict[SubscriptionPlan, Dict[str, Any]]:
        """Получить конфигурации планов подписки"""
        return {
            SubscriptionPlan.FREE: {
                "name": "Free",
                "description": "Базовый бесплатный план",
                "monthly_price": Decimal("0"),
                "yearly_price": Decimal("0"),
                "currency": "USD",
                "limits": {
                    "max_users": 3,
                    "max_projects": 5,
                    "max_departments": 1,
                    "max_teams": 2,
                    "max_storage_gb": 1,
                    "max_api_calls_per_month": 1000,
                    "max_integrations": 1,
                },
                "capabilities": {
                    "can_export_data": False,
                    "can_use_api": True,
                    "can_use_integrations": False,
                    "can_use_advanced_analytics": False,
                    "can_use_custom_branding": False,
                    "priority_support": False,
                },
                "features": ["Базовое управление требованиями", "Простые отчеты"],
            },
            SubscriptionPlan.BASIC: {
                "name": "Basic",
                "description": "Для малых команд",
                "monthly_price": Decimal("29"),
                "yearly_price": Decimal("290"),
                "currency": "USD",
                "limits": {
                    "max_users": 10,
                    "max_projects": 25,
                    "max_departments": 3,
                    "max_teams": 10,
                    "max_storage_gb": 10,
                    "max_api_calls_per_month": 10000,
                    "max_integrations": 3,
                },
                "capabilities": {
                    "can_export_data": True,
                    "can_use_api": True,
                    "can_use_integrations": True,
                    "can_use_advanced_analytics": False,
                    "can_use_custom_branding": False,
                    "priority_support": False,
                },
                "features": ["Расширенные отчеты", "Экспорт данных", "API доступ"],
                "is_popular": True,
            },
            SubscriptionPlan.PROFESSIONAL: {
                "name": "Professional",
                "description": "Для растущих команд",
                "monthly_price": Decimal("99"),
                "yearly_price": Decimal("990"),
                "currency": "USD",
                "limits": {
                    "max_users": 50,
                    "max_projects": 100,
                    "max_departments": 10,
                    "max_teams": 50,
                    "max_storage_gb": 100,
                    "max_api_calls_per_month": 100000,
                    "max_integrations": 10,
                },
                "capabilities": {
                    "can_export_data": True,
                    "can_use_api": True,
                    "can_use_integrations": True,
                    "can_use_advanced_analytics": True,
                    "can_use_custom_branding": True,
                    "priority_support": True,
                },
                "features": [
                    "Продвинутая аналитика",
                    "Кастомный брендинг",
                    "Приоритетная поддержка",
                ],
                "is_recommended": True,
            },
            SubscriptionPlan.ENTERPRISE: {
                "name": "Enterprise",
                "description": "Для крупных организаций",
                "monthly_price": Decimal("299"),
                "yearly_price": Decimal("2990"),
                "currency": "USD",
                "limits": {
                    "max_users": 500,
                    "max_projects": 1000,
                    "max_departments": 50,
                    "max_teams": 200,
                    "max_storage_gb": 1000,
                    "max_api_calls_per_month": 1000000,
                    "max_integrations": 50,
                },
                "capabilities": {
                    "can_export_data": True,
                    "can_use_api": True,
                    "can_use_integrations": True,
                    "can_use_advanced_analytics": True,
                    "can_use_custom_branding": True,
                    "priority_support": True,
                },
                "features": [
                    "Все возможности",
                    "Приоритетная поддержка 24/7",
                    "Персональный менеджер",
                ],
            },
            SubscriptionPlan.UNLIMITED: {
                "name": "Unlimited",
                "description": "Без ограничений",
                "monthly_price": Decimal("999"),
                "yearly_price": Decimal("9990"),
                "currency": "USD",
                "limits": {
                    "max_users": None,
                    "max_projects": None,
                    "max_departments": None,
                    "max_teams": None,
                    "max_storage_gb": None,
                    "max_api_calls_per_month": None,
                    "max_integrations": None,
                },
                "capabilities": {
                    "can_export_data": True,
                    "can_use_api": True,
                    "can_use_integrations": True,
                    "can_use_advanced_analytics": True,
                    "can_use_custom_branding": True,
                    "priority_support": True,
                },
                "features": [
                    "Безлимитные возможности",
                    "Выделенная поддержка",
                    "Кастомные интеграции",
                ],
            },
        }

    def _apply_plan_configuration(
        self, subscription_data: CompanySubscriptionCreate
    ) -> CompanySubscriptionCreate:
        """Применить конфигурацию плана к данным подписки"""
        plan_config = self.plan_configs.get(subscription_data.plan)
        if not plan_config:
            return subscription_data

        # Применить лимиты плана
        for limit_key, limit_value in plan_config["limits"].items():
            if (
                not hasattr(subscription_data, limit_key)
                or getattr(subscription_data, limit_key) is None
            ):
                setattr(subscription_data, limit_key, limit_value)

        # Применить возможности плана
        for capability_key, capability_value in plan_config["capabilities"].items():
            if (
                not hasattr(subscription_data, capability_key)
                or getattr(subscription_data, capability_key) is None
            ):
                setattr(subscription_data, capability_key, capability_value)

        # Применить цены
        if not subscription_data.monthly_price:
            subscription_data.monthly_price = plan_config["monthly_price"]
        if not subscription_data.yearly_price:
            subscription_data.yearly_price = plan_config["yearly_price"]

        return subscription_data

    def _calculate_usage_percent(
        self, current: Optional[float], limit: Optional[int]
    ) -> float:
        """Вычислить процент использования"""
        if limit is None or limit == 0:
            return 0.0
        if current is None:
            return 0.0
        return (current / limit) * 100

    def _can_access_company(self, user: User, company_id: int) -> bool:
        """Проверить права доступа к компании"""
        if user.is_system_admin:
            return True

        if user.company_id == company_id:
            return True

        # TODO: Проверить доступ через Enhanced Role System
        return False

    def _can_manage_company_subscription(self, user: User, company_id: int) -> bool:
        """Проверить права на управление подпиской компании"""
        if user.is_system_admin:
            return True

        if user.company_id == company_id and user.is_company_admin:
            return True

        # TODO: Проверить права через Enhanced Role System
        return False


# Создаем экземпляр сервиса
company_subscription_service = CompanySubscriptionService()
