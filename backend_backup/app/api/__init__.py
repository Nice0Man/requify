"""
API модуль для Requify.
"""

# Импорт всех эндпоинтов
from .v1.router import api_router

__all__ = ["api_router"]
