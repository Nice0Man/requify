"""
Модель подписки и биллинга компании (4NF декомпозиция).
Содержит всю информацию о подписке, вынесенную из основной модели Company.
"""

from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING, Optional
from enum import Enum as PyEnum
from decimal import Decimal

from sqlalchemy import (
    String,
    Boolean,
    DateTime,
    Integer,
    Index,
    ForeignKey,
    Numeric,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .company import Company


class SubscriptionStatus(PyEnum):
    """Статусы подписки"""

    TRIAL = "trial"
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    SUSPENDED = "suspended"


class SubscriptionPlan(PyEnum):
    """Планы подписки"""

    FREE = "free"
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"
    CUSTOM = "custom"


class BillingPeriod(PyEnum):
    """Периоды биллинга"""

    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"
    CUSTOM = "custom"


class CompanySubscription(Base, TimestampedMixin):
    """
    Подписка и биллинг компании.

    Вынесена из Company согласно 4NF для устранения многозначных зависимостей.
    Содержит всю информацию о тарифах, лимитах, платежах.
    """

    __tablename__ = "company_subscriptions"
    __table_args__ = (
        Index("ix_company_subscriptions_company_id", "company_id"),
        Index("ix_company_subscriptions_status", "status"),
        Index("ix_company_subscriptions_plan", "plan"),
        Index("ix_company_subscriptions_expires_at", "expires_at"),
        Index("ix_company_subscriptions_trial_ends_at", "trial_ends_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID компании",
    )

    # =============================================================================
    # Основная информация о подписке
    # =============================================================================

    status: Mapped[SubscriptionStatus] = mapped_column(
        String(20), nullable=False, default="trial", comment="Статус подписки"
    )
    plan: Mapped[SubscriptionPlan] = mapped_column(
        String(20), nullable=False, default="free", comment="План подписки"
    )
    billing_period: Mapped[BillingPeriod] = mapped_column(
        String(20), nullable=False, default="monthly", comment="Период биллинга"
    )

    # =============================================================================
    # Временные рамки
    # =============================================================================

    started_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now(UTC),
        comment="Дата начала подписки",
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Дата окончания подписки"
    )
    trial_ends_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Дата окончания пробного периода"
    )
    last_payment_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Дата последнего платежа"
    )
    next_billing_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="Дата следующего списания"
    )

    # =============================================================================
    # Финансовая информация
    # =============================================================================

    price: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2), nullable=True, comment="Цена подписки"
    )
    currency: Mapped[str] = mapped_column(
        String(3), nullable=False, default="RUB", comment="Валюта"
    )
    discount_percent: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 2), nullable=True, comment="Процент скидки"
    )
    discount_amount: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2), nullable=True, comment="Сумма скидки"
    )

    # Платежная информация
    total_paid: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, default=0, comment="Общая сумма оплат"
    )
    outstanding_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, default=0, comment="Сумма задолженности"
    )

    # =============================================================================
    # Лимиты и квоты
    # =============================================================================

    max_users: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, comment="Максимальное количество пользователей"
    )
    max_projects: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, comment="Максимальное количество проектов"
    )
    max_departments: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, comment="Максимальное количество департаментов"
    )
    max_teams: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, comment="Максимальное количество команд"
    )
    max_storage_gb: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, comment="Максимальный объем хранилища в ГБ"
    )
    max_api_calls_per_month: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, comment="Лимит API запросов в месяц"
    )

    # =============================================================================
    # Функциональные возможности
    # =============================================================================

    features_enabled: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Включенные функции (JSON массив)"
    )
    integrations_allowed: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Разрешенные интеграции (JSON массив)"
    )

    # Расширенные возможности
    custom_branding: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="Кастомный брендинг"
    )
    advanced_analytics: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="Расширенная аналитика"
    )
    priority_support: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="Приоритетная поддержка"
    )
    api_access: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Доступ к API"
    )
    white_label: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="White label решение"
    )

    # =============================================================================
    # Биллинг и платежи
    # =============================================================================

    billing_contact_id: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, comment="ID контакта для биллинга"
    )
    payment_method: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Способ оплаты (card, invoice, bank_transfer)",
    )
    invoice_email: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Email для счетов"
    )

    # Автоматическое продление
    auto_renew: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Автоматическое продление"
    )
    grace_period_days: Mapped[int] = mapped_column(
        Integer, nullable=False, default=7, comment="Льготный период (дни)"
    )

    # =============================================================================
    # Метаданные
    # =============================================================================

    external_subscription_id: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="ID в внешней платежной системе"
    )
    notes: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Заметки о подписке"
    )

    # =============================================================================
    # Отношения
    # =============================================================================

    company: Mapped["Company"] = relationship(
        "Company", back_populates="subscriptions", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<CompanySubscription(id={self.id}, company_id={self.company_id}, plan='{self.plan}', status='{self.status}')>"

    # =============================================================================
    # Business Logic Methods - Status
    # =============================================================================

    @property
    def is_active(self) -> bool:
        """Активна ли подписка"""
        return self.status == SubscriptionStatus.ACTIVE

    @property
    def is_trial(self) -> bool:
        """В пробном ли периоде"""
        return self.status == SubscriptionStatus.TRIAL

    @property
    def is_expired(self) -> bool:
        """Истекла ли подписка"""
        if not self.expires_at:
            return False
        return datetime.now(UTC) > self.expires_at

    @property
    def is_trial_expired(self) -> bool:
        """Истек ли пробный период"""
        if not self.trial_ends_at:
            return False
        return datetime.now(UTC) > self.trial_ends_at

    @property
    def days_until_expiry(self) -> Optional[int]:
        """Дни до истечения подписки"""
        if not self.expires_at:
            return None
        delta = self.expires_at - datetime.now(UTC)
        return max(0, delta.days)

    @property
    def days_until_trial_end(self) -> Optional[int]:
        """Дни до конца пробного периода"""
        if not self.trial_ends_at:
            return None
        delta = self.trial_ends_at - datetime.now(UTC)
        return max(0, delta.days)

    @property
    def is_overdue(self) -> bool:
        """Есть ли просроченные платежи"""
        return self.outstanding_amount > 0

    # =============================================================================
    # Business Logic Methods - Limits
    # =============================================================================

    def get_limit(self, resource: str) -> Optional[int]:
        """Получить лимит для ресурса"""
        limits_map = {
            "users": self.max_users,
            "projects": self.max_projects,
            "departments": self.max_departments,
            "teams": self.max_teams,
            "storage_gb": self.max_storage_gb,
            "api_calls": self.max_api_calls_per_month,
        }
        return limits_map.get(resource)

    def has_feature(self, feature: str) -> bool:
        """Проверить, включена ли функция"""
        if not self.features_enabled:
            return False

        # Простая проверка для примера (в реальности лучше использовать JSON)
        return feature in self.features_enabled

    def can_use_integration(self, integration: str) -> bool:
        """Проверить, разрешена ли интеграция"""
        if not self.integrations_allowed:
            return False

        return integration in self.integrations_allowed

    # =============================================================================
    # Business Logic Methods - Billing
    # =============================================================================

    def calculate_next_payment_amount(self) -> Decimal:
        """Вычислить сумму следующего платежа"""
        if not self.price:
            return Decimal("0.00")

        amount = self.price

        # Применяем скидку
        if self.discount_percent:
            amount = amount * (Decimal("100") - self.discount_percent) / Decimal("100")
        elif self.discount_amount:
            amount = max(Decimal("0.00"), amount - self.discount_amount)

        return amount

    def extend_subscription(self, days: int) -> None:
        """Продлить подписку на указанное количество дней"""
        if self.expires_at:
            self.expires_at += timedelta(days=days)
        else:
            self.expires_at = datetime.now(UTC) + timedelta(days=days)

    def extend_trial(self, days: int) -> None:
        """Продлить пробный период"""
        if self.trial_ends_at:
            self.trial_ends_at += timedelta(days=days)
        else:
            self.trial_ends_at = datetime.now(UTC) + timedelta(days=days)

    def upgrade_plan(self, new_plan: SubscriptionPlan) -> None:
        """Обновить план подписки"""
        self.plan = new_plan
        # Логика обновления лимитов в зависимости от плана
        self._update_limits_for_plan(new_plan)

    def activate(self) -> None:
        """Активировать подписку"""
        self.status = SubscriptionStatus.ACTIVE
        if not self.started_at:
            self.started_at = datetime.now(UTC)

    def cancel(self) -> None:
        """Отменить подписку"""
        self.status = SubscriptionStatus.CANCELLED
        self.auto_renew = False

    def suspend(self) -> None:
        """Приостановить подписку"""
        self.status = SubscriptionStatus.SUSPENDED

    def _update_limits_for_plan(self, plan: SubscriptionPlan) -> None:
        """Обновить лимиты в соответствии с планом"""
        plan_limits = {
            SubscriptionPlan.FREE: {
                "max_users": 3,
                "max_projects": 1,
                "max_departments": 1,
                "max_teams": 2,
                "max_storage_gb": 1,
                "max_api_calls_per_month": 1000,
            },
            SubscriptionPlan.BASIC: {
                "max_users": 10,
                "max_projects": 5,
                "max_departments": 3,
                "max_teams": 10,
                "max_storage_gb": 10,
                "max_api_calls_per_month": 10000,
            },
            SubscriptionPlan.PROFESSIONAL: {
                "max_users": 50,
                "max_projects": 25,
                "max_departments": 10,
                "max_teams": 50,
                "max_storage_gb": 100,
                "max_api_calls_per_month": 100000,
            },
            SubscriptionPlan.ENTERPRISE: {
                "max_users": None,  # Unlimited
                "max_projects": None,
                "max_departments": None,
                "max_teams": None,
                "max_storage_gb": 1000,
                "max_api_calls_per_month": 1000000,
            },
        }

        limits = plan_limits.get(plan, {})
        for field, value in limits.items():
            setattr(self, field, value)
