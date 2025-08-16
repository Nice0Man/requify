"""
Rate Limiter для API v2.

Современная система ограничения частоты запросов с поддержкой
различных стратегий, кэширования и детального логирования.
"""

import asyncio
import time
from typing import Dict, Optional, Any
from dataclasses import dataclass
from enum import Enum

from app.utils.logger import get_logger
from app.core.config import settings

logger = get_logger(__name__)


class RateLimitStrategy(str, Enum):
    """Стратегии ограничения частоты запросов."""

    SLIDING_WINDOW = "sliding_window"
    FIXED_WINDOW = "fixed_window"
    TOKEN_BUCKET = "token_bucket"


@dataclass
class RateLimitResult:
    """Результат проверки rate limit."""

    allowed: bool
    remaining: int
    reset_time: float
    retry_after: Optional[int] = None


class RateLimiter:
    """
    Система ограничения частоты запросов.

    Поддерживает различные стратегии и кэширование в памяти.
    """

    def __init__(
        self,
        max_requests: int,
        window_seconds: int,
        strategy: RateLimitStrategy = RateLimitStrategy.SLIDING_WINDOW,
        cleanup_interval: int = 300,  # 5 минут
    ):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.strategy = strategy
        self.cleanup_interval = cleanup_interval

        # В памяти хранилище для запросов
        self._requests: Dict[str, list] = {}
        self._last_cleanup = time.time()

        logger.info(
            f"Rate limiter initialized: {max_requests} requests per {window_seconds}s "
            f"using {strategy.value} strategy"
        )

    async def check_rate_limit(self, identifier: str) -> bool:
        """
        Проверка ограничения частоты запросов.

        Args:
            identifier: Уникальный идентификатор (IP, user_id, etc.)

        Returns:
            True если запрос разрешен, False если превышен лимит
        """
        current_time = time.time()

        # Периодическая очистка старых записей
        await self._cleanup_old_requests(current_time)

        # Получение или создание списка запросов для идентификатора
        if identifier not in self._requests:
            self._requests[identifier] = []

        requests = self._requests[identifier]

        if self.strategy == RateLimitStrategy.SLIDING_WINDOW:
            return await self._check_sliding_window(requests, current_time)
        elif self.strategy == RateLimitStrategy.FIXED_WINDOW:
            return await self._check_fixed_window(requests, current_time)
        elif self.strategy == RateLimitStrategy.TOKEN_BUCKET:
            return await self._check_token_bucket(requests, current_time)

        return False

    async def get_rate_limit_info(self, identifier: str) -> RateLimitResult:
        """
        Получение детальной информации о rate limit.

        Args:
            identifier: Уникальный идентификатор

        Returns:
            Информация о текущем состоянии лимита
        """
        current_time = time.time()

        if identifier not in self._requests:
            return RateLimitResult(
                allowed=True,
                remaining=self.max_requests,
                reset_time=current_time + self.window_seconds,
            )

        requests = self._requests[identifier]

        if self.strategy == RateLimitStrategy.SLIDING_WINDOW:
            # Удаление старых запросов
            cutoff_time = current_time - self.window_seconds
            requests[:] = [req_time for req_time in requests if req_time > cutoff_time]

            remaining = max(0, self.max_requests - len(requests))
            allowed = remaining > 0

            # Время сброса - когда самый старый запрос выйдет из окна
            reset_time = (
                requests[0] + self.window_seconds
                if requests
                else current_time + self.window_seconds
            )

            return RateLimitResult(
                allowed=allowed,
                remaining=remaining,
                reset_time=reset_time,
                retry_after=int(reset_time - current_time) if not allowed else None,
            )

        # Для других стратегий - базовая реализация
        return RateLimitResult(
            allowed=True,
            remaining=self.max_requests,
            reset_time=current_time + self.window_seconds,
        )

    async def _check_sliding_window(self, requests: list, current_time: float) -> bool:
        """Проверка с использованием скользящего окна."""
        # Удаление запросов старше окна
        cutoff_time = current_time - self.window_seconds
        requests[:] = [req_time for req_time in requests if req_time > cutoff_time]

        # Проверка лимита
        if len(requests) >= self.max_requests:
            logger.warning(f"Rate limit exceeded: {len(requests)}/{self.max_requests}")
            return False

        # Добавление текущего запроса
        requests.append(current_time)
        return True

    async def _check_fixed_window(self, requests: list, current_time: float) -> bool:
        """Проверка с использованием фиксированного окна."""
        window_start = int(current_time // self.window_seconds) * self.window_seconds

        # Удаление запросов из предыдущих окон
        requests[:] = [req_time for req_time in requests if req_time >= window_start]

        # Проверка лимита
        if len(requests) >= self.max_requests:
            return False

        # Добавление текущего запроса
        requests.append(current_time)
        return True

    async def _check_token_bucket(self, requests: list, current_time: float) -> bool:
        """Проверка с использованием алгоритма token bucket."""
        # Базовая реализация token bucket
        # В реальном проекте здесь должна быть более сложная логика

        if not hasattr(self, "_bucket_tokens"):
            self._bucket_tokens = {}

        if not hasattr(self, "_bucket_last_refill"):
            self._bucket_last_refill = {}

        # Инициализация bucket для идентификатора
        identifier = id(requests)  # Используем ID списка как идентификатор
        if identifier not in self._bucket_tokens:
            self._bucket_tokens[identifier] = self.max_requests
            self._bucket_last_refill[identifier] = current_time

        # Пополнение токенов
        time_passed = current_time - self._bucket_last_refill[identifier]
        tokens_to_add = int(time_passed * (self.max_requests / self.window_seconds))

        self._bucket_tokens[identifier] = min(
            self.max_requests, self._bucket_tokens[identifier] + tokens_to_add
        )
        self._bucket_last_refill[identifier] = current_time

        # Проверка наличия токенов
        if self._bucket_tokens[identifier] <= 0:
            return False

        # Потребление токена
        self._bucket_tokens[identifier] -= 1
        return True

    async def _cleanup_old_requests(self, current_time: float) -> None:
        """Периодическая очистка старых записей."""
        if current_time - self._last_cleanup < self.cleanup_interval:
            return

        cutoff_time = current_time - self.window_seconds * 2  # Двойной запас

        for identifier in list(self._requests.keys()):
            requests = self._requests[identifier]
            requests[:] = [req_time for req_time in requests if req_time > cutoff_time]

            # Удаление пустых записей
            if not requests:
                del self._requests[identifier]

        self._last_cleanup = current_time
        logger.debug(
            f"Rate limiter cleanup completed. Active identifiers: {len(self._requests)}"
        )

    def reset_limit(self, identifier: str) -> None:
        """Сброс лимита для конкретного идентификатора."""
        if identifier in self._requests:
            del self._requests[identifier]
            logger.info(f"Rate limit reset for identifier: {identifier}")

    def get_stats(self) -> Dict[str, Any]:
        """Получение статистики rate limiter."""
        total_identifiers = len(self._requests)
        total_requests = sum(len(requests) for requests in self._requests.values())

        return {
            "strategy": self.strategy.value,
            "max_requests": self.max_requests,
            "window_seconds": self.window_seconds,
            "active_identifiers": total_identifiers,
            "total_tracked_requests": total_requests,
            "cleanup_interval": self.cleanup_interval,
        }


# Глобальные экземпляры rate limiters для различных целей
default_rate_limiter = RateLimiter(
    max_requests=getattr(settings, "DEFAULT_RATE_LIMIT_REQUESTS", 100),
    window_seconds=getattr(settings, "DEFAULT_RATE_LIMIT_WINDOW", 60),
)

auth_rate_limiter = RateLimiter(
    max_requests=getattr(settings, "AUTH_RATE_LIMIT_REQUESTS", 5),
    window_seconds=getattr(settings, "AUTH_RATE_LIMIT_WINDOW", 60),
)

api_rate_limiter = RateLimiter(
    max_requests=getattr(settings, "API_RATE_LIMIT_REQUESTS", 1000),
    window_seconds=getattr(settings, "API_RATE_LIMIT_WINDOW", 3600),
)
