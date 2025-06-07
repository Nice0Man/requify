"""
Модуль для обработки исключений в приложении.

Содержит кастомные исключения и обработчики ошибок для FastAPI.
"""

from typing import Any, Dict, Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
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
                "timestamp": "2024-01-01T00:00:00Z",  # TODO: Использовать реальный timestamp
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
                "details": {},
                "timestamp": "2024-01-01T00:00:00Z",  # TODO: Использовать реальный timestamp
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
        exc: Ошибка валидации

    Returns:
        JSONResponse: JSON ответ с информацией об ошибке
    """
    logger.warning(
        f"Validation Error: {exc.errors()}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "errors": exc.errors(),
        },
    )

    # Форматируем ошибки валидации
    formatted_errors = []
    for error in exc.errors():
        formatted_errors.append(
            {
                "field": ".".join(str(x) for x in error["loc"]),
                "message": error["msg"],
                "type": error["type"],
            }
        )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "type": "ValidationError",
                "message": "Validation failed",
                "details": {"validation_errors": formatted_errors},
                "timestamp": "2024-01-01T00:00:00Z",  # TODO: Использовать реальный timestamp
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
    logger.error(
        f"Unhandled Exception: {str(exc)}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "exception_type": exc.__class__.__name__,
        },
        exc_info=True,
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "type": "InternalServerError",
                "message": "An internal server error occurred",
                "details": {"exception_type": exc.__class__.__name__},
                "timestamp": "2024-01-01T00:00:00Z",  # TODO: Использовать реальный timestamp
                "path": request.url.path,
            }
        },
    )


# Функции для регистрации обработчиков


def register_exception_handlers(app):
    """
    Регистрация всех обработчиков исключений в FastAPI приложении.

    Args:
        app: Экземпляр FastAPI приложения
    """
    app.add_exception_handler(RequifyException, requify_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
