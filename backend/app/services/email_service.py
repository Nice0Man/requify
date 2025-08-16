"""
Email Service для отправки уведомлений.

Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

import asyncio
import logging
<<<<<<< HEAD
=======
from typing import Optional, Dict, Any, List
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
>>>>>>> dev-backend
import smtplib
import ssl
from concurrent.futures import ThreadPoolExecutor
<<<<<<< HEAD
from datetime import datetime
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Any, Dict, List, Optional

from jinja2 import Environment, FileSystemLoader, Template

from app.core.config import settings

# === Email Configuration ===
=======
from abc import ABC, abstractmethod
from enum import Enum

from app.core.config import settings
from .base import BaseService, ServiceError
>>>>>>> dev-backend

logger = logging.getLogger(__name__)


class EmailServiceError(ServiceError):
    """Ошибки email сервиса."""

    pass


class EmailDeliveryError(EmailServiceError):
    """Ошибки доставки email."""

    pass


class EmailTemplateError(EmailServiceError):
    """Ошибки шаблонов email."""

    pass


class EmailType(str, Enum):
    """Типы email сообщений."""

    VERIFICATION = "verification"
    PASSWORD_RESET = "password_reset"
    WELCOME = "welcome"
    NOTIFICATION = "notification"


class EmailPriority(str, Enum):
    """Приоритеты email сообщений."""

    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


# Абстрактные интерфейсы
class IEmailBackend(ABC):
    """Интерфейс для backend отправки email."""

    @abstractmethod
    async def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        from_email: Optional[str] = None,
    ) -> bool:
        pass


class IEmailTemplate(ABC):
    """Интерфейс для шаблонов email."""

    @abstractmethod
    def render(self, context: Dict[str, Any]) -> Dict[str, str]:
        pass


# Конкретные реализации
class SMTPEmailBackend(IEmailBackend):
    """SMTP backend для отправки email."""

    def __init__(self, config: Dict[str, Any]):
        self.smtp_host = config.get("smtp_host", "localhost")
        self.smtp_port = config.get("smtp_port", 587)
        self.smtp_username = config.get("smtp_username")
        self.smtp_password = config.get("smtp_password")
        self.use_tls = config.get("use_tls", True)
        self.from_email = config.get("from_email", "noreply@example.com")
        self.from_name = config.get("from_name", "System")

    async def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        from_email: Optional[str] = None,
    ) -> bool:
        """Отправить email через SMTP."""
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = from_email or f"{self.from_name} <{self.from_email}>"
            msg["To"] = to_email

            text_part = MIMEText(body, "plain", "utf-8")
            msg.attach(text_part)

            if html_body:
                html_part = MIMEText(html_body, "html", "utf-8")
                msg.attach(html_part)

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                if self.use_tls:
                    server.starttls()
                if self.smtp_username and self.smtp_password:
                    server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)

            logger.info(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            raise EmailDeliveryError(f"Failed to send email: {str(e)}")


class ConsoleEmailBackend(IEmailBackend):
    """Console backend для отладки."""

    async def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        from_email: Optional[str] = None,
    ) -> bool:
        """Вывести email в консоль."""
        logger.info("=" * 50)
        logger.info("EMAIL (Console Backend)")
        logger.info(f"To: {to_email}")
        logger.info(f"From: {from_email or 'noreply@example.com'}")
        logger.info(f"Subject: {subject}")
        logger.info("-" * 30)
        logger.info(f"Body:\n{body}")
        if html_body:
            logger.info(f"HTML Body:\n{html_body}")
        logger.info("=" * 50)
        return True


class SimpleEmailTemplate(IEmailTemplate):
    """Простой шаблон email."""

    def __init__(
        self,
        subject_template: str,
        body_template: str,
        html_template: Optional[str] = None,
    ):
        self.subject_template = subject_template
        self.body_template = body_template
        self.html_template = html_template

    def render(self, context: Dict[str, Any]) -> Dict[str, str]:
        """Отрендерить простой шаблон."""
        try:
            result = {
                "subject": self.subject_template.format(**context),
                "body": self.body_template.format(**context),
            }

            if self.html_template:
                result["html_body"] = self.html_template.format(**context)

            return result

        except KeyError as e:
            raise EmailTemplateError(f"Missing template variable: {e}")


class EmailTemplateManager:
    """Менеджер шаблонов email."""

    def __init__(self):
        self._templates: Dict[EmailType, IEmailTemplate] = {}
        self._load_default_templates()

    def _load_default_templates(self):
        """Загрузить стандартные шаблоны."""
        verification_template = SimpleEmailTemplate(
            subject_template="Подтверждение email адреса",
            body_template="""
Здравствуйте, {user_name}!

Для завершения регистрации перейдите по ссылке:
{verification_url}

Ссылка действительна в течение 24 часов.

С уважением,
Команда Requify
            """,
            html_template="""
<html>
<body>
<h2>Подтверждение email адреса</h2>
<p>Здравствуйте, {user_name}!</p>
<p>Для завершения регистрации нажмите на кнопку:</p>
<a href="{verification_url}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Подтвердить email</a>
<p>Или перейдите по ссылке: <a href="{verification_url}">{verification_url}</a></p>
<p>Ссылка действительна в течение 24 часов.</p>
<p>С уважением,<br>Команда Requify</p>
</body>
</html>
            """,
        )

        password_reset_template = SimpleEmailTemplate(
            subject_template="Сброс пароля",
            body_template="""
Здравствуйте, {user_name}!

Вы запросили сброс пароля. Перейдите по ссылке для создания нового пароля:
{reset_url}

Если это были не вы, проигнорируйте это сообщение.

С уважением,
Команда Requify
            """,
            html_template="""
<html>
<body>
<h2>Сброс пароля</h2>
<p>Здравствуйте, {user_name}!</p>
<p>Вы запросили сброс пароля. Нажмите на кнопку для создания нового пароля:</p>
<a href="{reset_url}" style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Сбросить пароль</a>
<p>Или перейдите по ссылке: <a href="{reset_url}">{reset_url}</a></p>
<p>Если это были не вы, проигнорируйте это сообщение.</p>
<p>С уважением,<br>Команда Requify</p>
</body>
</html>
            """,
        )

        self._templates[EmailType.VERIFICATION] = verification_template
        self._templates[EmailType.PASSWORD_RESET] = password_reset_template

    def get_template(self, email_type: EmailType) -> Optional[IEmailTemplate]:
        """Получить шаблон по типу."""
        return self._templates.get(email_type)

    def register_template(self, email_type: EmailType, template: IEmailTemplate):
        """Зарегистрировать шаблон."""
        self._templates[email_type] = template


class EmailService(BaseService):
    """
    Основной сервис email.

    Реализует паттерны:
    - Singleton (через BaseService)
    - Strategy (разные backend'ы)
    - Template Method (процесс отправки)
    """

    def __init__(self):
        self._backend: Optional[IEmailBackend] = None
        self._template_manager = EmailTemplateManager()
        self._executor = ThreadPoolExecutor(max_workers=2)
        super().__init__()

    def get_service_name(self) -> str:
        return "EmailService"

    def _setup(self):
        """Инициализация сервиса."""
        if not self._initialized:
            self._setup_backend()
            super()._setup()

    def _setup_backend(self):
        """Настройка backend'а для отправки email."""
        try:
            if hasattr(settings, "email"):
                email_config = settings.email
                config = {
                    "smtp_host": getattr(email_config, "smtp_host", "localhost"),
                    "smtp_port": getattr(email_config, "smtp_port", 587),
                    "smtp_username": getattr(email_config, "smtp_user", None),
                    "smtp_password": getattr(email_config, "smtp_password", None),
                    "use_tls": getattr(email_config, "smtp_tls", True),
                    "from_email": getattr(
                        email_config, "from_email", "noreply@example.com"
                    ),
                    "from_name": getattr(email_config, "from_name", "System"),
                }

                development_mode = (
                    getattr(settings.run, "env", "development") == "development"
                )
                smtp_configured = config["smtp_host"] and config["smtp_host"] not in (
                    "",
                    "localhost",
                )

                if development_mode and not smtp_configured:
                    self._backend = ConsoleEmailBackend()
                    logger.info("Using Console email backend (development mode)")
                else:
                    self._backend = SMTPEmailBackend(config)
                    logger.info(
                        f"Using SMTP email backend: {config['smtp_host']}:{config['smtp_port']}"
                    )
            else:
                self._backend = ConsoleEmailBackend()
                logger.info("Using Console email backend (no email config)")

        except Exception as e:
            logger.error(f"Failed to setup email backend: {e}")
            self._backend = ConsoleEmailBackend()

    async def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        from_email: Optional[str] = None,
        priority: EmailPriority = EmailPriority.NORMAL,
    ) -> bool:
        """Отправить email."""
        try:
            self._log_operation(
                "send_email",
                {"to_email": to_email, "subject": subject, "priority": priority.value},
            )

            if not self._backend:
                raise EmailServiceError("Email backend not configured")

            return await self._backend.send_email(
                to_email, subject, body, html_body, from_email
            )

        except Exception as e:
            raise self._handle_error(e, "send_email")

    async def send_templated_email(
        self,
        email_type: EmailType,
        to_email: str,
        context: Dict[str, Any],
        priority: EmailPriority = EmailPriority.NORMAL,
    ) -> bool:
        """Отправить email с использованием шаблона."""
        try:
            self._log_operation(
                "send_templated_email",
                {"email_type": email_type.value, "to_email": to_email},
            )

            template = self._template_manager.get_template(email_type)
            if not template:
                raise EmailTemplateError(f"Template not found for type: {email_type}")

            rendered = template.render(context)

            return await self.send_email(
                to_email=to_email,
                subject=rendered["subject"],
                body=rendered["body"],
                html_body=rendered.get("html_body"),
                priority=priority,
            )

        except Exception as e:
            raise self._handle_error(e, "send_templated_email")

    async def send_email_verification(
        self, user_email: str, verification_token: str, user_name: str
    ) -> bool:
        """Отправить email верификации."""
        try:
            verification_url = (
                f"https://example.com/verify-email?token={verification_token}"
            )

            context = {
                "user_name": user_name,
                "verification_url": verification_url,
                "verification_token": verification_token,
            }

            return await self.send_templated_email(
                EmailType.VERIFICATION, user_email, context, EmailPriority.HIGH
            )

        except Exception as e:
            raise self._handle_error(e, "send_email_verification")

    async def send_password_reset(
        self, user_email: str, reset_token: str, user_name: str
    ) -> bool:
        """Отправить email сброса пароля."""
        try:
            reset_url = f"https://example.com/reset-password?token={reset_token}"

            context = {
                "user_name": user_name,
                "reset_url": reset_url,
                "reset_token": reset_token,
            }

            return await self.send_templated_email(
                EmailType.PASSWORD_RESET, user_email, context, EmailPriority.HIGH
            )

        except Exception as e:
            raise self._handle_error(e, "send_password_reset")


# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("email", EmailService)

# Singleton instance
email_service = EmailService()
