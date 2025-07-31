"""
API endpoints для брендинга компании.
"""

from typing import List, Optional, Dict, Any
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Query,
    Response,
    UploadFile,
    File,
)
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.services.company_branding_service import company_branding_service
from app.schemas.company_branding import (
    CompanyBrandingCreate,
    CompanyBrandingUpdate,
    CompanyBrandingResponse,
    CompanyBrandingProfile,
    ColorPalette,
    TypographyConfig,
    ComponentStyles,
    LayoutConfig,
    SocialLinks,
    ThemePreset,
    BrandingValidation,
    AssetUpload,
    BrandingExport,
    ThemeName,
    LayoutType,
)

router = APIRouter()


@router.get("/company/{company_id}/branding", response_model=CompanyBrandingResponse)
def get_company_branding(
    company_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyBrandingResponse:
    """
    Получить брендинг компании.
    """
    branding = company_branding_service.get_company_branding(
        db=db, company_id=company_id, current_user=current_user
    )

    if not branding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Company branding not found"
        )

    response = CompanyBrandingResponse(**branding.__dict__)

    # Добавить вычисляемые поля
    response.color_palette = branding.get_color_palette()
    response.typography_config = branding.get_typography_config()
    response.component_styles = branding.get_component_styles()
    response.layout_config = branding.get_layout_config()
    response.css_variables = branding.generate_css_variables()

    return response


@router.get(
    "/company/{company_id}/branding/active", response_model=CompanyBrandingResponse
)
def get_active_branding(
    company_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyBrandingResponse:
    """
    Получить активный брендинг компании.
    """
    branding = company_branding_service.get_active_branding(
        db=db, company_id=company_id, current_user=current_user
    )

    if not branding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active branding found for company",
        )

    response = CompanyBrandingResponse(**branding.__dict__)

    # Добавить вычисляемые поля
    response.color_palette = branding.get_color_palette()
    response.typography_config = branding.get_typography_config()
    response.component_styles = branding.get_component_styles()
    response.layout_config = branding.get_layout_config()
    response.css_variables = branding.generate_css_variables()

    return response


@router.post(
    "/company/{company_id}/branding",
    response_model=CompanyBrandingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_or_update_company_branding(
    *,
    company_id: int,
    branding_in: CompanyBrandingCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyBrandingResponse:
    """
    Создать или обновить брендинг компании.

    Требует права на управление брендингом компании.
    """
    branding = company_branding_service.create_or_update_branding(
        db=db,
        company_id=company_id,
        branding_data=branding_in,
        current_user=current_user,
    )

    return CompanyBrandingResponse(**branding.__dict__)


@router.put("/company/{company_id}/branding", response_model=CompanyBrandingResponse)
def update_company_branding(
    *,
    company_id: int,
    branding_in: CompanyBrandingUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyBrandingResponse:
    """
    Обновить брендинг компании.

    Требует права на управление брендингом компании.
    """
    branding = company_branding_service.update_branding(
        db=db,
        company_id=company_id,
        branding_data=branding_in,
        current_user=current_user,
    )

    return CompanyBrandingResponse(**branding.__dict__)


@router.get(
    "/company/{company_id}/branding/profile", response_model=CompanyBrandingProfile
)
def get_company_branding_profile(
    company_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyBrandingProfile:
    """
    Получить упрощенный профиль брендинга компании.

    Возвращает только основные настройки без чувствительных данных.
    """
    branding = company_branding_service.get_company_branding(
        db=db, company_id=company_id, current_user=current_user
    )

    if not branding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Company branding not found"
        )

    return CompanyBrandingProfile(
        logo_url=branding.logo_url,
        primary_color=branding.primary_color,
        secondary_color=branding.secondary_color,
        theme_name=ThemeName(branding.theme_name),
        is_dark_theme=branding.is_dark_theme,
        company_slogan=branding.company_slogan,
        product_name=branding.product_name,
        is_active=branding.is_active,
    )


# Color Palette Endpoints


@router.get("/company/{company_id}/branding/colors", response_model=ColorPalette)
def get_color_palette(
    company_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> ColorPalette:
    """
    Получить цветовую палитру компании.
    """
    branding = company_branding_service.get_company_branding(
        db=db, company_id=company_id, current_user=current_user
    )

    if not branding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Company branding not found"
        )

    color_palette = branding.get_color_palette()
    return ColorPalette(**color_palette)


@router.put(
    "/company/{company_id}/branding/colors", response_model=CompanyBrandingResponse
)
def update_color_palette(
    *,
    company_id: int,
    colors: ColorPalette,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyBrandingResponse:
    """
    Обновить цветовую палитру компании.

    Требует права на управление брендингом компании.
    """
    branding = company_branding_service.update_color_palette(
        db=db, company_id=company_id, colors=colors, current_user=current_user
    )

    return CompanyBrandingResponse(**branding.__dict__)


# Typography Endpoints


@router.get(
    "/company/{company_id}/branding/typography", response_model=TypographyConfig
)
def get_typography(
    company_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> TypographyConfig:
    """
    Получить конфигурацию типографики компании.
    """
    branding = company_branding_service.get_company_branding(
        db=db, company_id=company_id, current_user=current_user
    )

    if not branding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Company branding not found"
        )

    typography_config = branding.get_typography_config()
    return TypographyConfig(**typography_config)


@router.put(
    "/company/{company_id}/branding/typography", response_model=CompanyBrandingResponse
)
def update_typography(
    *,
    company_id: int,
    typography: TypographyConfig,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyBrandingResponse:
    """
    Обновить типографику компании.

    Требует права на управление брендингом компании.
    """
    branding = company_branding_service.update_typography(
        db=db, company_id=company_id, typography=typography, current_user=current_user
    )

    return CompanyBrandingResponse(**branding.__dict__)


# Component Styles Endpoints


@router.get("/company/{company_id}/branding/components", response_model=ComponentStyles)
def get_component_styles(
    company_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> ComponentStyles:
    """
    Получить стили UI компонентов компании.
    """
    branding = company_branding_service.get_company_branding(
        db=db, company_id=company_id, current_user=current_user
    )

    if not branding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Company branding not found"
        )

    component_styles = branding.get_component_styles()
    return ComponentStyles(**component_styles)


@router.put(
    "/company/{company_id}/branding/components", response_model=CompanyBrandingResponse
)
def update_component_styles(
    *,
    company_id: int,
    styles: ComponentStyles,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyBrandingResponse:
    """
    Обновить стили UI компонентов компании.

    Требует права на управление брендингом компании.
    """
    branding = company_branding_service.update_component_styles(
        db=db, company_id=company_id, styles=styles, current_user=current_user
    )

    return CompanyBrandingResponse(**branding.__dict__)


# Social Links Endpoints


@router.get("/company/{company_id}/branding/social", response_model=SocialLinks)
def get_social_links(
    company_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> SocialLinks:
    """
    Получить ссылки на социальные сети компании.
    """
    branding = company_branding_service.get_company_branding(
        db=db, company_id=company_id, current_user=current_user
    )

    if not branding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Company branding not found"
        )

    social_links = branding.get_social_links()
    return SocialLinks(**social_links)


@router.put(
    "/company/{company_id}/branding/social", response_model=CompanyBrandingResponse
)
def update_social_links(
    *,
    company_id: int,
    social_links: SocialLinks,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyBrandingResponse:
    """
    Обновить ссылки на социальные сети компании.

    Требует права на управление брендингом компании.
    """
    branding = company_branding_service.update_social_links(
        db=db,
        company_id=company_id,
        social_links=social_links,
        current_user=current_user,
    )

    return CompanyBrandingResponse(**branding.__dict__)


# Theme Presets


@router.get("/branding/presets", response_model=List[ThemePreset])
def get_available_presets() -> List[ThemePreset]:
    """
    Получить доступные предустановленные темы.
    """
    return company_branding_service.get_available_presets()


@router.post(
    "/company/{company_id}/branding/preset/{preset_name}",
    response_model=CompanyBrandingResponse,
)
def apply_preset_theme(
    company_id: int,
    preset_name: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyBrandingResponse:
    """
    Применить предустановленную тему.

    Требует права на управление брендингом компании.
    """
    branding = company_branding_service.apply_preset_theme(
        db=db, company_id=company_id, preset_name=preset_name, current_user=current_user
    )

    return CompanyBrandingResponse(**branding.__dict__)


# CSS Generation


@router.get("/company/{company_id}/branding/css", response_class=Response)
def generate_css(
    company_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Response:
    """
    Сгенерировать CSS переменные для компании.
    """
    css = company_branding_service.generate_css(
        db=db, company_id=company_id, current_user=current_user
    )

    return Response(content=css, media_type="text/css")


# Validation


@router.post(
    "/company/{company_id}/branding/validate", response_model=BrandingValidation
)
def validate_branding(
    *,
    company_id: int,
    branding_in: CompanyBrandingCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> BrandingValidation:
    """
    Валидировать брендинг компании без сохранения.

    Проверяет корректность настроек и возвращает рекомендации.
    """
    # Проверить права доступа
    if not company_branding_service._can_access_company(current_user, company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
        )

    return company_branding_service._validate_branding(branding_in)


@router.get("/company/{company_id}/branding/validation", response_model=Dict[str, Any])
def get_branding_validation(
    company_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Получить результаты валидации текущего брендинга компании.
    """
    return company_branding_service.validate_branding(
        db=db, company_id=company_id, current_user=current_user
    )


# Branding Management


@router.post(
    "/company/{company_id}/branding/{branding_id}/activate",
    response_model=CompanyBrandingResponse,
)
def activate_branding(
    company_id: int,
    branding_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyBrandingResponse:
    """
    Активировать брендинг.

    Требует права на управление брендингом компании.
    """
    branding = company_branding_service.activate_branding(
        db=db, company_id=company_id, branding_id=branding_id, current_user=current_user
    )

    return CompanyBrandingResponse(**branding.__dict__)


@router.post(
    "/company/{company_id}/branding/deactivate", response_model=Dict[str, bool]
)
def deactivate_branding(
    company_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, bool]:
    """
    Деактивировать все схемы брендинга компании.

    Требует права на управление брендингом компании.
    """
    success = company_branding_service.deactivate_branding(
        db=db, company_id=company_id, current_user=current_user
    )

    return {"success": success}


# Cloning


@router.post(
    "/company/{target_company_id}/branding/clone/{source_company_id}",
    response_model=CompanyBrandingResponse,
)
def clone_branding(
    target_company_id: int,
    source_company_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyBrandingResponse:
    """
    Клонировать брендинг от одной компании к другой.

    Требует права на управление брендингом целевой компании
    и права доступа к исходной компании.
    """
    branding = company_branding_service.clone_branding(
        db=db,
        source_company_id=source_company_id,
        target_company_id=target_company_id,
        current_user=current_user,
    )

    return CompanyBrandingResponse(**branding.__dict__)


# Similar Themes


@router.get(
    "/company/{company_id}/branding/similar",
    response_model=List[CompanyBrandingProfile],
)
def get_similar_themes(
    company_id: int,
    limit: int = Query(
        5, ge=1, le=20, description="Максимальное количество похожих тем"
    ),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> List[CompanyBrandingProfile]:
    """
    Получить похожие темы для вдохновения.
    """
    similar_brandings = company_branding_service.get_similar_themes(
        db=db, company_id=company_id, current_user=current_user, limit=limit
    )

    return [
        CompanyBrandingProfile(
            logo_url=branding.logo_url,
            primary_color=branding.primary_color,
            secondary_color=branding.secondary_color,
            theme_name=ThemeName(branding.theme_name),
            is_dark_theme=branding.is_dark_theme,
            company_slogan=branding.company_slogan,
            product_name=branding.product_name,
            is_active=branding.is_active,
        )
        for branding in similar_brandings
    ]


# Backup and Restore


@router.post("/company/{company_id}/branding/backup", response_model=Dict[str, Any])
def backup_branding(
    company_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Создать резервную копию брендинга компании.

    Требует права на управление брендингом компании.
    """
    return company_branding_service.backup_branding(
        db=db, company_id=company_id, current_user=current_user
    )


@router.post(
    "/company/{company_id}/branding/restore", response_model=CompanyBrandingResponse
)
def restore_branding(
    *,
    company_id: int,
    backup_data: Dict[str, Any],
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> CompanyBrandingResponse:
    """
    Восстановить брендинг компании из резервной копии.

    Требует права на управление брендингом компании.
    """
    branding = company_branding_service.restore_branding(
        db=db, company_id=company_id, backup_data=backup_data, current_user=current_user
    )

    return CompanyBrandingResponse(**branding.__dict__)


# Export


@router.get("/company/{company_id}/branding/export/{format}", response_class=Response)
def export_branding(
    company_id: int,
    format: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Response:
    """
    Экспортировать брендинг в различных форматах.

    Поддерживаемые форматы: css, json
    """
    content = company_branding_service.export_branding(
        db=db, company_id=company_id, export_format=format, current_user=current_user
    )

    media_type = "text/css" if format == "css" else "application/json"
    filename = f"branding-{company_id}.{format}"

    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


# Administrative Endpoints


@router.get("/branding/statistics", response_model=Dict[str, Any])
def get_branding_statistics(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Получить статистику брендинга компаний.

    Доступно только системным администраторам.
    """
    return company_branding_service.get_branding_statistics(
        db=db, current_user=current_user
    )


@router.get("/branding/themes", response_model=List[str])
def get_available_themes() -> List[str]:
    """
    Получить список доступных тем.
    """
    return [theme.value for theme in ThemeName]


@router.get("/branding/layouts", response_model=List[str])
def get_available_layouts() -> List[str]:
    """
    Получить доступные типы макета.
    """
    return [layout.value for layout in LayoutType]
