"""
Модуль логирования для приложения Requify.
"""

import logging
import os
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Optional

from app.core.config import settings


def setup_logger(
    name: str = "requify",
    log_file: Optional[str] = None,
    level: str = "INFO",
) -> logging.Logger:
    """
    Настройка логгера для приложения.

    Args:
        name: Имя логгера
        log_file: Путь к файлу логов
        level: Уровень логирования

    Returns:
        logging.Logger: Настроенный логгер
    """
    # Создаем логгер
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper()))

    # Очищаем существующие обработчики
    logger.handlers.clear()

    # Форматтер для логов
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s"
    )

    # Консольный обработчик
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # Файловый обработчик, если указан файл
    if log_file:
        try:
            # Создаем директорию для логов, если её нет
            log_path = Path(log_file)
            log_path.parent.mkdir(parents=True, exist_ok=True)

            # Проверяем права на запись в директорию
            log_dir = log_path.parent
            if not os.access(log_dir, os.W_OK):
                logger.warning(
                    f"No write permission for log directory {log_dir}, using console logging only"
                )
                return logger

            file_handler = RotatingFileHandler(
                log_file,
                maxBytes=settings.logging.max_size,
                backupCount=settings.logging.backup_count,
                encoding="utf-8",
            )
            file_handler.setLevel(getattr(logging, level.upper()))
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)

            logger.info(f"File logging enabled: {log_file}")

        except (OSError, PermissionError) as e:
            logger.warning(
                f"Failed to setup file logging for {log_file}: {e}. Using console logging only."
            )
        except Exception as e:
            logger.error(
                f"Unexpected error setting up file logging: {e}. Using console logging only."
            )

    return logger


# Создаем основной логгер приложения
logger = setup_logger(
    name="requify",
    log_file=settings.logging.file,
    level=settings.logging.level,
)


def get_logger(name: str) -> logging.Logger:
    """
    Получить логгер с указанным именем.

    Args:
        name: Имя логгера

    Returns:
        logging.Logger: Логгер
    """
    return logging.getLogger(f"requify.{name}")


# Специализированные логгеры для разных модулей
auth_logger = get_logger("auth")
db_logger = get_logger("database")
api_logger = get_logger("api")
security_logger = get_logger("security")
notification_logger = get_logger("notifications")
integration_logger = get_logger("integrations")
testing_logger = get_logger("testing")
admin_logger = get_logger("admin")
email_logger = get_logger("email")


# Контекстный менеджер для логирования операций
class LoggedOperation:
    """Контекстный менеджер для логирования операций."""

    def __init__(self, operation_name: str, logger_instance: logging.Logger = None):
        self.operation_name = operation_name
        self.logger = logger_instance or logger

    def __enter__(self):
        self.logger.info(f"Starting operation: {self.operation_name}")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            self.logger.info(f"Operation completed successfully: {self.operation_name}")
        else:
            self.logger.error(
                f"Operation failed: {self.operation_name} - {exc_type.__name__}: {exc_val}"
            )
        return False  # Не подавлять исключения
