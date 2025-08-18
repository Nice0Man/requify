"""
Identity Management Domain

Handles user and role management operations including:
- User management (CRUD)
- Profile management
- Role management
- Permission management
- User-role assignments
"""

from .router import router

__all__ = ["router"]
