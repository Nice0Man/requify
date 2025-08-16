"""
Quality Specifications Router.

Handles all specification-related operations including CRUD operations,
document generation, and requirements coverage analysis.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.api.dependencies import (
    SessionDep,
    CurrentActiveUserDep,
    PermissionChecker,
)
from app.models import User
from app.core.constants import Permission, RoleScope
from app.services.specification_management_service import (
    specification_management_service,
)
from .schemas import (
    SpecificationCreateRequest,
    SpecificationUpdateRequest,
    SpecificationResponse,
    SpecificationDetailResponse,
    SpecificationListResponse,
    SpecificationOperationResponse,
    DocumentGenerationRequest,
    DocumentGenerationResponse,
)

# Initialize permission checker
permission_checker = PermissionChecker()

router = APIRouter()

# =============================================================================
# Specifications Management
# =============================================================================


@router.get(
    "/",
    summary="Get Specifications",
    description="Get paginated list of specifications",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_SPECIFICATION, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=SpecificationListResponse,
)
async def get_specifications(
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    project_id: Optional[int] = Query(None, description="Filter by project"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search query"),
):
    """
    Получение списка спецификаций.

    Доступ: PROJECT_VIEWER+
    """
    try:
        result = await specification_management_service.get_specifications_list(
            db=db,
            skip=skip,
            limit=limit,
            project_id=project_id,
            status=status,
            search=search,
            current_user=current_user,
        )

        specifications = [
            SpecificationResponse(
                id=spec.id,
                title=spec.title,
                description=spec.description,
                project_id=spec.project_id,
                status=spec.status,
                version=spec.version,
                created_at=spec.created_at,
                updated_at=spec.updated_at,
            )
            for spec in result
        ]

        total = len(result)
        pages = (total + limit - 1) // limit

        return SpecificationListResponse(
            specifications=specifications,
            total=total,
            page=(skip // limit) + 1,
            size=limit,
            pages=pages,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get specifications: {str(e)}",
        )


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Create Specification",
    description="Create new specification",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.MANAGE_SPECIFICATION, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=SpecificationDetailResponse,
)
async def create_specification(
    spec_data: SpecificationCreateRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Создание новой спецификации.

    Доступ: ANALYST+
    """
    try:
        new_spec = await specification_management_service.create_specification(
            db=db,
            title=spec_data.title,
            description=spec_data.description,
            project_id=spec_data.project_id,
            content=spec_data.content,
            template_id=spec_data.template_id,
            created_by=current_user.id,
        )

        return SpecificationDetailResponse(
            id=new_spec.id,
            title=new_spec.title,
            description=new_spec.description,
            project_id=new_spec.project_id,
            status=new_spec.status,
            version=new_spec.version,
            content=new_spec.content,
            created_at=new_spec.created_at,
            updated_at=new_spec.updated_at,
            created_by=new_spec.created_by,
            requirements_count=0,
            coverage_percentage=0.0,
            last_generated_at=None,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create specification: {str(e)}",
        )


@router.get(
    "/{spec_id}",
    summary="Get Specification",
    description="Get specification by ID",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_SPECIFICATION, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=SpecificationDetailResponse,
)
async def get_specification(
    spec_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение спецификации по ID.

    Доступ: PROJECT_VIEWER+
    """
    try:
        spec = await specification_management_service.get_specification_by_id(
            db=db, spec_id=spec_id, current_user=current_user
        )
        if not spec:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Specification not found",
            )

        # Get statistics
        stats = await specification_management_service.get_specification_statistics(
            db=db, spec_id=spec_id
        )

        return SpecificationDetailResponse(
            id=spec.id,
            title=spec.title,
            description=spec.description,
            project_id=spec.project_id,
            status=spec.status,
            version=spec.version,
            content=spec.content,
            created_at=spec.created_at,
            updated_at=spec.updated_at,
            created_by=spec.created_by,
            requirements_count=stats.get("requirements_count", 0),
            coverage_percentage=stats.get("coverage_percentage", 0.0),
            last_generated_at=stats.get("last_generated_at"),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get specification: {str(e)}",
        )


@router.put(
    "/{spec_id}",
    summary="Update Specification",
    description="Update specification",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.MANAGE_SPECIFICATION, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=SpecificationDetailResponse,
)
async def update_specification(
    spec_id: int,
    spec_data: SpecificationUpdateRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Обновление спецификации.

    Доступ: ANALYST+
    """
    try:
        updated_spec = await specification_management_service.update_specification(
            db=db,
            spec_id=spec_id,
            spec_data=spec_data.model_dump(exclude_unset=True),
            current_user=current_user,
        )

        if not updated_spec:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Specification not found",
            )

        # Get statistics
        stats = await specification_management_service.get_specification_statistics(
            db=db, spec_id=spec_id
        )

        return SpecificationDetailResponse(
            id=updated_spec.id,
            title=updated_spec.title,
            description=updated_spec.description,
            project_id=updated_spec.project_id,
            status=updated_spec.status,
            version=updated_spec.version,
            content=updated_spec.content,
            created_at=updated_spec.created_at,
            updated_at=updated_spec.updated_at,
            created_by=updated_spec.created_by,
            requirements_count=stats.get("requirements_count", 0),
            coverage_percentage=stats.get("coverage_percentage", 0.0),
            last_generated_at=stats.get("last_generated_at"),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update specification: {str(e)}",
        )


@router.delete(
    "/{spec_id}",
    summary="Delete Specification",
    description="Delete specification",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.MANAGE_SPECIFICATION, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=SpecificationOperationResponse,
)
async def delete_specification(
    spec_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Удаление спецификации.

    Доступ: ANALYST+
    """
    try:
        success = await specification_management_service.delete_specification(
            db=db, spec_id=spec_id, deleted_by=current_user.id
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Specification not found",
            )

        return SpecificationOperationResponse(
            success=True,
            message="Specification deleted successfully",
            specification_id=spec_id,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete specification: {str(e)}",
        )


# =============================================================================
# Specification Requirements Management
# =============================================================================


@router.get(
    "/{spec_id}/requirements",
    summary="Get Specification Requirements",
    description="Get requirements covered by specification",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_SPECIFICATION, scope=RoleScope.PROJECT
            )
        )
    ],
)
async def get_specification_requirements(
    spec_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
):
    """
    Получение требований, покрытых спецификацией.

    Доступ: PROJECT_VIEWER+
    """
    try:
        requirements = (
            await specification_management_service.get_specification_requirements(
                db=db,
                spec_id=spec_id,
                skip=skip,
                limit=limit,
                current_user=current_user,
            )
        )

        return requirements
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get specification requirements: {str(e)}",
        )


# =============================================================================
# Document Generation
# =============================================================================


@router.post(
    "/{spec_id}/generate-document",
    summary="Generate Specification Document",
    description="Generate document from specification",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.GENERATE_DOCUMENTATION, scope=RoleScope.PROJECT
            )
        )
    ],
    response_model=DocumentGenerationResponse,
)
async def generate_specification_document(
    spec_id: int,
    generation_data: DocumentGenerationRequest,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Генерация документа из спецификации.

    Доступ: ANALYST+
    """
    try:
        result = await specification_management_service.generate_specification_document(
            db=db,
            spec_id=spec_id,
            format=generation_data.format,
            template_id=generation_data.template_id,
            include_requirements=generation_data.include_requirements,
            include_test_cases=generation_data.include_test_cases,
            generated_by=current_user.id,
        )

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Specification not found",
            )

        return DocumentGenerationResponse(
            success=True,
            document_id=result["document_id"],
            download_url=result["download_url"],
            format=generation_data.format,
            file_size_bytes=result.get("file_size_bytes", 0),
            pages_count=result.get("pages_count", 0),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to generate document: {str(e)}",
        )


@router.get(
    "/{spec_id}/download/{format}",
    summary="Download Specification",
    description="Download specification in specified format",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_SPECIFICATION, scope=RoleScope.PROJECT
            )
        )
    ],
)
async def download_specification(
    spec_id: int,
    format: str,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Скачивание спецификации в указанном формате.

    Доступ: PROJECT_VIEWER+
    """
    try:
        download_info = (
            await specification_management_service.prepare_specification_download(
                db=db,
                spec_id=spec_id,
                format=format,
                current_user=current_user,
            )
        )

        if not download_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Specification not found",
            )

        return download_info
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to prepare download: {str(e)}",
        )


# =============================================================================
# Specification Coverage Analysis
# =============================================================================


@router.get(
    "/{spec_id}/coverage",
    summary="Get Specification Coverage",
    description="Get requirements coverage analysis",
    dependencies=[
        Depends(
            permission_checker.require_permission(
                Permission.VIEW_SPECIFICATION, scope=RoleScope.PROJECT
            )
        )
    ],
)
async def get_specification_coverage(
    spec_id: int,
    db: SessionDep,
    current_user: CurrentActiveUserDep,
):
    """
    Получение анализа покрытия требований спецификацией.

    Доступ: PROJECT_VIEWER+
    """
    try:
        coverage = (
            await specification_management_service.analyze_specification_coverage(
                db=db, spec_id=spec_id, current_user=current_user
            )
        )

        if not coverage:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Specification not found",
            )

        return coverage
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to analyze coverage: {str(e)}",
        )
