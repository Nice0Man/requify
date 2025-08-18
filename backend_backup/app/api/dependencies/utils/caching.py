"""
Caching utilities for dependencies.

Реализует паттерн Decorator для кеширования dependency результатов.
"""

from typing import Callable, Any, Optional, Dict, TypeVar, Generic
from functools import wraps, lru_cache
from datetime import datetime, timedelta, UTC
import asyncio
from dataclasses import dataclass

from app.utils.logger import logger


T = TypeVar("T")


@dataclass
class CacheEntry(Generic[T]):
    """Cache entry with expiration."""

    value: T
    expires_at: datetime
    created_at: datetime = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now(UTC)

    @property
    def is_expired(self) -> bool:
        """Check if cache entry is expired."""
        return datetime.now(UTC) > self.expires_at


class AsyncCache:
    """
    Async cache for dependency results.

    Использует паттерн Singleton для глобального кеша.
    """

    _instance = None
    _cache: Dict[str, CacheEntry] = {}
    _locks: Dict[str, asyncio.Lock] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        entry = self._cache.get(key)
        if entry and not entry.is_expired:
            logger.debug(f"Cache hit for key: {key}")
            return entry.value

        if entry and entry.is_expired:
            logger.debug(f"Cache expired for key: {key}")
            del self._cache[key]

        return None

    async def set(self, key: str, value: Any, ttl_seconds: int = 300) -> None:
        """Set value in cache with TTL."""
        expires_at = datetime.now(UTC) + timedelta(seconds=ttl_seconds)
        self._cache[key] = CacheEntry(value=value, expires_at=expires_at)
        logger.debug(f"Cache set for key: {key}, TTL: {ttl_seconds}s")

    async def delete(self, key: str) -> None:
        """Delete value from cache."""
        if key in self._cache:
            del self._cache[key]
            logger.debug(f"Cache deleted for key: {key}")

    async def clear(self) -> None:
        """Clear all cache."""
        self._cache.clear()
        self._locks.clear()
        logger.debug("Cache cleared")

    async def get_lock(self, key: str) -> asyncio.Lock:
        """Get lock for key to prevent cache stampede."""
        if key not in self._locks:
            self._locks[key] = asyncio.Lock()
        return self._locks[key]


class CachedDependency:
    """
    Decorator for caching dependency results.

    Использует паттерн Decorator для добавления кеширования
    к существующим dependencies.
    """

    def __init__(
        self,
        ttl_seconds: int = 300,
        key_prefix: str = "dep",
        cache_per_user: bool = True,
        cache_exceptions: bool = False,
    ):
        self.ttl_seconds = ttl_seconds
        self.key_prefix = key_prefix
        self.cache_per_user = cache_per_user
        self.cache_exceptions = cache_exceptions
        self.cache = AsyncCache()

    def __call__(self, dependency_func: Callable) -> Callable:
        """Apply caching to dependency function."""

        @wraps(dependency_func)
        async def cached_dependency(*args, **kwargs):
            # Generate cache key
            cache_key = self._generate_cache_key(dependency_func.__name__, args, kwargs)

            # Try to get from cache first
            cached_result = await self.cache.get(cache_key)
            if cached_result is not None:
                return cached_result

            # Get lock to prevent multiple execution
            lock = await self.cache.get_lock(cache_key)

            async with lock:
                # Double-check cache after acquiring lock
                cached_result = await self.cache.get(cache_key)
                if cached_result is not None:
                    return cached_result

                try:
                    # Execute original dependency
                    result = await dependency_func(*args, **kwargs)

                    # Cache the result
                    await self.cache.set(cache_key, result, self.ttl_seconds)

                    return result

                except Exception as e:
                    if self.cache_exceptions:
                        # Cache the exception for short time to prevent cascading failures
                        await self.cache.set(cache_key, e, min(self.ttl_seconds, 60))
                    raise

        # Preserve original function metadata
        cached_dependency.__name__ = f"cached_{dependency_func.__name__}"
        cached_dependency.__doc__ = dependency_func.__doc__

        return cached_dependency

    def _generate_cache_key(self, func_name: str, args: tuple, kwargs: dict) -> str:
        """Generate cache key from function name and arguments."""
        key_parts = [self.key_prefix, func_name]

        # Add user ID if caching per user
        if self.cache_per_user:
            current_user = None

            # Try to find user in kwargs
            for value in kwargs.values():
                if hasattr(value, "id") and hasattr(value, "email"):
                    current_user = value
                    break

            # Try to find user in args
            if not current_user:
                for arg in args:
                    if hasattr(arg, "id") and hasattr(arg, "email"):
                        current_user = arg
                        break

            if current_user:
                key_parts.append(f"user_{current_user.id}")

        # Add relevant kwargs to key
        relevant_kwargs = {
            k: v
            for k, v in kwargs.items()
            if isinstance(v, (str, int, bool, type(None)))
        }

        if relevant_kwargs:
            key_parts.append(
                "_".join(f"{k}_{v}" for k, v in sorted(relevant_kwargs.items()))
            )

        return ":".join(key_parts)


# Convenience decorators for common TTL values
def cache_short(ttl_seconds: int = 60):
    """Cache dependency result for short time (1 minute default)."""
    return CachedDependency(ttl_seconds=ttl_seconds)


def cache_medium(ttl_seconds: int = 300):
    """Cache dependency result for medium time (5 minutes default)."""
    return CachedDependency(ttl_seconds=ttl_seconds)


def cache_long(ttl_seconds: int = 1800):
    """Cache dependency result for long time (30 minutes default)."""
    return CachedDependency(ttl_seconds=ttl_seconds)


# LRU cache for simple synchronous dependencies
def lru_cached_dependency(maxsize: int = 128):
    """Apply LRU cache to synchronous dependency."""
    return lru_cache(maxsize=maxsize)
