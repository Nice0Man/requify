"""
Session Service.

Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

from datetime import datetime, UTC, timedelta
from typing import List, Optional, Dict, Any
from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum

from fastapi import HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_client_ip, get_user_agent
from app.crud import crud_refresh_token
from app.models.user import User
from app.schemas.auth import ActiveSession
from app.utils.logger import logger
from .base import BaseService, ServiceError


class SessionServiceError(ServiceError):
    """Ошибки сервиса сессий."""
    pass


class SessionNotFoundError(SessionServiceError):
    """Ошибка - сессия не найдена."""
    pass


class SessionExpiredError(SessionServiceError):
    """Ошибка - сессия истекла."""
    pass


class SessionStatus(str, Enum):
    """Статусы сессий."""
    
    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"
    SUSPICIOUS = "suspicious"


class SessionType(str, Enum):
    """Типы сессий."""
    
    WEB = "web"
    MOBILE = "mobile"
    API = "api"
    DESKTOP = "desktop"


@dataclass
class SessionInfo:
    """Информация о сессии."""
    
    id: str
    user_id: int
    session_type: SessionType
    status: SessionStatus
    created_at: datetime
    last_used_at: Optional[datetime]
    expires_at: datetime
    ip_address: Optional[str]
    user_agent: Optional[str]
    device_info: Optional[str]
    location: Optional[str]
    is_current: bool = False


@dataclass
class SessionContext:
    """Контекст сессии."""
    
    user_id: int
    ip_address: str
    user_agent: str
    device_info: Optional[str] = None
    location: Optional[str] = None


# Абстрактные интерфейсы
class ISessionDetector(ABC):
    """Интерфейс для определения типа сессии."""
    
    @abstractmethod
    def detect_session_type(self, user_agent: str) -> SessionType:
        """Определить тип сессии по User-Agent."""
        pass


class ISessionMonitor(ABC):
    """Интерфейс для мониторинга сессий."""
    
    @abstractmethod
    async def check_suspicious_activity(self, session_info: SessionInfo, context: SessionContext) -> bool:
        """Проверить подозрительную активность."""
        pass


class ISessionStorage(ABC):
    """Интерфейс для хранения данных сессий."""
    
    @abstractmethod
    async def store_session_data(self, session_id: str, data: Dict[str, Any]) -> bool:
        """Сохранить данные сессии."""
        pass
    
    @abstractmethod
    async def get_session_data(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Получить данные сессии."""
        pass


# Конкретные реализации
class UserAgentSessionDetector(ISessionDetector):
    """Детектор типа сессии по User-Agent."""
    
    def detect_session_type(self, user_agent: str) -> SessionType:
        """Определить тип сессии по User-Agent."""
        if not user_agent:
            return SessionType.API
        
        user_agent_lower = user_agent.lower()
        
        # Мобильные устройства
        mobile_indicators = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry']
        if any(indicator in user_agent_lower for indicator in mobile_indicators):
            return SessionType.MOBILE
        
        # Десктопные приложения
        desktop_indicators = ['electron', 'desktop', 'app']
        if any(indicator in user_agent_lower for indicator in desktop_indicators):
            return SessionType.DESKTOP
        
        # API клиенты
        api_indicators = ['curl', 'wget', 'postman', 'insomnia', 'httpie', 'python-requests']
        if any(indicator in user_agent_lower for indicator in api_indicators):
            return SessionType.API
        
        # По умолчанию - веб
        return SessionType.WEB


class SecuritySessionMonitor(ISessionMonitor):
    """Монитор безопасности сессий."""
    
    def __init__(self):
        self._suspicious_ips: set = set()
        self._failed_attempts: Dict[str, int] = {}
    
    async def check_suspicious_activity(self, session_info: SessionInfo, context: SessionContext) -> bool:
        """Проверить подозрительную активность."""
        suspicious_factors = []
        
        # Проверка IP в черном списке
        if context.ip_address in self._suspicious_ips:
            suspicious_factors.append("blacklisted_ip")
        
        # Проверка слишком частых запросов с одного IP
        if context.ip_address in self._failed_attempts:
            if self._failed_attempts[context.ip_address] > 10:
                suspicious_factors.append("too_many_failed_attempts")
        
        # Проверка изменения User-Agent в рамках сессии
        if (session_info.user_agent and context.user_agent and 
            session_info.user_agent != context.user_agent):
            suspicious_factors.append("user_agent_changed")
        
        # Проверка изменения IP в рамках сессии (если не ожидается)
        if (session_info.ip_address and context.ip_address and
            session_info.ip_address != context.ip_address):
            suspicious_factors.append("ip_changed")
        
        # Логирование подозрительной активности
        if suspicious_factors:
            logger.warning(f"Suspicious session activity detected: {suspicious_factors}")
        
        return len(suspicious_factors) > 0
    
    def report_failed_attempt(self, ip_address: str):
        """Зарегистрировать неудачную попытку."""
        self._failed_attempts[ip_address] = self._failed_attempts.get(ip_address, 0) + 1
    
    def add_suspicious_ip(self, ip_address: str):
        """Добавить IP в черный список."""
        self._suspicious_ips.add(ip_address)


class InMemorySessionStorage(ISessionStorage):
    """In-memory хранилище данных сессий."""
    
    def __init__(self):
        self._storage: Dict[str, Dict[str, Any]] = {}
    
    async def store_session_data(self, session_id: str, data: Dict[str, Any]) -> bool:
        """Сохранить данные сессии."""
        self._storage[session_id] = data
        return True
    
    async def get_session_data(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Получить данные сессии."""
        return self._storage.get(session_id)


class SessionAnalyzer:
    """Анализатор сессий."""
    
    def __init__(self):
        self._detector = UserAgentSessionDetector()
    
    def analyze_session(self, token_info: Any, current_context: SessionContext) -> SessionInfo:
        """Анализировать сессию."""
        session_type = self._detector.detect_session_type(token_info.user_agent or "")
        
        # Определение статуса
        status = SessionStatus.ACTIVE
        if token_info.expires_at and token_info.expires_at < datetime.now(UTC).replace(tzinfo=None):
            status = SessionStatus.EXPIRED
        elif getattr(token_info, 'revoked', False):
            status = SessionStatus.REVOKED
        
        # Определение устройства
        device_info = self._extract_device_info(token_info.user_agent)
        
        # Проверка, является ли сессия текущей
        is_current = self._is_current_session(token_info, current_context)
        
        return SessionInfo(
            id=str(token_info.id),
            user_id=token_info.user_id,
            session_type=session_type,
            status=status,
            created_at=token_info.created_at,
            last_used_at=token_info.last_used_at,
            expires_at=token_info.expires_at,
            ip_address=token_info.ip_address,
            user_agent=token_info.user_agent,
            device_info=device_info,
            location=None,  # TODO: Геолокация по IP
            is_current=is_current
        )
    
    def _extract_device_info(self, user_agent: Optional[str]) -> Optional[str]:
        """Извлечь информацию об устройстве."""
        if not user_agent:
            return None
        
        # Простое извлечение информации об устройстве
        if 'Windows' in user_agent:
            return 'Windows PC'
        elif 'Mac' in user_agent:
            return 'Mac'
        elif 'Linux' in user_agent:
            return 'Linux'
        elif 'Android' in user_agent:
            return 'Android Device'
        elif 'iPhone' in user_agent:
            return 'iPhone'
        elif 'iPad' in user_agent:
            return 'iPad'
        
        return 'Unknown Device'
    
    def _is_current_session(self, token_info: Any, current_context: SessionContext) -> bool:
        """Проверить, является ли сессия текущей."""
        if (token_info.ip_address == current_context.ip_address and
            token_info.user_agent == current_context.user_agent and
            token_info.last_used_at):
            try:
                time_since_last_use = (
                    datetime.now(UTC).replace(tzinfo=None) - token_info.last_used_at
                ).total_seconds()
                return time_since_last_use < 300  # Активность в последние 5 минут
            except Exception:
                return False
        return False


class SessionService(BaseService):
    """
    Основной сервис сессий.
    
    Реализует паттерны:
    - Singleton (через BaseService)
    - Strategy (разные детекторы и мониторы)
    - Observer (мониторинг сессий)
    - Repository (работа с данными сессий)
    """
    
    def __init__(self):
        self._analyzer = SessionAnalyzer()
        self._monitor = SecuritySessionMonitor()
        self._storage = InMemorySessionStorage()
        super().__init__()
    
    def get_service_name(self) -> str:
        return "SessionService"
    
    async def get_user_sessions(
        self,
        db: AsyncSession,
        user: User,
        request: Request,
        active_only: bool = True
    ) -> List[ActiveSession]:
        """Получить список сессий пользователя."""
        try:
            self._log_operation("get_user_sessions", {
                "user_id": user.id,
                "active_only": active_only
            })
            
            # Получение токенов из базы данных
            tokens = await crud_refresh_token.get_user_tokens(
                db, user_id=user.id, active_only=active_only
            )
            
            # Текущий контекст
            current_context = SessionContext(
                user_id=user.id,
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request)
            )
            
            # Анализ и преобразование сессий
            sessions = []
            for token in tokens:
                session_info = self._analyzer.analyze_session(token, current_context)
                
                # Проверка на подозрительную активность
                is_suspicious = await self._monitor.check_suspicious_activity(session_info, current_context)
                
                sessions.append(
                    ActiveSession(
                        id=session_info.id,
                        created_at=session_info.created_at,
                        last_used_at=session_info.last_used_at,
                        expires_at=session_info.expires_at,
                        ip_address=session_info.ip_address,
                        user_agent=session_info.user_agent,
                        device_info=session_info.device_info,
                        location=session_info.location,
                        is_current=session_info.is_current,
                        session_type=session_info.session_type.value,
                        status=SessionStatus.SUSPICIOUS.value if is_suspicious else session_info.status.value
                    )
                )
            
            return sessions
            
        except Exception as e:
            raise self._handle_error(e, "get_user_sessions")
    
    async def revoke_session(
        self,
        db: AsyncSession,
        user: User,
        session_id: int,
        reason: str = "user_request"
    ) -> bool:
        """Отозвать сессию."""
        try:
            self._log_operation("revoke_session", {
                "user_id": user.id,
                "session_id": session_id,
                "reason": reason
            })
            
            # Проверка, что сессия принадлежит пользователю
            token = await crud_refresh_token.get(db, id=session_id)
            if not token or token.user_id != user.id:
                raise SessionNotFoundError("Сессия не найдена")
            
            # Отзыв токена
            success = await crud_refresh_token.revoke_token(
                db, token_id=session_id, reason=reason
            )
            
            if success:
                logger.info(f"Session {session_id} revoked for user {user.email}")
            
            return success
            
        except Exception as e:
            raise self._handle_error(e, "revoke_session")
    
    async def revoke_all_sessions(
        self,
        db: AsyncSession,
        user: User,
        exclude_current: bool = True,
        request: Optional[Request] = None,
        reason: str = "revoke_all"
    ) -> int:
        """Отозвать все сессии пользователя."""
        try:
            self._log_operation("revoke_all_sessions", {
                "user_id": user.id,
                "exclude_current": exclude_current
            })
            
            current_token_id = None
            if exclude_current and request:
                # Определить текущую сессию для исключения
                current_context = SessionContext(
                    user_id=user.id,
                    ip_address=get_client_ip(request),
                    user_agent=get_user_agent(request)
                )
                
                tokens = await crud_refresh_token.get_user_tokens(
                    db, user_id=user.id, active_only=True
                )
                
                for token in tokens:
                    session_info = self._analyzer.analyze_session(token, current_context)
                    if session_info.is_current:
                        current_token_id = token.id
                        break
            
            # Отзыв токенов
            revoked_count = await crud_refresh_token.revoke_user_tokens(
                db, user_id=user.id, reason=reason, exclude_token_id=current_token_id
            )
            
            logger.info(f"Revoked {revoked_count} sessions for user {user.email}")
            
            return revoked_count
            
        except Exception as e:
            raise self._handle_error(e, "revoke_all_sessions")
    
    async def update_session_activity(
        self,
        db: AsyncSession,
        token_id: int,
        request: Request
    ) -> bool:
        """Обновить активность сессии."""
        try:
            self._log_operation("update_session_activity", {"token_id": token_id})
            
            # Обновление времени последнего использования
            success = await crud_refresh_token.update_last_used(
                db, token_id=token_id, 
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request)
            )
            
            return success
            
        except Exception as e:
            raise self._handle_error(e, "update_session_activity")
    
    async def get_session_statistics(
        self,
        db: AsyncSession,
        user: User
    ) -> Dict[str, Any]:
        """Получить статистику сессий пользователя."""
        try:
            self._log_operation("get_session_statistics", {"user_id": user.id})
            
            tokens = await crud_refresh_token.get_user_tokens(
                db, user_id=user.id, active_only=False
            )
            
            total_sessions = len(tokens)
            active_sessions = len([t for t in tokens if not getattr(t, 'revoked', False)])
            
            # Группировка по типам устройств
            device_stats = {}
            for token in tokens:
                device_info = self._analyzer._extract_device_info(token.user_agent)
                device_stats[device_info] = device_stats.get(device_info, 0) + 1
            
            return {
                "total_sessions": total_sessions,
                "active_sessions": active_sessions,
                "expired_sessions": total_sessions - active_sessions,
                "device_breakdown": device_stats,
                "last_activity": max((t.last_used_at for t in tokens if t.last_used_at), default=None)
            }
            
        except Exception as e:
            raise self._handle_error(e, "get_session_statistics")


# Регистрация сервиса в фабрике
from .base import ServiceFactory
ServiceFactory.register_service("session", SessionService)

# Singleton instance
session_service = SessionService()