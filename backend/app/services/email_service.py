"""
Email Service для отправки уведомлений.

Модуль содержит сервис для отправки различных типов email уведомлений,
включая сброс пароля, верификацию email и другие.
Следует принципам SOLID и современным практикам.
"""

import asyncio
import logging
import smtplib
import ssl
from concurrent.futures import ThreadPoolExecutor
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

logger = logging.getLogger(__name__)


class EmailConfig:
    """Конфигурация для email сервиса."""

    # SMTP настройки
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_USE_TLS: bool = True
    SMTP_USE_SSL: bool = False

    # Настройки отправителя
    FROM_EMAIL: str = "noreply@requify.com"
    FROM_NAME: str = "Requify System"

    # Настройки шаблонов
    TEMPLATES_DIR: str = "app/templates/email"

    # Настройки для разработки
    DEVELOPMENT_MODE: bool = False
    CONSOLE_BACKEND: bool = False  # Выводить в консоль вместо отправки

    @classmethod
    def from_settings(cls) -> "EmailConfig":
        """Создать конфигурацию из настроек приложения."""
        config = cls()

        # Загружаем из настроек email конфигурации
        if hasattr(settings, "email"):
            email_config = settings.email
            config.SMTP_HOST = email_config.smtp_host or config.SMTP_HOST
            config.SMTP_PORT = email_config.smtp_port or config.SMTP_PORT
            config.SMTP_USERNAME = email_config.smtp_user or config.SMTP_USERNAME
            config.SMTP_PASSWORD = email_config.smtp_password or config.SMTP_PASSWORD
            config.SMTP_USE_TLS = (
                email_config.smtp_tls
                if hasattr(email_config, "smtp_tls")
                else config.SMTP_USE_TLS
            )
            config.SMTP_USE_SSL = (
                email_config.smtp_ssl
                if hasattr(email_config, "smtp_ssl")
                else config.SMTP_USE_SSL
            )
            config.FROM_EMAIL = email_config.from_email or config.FROM_EMAIL
            config.FROM_NAME = email_config.from_name or config.FROM_NAME

        # Определяем режим работы
        config.DEVELOPMENT_MODE = (
            getattr(settings, "app_config", {})
            and getattr(settings.app_config, "env", "development") == "development"
        )

        # Если SMTP настройки заданы, используем SMTP (включая MailHog)
        # Только если SMTP_HOST пустой или явно не задан, используем консольный бэкенд
        if config.SMTP_HOST and config.SMTP_HOST not in ("", "localhost"):
            config.CONSOLE_BACKEND = False
        elif config.SMTP_HOST == "mailhog":  # Специальная обработка для MailHog
            config.CONSOLE_BACKEND = False
        elif not config.SMTP_HOST or config.SMTP_HOST == "":
            config.CONSOLE_BACKEND = True
        else:
            # localhost без явной настройки - используем консоль в dev режиме
            config.CONSOLE_BACKEND = config.DEVELOPMENT_MODE

        return config


# === Email Templates ===


class EmailTemplates:
    """Менеджер email шаблонов."""

    def __init__(self, templates_dir: Optional[str] = None):
        """
        Инициализация менеджера шаблонов.

        Args:
            templates_dir: Путь к директории с шаблонами
        """
        self.templates_dir = templates_dir or EmailConfig.TEMPLATES_DIR
        self.env = None

        # Попытаемся загрузить шаблоны из файлов
        try:
            if Path(self.templates_dir).exists():
                self.env = Environment(loader=FileSystemLoader(self.templates_dir))
                # Добавляем кастомные фильтры
                self._add_custom_filters()
        except Exception as e:
            logger.warning(
                f"Failed to load email templates from {self.templates_dir}: {e}"
            )

    def _add_custom_filters(self):
        """Добавить кастомные фильтры для Jinja2."""
        if self.env:
            # Добавляем фильтр strftime для форматирования даты
            def strftime_filter(datetime_obj, format_string="%Y-%m-%d %H:%M:%S"):
                """Фильтр для форматирования datetime объектов."""
                if datetime_obj is None:
                    return ""
                try:
                    return datetime_obj.strftime(format_string)
                except (AttributeError, ValueError):
                    return str(datetime_obj)

            self.env.filters["strftime"] = strftime_filter

    def get_template(self, template_name: str) -> Optional[Template]:
        """
        Получить шаблон по имени.

        Args:
            template_name: Имя шаблона

        Returns:
            Optional[Template]: Шаблон или None
        """
        if self.env:
            try:
                return self.env.get_template(template_name)
            except Exception as e:
                logger.warning(f"Failed to load template {template_name}: {e}")
        return None

    def render_password_reset_html(
        self,
        user_email: str,
        reset_token: str,
        user_name: Optional[str] = None,
        ip_address: Optional[str] = None,
        timestamp: Optional[datetime] = None,
    ) -> str:
        """
        Рендер HTML шаблона для сброса пароля.

        Args:
            user_email: Email пользователя
            reset_token: Токен сброса пароля
            user_name: Имя пользователя
            ip_address: IP адрес запроса
            timestamp: Время запроса

        Returns:
            str: HTML контент
        """
        template = self.get_template("password_reset.html.jinja")

        if template:
            reset_url = (
                f"{settings.security.frontend_url}/reset-password?token={reset_token}"
            )
            return template.render(
                user_email=user_email,
                user_name=user_name or user_email,
                reset_url=reset_url,
                reset_token=reset_token,
                app_name="Requify",
                app_url=settings.security.frontend_url,
                support_email=(
                    self.config.FROM_EMAIL
                    if hasattr(self, "config")
                    else EmailConfig.FROM_EMAIL
                ),
                ip_address=ip_address,
                timestamp=timestamp or datetime.now(),
                now=datetime.now,
            )

        # Fallback HTML шаблон
        reset_url = (
            f"{settings.security.frontend_url}/reset-password?token={reset_token}"
        )
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Сброс пароля - Requify</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .logo {{ font-size: 24px; font-weight: bold; color: #2563eb; }}
                .button {{ display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">Requify</div>
                    <h1>Сброс пароля</h1>
                </div>
                
                <p>Здравствуйте, {user_name or user_email}!</p>
                
                <p>Вы запросили сброс пароля для вашей учетной записи в системе Requify.</p>
                
                <p>Для сброса пароля нажмите на кнопку ниже:</p>
                
                <div style="text-align: center;">
                    <a href="{reset_url}" class="button">Сбросить пароль</a>
                </div>
                
                <p>Если кнопка не работает, скопируйте и вставьте следующую ссылку в адресную строку браузера:</p>
                <p><a href="{reset_url}">{reset_url}</a></p>
                
                <p><strong>Важно:</strong> Ссылка действительна в течение 60 минут. Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
                
                <div class="footer">
                    <p>С уважением,<br>Команда Requify</p>
                    <p>Если у вас есть вопросы, обратитесь в службу поддержки: {EmailConfig.FROM_EMAIL}</p>
                </div>
            </div>
        </body>
        </html>
        """

    def render_password_reset_text(
        self,
        user_email: str,
        reset_token: str,
        user_name: Optional[str] = None,
        ip_address: Optional[str] = None,
        timestamp: Optional[datetime] = None,
    ) -> str:
        """
        Рендер текстового шаблона для сброса пароля.

        Args:
            user_email: Email пользователя
            reset_token: Токен сброса пароля
            user_name: Имя пользователя
            ip_address: IP адрес запроса
            timestamp: Время запроса

        Returns:
            str: Текстовый контент
        """
        template = self.get_template("password_reset.txt.jinja")

        if template:
            reset_url = (
                f"{settings.security.frontend_url}/reset-password?token={reset_token}"
            )
            return template.render(
                user_email=user_email,
                user_name=user_name or user_email,
                reset_url=reset_url,
                reset_token=reset_token,
                app_name="Requify",
                support_email=(
                    self.config.FROM_EMAIL
                    if hasattr(self, "config")
                    else EmailConfig.FROM_EMAIL
                ),
                ip_address=ip_address,
                timestamp=timestamp or datetime.now(),
                now=datetime.now,
            )

        # Fallback текстовый шаблон
        reset_url = (
            f"{settings.security.frontend_url}/reset-password?token={reset_token}"
        )
        return f"""
Сброс пароля - Requify

Здравствуйте, {user_name or user_email}!

Вы запросили сброс пароля для вашей учетной записи в системе Requify.

Для сброса пароля перейдите по следующей ссылке:
{reset_url}

Важно: Ссылка действительна в течение 60 минут. 
Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.

С уважением,
Команда Requify

Если у вас есть вопросы, обратитесь в службу поддержки: {EmailConfig.FROM_EMAIL}
        """

    def render_email_verification_html(
        self,
        user_email: str,
        verification_token: str,
        user_name: Optional[str] = None,
        ip_address: Optional[str] = None,
        timestamp: Optional[datetime] = None,
    ) -> str:
        """
        Рендер HTML шаблона для верификации email.

        Args:
            user_email: Email пользователя
            verification_token: Токен верификации
            user_name: Имя пользователя
            ip_address: IP адрес запроса
            timestamp: Время запроса

        Returns:
            str: HTML контент
        """
        template = self.get_template("email_verification.html.jinja")

        if template:
            verification_url = f"{settings.security.frontend_url}/verify-email?token={verification_token}"
            return template.render(
                user_email=user_email,
                user_name=user_name or user_email,
                verification_url=verification_url,
                verification_token=verification_token,
                app_name="Requify",
                app_url=settings.security.frontend_url,
                support_email=(
                    self.config.FROM_EMAIL
                    if hasattr(self, "config")
                    else EmailConfig.FROM_EMAIL
                ),
                ip_address=ip_address,
                timestamp=timestamp or datetime.now(),
                now=datetime.now,
            )

        # Fallback если шаблон не найден
        verification_url = (
            f"{settings.security.frontend_url}/verify-email?token={verification_token}"
        )
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Подтверждение email - Requify</title>
        </head>
        <body>
            <h1>Подтверждение email адреса</h1>
            <p>Здравствуйте, {user_name or user_email}!</p>
            <p>Для завершения регистрации подтвердите ваш email адрес:</p>
            <p><a href="{verification_url}">Подтвердить email</a></p>
        </body>
        </html>
        """

    def render_email_verification_text(
        self,
        user_email: str,
        verification_token: str,
        user_name: Optional[str] = None,
        ip_address: Optional[str] = None,
        timestamp: Optional[datetime] = None,
    ) -> str:
        """
        Рендер текстового шаблона для верификации email.

        Args:
            user_email: Email пользователя
            verification_token: Токен верификации
            user_name: Имя пользователя
            ip_address: IP адрес запроса
            timestamp: Время запроса

        Returns:
            str: Текстовый контент
        """
        template = self.get_template("email_verification.txt.jinja")

        if template:
            verification_url = f"{settings.security.frontend_url}/verify-email?token={verification_token}"
            return template.render(
                user_email=user_email,
                user_name=user_name or user_email,
                verification_url=verification_url,
                verification_token=verification_token,
                app_name="Requify",
                support_email=(
                    self.config.FROM_EMAIL
                    if hasattr(self, "config")
                    else EmailConfig.FROM_EMAIL
                ),
                ip_address=ip_address,
                timestamp=timestamp or datetime.now(),
                now=datetime.now,
            )

        # Fallback если шаблон не найден
        verification_url = (
            f"{settings.security.frontend_url}/verify-email?token={verification_token}"
        )
        return f"""
        Подтверждение email адреса - Requify
        
        Здравствуйте, {user_name or user_email}!
        
        Для завершения регистрации подтвердите ваш email адрес по ссылке:
        {verification_url}
        
        С уважением,
        Команда Requify
        """

    def render_welcome_html(
        self,
        user_email: str,
        user_name: Optional[str] = None,
        timestamp: Optional[datetime] = None,
    ) -> str:
        """
        Рендер HTML шаблона приветственного письма.

        Args:
            user_email: Email пользователя
            user_name: Имя пользователя
            timestamp: Время создания аккаунта

        Returns:
            str: HTML контент
        """
        template = self.get_template("welcome.html.jinja")

        if template:
            return template.render(
                user_email=user_email,
                user_name=user_name or user_email,
                app_name="Requify",
                app_url=settings.security.frontend_url,
                support_email=(
                    self.config.FROM_EMAIL
                    if hasattr(self, "config")
                    else EmailConfig.FROM_EMAIL
                ),
                timestamp=timestamp or datetime.now(),
                now=datetime.now,
            )

        # Fallback если шаблон не найден
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Добро пожаловать в Requify!</title>
        </head>
        <body>
            <h1>Добро пожаловать в Requify!</h1>
            <p>Здравствуйте, {user_name or user_email}!</p>
            <p>Ваша учетная запись успешно создана. Добро пожаловать в Requify!</p>
        </body>
        </html>
        """

    def render_security_alert_html(
        self,
        user_email: str,
        alert_type: str,
        details: Dict[str, Any],
        user_name: Optional[str] = None,
    ) -> str:
        """
        Рендер HTML шаблона уведомления безопасности.

        Args:
            user_email: Email пользователя
            alert_type: Тип уведомления
            details: Детали события
            user_name: Имя пользователя

        Returns:
            str: HTML контент
        """
        template = self.get_template("security_alert.html.jinja")

        if template:
            return template.render(
                user_email=user_email,
                user_name=user_name or user_email,
                alert_type=alert_type,
                details=details,
                app_name="Requify",
                app_url=settings.security.frontend_url,
                support_email=(
                    self.config.FROM_EMAIL
                    if hasattr(self, "config")
                    else EmailConfig.FROM_EMAIL
                ),
                now=datetime.now,
            )

        # Fallback если шаблон не найден
        alert_titles = {
            "password_change": "Пароль изменен",
            "login_new_device": "Вход с нового устройства",
            "suspicious_activity": "Подозрительная активность",
            "account_locked": "Аккаунт заблокирован",
        }

        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Уведомление безопасности - Requify</title>
        </head>
        <body>
            <h1>🔒 Уведомление безопасности</h1>
            <p>Здравствуйте, {user_name or user_email}!</p>
            <h3>{alert_titles.get(alert_type, alert_type)}</h3>
            <p>Время: {details.get('timestamp', datetime.now().isoformat())}</p>
            <p>IP-адрес: {details.get('ip_address', 'Неизвестно')}</p>
            <p>Устройство: {details.get('user_agent', 'Неизвестно')}</p>
            <p>Если это были не вы, немедленно смените пароль и обратитесь в службу поддержки.</p>
        </body>
        </html>
        """


# === Email Service ===


class EmailService:
    """Сервис для отправки email уведомлений."""

    def __init__(self, config: Optional[EmailConfig] = None):
        """
        Инициализация email сервиса.

        Args:
            config: Конфигурация email сервиса
        """
        self.config = config or EmailConfig.from_settings()
        self.templates = EmailTemplates()
        self.executor = ThreadPoolExecutor(max_workers=3)

        # Логируем конфигурацию при инициализации
        logger.info(
            f"Email service initialized with SMTP_HOST: {self.config.SMTP_HOST}, "
            f"CONSOLE_BACKEND: {self.config.CONSOLE_BACKEND}, "
            f"DEVELOPMENT_MODE: {self.config.DEVELOPMENT_MODE}"
        )

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None,
    ) -> bool:
        """
        Отправить email.

        Args:
            to_email: Email получателя
            subject: Тема письма
            html_content: HTML контент
            text_content: Текстовый контент (опционально)
            attachments: Вложения (опционально)

        Returns:
            bool: True если отправлено успешно
        """
        if self.config.CONSOLE_BACKEND:
            # В режиме разработки выводим в консоль
            logger.info(
                f"Email service in console mode - email will be printed to console instead of sent via SMTP"
            )
            return await self._send_to_console(
                to_email, subject, html_content, text_content
            )

        try:
            # Отправляем через SMTP в отдельном потоке
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                self.executor,
                self._send_smtp_email,
                to_email,
                subject,
                html_content,
                text_content,
                attachments,
            )

            logger.info(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False

    async def _send_to_console(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """
        Вывести email в консоль (для разработки).

        Args:
            to_email: Email получателя
            subject: Тема письма
            html_content: HTML контент
            text_content: Текстовый контент

        Returns:
            bool: True (всегда успешно)
        """
        print("=" * 80)
        print("📧 EMAIL NOTIFICATION (CONSOLE MODE - NOT SENT)")
        print("=" * 80)
        print(f"To: {to_email}")
        print(f"From: {self.config.FROM_NAME} <{self.config.FROM_EMAIL}>")
        print(f"Subject: {subject}")
        print(f"Date: {datetime.now().isoformat()}")
        print(
            f"SMTP Config: Host={self.config.SMTP_HOST}, Port={self.config.SMTP_PORT}"
        )
        print(f"Console Backend: {self.config.CONSOLE_BACKEND}")
        print("-" * 80)

        if text_content:
            print("TEXT CONTENT:")
            print(text_content)
            print("-" * 80)

        print("HTML CONTENT:")
        print(html_content)
        print("=" * 80)

        return True

    def _send_smtp_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None,
    ) -> None:
        """
        Отправить email через SMTP (синхронная функция для выполнения в отдельном потоке).

        Args:
            to_email: Email получателя
            subject: Тема письма
            html_content: HTML контент
            text_content: Текстовый контент
            attachments: Вложения
        """
        # Создаем сообщение
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{self.config.FROM_NAME} <{self.config.FROM_EMAIL}>"
        msg["To"] = to_email

        # Добавляем текстовый контент
        if text_content:
            text_part = MIMEText(text_content, "plain", "utf-8")
            msg.attach(text_part)

        # Добавляем HTML контент
        html_part = MIMEText(html_content, "html", "utf-8")
        msg.attach(html_part)

        # Добавляем вложения
        if attachments:
            for attachment in attachments:
                self._add_attachment(msg, attachment)

        # Отправляем email
        if self.config.SMTP_USE_SSL:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(
                self.config.SMTP_HOST, self.config.SMTP_PORT, context=context
            ) as server:
                if self.config.SMTP_USERNAME and self.config.SMTP_PASSWORD:
                    server.login(self.config.SMTP_USERNAME, self.config.SMTP_PASSWORD)
                server.send_message(msg)
        else:
            with smtplib.SMTP(self.config.SMTP_HOST, self.config.SMTP_PORT) as server:
                if self.config.SMTP_USE_TLS:
                    context = ssl.create_default_context()
                    server.starttls(context=context)

                if self.config.SMTP_USERNAME and self.config.SMTP_PASSWORD:
                    server.login(self.config.SMTP_USERNAME, self.config.SMTP_PASSWORD)

                server.send_message(msg)

    def _add_attachment(self, msg: MIMEMultipart, attachment: Dict[str, Any]) -> None:
        """
        Добавить вложение к сообщению.

        Args:
            msg: Сообщение
            attachment: Данные вложения
        """
        filename = attachment.get("filename", "attachment")
        content = attachment.get("content", b"")
        content_type = attachment.get("content_type", "application/octet-stream")

        part = MIMEBase(*content_type.split("/"))
        part.set_payload(content)
        encoders.encode_base64(part)
        part.add_header("Content-Disposition", f"attachment; filename= {filename}")
        msg.attach(part)

    # === Специализированные методы для аутентификации ===

    async def send_password_reset_email(
        self,
        user_email: str,
        reset_token: str,
        user_name: Optional[str] = None,
        ip_address: Optional[str] = None,
        timestamp: Optional[datetime] = None,
    ) -> bool:
        """
        Отправить email для сброса пароля.

        Args:
            user_email: Email пользователя
            reset_token: Токен сброса пароля
            user_name: Имя пользователя
            ip_address: IP адрес запроса
            timestamp: Время запроса

        Returns:
            bool: True если отправлено успешно
        """
        subject = "Сброс пароля - Requify"

        html_content = self.templates.render_password_reset_html(
            user_email, reset_token, user_name, ip_address, timestamp
        )
        text_content = self.templates.render_password_reset_text(
            user_email, reset_token, user_name, ip_address, timestamp
        )

        return await self.send_email(
            to_email=user_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
        )

    async def send_email_verification(
        self,
        user_email: str,
        verification_token: str,
        user_name: Optional[str] = None,
        ip_address: Optional[str] = None,
        timestamp: Optional[datetime] = None,
    ) -> bool:
        """
        Отправить email для верификации email адреса.

        Args:
            user_email: Email пользователя
            verification_token: Токен верификации
            user_name: Имя пользователя
            ip_address: IP адрес запроса
            timestamp: Время запроса

        Returns:
            bool: True если отправлено успешно
        """
        subject = "Подтверждение email адреса - Requify"

        html_content = self.templates.render_email_verification_html(
            user_email, verification_token, user_name, ip_address, timestamp
        )
        text_content = self.templates.render_email_verification_text(
            user_email, verification_token, user_name, ip_address, timestamp
        )

        return await self.send_email(
            to_email=user_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
        )

    async def send_security_alert(
        self,
        user_email: str,
        alert_type: str,
        details: Dict[str, Any],
        user_name: Optional[str] = None,
    ) -> bool:
        """
        Отправить уведомление о событии безопасности.

        Args:
            user_email: Email пользователя
            alert_type: Тип уведомления
            details: Детали события
            user_name: Имя пользователя

        Returns:
            bool: True если отправлено успешно
        """
        alert_titles = {
            "password_change": "Пароль изменен",
            "login_new_device": "Вход с нового устройства",
            "suspicious_activity": "Подозрительная активность",
            "account_locked": "Аккаунт заблокирован",
        }

        subject = f"Уведомление безопасности: {alert_titles.get(alert_type, alert_type)} - Requify"

        html_content = self.templates.render_security_alert_html(
            user_email, alert_type, details, user_name
        )

        return await self.send_email(
            to_email=user_email, subject=subject, html_content=html_content
        )

    async def send_welcome_email(
        self,
        user_email: str,
        user_name: Optional[str] = None,
        timestamp: Optional[datetime] = None,
    ) -> bool:
        """
        Отправить приветственное письмо новому пользователю.

        Args:
            user_email: Email пользователя
            user_name: Имя пользователя
            timestamp: Время создания аккаунта

        Returns:
            bool: True если отправлено успешно
        """
        subject = "Добро пожаловать в Requify!"

        html_content = self.templates.render_welcome_html(
            user_email, user_name, timestamp
        )

        # Простой текстовый контент для приветственного письма
        text_content = f"""
        Добро пожаловать в Requify!
        
        Здравствуйте, {user_name or user_email}!
        
        Ваша учетная запись в системе управления требованиями Requify успешно создана.
        Теперь вы можете использовать все возможности нашей платформы.
        
        Перейдите в личный кабинет: {settings.security.frontend_url}/dashboard
        
        С уважением,
        Команда Requify
        """

        return await self.send_email(
            to_email=user_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
        )


# === Global Email Service Instance ===

email_service = EmailService()
