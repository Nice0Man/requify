"""
Сервис уведомлений.

Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

import asyncio
<<<<<<< HEAD
import logging
import smtplib
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from enum import Enum
from typing import Any, Dict, List, Optional

from app.core.config import settings
from app.core.exceptions import NotificationError
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.user import User
=======
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime, UTC
from enum import Enum
from abc import ABC, abstractmethod
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import settings
from app.models.user import User
from app.models.requirement import Requirement
from app.models.project import Project
from .base import BaseService, ServiceError
>>>>>>> dev-backend

logger = logging.getLogger(__name__)


class NotificationServiceError(ServiceError):
    """Ошибки сервиса уведомлений."""

    pass


class NotificationType(str, Enum):
    """Типы уведомлений."""

    REQUIREMENT_STATUS_CHANGED = "requirement_status_changed"
    REQUIREMENT_CREATED = "requirement_created"
    REQUIREMENT_UPDATED = "requirement_updated"
    PROJECT_CREATED = "project_created"
    PROJECT_UPDATED = "project_updated"
    COMMENT_ADDED = "comment_added"
    TESTING_COMPLETED = "testing_completed"


class NotificationChannel(str, Enum):
    """Каналы доставки уведомлений."""

    EMAIL = "email"
    IN_APP = "in_app"
    SMS = "sms"


class NotificationPriority(str, Enum):
    """Приоритеты уведомлений."""

    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


@dataclass
class NotificationTemplate:
    """Шаблон уведомления."""

    type: NotificationType
    subject_template: str
    body_template: str
    html_template: Optional[str] = None


@dataclass
class NotificationRecipient:
    """Получатель уведомления."""

    user_id: int
    email: str
    name: str
    preferred_channels: List[NotificationChannel]


@dataclass
class NotificationContext:
    """Контекст для формирования уведомления."""

    type: NotificationType
    recipients: List[NotificationRecipient]
    data: Dict[str, Any]
    channels: List[NotificationChannel]
    priority: NotificationPriority = NotificationPriority.NORMAL


@dataclass
class NotificationResult:
    """Результат отправки уведомления."""

    success: bool
    channel: NotificationChannel
    recipient: NotificationRecipient
    error_message: Optional[str] = None
    sent_at: Optional[datetime] = None


# Абстрактные интерфейсы
class INotificationChannel(ABC):
    """Интерфейс канала доставки уведомлений."""

    @abstractmethod
    async def send(
        self,
        recipient: NotificationRecipient,
        subject: str,
        content: str,
        context: NotificationContext,
    ) -> NotificationResult:
        pass

    @abstractmethod
    def get_channel_type(self) -> NotificationChannel:
        pass


class INotificationTemplate(ABC):
    """Интерфейс для шаблонов уведомлений."""

    @abstractmethod
    def render(self, data: Dict[str, Any]) -> Dict[str, str]:
        pass


# Конкретные реализации
class EmailNotificationChannel(INotificationChannel):
    """Канал email уведомлений."""

    def __init__(self):
        if hasattr(settings, "email"):
            email_config = settings.email
            self.smtp_server = getattr(email_config, "smtp_server", "localhost")
            self.smtp_port = getattr(email_config, "smtp_port", 587)
            self.from_email = getattr(email_config, "from_email", "noreply@example.com")
        else:
            self.smtp_server = "localhost"
            self.smtp_port = 587
            self.from_email = "noreply@example.com"

    async def send(
        self,
        recipient: NotificationRecipient,
        subject: str,
        content: str,
        context: NotificationContext,
    ) -> NotificationResult:
        """Отправить email уведомление."""
        try:
            # Для демонстрации просто логируем
            logger.info(f"Sending email to {recipient.email}: {subject}")

            return NotificationResult(
                success=True,
                channel=self.get_channel_type(),
                recipient=recipient,
                sent_at=datetime.now(UTC),
            )

        except Exception as e:
            logger.error(f"Failed to send email to {recipient.email}: {e}")
            return NotificationResult(
                success=False,
                channel=self.get_channel_type(),
                recipient=recipient,
                error_message=str(e),
            )

    def get_channel_type(self) -> NotificationChannel:
        return NotificationChannel.EMAIL


class InAppNotificationChannel(INotificationChannel):
    """Канал внутриприложенческих уведомлений."""

    async def send(
        self,
        recipient: NotificationRecipient,
        subject: str,
        content: str,
        context: NotificationContext,
    ) -> NotificationResult:
        """Сохранить уведомление в приложении."""
        try:
            logger.info(f"In-app notification for user {recipient.user_id}: {subject}")

            return NotificationResult(
                success=True,
                channel=self.get_channel_type(),
                recipient=recipient,
                sent_at=datetime.now(UTC),
            )

        except Exception as e:
            return NotificationResult(
                success=False,
                channel=self.get_channel_type(),
                recipient=recipient,
                error_message=str(e),
            )

    def get_channel_type(self) -> NotificationChannel:
        return NotificationChannel.IN_APP


class SimpleNotificationTemplate(INotificationTemplate):
    """Простой шаблон уведомлений."""

    def __init__(self, template: NotificationTemplate):
        self.template = template

    def render(self, data: Dict[str, Any]) -> Dict[str, str]:
        """Отрендерить шаблон с подстановкой данных."""
        try:
            subject = self.template.subject_template.format(**data)
            body = self.template.body_template.format(**data)

            result = {"subject": subject, "body": body}

            if self.template.html_template:
                result["html"] = self.template.html_template.format(**data)

            return result

        except KeyError as e:
            raise NotificationServiceError(f"Missing template variable: {e}")


class NotificationTemplateManager:
    """Менеджер шаблонов уведомлений."""

    def __init__(self):
        self._templates: Dict[NotificationType, NotificationTemplate] = {}
        self._load_default_templates()

    def _load_default_templates(self):
        """Загрузить базовые шаблоны."""
        templates = [
            NotificationTemplate(
                type=NotificationType.REQUIREMENT_CREATED,
                subject_template="Новое требование: {requirement_name}",
                body_template="Создано новое требование '{requirement_name}' в проекте '{project_name}'.",
            ),
            NotificationTemplate(
                type=NotificationType.REQUIREMENT_STATUS_CHANGED,
                subject_template="Изменен статус требования: {requirement_name}",
                body_template="Статус требования '{requirement_name}' изменен на '{new_status}'.",
            ),
            NotificationTemplate(
                type=NotificationType.PROJECT_CREATED,
                subject_template="Новый проект: {project_name}",
                body_template="Создан новый проект '{project_name}'.",
            ),
        ]

        for template in templates:
            self._templates[template.type] = template

    def get_template(
        self, notification_type: NotificationType
    ) -> Optional[NotificationTemplate]:
        """Получить шаблон по типу уведомления."""
        return self._templates.get(notification_type)

    def register_template(self, template: NotificationTemplate):
        """Зарегистрировать новый шаблон."""
        self._templates[template.type] = template


class NotificationService(BaseService):
    """
    Основной сервис уведомлений.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Strategy (разные каналы доставки)
    - Template Method (процесс отправки)
    """

    def __init__(self):
        self._channels: Dict[NotificationChannel, INotificationChannel] = {}
        self._template_manager = NotificationTemplateManager()
        super().__init__()

    def get_service_name(self) -> str:
        return "NotificationService"

    def _setup(self):
        """Инициализация сервиса с регистрацией каналов."""
        if not self._initialized:
            self.register_channel(EmailNotificationChannel())
            self.register_channel(InAppNotificationChannel())
            super()._setup()

    def register_channel(self, channel: INotificationChannel):
        """Регистрация канала доставки."""
        self._channels[channel.get_channel_type()] = channel
        self._log_operation(
            "register_channel", {"channel": channel.get_channel_type().value}
        )

    async def send_notification(
        self, context: NotificationContext
    ) -> List[NotificationResult]:
        """Отправить уведомление."""
        try:
            self._log_operation(
                "send_notification",
                {
                    "type": context.type.value,
                    "recipients_count": len(context.recipients),
                },
            )

            # Получение шаблона
            template = self._template_manager.get_template(context.type)
            if not template:
                raise NotificationServiceError(
                    f"Template not found for type: {context.type}"
                )

            # Рендеринг шаблона
            template_renderer = SimpleNotificationTemplate(template)
            rendered = template_renderer.render(context.data)

            results = []

            # Отправка через каждый канал
            for channel_type in context.channels:
                if channel_type not in self._channels:
                    continue

                channel = self._channels[channel_type]

                # Отправка каждому получателю
                for recipient in context.recipients:
                    if channel_type in recipient.preferred_channels:
                        result = await channel.send(
                            recipient, rendered["subject"], rendered["body"], context
                        )
                        results.append(result)

            return results

        except Exception as e:
            raise self._handle_error(e, "send_notification")

    async def send_requirement_notification(
        self,
        notification_type: NotificationType,
        requirement: Requirement,
        recipients: List[User],
        additional_data: Optional[Dict[str, Any]] = None,
    ):
        """Отправить уведомление о требовании."""
        try:
<<<<<<< HEAD
            from sqlalchemy import and_, select

            from app import crud
            from app.db.session import async_session_scope
            from app.models.requirement import Requirement

            logger.info("Выполняется проверка дедлайнов требований")

            notifications_sent = 0
            checked_requirements = 0

            async with async_session_scope() as db:
                # Определяем временные рамки для уведомлений (1 день, 3 дня, 1 неделя)
                now = datetime.now(UTC)
                warning_periods = [
                    timedelta(days=1),
                    timedelta(days=3),
                    timedelta(days=7),
                ]

                for period in warning_periods:
                    deadline_threshold = now + period
                    logger.info(f"Проверяем дедлайны в период: {deadline_threshold}")

                    # Ищем требования с дедлайнами в указанном периоде
                    # Предполагаем, что в модели Requirement есть поле deadline
                    # Если его нет, используем планируемую дату релиза
                    stmt = (
                        select(Requirement)
                        .where(
                            and_(
                                Requirement.release.has(),  # Есть связанный релиз
                                # Используем планируемую дату релиза как дедлайн
                            )
                        )
                        .limit(100)
                    )

                    result = await db.execute(stmt)
                    requirements = result.scalars().all()

                    for req in requirements:
                        checked_requirements += 1

                        # Проверяем, есть ли у релиза планируемая дата
                        if req.release and req.release.planned_date:
                            deadline = req.release.planned_date
                            time_diff = deadline - now

                            # Проверяем, попадает ли в период предупреждения
                            if timedelta(0) <= time_diff <= period:
                                # Получаем заинтересованных пользователей
                                # (автор требования, участники проекта)
                                recipients = []

                                if req.author:
                                    recipients.append(req.author)

                                # Уведомляем о приближающемся дедлайне
                                await self.notify_deadline_approaching(
                                    req, deadline, recipients
                                )
                                notifications_sent += 1

                                logger.info(
                                    f"Отправлено уведомление о дедлайне для требования {req.id}"
                                )

            return {
                "checked": checked_requirements,
                "notifications_sent": notifications_sent,
                "status": "completed",
=======
            data = {
                "requirement_name": requirement.name,
                "requirement_id": requirement.id,
                "project_name": (
                    requirement.project.name if requirement.project else "Unknown"
                ),
                **(additional_data or {}),
>>>>>>> dev-backend
            }

            notification_recipients = [
                NotificationRecipient(
                    user_id=user.id,
                    email=user.email,
                    name=user.name or user.username,
                    preferred_channels=[
                        NotificationChannel.EMAIL,
                        NotificationChannel.IN_APP,
                    ],
                )
                for user in recipients
            ]

            context = NotificationContext(
                type=notification_type,
                recipients=notification_recipients,
                data=data,
                channels=[NotificationChannel.EMAIL, NotificationChannel.IN_APP],
            )

            await self.send_notification(context)

        except Exception as e:
            raise self._handle_error(e, "send_requirement_notification")


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("notification", NotificationService)

# Singleton instance
notification_service = NotificationService()
