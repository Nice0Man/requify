"""
Сервисы приложения.

Модуль содержит различные сервисы для работы с внешними системами,
уведомлениями, отчетами и другой бизнес-логикой.
"""

from .email_service import EmailService, email_service

__all__ = [
    "EmailService",
    "email_service",
]
