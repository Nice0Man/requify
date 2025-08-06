"""
API endpoints для контактных данных компании.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

    AdminPermissions,
from app.api.dependencies import get_db, get_current_active_user, SessionDep,
from app.models.user import User
from app.services.company_contact_service import company_contact_service
from app.schemas.company_contact import (
    CompanyContactCreate,
    CompanyContactUpdate,
    CompanyContactResponse,
)

router = APIRouter()


@router.get("/company/{company_id}/contact", response_model=CompanyContactResponse)
async def get_company_contact(
    company_id: int,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanyContactResponse:
    """
    Получить контактные данные компании.
    """
    contact = company_contact_service.get_company_contact(
        db=db, company_id=company_id, current_user=current_user
    )

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Company contact not found"
        )

    return CompanyContactResponse(**contact.__dict__)


@router.post(
    "/company/{company_id}/contact",
    response_model=CompanyContactResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_or_update_company_contact(
    *,
    company_id: int,
    contact_in: CompanyContactCreate,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanyContactResponse:
    """
    Создать или обновить контактные данные компании.

    Если контактные данные уже существуют, они будут обновлены.
    Требует права на редактирование компании.
    """
    # Валидация данных
    validation_errors = company_contact_service.validate_contact_data(contact_in)
    if validation_errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation errors: {validation_errors}",
        )

    contact = company_contact_service.create_or_update_company_contact(
        db=db, company_id=company_id, contact_data=contact_in, current_user=current_user
    )

    return CompanyContactResponse(**contact.__dict__)


@router.put("/company/{company_id}/contact", response_model=CompanyContactResponse)
async def update_company_contact(
    *,
    company_id: int,
    contact_in: CompanyContactUpdate,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> CompanyContactResponse:
    """
    Обновить контактные данные компании.

    Требует права на редактирование компании.
    """
    contact = company_contact_service.update_company_contact(
        db=db, company_id=company_id, contact_data=contact_in, current_user=current_user
    )

    return CompanyContactResponse(**contact.__dict__)


@router.get("/contact/search/email", response_model=List[CompanyContactResponse])
async def search_companies_by_email(
    email: str = Query(..., description="Email адрес для поиска"),
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> List[CompanyContactResponse]:
    """
    Поиск компаний по email адресу.

    Доступно только системным администраторам.
    """
    contacts = company_contact_service.search_companies_by_email(
        db=db, email=email, current_user=current_user
    )

    return [CompanyContactResponse(**contact.__dict__) for contact in contacts]


@router.get("/contact/search/phone", response_model=List[CompanyContactResponse])
async def search_companies_by_phone(
    phone: str = Query(..., description="Номер телефона для поиска"),
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> List[CompanyContactResponse]:
    """
    Поиск компаний по номеру телефона.

    Доступно только системным администраторам.
    """
    contacts = company_contact_service.search_companies_by_phone(
        db=db, phone=phone, current_user=current_user
    )

    return [CompanyContactResponse(**contact.__dict__) for contact in contacts]


@router.get("/contact/search/location", response_model=List[CompanyContactResponse])
async def search_companies_by_location(
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
    country: Optional[str] = Query(None, description="Страна для поиска"),
    city: Optional[str] = Query(None, description="Город для поиска"),
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(
        100, ge=1, le=1000, description="Максимальное количество записей"
    ),
) -> List[CompanyContactResponse]:
    """
    Поиск компаний по местоположению (стране или городу).

    Доступно только системным администраторам.
    """
    contacts = company_contact_service.get_companies_by_location(
        db=db,
        country=country,
        city=city,
        current_user=current_user,
        skip=skip,
        limit=limit,
    )

    return [CompanyContactResponse(**contact.__dict__) for contact in contacts]


@router.get("/contact/search/timezone", response_model=List[CompanyContactResponse])
async def search_companies_by_timezone(
    timezone: str = Query(..., description="Временная зона для поиска"),
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(
        100, ge=1, le=1000, description="Максимальное количество записей"
    ),
) -> List[CompanyContactResponse]:
    """
    Поиск компаний по временной зоне.

    Доступно только системным администраторам.
    """
    contacts = company_contact_service.get_companies_by_timezone(
        db=db, timezone=timezone, current_user=current_user, skip=skip, limit=limit
    )

    return [CompanyContactResponse(**contact.__dict__) for contact in contacts]


@router.get("/contact/search", response_model=List[CompanyContactResponse])
async def search_company_contacts(
    q: str = Query(..., min_length=1, description="Поисковый запрос"),
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(
        100, ge=1, le=1000, description="Максимальное количество записей"
    ),
) -> List[CompanyContactResponse]:
    """
    Поиск контактных данных компаний по общему запросу.

    Поиск осуществляется по email, сайту, городу, стране, телефону.
    Доступно только системным администраторам.
    """
    contacts = company_contact_service.search_company_contacts(
        db=db, query=q, current_user=current_user, skip=skip, limit=limit
    )

    return [CompanyContactResponse(**contact.__dict__) for contact in contacts]


@router.get("/contact/incomplete", response_model=List[CompanyContactResponse])
async def get_incomplete_contacts(
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(
        100, ge=1, le=1000, description="Максимальное количество записей"
    ),
) -> List[CompanyContactResponse]:
    """
    Получить компании с неполными контактными данными.

    Возвращает компании, у которых отсутствуют основные контактные данные
    (email, телефон, страна, город).
    Доступно только системным администраторам.
    """
    contacts = company_contact_service.get_incomplete_contacts(
        db=db, current_user=current_user, skip=skip, limit=limit
    )

    return [CompanyContactResponse(**contact.__dict__) for contact in contacts]


@router.get("/contact/statistics", response_model=Dict[str, Any])
async def get_contact_statistics(
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Получить статистику контактных данных компаний.

    Возвращает общую статистику по заполненности контактных данных.
    Доступно только системным администраторам.
    """
    return company_contact_service.get_contact_statistics(
        db=db, current_user=current_user
    )


@router.post("/company/{company_id}/contact/validate", response_model=Dict[str, Any])
async def validate_contact_data(
    *,
    company_id: int,
    contact_in: CompanyContactCreate,
    db: SessionDep,
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Валидация контактных данных компании без сохранения.

    Проверяет корректность введенных данных и возвращает список ошибок.
    """
    # Проверить права доступа
    if not company_contact_service._can_access_company(current_user, company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
        )

    validation_errors = company_contact_service.validate_contact_data(contact_in)

    return {"valid": len(validation_errors) == 0, "errors": validation_errors}
