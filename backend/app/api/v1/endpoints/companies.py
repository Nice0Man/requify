"""
API endpoints для компаний.
"""

from typing import List, Optional, Dict, Any
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Query,
)
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.crud.company import company as company_crud
from app.schemas.company import (
    CompanyCreate,
    CompanyUpdate,
    CompanyResponse,
    CompanyListResponse,
    CompanyFilter,
    CompanyStats,
    CompanyWithStats,
    CompanyTypeEnum,
    CompanyStatusEnum,
)

router = APIRouter()


@router.get("/companies/", response_model=List[CompanyListResponse])
def get_companies(
    skip: int = Query(0, ge=0, description="Количество записей для пропуска"),
    limit: int = Query(
        100, ge=1, le=1000, description="Максимальное количество записей"
    ),
    name: Optional[str] = Query(None, description="Фильтр по названию"),
    company_type: Optional[CompanyTypeEnum] = Query(None, description="Фильтр по типу"),
    status: Optional[CompanyStatusEnum] = Query(None, description="Фильтр по статусу"),
    is_active: Optional[bool] = Query(None, description="Фильтр по активности"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> List[CompanyListResponse]:
    """
    Получить список компаний с фильтрацией.

    Доступно только системным администраторам.
    """
    # Проверить права доступа
    if not current_user.is_system_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only system administrators can view all companies",
        )

    # Если есть фильтры, используем поиск
    if name or company_type or status:
        if name:
            companies_data = company_crud.search_companies(
                db,
                query=name,
                company_type=company_type.value if company_type else None,
                status=status.value if status else None,
                skip=skip,
                limit=limit,
            )
            # Конвертируем в нужный формат
            result = []
            for company in companies_data:
                company_data = CompanyListResponse(
                    id=company.id,
                    name=company.name,
                    slug=company.slug,
                    description=company.description,
                    type=CompanyTypeEnum(company.type),
                    status=CompanyStatusEnum(company.status),
                    is_active=company.is_active,
                    created_at=company.created_at,
                    current_user_count=company.current_user_count,
                    current_project_count=None,  # Вычислим отдельно если нужно
                )
                result.append(company_data)
            return result
        else:
            # Фильтрация без поиска
            if company_type:
                companies = company_crud.get_companies_by_type(
                    db, company_type=company_type.value, skip=skip, limit=limit
                )
            elif status:
                companies = company_crud.get_companies_by_status(
                    db, status=status.value, skip=skip, limit=limit
                )
            else:
                companies = company_crud.get_multi(db, skip=skip, limit=limit)
    else:
        # Получить все компании с базовой статистикой
        companies_data = company_crud.get_all_with_stats(db, skip=skip, limit=limit)
        return [CompanyListResponse(**company_data) for company_data in companies_data]

    # Обработать обычный список компаний
    result = []
    for company in companies:
        company_data = CompanyListResponse(
            id=company.id,
            name=company.name,
            slug=company.slug,
            description=company.description,
            type=CompanyTypeEnum(company.type),
            status=CompanyStatusEnum(company.status),
            is_active=company.is_active,
            created_at=company.created_at,
            current_user_count=company.current_user_count,
            current_project_count=None,  # Можно добавить вычисление
        )
        result.append(company_data)

    return result


@router.post(
    "/companies/",
    response_model=CompanyResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_company(
    *,
    company_in: CompanyCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyResponse:
    """
    Создать новую компанию.

    Доступно только системным администраторам.
    """
    # Проверить права доступа
    if not current_user.is_system_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only system administrators can create companies",
        )

    # Проверить уникальность названия
    existing_company = company_crud.get_by_name(db, name=company_in.name)
    if existing_company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company with this name already exists",
        )

    # Проверить уникальность slug если указан
    if company_in.slug:
        existing_slug = company_crud.get_by_slug(db, slug=company_in.slug)
        if existing_slug:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company with this slug already exists",
            )

    # Создать компанию с базовыми настройками
    company = company_crud.create_with_defaults(db, obj_in=company_in)

    # Загрузить связанные данные для ответа
    company_with_relations = company_crud.get_with_relationships(
        db, company_id=company.id
    )

    return CompanyResponse(**company_with_relations.__dict__)


@router.get("/companies/{company_id}", response_model=CompanyResponse)
def get_company(
    company_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyResponse:
    """
    Получить компанию по ID.

    Системные администраторы могут просматривать любые компании.
    Пользователи могут просматривать только свою компанию.
    """
    # Проверить права доступа
    if not current_user.is_system_admin and current_user.company_id != company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this company",
        )

    company = company_crud.get_with_relationships(db, company_id=company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    # Добавить вычисляемые поля
    response = CompanyResponse(**company.__dict__)
    response.current_user_count = company.current_user_count
    response.current_project_count = None  # Можно добавить вычисление
    response.current_department_count = (
        len(company.departments) if company.departments else 0
    )

    return response


@router.get("/companies/slug/{slug}", response_model=CompanyResponse)
def get_company_by_slug(
    slug: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyResponse:
    """
    Получить компанию по slug.

    Публичный endpoint для получения основной информации о компании.
    """
    company = company_crud.get_by_slug(db, slug=slug)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    # Проверить права доступа (можно ослабить для публичного доступа)
    if not current_user.is_system_admin and current_user.company_id != company.id:
        # Возвращаем только базовую публичную информацию
        return CompanyResponse(
            id=company.id,
            name=company.name,
            slug=company.slug,
            description=company.description,
            type=CompanyTypeEnum(company.type),
            industry=company.industry,
            status=CompanyStatusEnum(company.status),
            is_active=company.is_active,
            created_at=company.created_at,
            updated_at=company.updated_at,
        )

    # Полный доступ для администраторов и сотрудников компании
    company_with_relations = company_crud.get_with_relationships(
        db, company_id=company.id
    )
    return CompanyResponse(**company_with_relations.__dict__)


@router.put("/companies/{company_id}", response_model=CompanyResponse)
def update_company(
    *,
    company_id: int,
    company_in: CompanyUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyResponse:
    """
    Обновить компанию.

    Системные администраторы могут обновлять любые компании.
    Администраторы компании могут обновлять только свою компанию.
    """
    # Проверить права доступа
    if not current_user.is_system_admin:
        if current_user.company_id != company_id or not current_user.is_company_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to update this company",
            )

    company = company_crud.get(db, id=company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    # Проверить уникальность названия при изменении
    if company_in.name and company_in.name != company.name:
        existing_company = company_crud.get_by_name(db, name=company_in.name)
        if existing_company:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company with this name already exists",
            )

    # Проверить уникальность slug при изменении
    if company_in.slug and company_in.slug != company.slug:
        if not company_crud.is_slug_available(
            db, slug=company_in.slug, exclude_id=company_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company with this slug already exists",
            )

    # Обновить компанию
    company = company_crud.update(db, db_obj=company, obj_in=company_in)

    # Загрузить связанные данные
    company_with_relations = company_crud.get_with_relationships(
        db, company_id=company.id
    )

    return CompanyResponse(**company_with_relations.__dict__)


@router.delete("/companies/{company_id}")
def delete_company(
    company_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, str]:
    """
    Удалить компанию.

    Доступно только системным администраторам.
    """
    # Проверить права доступа
    if not current_user.is_system_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only system administrators can delete companies",
        )

    company = company_crud.get(db, id=company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    # Удалить компанию (каскадное удаление настроено в моделях)
    company_crud.remove(db, id=company_id)

    return {"message": "Company deleted successfully"}


@router.get("/companies/{company_id}/stats", response_model=CompanyStats)
def get_company_stats(
    company_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyStats:
    """
    Получить детальную статистику компании.

    Доступно администраторам компании и системным администраторам.
    """
    # Проверить права доступа
    if not current_user.is_system_admin:
        if current_user.company_id != company_id or not current_user.is_company_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to company statistics",
            )

    company = company_crud.get(db, id=company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    stats_data = company_crud.get_company_stats(db, company_id=company_id)
    return CompanyStats(**stats_data)


@router.post("/companies/{company_id}/activate", response_model=CompanyResponse)
def activate_company(
    company_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyResponse:
    """
    Активировать компанию.

    Доступно только системным администраторам.
    """
    # Проверить права доступа
    if not current_user.is_system_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only system administrators can activate companies",
        )

    company = company_crud.activate(db, company_id=company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    return CompanyResponse(**company.__dict__)


@router.post("/companies/{company_id}/deactivate", response_model=CompanyResponse)
def deactivate_company(
    company_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyResponse:
    """
    Деактивировать компанию.

    Доступно только системным администраторам.
    """
    # Проверить права доступа
    if not current_user.is_system_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only system administrators can deactivate companies",
        )

    company = company_crud.deactivate(db, company_id=company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    return CompanyResponse(**company.__dict__)


@router.post("/companies/{company_id}/suspend", response_model=CompanyResponse)
def suspend_company(
    company_id: int,
    reason: Optional[str] = Query(None, description="Причина приостановки"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyResponse:
    """
    Приостановить компанию.

    Доступно только системным администраторам.
    """
    # Проверить права доступа
    if not current_user.is_system_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only system administrators can suspend companies",
        )

    company = company_crud.suspend(db, company_id=company_id, reason=reason)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    return CompanyResponse(**company.__dict__)


@router.put("/companies/{company_id}/status", response_model=CompanyResponse)
def update_company_status(
    company_id: int,
    new_status: CompanyStatusEnum,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyResponse:
    """
    Обновить статус компании.

    Доступно только системным администраторам.
    """
    # Проверить права доступа
    if not current_user.is_system_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only system administrators can update company status",
        )

    company = company_crud.update_company_status(
        db, company_id=company_id, status=new_status.value
    )
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    return CompanyResponse(**company.__dict__)


@router.get("/companies/search", response_model=List[CompanyListResponse])
def search_companies(
    q: str = Query(..., min_length=2, description="Поисковый запрос"),
    company_type: Optional[CompanyTypeEnum] = Query(None, description="Фильтр по типу"),
    status: Optional[CompanyStatusEnum] = Query(None, description="Фильтр по статусу"),
    skip: int = Query(0, ge=0, description="Количество записей для пропуска"),
    limit: int = Query(50, ge=1, le=100, description="Максимальное количество записей"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> List[CompanyListResponse]:
    """
    Поиск компаний.

    Доступно только системным администраторам.
    """
    # Проверить права доступа
    if not current_user.is_system_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only system administrators can search companies",
        )

    companies = company_crud.search_companies(
        db,
        query=q,
        company_type=company_type.value if company_type else None,
        status=status.value if status else None,
        skip=skip,
        limit=limit,
    )

    result = []
    for company in companies:
        company_data = CompanyListResponse(
            id=company.id,
            name=company.name,
            slug=company.slug,
            description=company.description,
            type=CompanyTypeEnum(company.type),
            status=CompanyStatusEnum(company.status),
            is_active=company.is_active,
            created_at=company.created_at,
            current_user_count=company.current_user_count,
            current_project_count=None,  # Можно добавить вычисление
        )
        result.append(company_data)

    return result


@router.get("/companies/statistics", response_model=Dict[str, Any])
def get_companies_statistics(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Получить общую статистику компаний.

    Доступно только системным администраторам.
    """
    # Проверить права доступа
    if not current_user.is_system_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only system administrators can view companies statistics",
        )

    return company_crud.get_companies_statistics(db)


# Utility Endpoints


@router.get("/companies/types", response_model=List[str])
def get_company_types() -> List[str]:
    """
    Получить доступные типы компаний.
    """
    return [company_type.value for company_type in CompanyTypeEnum]


@router.get("/companies/statuses", response_model=List[str])
def get_company_statuses() -> List[str]:
    """
    Получить доступные статусы компаний.
    """
    return [status.value for status in CompanyStatusEnum]


@router.get("/companies/{company_id}/slug-check")
def check_slug_availability(
    company_id: int,
    slug: str = Query(..., description="Slug для проверки"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, bool]:
    """
    Проверить доступность slug для компании.

    Доступно администраторам компании и системным администраторам.
    """
    # Проверить права доступа
    if not current_user.is_system_admin:
        if current_user.company_id != company_id or not current_user.is_company_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    is_available = company_crud.is_slug_available(db, slug=slug, exclude_id=company_id)

    return {"available": is_available}
