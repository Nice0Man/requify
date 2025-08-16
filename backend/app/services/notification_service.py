"""
Сервис уведомлений.

Отвечает за отправку уведомлений пользователям об изменениях
в статусах требований, проектов и других событиях системы.
"""

import asyncio
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

logger = logging.getLogger(__name__)


class NotificationType(str, Enum):
    """Типы уведомлений"""

    REQUIREMENT_STATUS_CHANGED = "requirement_status_changed"
    REQUIREMENT_CREATED = "requirement_created"
    REQUIREMENT_UPDATED = "requirement_updated"
    REQUIREMENT_ASSIGNED = "requirement_assigned"
    REQUIREMENT_DEADLINE_APPROACHING = "requirement_deadline_approaching"
    PROJECT_STATUS_CHANGED = "project_status_changed"
    PROJECT_CREATED = "project_created"
    PROJECT_UPDATED = "project_updated"
    COMMENT_ADDED = "comment_added"
    TESTING_COMPLETED = "testing_completed"
    RELEASE_CREATED = "release_created"
    SYSTEM_MAINTENANCE = "system_maintenance"


class NotificationChannel(str, Enum):
    """Каналы доставки уведомлений"""

    EMAIL = "email"
    IN_APP = "in_app"
    SMS = "sms"  # Для будущего расширения
    WEBHOOK = "webhook"  # Для будущего расширения


@dataclass
class NotificationTemplate:
    """Шаблон уведомления"""

    type: NotificationType
    subject_template: str
    body_template: str
    html_template: Optional[str] = None


@dataclass
class NotificationRecipient:
    """Получатель уведомления"""

    user_id: int
    email: str
    name: str
    preferred_channels: List[NotificationChannel]


@dataclass
class NotificationContext:
    """Контекст для формирования уведомления"""

    type: NotificationType
    recipients: List[NotificationRecipient]
    data: Dict[str, Any]
    channels: List[NotificationChannel]
    priority: str = "normal"  # low, normal, high, urgent
    scheduled_time: Optional[datetime] = None


class NotificationService:
    """
    Сервис уведомлений.

    Реализует принципы SOLID:
    - Single Responsibility: отвечает только за уведомления
    - Open/Closed: легко расширяется новыми каналами доставки
    - Liskov Substitution: может быть заменен другой реализацией
    - Interface Segregation: разделены интерфейсы для разных каналов
    - Dependency Inversion: зависит от абстракций
    """

    def __init__(self):
        self.templates = self._load_templates()
        self.email_config = settings.email

    def _load_templates(self) -> Dict[NotificationType, NotificationTemplate]:
        """Загружает шаблоны уведомлений"""
        return {
            NotificationType.REQUIREMENT_STATUS_CHANGED: NotificationTemplate(
                type=NotificationType.REQUIREMENT_STATUS_CHANGED,
                subject_template="Изменен статус требования: {requirement_name}",
                body_template=(
                    "Здравствуйте, {user_name}!\n\n"
                    "Статус требования '{requirement_name}' изменен с '{old_status}' на '{new_status}'.\n\n"
                    "Проект: {project_name}\n"
                    "Изменил: {changed_by}\n"
                    "Время изменения: {changed_at}\n\n"
                    "Перейти к требованию: {requirement_url}\n\n"
                    "С уважением,\nКоманда Requify"
                ),
                html_template=(
                    "<h2>Изменен статус требования</h2>"
                    "<p>Здравствуйте, <strong>{user_name}</strong>!</p>"
                    "<p>Статус требования <strong>'{requirement_name}'</strong> изменен "
                    "с <span style='color: #ff6b6b;'>{old_status}</span> "
                    "на <span style='color: #51cf66;'>{new_status}</span>.</p>"
                    "<table style='border-collapse: collapse; width: 100%;'>"
                    "<tr><td style='padding: 8px; border: 1px solid #ddd;'><strong>Проект:</strong></td>"
                    "<td style='padding: 8px; border: 1px solid #ddd;'>{project_name}</td></tr>"
                    "<tr><td style='padding: 8px; border: 1px solid #ddd;'><strong>Изменил:</strong></td>"
                    "<td style='padding: 8px; border: 1px solid #ddd;'>{changed_by}</td></tr>"
                    "<tr><td style='padding: 8px; border: 1px solid #ddd;'><strong>Время:</strong></td>"
                    "<td style='padding: 8px; border: 1px solid #ddd;'>{changed_at}</td></tr>"
                    "</table>"
                    "<p><a href='{requirement_url}' style='background-color: #339af0; color: white; "
                    "padding: 10px 15px; text-decoration: none; border-radius: 5px;'>"
                    "Перейти к требованию</a></p>"
                    "<p><em>С уважением,<br>Команда Requify</em></p>"
                ),
            ),
            NotificationType.REQUIREMENT_CREATED: NotificationTemplate(
                type=NotificationType.REQUIREMENT_CREATED,
                subject_template="Создано новое требование: {requirement_name}",
                body_template=(
                    "Здравствуйте, {user_name}!\n\n"
                    "Создано новое требование '{requirement_name}'.\n\n"
                    "Проект: {project_name}\n"
                    "Автор: {author}\n"
                    "Приоритет: {priority}\n"
                    "Тип: {type}\n"
                    "Время создания: {created_at}\n\n"
                    "Описание:\n{description}\n\n"
                    "Перейти к требованию: {requirement_url}\n\n"
                    "С уважением,\nКоманда Requify"
                ),
            ),
            NotificationType.REQUIREMENT_DEADLINE_APPROACHING: NotificationTemplate(
                type=NotificationType.REQUIREMENT_DEADLINE_APPROACHING,
                subject_template="Приближается дедлайн требования: {requirement_name}",
                body_template=(
                    "Здравствуйте, {user_name}!\n\n"
                    "Приближается дедлайн требования '{requirement_name}'.\n\n"
                    "Проект: {project_name}\n"
                    "Дедлайн: {deadline}\n"
                    "Осталось времени: {time_left}\n"
                    "Текущий статус: {current_status}\n\n"
                    "Перейти к требованию: {requirement_url}\n\n"
                    "С уважением,\nКоманда Requify"
                ),
            ),
            NotificationType.PROJECT_STATUS_CHANGED: NotificationTemplate(
                type=NotificationType.PROJECT_STATUS_CHANGED,
                subject_template="Изменен статус проекта: {project_name}",
                body_template=(
                    "Здравствуйте, {user_name}!\n\n"
                    "Статус проекта '{project_name}' изменен с '{old_status}' на '{new_status}'.\n\n"
                    "Изменил: {changed_by}\n"
                    "Время изменения: {changed_at}\n\n"
                    "Перейти к проекту: {project_url}\n\n"
                    "С уважением,\nКоманда Requify"
                ),
            ),
            NotificationType.COMMENT_ADDED: NotificationTemplate(
                type=NotificationType.COMMENT_ADDED,
                subject_template="Новый комментарий к требованию: {requirement_name}",
                body_template=(
                    "Здравствуйте, {user_name}!\n\n"
                    "Добавлен новый комментарий к требованию '{requirement_name}'.\n\n"
                    "Автор комментария: {comment_author}\n"
                    "Время: {comment_time}\n\n"
                    "Комментарий:\n{comment_text}\n\n"
                    "Перейти к требованию: {requirement_url}\n\n"
                    "С уважением,\nКоманда Requify"
                ),
            ),
            NotificationType.TESTING_COMPLETED: NotificationTemplate(
                type=NotificationType.TESTING_COMPLETED,
                subject_template="Завершено тестирование требования: {requirement_name}",
                body_template=(
                    "Здравствуйте, {user_name}!\n\n"
                    "Завершено тестирование требования '{requirement_name}'.\n\n"
                    "Результат тестирования: {test_result}\n"
                    "Тестировщик: {tester}\n"
                    "Время завершения: {completed_at}\n\n"
                    "Перейти к требованию: {requirement_url}\n\n"
                    "С уважением,\nКоманда Requify"
                ),
            ),
        }

    async def send_notification(self, context: NotificationContext) -> Dict[str, Any]:
        """Отправляет уведомление по указанным каналам"""
        results = {
            "total_recipients": len(context.recipients),
            "successful_deliveries": 0,
            "failed_deliveries": 0,
            "errors": [],
        }

        template = self.templates.get(context.type)
        if not template:
            raise NotificationError(f"Шаблон для типа {context.type} не найден")

        try:
            for recipient in context.recipients:
                for channel in context.channels:
                    if channel in recipient.preferred_channels:
                        try:
                            if channel == NotificationChannel.EMAIL:
                                await self._send_email_notification(
                                    template, recipient, context.data
                                )
                            elif channel == NotificationChannel.IN_APP:
                                await self._send_in_app_notification(
                                    template, recipient, context.data
                                )

                            results["successful_deliveries"] += 1

                        except Exception as e:
                            error_msg = f"Ошибка отправки {channel} уведомления для {recipient.email}: {str(e)}"
                            logger.error(error_msg)
                            results["errors"].append(error_msg)
                            results["failed_deliveries"] += 1

            return results

        except Exception as e:
            logger.error(f"Критическая ошибка в сервисе уведомлений: {e}")
            raise NotificationError(f"Ошибка отправки уведомлений: {str(e)}")

    async def _send_email_notification(
        self,
        template: NotificationTemplate,
        recipient: NotificationRecipient,
        data: Dict[str, Any],
    ) -> None:
        """Отправляет email уведомление"""
        if not self.email_config.smtp_host:
            logger.warning("SMTP не настроен, пропускаем email уведомление")
            return

        try:
            # Подготавливаем данные для шаблона
            template_data = {"user_name": recipient.name, **data}

            # Формируем сообщение
            subject = template.subject_template.format(**template_data)
            body = template.body_template.format(**template_data)

            # Создаем email
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = (
                f"{self.email_config.from_name} <{self.email_config.from_email}>"
            )
            msg["To"] = recipient.email

            # Добавляем текстовую версию
            text_part = MIMEText(body, "plain", "utf-8")
            msg.attach(text_part)

            # Добавляем HTML версию, если есть
            if template.html_template:
                html_body = template.html_template.format(**template_data)
                html_part = MIMEText(html_body, "html", "utf-8")
                msg.attach(html_part)

            # Отправляем email
            await self._send_email(msg, recipient.email)

            logger.info(f"Email уведомление отправлено: {recipient.email}")

        except Exception as e:
            logger.error(f"Ошибка отправки email уведомления: {e}")
            raise

    async def _send_email(self, msg: MIMEMultipart, to_email: str) -> None:
        """Отправляет email через SMTP"""
        try:
            # Создаем соединение с SMTP сервером
            if self.email_config.smtp_ssl:
                server = smtplib.SMTP_SSL(
                    self.email_config.smtp_host, self.email_config.smtp_port
                )
            else:
                server = smtplib.SMTP(
                    self.email_config.smtp_host, self.email_config.smtp_port
                )
                if self.email_config.smtp_tls:
                    server.starttls()

            # Аутентификация
            if self.email_config.smtp_user:
                server.login(
                    self.email_config.smtp_user, self.email_config.smtp_password
                )

            # Отправляем email
            text = msg.as_string()
            server.sendmail(self.email_config.from_email, to_email, text)
            server.quit()

        except Exception as e:
            logger.error(f"Ошибка SMTP отправки: {e}")
            raise

    async def _send_in_app_notification(
        self,
        template: NotificationTemplate,
        recipient: NotificationRecipient,
        data: Dict[str, Any],
    ) -> None:
        """Отправляет внутрисистемное уведомление"""
        # Реализуем сохранение уведомления через создание комментария
        try:
            from app import crud
            from app.db.session import async_session_scope
            from app.schemas.comment import CommentCreate

            template_data = {"user_name": recipient.name, **data}
            subject = template.subject_template.format(**template_data)
            body = template.body_template.format(**template_data)

            # Создаем комментарий как in-app уведомление
            async with async_session_scope() as db:
                # Проверяем, есть ли requirement_id в данных
                requirement_id = data.get("requirement_id")
                if requirement_id:
                    # Создаем системный комментарий как уведомление
                    comment_data = CommentCreate(
                        content=f"🔔 {subject}\n\n{body}",
                        requirement_id=requirement_id,
                        author_id=1,  # Системный пользователь
                    )
                    await crud.comment.create(db, obj_in=comment_data)

            logger.info(
                f"In-app уведомление сохранено для пользователя {recipient.user_id}: {template.type}"
            )

        except Exception as e:
            logger.error(f"Ошибка сохранения in-app уведомления: {e}")
            # Не бросаем исключение, чтобы не прерывать другие уведомления
            pass

    async def notify_requirement_status_change(
        self,
        requirement: Requirement,
        old_status: str,
        new_status: str,
        changed_by: User,
        recipients: List[User],
    ) -> Dict[str, Any]:
        """Уведомляет об изменении статуса требования"""
        notification_recipients = [
            NotificationRecipient(
                user_id=user.id,
                email=user.email,
                name=user.name,
                preferred_channels=[
                    NotificationChannel.EMAIL,
                    NotificationChannel.IN_APP,
                ],
            )
            for user in recipients
        ]

        context = NotificationContext(
            type=NotificationType.REQUIREMENT_STATUS_CHANGED,
            recipients=notification_recipients,
            data={
                "requirement_name": requirement.title,
                "requirement_id": requirement.id,
                "old_status": old_status,
                "new_status": new_status,
                "project_name": (
                    requirement.project.name if requirement.project else "Неизвестный"
                ),
                "changed_by": changed_by.name,
                "changed_at": datetime.now(UTC).strftime("%d.%m.%Y %H:%M"),
                "requirement_url": f"{settings.app_host}/requirements/{requirement.id}",
            },
            channels=[NotificationChannel.EMAIL, NotificationChannel.IN_APP],
        )

        return await self.send_notification(context)

    async def notify_requirement_created(
        self, requirement: Requirement, author: User, recipients: List[User]
    ) -> Dict[str, Any]:
        """Уведомляет о создании нового требования"""
        notification_recipients = [
            NotificationRecipient(
                user_id=user.id,
                email=user.email,
                name=user.name,
                preferred_channels=[
                    NotificationChannel.EMAIL,
                    NotificationChannel.IN_APP,
                ],
            )
            for user in recipients
        ]

        context = NotificationContext(
            type=NotificationType.REQUIREMENT_CREATED,
            recipients=notification_recipients,
            data={
                "requirement_name": requirement.title,
                "requirement_id": requirement.id,
                "description": requirement.description or "Описание не указано",
                "project_name": (
                    requirement.project.name if requirement.project else "Неизвестный"
                ),
                "author": author.name,
                "priority": (
                    requirement.priority.name if requirement.priority else "Не указан"
                ),
                "type": requirement.type.name if requirement.type else "Не указан",
                "created_at": (
                    requirement.created_at.strftime("%d.%m.%Y %H:%M")
                    if requirement.created_at
                    else "Неизвестно"
                ),
                "requirement_url": f"{settings.app_host}/requirements/{requirement.id}",
            },
            channels=[NotificationChannel.EMAIL, NotificationChannel.IN_APP],
        )

        return await self.send_notification(context)

    async def notify_deadline_approaching(
        self, requirement: Requirement, deadline: datetime, recipients: List[User]
    ) -> Dict[str, Any]:
        """Уведомляет о приближающемся дедлайне"""
        time_left = deadline - datetime.now(UTC)

        if time_left.days > 0:
            time_left_str = f"{time_left.days} дней"
        elif time_left.seconds > 3600:
            hours = time_left.seconds // 3600
            time_left_str = f"{hours} часов"
        else:
            time_left_str = "менее часа"

        notification_recipients = [
            NotificationRecipient(
                user_id=user.id,
                email=user.email,
                name=user.name,
                preferred_channels=[
                    NotificationChannel.EMAIL,
                    NotificationChannel.IN_APP,
                ],
            )
            for user in recipients
        ]

        context = NotificationContext(
            type=NotificationType.REQUIREMENT_DEADLINE_APPROACHING,
            recipients=notification_recipients,
            data={
                "requirement_name": requirement.title,
                "requirement_id": requirement.id,
                "project_name": (
                    requirement.project.name if requirement.project else "Неизвестный"
                ),
                "deadline": deadline.strftime("%d.%m.%Y %H:%M"),
                "time_left": time_left_str,
                "current_status": (
                    requirement.status.name if requirement.status else "Неизвестен"
                ),
                "requirement_url": f"{settings.app_host}/requirements/{requirement.id}",
            },
            channels=[NotificationChannel.EMAIL, NotificationChannel.IN_APP],
            priority="high",
        )

        return await self.send_notification(context)

    async def notify_comment_added(
        self,
        requirement: Requirement,
        comment_text: str,
        comment_author: User,
        recipients: List[User],
    ) -> Dict[str, Any]:
        """Уведомляет о добавлении комментария"""
        notification_recipients = [
            NotificationRecipient(
                user_id=user.id,
                email=user.email,
                name=user.name,
                preferred_channels=[
                    NotificationChannel.EMAIL,
                    NotificationChannel.IN_APP,
                ],
            )
            for user in recipients
            if user.id != comment_author.id  # Не уведомляем автора комментария
        ]

        context = NotificationContext(
            type=NotificationType.COMMENT_ADDED,
            recipients=notification_recipients,
            data={
                "requirement_name": requirement.title,
                "requirement_id": requirement.id,
                "comment_text": (
                    comment_text[:200] + "..."
                    if len(comment_text) > 200
                    else comment_text
                ),
                "comment_author": comment_author.name,
                "comment_time": datetime.now(UTC).strftime("%d.%m.%Y %H:%M"),
                "requirement_url": f"{settings.app_host}/requirements/{requirement.id}",
            },
            channels=[NotificationChannel.EMAIL, NotificationChannel.IN_APP],
        )

        return await self.send_notification(context)

    async def bulk_notify_deadline_check(self) -> Dict[str, Any]:
        """Проверяет дедлайны и отправляет уведомления (для планировщика задач)"""
        # Реализуем получение требований с приближающимися дедлайнами из базы данных
        try:
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
            }

        except Exception as e:
            logger.error(f"Ошибка при проверке дедлайнов: {e}")
            return {
                "checked": 0,
                "notifications_sent": 0,
                "status": "error",
                "error": str(e),
            }


# Экземпляр сервиса для использования в приложении
notification_service = NotificationService()
