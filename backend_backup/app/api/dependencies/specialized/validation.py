"""
Validation dependencies.

Специализированные dependencies для валидации данных.
"""

from typing import Callable, Any, Dict, Optional
from fastapi import HTTPException, status, Path, Query
from pydantic import UUID4, validator
import re

from app.utils.logger import logger


class ValidationDependencies:
    """
    Collection of validation dependencies.

    Provides reusable validation logic for common patterns.
    """

    @staticmethod
    def valid_id(min_value: int = 1) -> Callable:
        """
        Validate positive integer ID.

        Args:
            min_value: Minimum allowed value

        Returns:
            Callable: Validation dependency
        """

        def validate_id(id_value: int = Path(..., ge=min_value)) -> int:
            return id_value

        return validate_id

    @staticmethod
    def valid_uuid() -> Callable:
        """Validate UUID format."""

        def validate_uuid(uuid_value: UUID4 = Path(...)) -> UUID4:
            return uuid_value

        return validate_uuid

    @staticmethod
    def valid_email() -> Callable:
        """Validate email format."""

        def validate_email(email: str = Query(...)) -> str:
            email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
            if not re.match(email_pattern, email):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid email format",
                )
            return email.lower()

        return validate_email

    @staticmethod
    def valid_username() -> Callable:
        """Validate username format."""

        def validate_username(username: str = Query(...)) -> str:
            username_pattern = r"^[a-zA-Z0-9_-]{3,50}$"
            if not re.match(username_pattern, username):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username must be 3-50 characters, letters, numbers, underscore and dash only",
                )
            return username.lower()

        return validate_username

    @staticmethod
    def valid_pagination() -> Callable:
        """Validate pagination parameters."""

        def validate_pagination(
            skip: int = Query(0, ge=0, description="Number of records to skip"),
            limit: int = Query(
                100, ge=1, le=1000, description="Number of records to return"
            ),
        ) -> Dict[str, int]:
            return {"skip": skip, "limit": limit}

        return validate_pagination

    @staticmethod
    def valid_search_query() -> Callable:
        """Validate search query."""

        def validate_search(
            q: Optional[str] = Query(None, min_length=2, max_length=100)
        ) -> Optional[str]:
            if q:
                # Sanitize search query
                q = re.sub(r"[^\w\s-]", "", q).strip()
                if len(q) < 2:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Search query must be at least 2 characters",
                    )
            return q

        return validate_search

    @staticmethod
    def valid_sort_params(allowed_fields: list) -> Callable:
        """
        Validate sorting parameters.

        Args:
            allowed_fields: List of allowed sort fields

        Returns:
            Callable: Sort validation dependency
        """

        def validate_sort(
            sort_by: Optional[str] = Query(None, description="Field to sort by"),
            sort_order: str = Query(
                "asc", regex="^(asc|desc)$", description="Sort order"
            ),
        ) -> Dict[str, str]:
            if sort_by and sort_by not in allowed_fields:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid sort field. Allowed: {', '.join(allowed_fields)}",
                )
            return {"sort_by": sort_by, "sort_order": sort_order}

        return validate_sort


# Common validation instances for reuse
valid_positive_id = ValidationDependencies.valid_id()
valid_uuid_param = ValidationDependencies.valid_uuid()
valid_email_param = ValidationDependencies.valid_email()
valid_username_param = ValidationDependencies.valid_username()
valid_pagination_params = ValidationDependencies.valid_pagination()
valid_search_param = ValidationDependencies.valid_search_query()
