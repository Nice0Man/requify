"""
Companies Management Router.

Handles all company-related operations including CRUD operations,
settings management, and subscription management.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.api.dependencies import (
    SessionDep,
    CurrentActiveUserDep,
    # CompanyPermissions,
    # AdminPermissions,
    PermissionChecker,
)
from app.models import User
from app.core.constants import Permission, RoleScope
from app.services.company_settings_service import CompanySettingsService
from app.services.company_contact_service import CompanyContactService
from app.services.company_branding_service import CompanyBrandingService
from .schemas import (
    CompanyCreateRequest,
    CompanyUpdateRequest,
    CompanyResponse,
    CompanyDetailResponse,
    CompanyListResponse,
    CompanyOperationResponse,
    CompanySettingsRequest,
    CompanySettingsResponse,
    CompanyContactRequest,
    CompanyContactResponse,
    CompanyBrandingRequest,
    CompanyBrandingResponse,
)

# Initialize services
company_settings_service = CompanySettingsService()
company_contact_service = CompanyContactService()
company_branding_service = CompanyBrandingService()

# Initialize permission checker
permission_checker = PermissionChecker()

router = APIRouter()

# =============================================================================
# Company CRUD Operations
# =============================================================================


@router.get(
    "/",
    summary="Get Companies List",
    description="Get paginated list of companies (Admin only)",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_COMPANY))
    ],
    response_model=CompanyListResponse,
)
async def get_companies(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    search: Optional[str] = Query(None, description="Search query"),
    status: Optional[str] = Query(None, description="Filter by status"),
):
    """
    Получение списка компаний с фильтрацией и пагинацией.

    Доступ: SYSTEM_ADMIN
    """
    try:
        result = await company_management_service.get_companies_list(
            db=db,
            skip=skip,
            limit=limit,
            search=search,
            status=status,
            current_user=current_user,
        )

        # Convert to response format
        companies = [
            CompanyResponse(
                id=company.id,
                name=company.name,
                description=company.description,
                website=company.website,
                industry=company.industry,
                size=company.size,
                status=company.status,
                created_at=company.created_at,
                updated_at=company.updated_at,
            )
            for company in result
        ]

        total = len(result)
        pages = (total + limit - 1) // limit

        return CompanyListResponse(
            companies=companies,
            total=total,
            page=(skip // limit) + 1,
            size=limit,
            pages=pages,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get companies: {str(e)}",
        )


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Create Company",
    description="Create new company (Admin only)",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_COMPANY))
    ],
    response_model=CompanyDetailResponse,
)
async def create_company(
    company_data: CompanyCreateRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Создание новой компании.

    Только для системных администраторов.
    """
    try:
        new_company = await company_management_service.create_company(
            db=db,
            name=company_data.name,
            description=company_data.description,
            website=company_data.website,
            industry=company_data.industry,
            size=company_data.size.value,
            initial_admin_email=company_data.initial_admin_email,
            subscription_plan=company_data.subscription_plan.value,
            created_by=current_user.id,
        )

        return CompanyDetailResponse(
            id=new_company.id,
            name=new_company.name,
            description=new_company.description,
            website=new_company.website,
            industry=new_company.industry,
            size=new_company.size,
            status=new_company.status,
            created_at=new_company.created_at,
            updated_at=new_company.updated_at,
            employees_count=0,
            projects_count=0,
            departments_count=0,
            teams_count=0,
            subscription_plan=company_data.subscription_plan,
            subscription_expires_at=None,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create company: {str(e)}",
        )


@router.get(
    "/my",
    summary="Get My Company",
    description="Get current user's company information",
    response_model=CompanyDetailResponse,
)
async def get_my_company(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение информации о компании текущего пользователя.

    Доступно всем аутентифицированным пользователям.
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User is not associated with any company",
            )

        company = await company_management_service.get_company_by_id(
            db=db, company_id=current_user.company_id
        )
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Company not found"
            )

        # Get company statistics
        stats = await company_management_service.get_company_statistics(
            db=db, company_id=company.id
        )

        return CompanyDetailResponse(
            id=company.id,
            name=company.name,
            description=company.description,
            website=company.website,
            industry=company.industry,
            size=company.size,
            status=company.status,
            created_at=company.created_at,
            updated_at=company.updated_at,
            employees_count=stats.get("employees_count", 0),
            projects_count=stats.get("projects_count", 0),
            departments_count=stats.get("departments_count", 0),
            teams_count=stats.get("teams_count", 0),
            subscription_plan=stats.get("subscription_plan", "free"),
            subscription_expires_at=stats.get("subscription_expires_at"),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get company: {str(e)}",
        )


@router.put(
    "/my",
    summary="Update My Company",
    description="Update current user's company information",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.MANAGE_COMPANY, scope=RoleScope.COMPANY
            )
        )
    ],
    response_model=CompanyDetailResponse,
)
async def update_my_company(
    company_data: CompanyUpdateRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Обновление информации о компании текущего пользователя.

    Доступ: COMPANY_ADMIN+
    """
    try:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User is not associated with any company",
            )

        # Update company
        company_updates = {}
        if company_data.name is not None:
            company_updates["name"] = company_data.name
        if company_data.description is not None:
            company_updates["description"] = company_data.description
        if company_data.website is not None:
            company_updates["website"] = company_data.website
        if company_data.industry is not None:
            company_updates["industry"] = company_data.industry
        if company_data.size is not None:
            company_updates["size"] = company_data.size.value

        if company_updates:
            await company_management_service.update_company(
                db=db, company_id=current_user.company_id, **company_updates
            )

        # Get updated company
        updated_company = await company_management_service.get_company_by_id(
            db=db, company_id=current_user.company_id
        )
        if not updated_company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Company not found"
            )

        # Get company statistics
        stats = await company_management_service.get_company_statistics(
            db=db, company_id=updated_company.id
        )

        return CompanyDetailResponse(
            id=updated_company.id,
            name=updated_company.name,
            description=updated_company.description,
            website=updated_company.website,
            industry=updated_company.industry,
            size=updated_company.size,
            status=updated_company.status,
            created_at=updated_company.created_at,
            updated_at=updated_company.updated_at,
            employees_count=stats.get("employees_count", 0),
            projects_count=stats.get("projects_count", 0),
            departments_count=stats.get("departments_count", 0),
            teams_count=stats.get("teams_count", 0),
            subscription_plan=stats.get("subscription_plan", "free"),
            subscription_expires_at=stats.get("subscription_expires_at"),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update company: {str(e)}",
        )


@router.get(
    "/{company_id}",
    summary="Get Company by ID",
    description="Get company information by ID",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_COMPANY_SETTINGS, scope=RoleScope.SYSTEM
            )
        )
    ],
    response_model=CompanyDetailResponse,
)
async def get_company(
    company_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение информации о компании по ID.

    Доступ: SYSTEM_ADMIN или участники компании
    """
    try:
        company = await company_management_service.get_company_by_id(
            db=db, company_id=company_id
        )
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Company not found"
            )

        # Get company statistics
        stats = await company_management_service.get_company_statistics(
            db=db, company_id=company.id
        )

        return CompanyDetailResponse(
            id=company.id,
            name=company.name,
            description=company.description,
            website=company.website,
            industry=company.industry,
            size=company.size,
            status=company.status,
            created_at=company.created_at,
            updated_at=company.updated_at,
            employees_count=stats.get("employees_count", 0),
            projects_count=stats.get("projects_count", 0),
            departments_count=stats.get("departments_count", 0),
            teams_count=stats.get("teams_count", 0),
            subscription_plan=stats.get("subscription_plan", "free"),
            subscription_expires_at=stats.get("subscription_expires_at"),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get company: {str(e)}",
        )


@router.delete(
    "/{company_id}",
    summary="Delete Company",
    description="Delete company (System Admin only)",
    dependencies=[
        Depends(permission_checker.require_permission(Permission.MANAGE_COMPANY))
    ],
    response_model=CompanyOperationResponse,
)
async def delete_company(
    company_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Удаление компании.

    Только для системных администраторов.
    """
    try:
        success = await company_management_service.delete_company(
            db=db, company_id=company_id, deleted_by=current_user.id
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Company not found"
            )

        return CompanyOperationResponse(
            success=True, message="Company deleted successfully", company_id=company_id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete company: {str(e)}",
        )

# =============================================================================
# Company Settings Management
# =============================================================================


@router.get(
    "/{company_id}/settings",
    summary="Get Company Settings",
    description="Get company settings",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_COMPANY_SETTINGS, scope=RoleScope.COMPANY
            )
        )
    ],
    response_model=CompanySettingsResponse,
)
async def get_company_settings(
    company_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение настроек компании.

    Доступ: COMPANY_ADMIN+
    """
    try:
        settings = await company_settings_service.get_company_settings(
            db=db, company_id=company_id, current_user=current_user
        )

        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company settings not found",
            )

        return CompanySettingsResponse(
            id=settings.id,
            company_id=settings.company_id,
            timezone=settings.timezone,
            language=settings.language,
            date_format=settings.date_format,
            currency=settings.currency,
            password_policy_enabled=settings.password_policy_enabled,
            two_factor_required=settings.two_factor_required,
            session_timeout_minutes=settings.session_timeout_minutes,
            projects_enabled=settings.projects_enabled,
            requirements_enabled=settings.requirements_enabled,
            testing_enabled=settings.testing_enabled,
            analytics_enabled=settings.analytics_enabled,
            created_at=settings.created_at,
            updated_at=settings.updated_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get company settings: {str(e)}",
        )


@router.put(
    "/{company_id}/settings",
    summary="Update Company Settings",
    description="Update company settings",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.MANAGE_COMPANY_SETTINGS, scope=RoleScope.COMPANY
            )
        )
    ],
    response_model=CompanySettingsResponse,
)
async def update_company_settings(
    company_id: int,
    settings_data: CompanySettingsRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Обновление настроек компании.

    Доступ: COMPANY_ADMIN+
    """
    try:
        updated_settings = await company_settings_service.update_company_settings(
            db=db,
            company_id=company_id,
            settings_data=settings_data.model_dump(exclude_unset=True),
            current_user=current_user,
        )

        return CompanySettingsResponse(
            id=updated_settings.id,
            company_id=updated_settings.company_id,
            timezone=updated_settings.timezone,
            language=updated_settings.language,
            date_format=updated_settings.date_format,
            currency=updated_settings.currency,
            password_policy_enabled=updated_settings.password_policy_enabled,
            two_factor_required=updated_settings.two_factor_required,
            session_timeout_minutes=updated_settings.session_timeout_minutes,
            projects_enabled=updated_settings.projects_enabled,
            requirements_enabled=updated_settings.requirements_enabled,
            testing_enabled=updated_settings.testing_enabled,
            analytics_enabled=updated_settings.analytics_enabled,
            created_at=updated_settings.created_at,
            updated_at=updated_settings.updated_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update company settings: {str(e)}",
        )


# =============================================================================
# Company Contact Management
# =============================================================================


@router.get(
    "/{company_id}/contact",
    summary="Get Company Contact",
    description="Get company contact information",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_COMPANY_SETTINGS, scope=RoleScope.COMPANY
            )
        )
    ],
    response_model=CompanyContactResponse,
)
async def get_company_contact(
    company_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение контактной информации компании.

    Доступ: COMPANY_ADMIN+
    """
    try:
        contact = await company_contact_service.get_company_contact(
            db=db, company_id=company_id, current_user=current_user
        )

        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company contact not found",
            )

        return CompanyContactResponse(
            id=contact.id,
            company_id=contact.company_id,
            email=contact.email,
            phone=contact.phone,
            address=contact.address,
            city=contact.city,
            country=contact.country,
            postal_code=contact.postal_code,
            created_at=contact.created_at,
            updated_at=contact.updated_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get company contact: {str(e)}",
        )


@router.put(
    "/{company_id}/contact",
    summary="Update Company Contact",
    description="Update company contact information",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.MANAGE_COMPANY_SETTINGS, scope=RoleScope.COMPANY
            )
        )
    ],
    response_model=CompanyContactResponse,
)
async def update_company_contact(
    company_id: int,
    contact_data: CompanyContactRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Обновление контактной информации компании.

    Доступ: COMPANY_ADMIN+
    """
    try:
        updated_contact = await company_contact_service.update_company_contact(
            db=db,
            company_id=company_id,
            contact_data=contact_data.model_dump(exclude_unset=True),
            current_user=current_user,
        )

        return CompanyContactResponse(
            id=updated_contact.id,
            company_id=updated_contact.company_id,
            email=updated_contact.email,
            phone=updated_contact.phone,
            address=updated_contact.address,
            city=updated_contact.city,
            country=updated_contact.country,
            postal_code=updated_contact.postal_code,
            created_at=updated_contact.created_at,
            updated_at=updated_contact.updated_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update company contact: {str(e)}",
        )


# =============================================================================
# Company Branding Management
# =============================================================================


@router.get(
    "/{company_id}/branding",
    summary="Get Company Branding",
    description="Get company branding information",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_COMPANY_SETTINGS, scope=RoleScope.COMPANY
            )
        )
    ],
    response_model=CompanyBrandingResponse,
)
async def get_company_branding(
    company_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение брендинга компании.

    Доступ: COMPANY_ADMIN+
    """
    try:
        branding = await company_branding_service.get_company_branding(
            db=db, company_id=company_id, current_user=current_user
        )

        if not branding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company branding not found",
            )

        return CompanyBrandingResponse(
            id=branding.id,
            company_id=branding.company_id,
            logo_url=branding.logo_url,
            primary_color=branding.primary_color,
            secondary_color=branding.secondary_color,
            accent_color=branding.accent_color,
            font_family=branding.font_family,
            created_at=branding.created_at,
            updated_at=branding.updated_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get company branding: {str(e)}",
        )


@router.put(
    "/{company_id}/branding",
    summary="Update Company Branding",
    description="Update company branding information",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.MANAGE_COMPANY_SETTINGS, scope=RoleScope.COMPANY
            )
        )
    ],
    response_model=CompanyBrandingResponse,
)
async def update_company_branding(
    company_id: int,
    branding_data: CompanyBrandingRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Обновление брендинга компании.

    Доступ: COMPANY_ADMIN+
    """
    try:
        updated_branding = await company_branding_service.update_company_branding(
            db=db,
            company_id=company_id,
            branding_data=branding_data.model_dump(exclude_unset=True),
            current_user=current_user,
        )

        return CompanyBrandingResponse(
            id=updated_branding.id,
            company_id=updated_branding.company_id,
            logo_url=updated_branding.logo_url,
            primary_color=updated_branding.primary_color,
            secondary_color=updated_branding.secondary_color,
            accent_color=updated_branding.accent_color,
            font_family=updated_branding.font_family,
            created_at=updated_branding.created_at,
            updated_at=updated_branding.updated_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update company branding: {str(e)}",
        )

