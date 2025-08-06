"""
Session Service.

Сервис для управления сессиями пользователей.
Реализует принципы SOLID и Feature-Sliced Design архитектуры.
"""

from datetime import datetime, UTC
from typing import List, Optional

from fastapi import HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_client_ip, get_user_agent
from app.crud import crud_refresh_token
from app.models.user import User
from app.schemas.auth import ActiveSession
from app.utils.logger import logger


class SessionService:
    """
    Service for session management operations.

    Следует принципам SOLID:
    - Single Responsibility: отвечает только за операции с сессиями
    - Open/Closed: легко расширяется новой логикой сессий
    - Liskov Substitution: может быть заменен другой реализацией
    - Interface Segregation: четкий интерфейс для работы с сессиями
    - Dependency Inversion: зависит от абстракций
    """

    @staticmethod
    async def get_user_sessions(
        db: AsyncSession, user: User, request: Request, active_only: bool = True
    ) -> List[ActiveSession]:
        """
        Get list of user sessions.

        Args:
            db: Сессия базы данных
            user: Пользователь
            request: HTTP запрос (для определения текущей сессии)
            active_only: Только активные сессии

        Returns:
            List[ActiveSession]: Список сессий пользователя
        """
        tokens = await crud_refresh_token.get_user_tokens(
            db, user_id=user.id, active_only=active_only
        )

        # Get current request IP and User-Agent to identify current session
        current_ip = get_client_ip(request)
        current_user_agent = get_user_agent(request)

        sessions = []
        for token in tokens:
            # Determine current session by IP and User-Agent
            is_current = False
            if (
                token.ip_address == current_ip
                and token.user_agent == current_user_agent
                and token.last_used_at
            ):
                try:
                    time_since_last_use = (
                        datetime.now(UTC).replace(tzinfo=None) - token.last_used_at
                    ).total_seconds()
                    is_current = time_since_last_use < 300  # Activity in last 5 minutes
                except Exception:
                    is_current = False

            sessions.append(
                ActiveSession(
                    id=token.id,
                    created_at=token.created_at,
                    last_used_at=token.last_used_at,
                    expires_at=token.expires_at,
                    ip_address=token.ip_address,
                    user_agent=token.user_agent,
                    is_current=bool(is_current),
                )
            )

        logger.info(f"Retrieved {len(sessions)} sessions for user: {user.email}")
        return sessions

    @staticmethod
    async def revoke_user_session(
        db: AsyncSession,
        user: User,
        session_id: Optional[int] = None,
        revoke_all: bool = False,
    ) -> int:
        """
        Revoke user sessions.

        Args:
            db: Сессия базы данных
            user: Пользователь
            session_id: ID конкретной сессии для отзыва
            revoke_all: Отозвать все сессии

        Returns:
            int: Количество отозванных сессий

        Raises:
            HTTPException: Если сессия не найдена или параметры некорректны
        """
        if revoke_all:
            revoked_count = await crud_refresh_token.revoke_user_tokens(
                db, user_id=user.id, reason="session_revoke_all"
            )
            logger.info(
                f"Revoked all sessions for user {user.email}: {revoked_count} sessions"
            )
            return revoked_count

        elif session_id:
            tokens = await crud_refresh_token.get_user_tokens(
                db, user_id=user.id, active_only=True
            )

            for token in tokens:
                if token.id == session_id:
                    await crud_refresh_token.revoke_token(
                        db, token=token, reason="session_revoke"
                    )
                    logger.info(f"Session {session_id} revoked for user: {user.email}")
                    return 1

            logger.warning(f"Session {session_id} not found for user: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
            )

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either session_id or revoke_all must be specified",
            )

    @staticmethod
    async def cleanup_expired_sessions(db: AsyncSession) -> int:
        """
        Clean up expired sessions.

        Args:
            db: Сессия базы данных

        Returns:
            int: Количество очищенных сессий
        """
        # This method would implement cleanup of expired sessions
        # For now, we'll just return 0 as the implementation would depend
        # on the specific requirements and database schema
        logger.info("Session cleanup requested")
        return 0

    @staticmethod
    async def get_session_stats(db: AsyncSession, user: User) -> dict:
        """
        Get session statistics for user.

        Args:
            db: Сессия базы данных
            user: Пользователь

        Returns:
            dict: Статистика сессий
        """
        active_tokens = await crud_refresh_token.get_user_tokens(
            db, user_id=user.id, active_only=True
        )

        all_tokens = await crud_refresh_token.get_user_tokens(
            db, user_id=user.id, active_only=False
        )

        stats = {
            "user_id": user.id,
            "active_sessions": len(active_tokens),
            "total_sessions": len(all_tokens),
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "current_time": datetime.now(UTC).isoformat(),
        }

        if active_tokens:
            latest_session = max(active_tokens, key=lambda t: t.created_at)
            stats["latest_session"] = {
                "created_at": latest_session.created_at.isoformat(),
                "ip_address": latest_session.ip_address,
                "user_agent": latest_session.user_agent,
            }

        logger.info(f"Session stats generated for user: {user.email}")
        return stats

    @staticmethod
    def get_session_device_info(user_agent: str) -> dict:
        """
        Extract device information from user agent.

        Args:
            user_agent: User Agent строка

        Returns:
            dict: Информация об устройстве
        """
        # Simple user agent parsing
        # In production, you might want to use a library like user-agents
        device_info = {
            "browser": "Unknown",
            "os": "Unknown",
            "device": "Unknown",
            "is_mobile": False,
        }

        if user_agent:
            user_agent_lower = user_agent.lower()

            # Browser detection
            if "chrome" in user_agent_lower:
                device_info["browser"] = "Chrome"
            elif "firefox" in user_agent_lower:
                device_info["browser"] = "Firefox"
            elif "safari" in user_agent_lower:
                device_info["browser"] = "Safari"
            elif "edge" in user_agent_lower:
                device_info["browser"] = "Edge"

            # OS detection
            if "windows" in user_agent_lower:
                device_info["os"] = "Windows"
            elif "macintosh" in user_agent_lower or "mac os" in user_agent_lower:
                device_info["os"] = "macOS"
            elif "linux" in user_agent_lower:
                device_info["os"] = "Linux"
            elif "android" in user_agent_lower:
                device_info["os"] = "Android"
            elif "ios" in user_agent_lower or "iphone" in user_agent_lower:
                device_info["os"] = "iOS"

            # Mobile detection
            if any(
                mobile in user_agent_lower
                for mobile in ["mobile", "android", "iphone", "ipad"]
            ):
                device_info["is_mobile"] = True
                device_info["device"] = "Mobile"
            else:
                device_info["device"] = "Desktop"

        return device_info


# Singleton instance
session_service = SessionService()
