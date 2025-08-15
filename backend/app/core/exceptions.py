"""
Модуль для обработки исключений в приложении.

Содержит кастомные исключения и обработчики ошибок для FastAPI.
"""

from datetime import datetime, UTC
from typing import Any, Dict, Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError, NoResultFound, IntegrityError
import logging

logger = logging.getLogger(__name__)


class RequifyException(Exception):
    """Базовое исключение для приложения Requify."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(RequifyException):
    """Исключение для ошибок валидации данных."""

    def __init__(self, message: str, field: Optional[str] = None):
        details = {"field": field} if field else {}
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details,
        )


class NotFoundError(RequifyException):
    """Исключение для случаев, когда ресурс не найден."""

    def __init__(self, resource: str, identifier: Any):
        message = f"{resource} with identifier '{identifier}' not found"
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            details={"resource": resource, "identifier": str(identifier)},
        )


class PermissionDeniedError(RequifyException):
    """Исключение для ошибок доступа."""

    def __init__(self, action: str, resource: Optional[str] = None):
        message = f"Permission denied for action: {action}"
        if resource:
            message += f" on resource: {resource}"

        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            details={"action": action, "resource": resource},
        )


class BusinessLogicError(RequifyException):
    """Исключение для ошибок бизнес-логики."""

    def __init__(self, message: str, error_code: Optional[str] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            details={"error_code": error_code} if error_code else {},
        )


class ExternalServiceError(RequifyException):
    """Исключение для ошибок внешних сервисов."""

    def __init__(self, service_name: str, message: str):
        super().__init__(
            message=f"External service '{service_name}' error: {message}",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            details={"service": service_name, "original_message": message},
        )


class DatabaseError(RequifyException):
    """Исключение для ошибок базы данных."""

    def __init__(self, message: str, operation: Optional[str] = None):
        super().__init__(
            message=f"Database error: {message}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"operation": operation} if operation else {},
        )


class ExternalSystemError(RequifyException):
    """Исключение для ошибок внешних систем."""

    def __init__(self, message: str, system_name: Optional[str] = None):
        super().__init__(
            message=f"External system error: {message}",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            details={"system": system_name} if system_name else {},
        )


class NotificationError(RequifyException):
    """Исключение для ошибок системы уведомлений."""

    def __init__(self, message: str, notification_type: Optional[str] = None):
        super().__init__(
            message=f"Notification error: {message}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"type": notification_type} if notification_type else {},
        )


class ReportGenerationError(RequifyException):
    """Исключение для ошибок генерации отчётов."""

    def __init__(self, message: str, report_type: Optional[str] = None):
        super().__init__(
            message=f"Report generation error: {message}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"report_type": report_type} if report_type else {},
        )


class UserNotFoundError(RequifyException):
    """Исключение для случаев, когда пользователь не найден."""

    def __init__(self, identifier: Any):
        message = f"User with identifier '{identifier}' not found"
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            details={"resource": "user", "identifier": str(identifier)},
        )


class ServiceError(RequifyException):
    """Исключение для ошибок внутренних сервисов."""

    def __init__(
        self, service_name: str, message: str, error_code: Optional[str] = None
    ):
        super().__init__(
            message=f"Service '{service_name}' error: {message}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={
                "service": service_name,
                "error_code": error_code,
                "original_message": message,
            },
        )


# Обработчики исключений для FastAPI


async def requify_exception_handler(
    request: Request, exc: RequifyException
) -> JSONResponse:
    """
    Обработчик кастомных исключений Requify.

    Args:
        request: HTTP запрос
        exc: Исключение Requify

    Returns:
        JSONResponse: JSON ответ с информацией об ошибке
    """
    logger.error(
        f"RequifyException: {exc.message}",
        extra={
            "status_code": exc.status_code,
            "details": exc.details,
            "path": request.url.path,
            "method": request.method,
        },
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "type": exc.__class__.__name__,
                "message": exc.message,
                "details": exc.details,
                "timestamp": datetime.now(UTC).isoformat(),
                "path": request.url.path,
            }
        },
    )


async def http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    """
    Обработчик HTTP исключений.

    Args:
        request: HTTP запрос
        exc: HTTP исключение

    Returns:
        JSONResponse: JSON ответ с информацией об ошибке
    """
    logger.warning(
        f"HTTP Exception: {exc.detail}",
        extra={
            "status_code": exc.status_code,
            "path": request.url.path,
            "method": request.method,
        },
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "type": "HTTPException",
                "message": exc.detail,
                "timestamp": datetime.now(UTC).isoformat(),
                "path": request.url.path,
            }
        },
    )


async def sqlalchemy_exception_handler(
    request: Request, exc: SQLAlchemyError
) -> JSONResponse:
    """
    Обработчик исключений SQLAlchemy.

    Args:
        request: HTTP запрос
        exc: SQLAlchemy исключение

    Returns:
        JSONResponse: JSON ответ с информацией об ошибке
    """
    # Определяем тип ошибки и статус код
    if isinstance(exc, NoResultFound):
        status_code = status.HTTP_404_NOT_FOUND
        message = "Resource not found"
        error_type = "NotFound"
    elif isinstance(exc, IntegrityError):
        status_code = status.HTTP_400_BAD_REQUEST
        message = "Data integrity constraint violation"
        error_type = "IntegrityError"
    else:
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        message = "Database operation failed"
        error_type = "DatabaseError"

    logger.error(
        f"SQLAlchemy Exception: {str(exc)}",
        extra={
            "status_code": status_code,
            "path": request.url.path,
            "method": request.method,
            "exception_type": type(exc).__name__,
        },
    )

    return JSONResponse(
        status_code=status_code,
        content={
            "error": {
                "type": error_type,
                "message": message,
                "timestamp": datetime.now(UTC).isoformat(),
                "path": request.url.path,
            }
        },
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """
    Обработчик ошибок валидации Pydantic.

    Args:
        request: HTTP запрос
        exc: Исключение валидации

    Returns:
        JSONResponse: JSON ответ с информацией об ошибке
    """
    logger.warning(
        f"Validation error: {exc.errors()}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "errors": exc.errors(),
        },
    )

    # Преобразуем ошибки в более понятный формат
    validation_errors = []
    for error in exc.errors():
        # Handle bytes input that cannot be JSON serialized
        input_value = error.get("input")
        if isinstance(input_value, bytes):
            try:
                input_value = input_value.decode("utf-8")
            except UnicodeDecodeError:
                input_value = str(input_value)

        validation_errors.append(
            {
                "field": ".".join(str(loc) for loc in error["loc"]),
                "message": error["msg"],
                "type": error["type"],
                "input": input_value,
            }
        )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "type": "ValidationError",
                "message": "Request validation failed",
                "details": {"validation_errors": validation_errors},
                "timestamp": datetime.now(UTC).isoformat(),
                "path": request.url.path,
            }
        },
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Обработчик общих исключений.

    Args:
        request: HTTP запрос
        exc: Исключение

    Returns:
        JSONResponse: JSON ответ с информацией об ошибке
    """
    # Специальная обработка для AttributeError при обращении к None объектам
    if isinstance(exc, AttributeError) and "NoneType" in str(exc):
        logger.error(
            f"AttributeError on None object: {str(exc)}",
            extra={
                "path": request.url.path,
                "method": request.method,
                "exception_type": type(exc).__name__,
            },
        )

        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "error": {
                    "type": "NotFound",
                    "message": "Requested resource not found",
                    "timestamp": datetime.now(UTC).isoformat(),
                    "path": request.url.path,
                }
            },
        )

    logger.error(
        f"Unhandled exception: {str(exc)}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "exception_type": type(exc).__name__,
        },
        exc_info=True,
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "type": "InternalServerError",
                "message": "An unexpected error occurred",
                "timestamp": datetime.now(UTC).isoformat(),
                "path": request.url.path,
            }
        },
    )


def register_exception_handlers(app):
    """
    Регистрирует все обработчики исключений в приложении FastAPI.

    Args:
        app: Экземпляр FastAPI приложения
    """
    # Кастомные исключения Requify
    app.add_exception_handler(RequifyException, requify_exception_handler)

    # HTTP исключения
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)

    # SQLAlchemy исключения
    app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)

    # Ошибки валидации
    app.add_exception_handler(RequestValidationError, validation_exception_handler)

    # Общие исключения (должен быть последним)
    app.add_exception_handler(Exception, general_exception_handler)
