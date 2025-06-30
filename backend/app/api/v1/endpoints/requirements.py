"""
API endpoints for working with requirements.

Includes CRUD operations for requirements and their state management.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_db,
    get_requirements_read_user,
    get_requirements_write_user,
    get_requirements_delete_user,
)
from app.core.config import settings
from app import crud, schemas
from app.models.user import User

router = APIRouter()


@router.get("/search", response_model=List[schemas.Requirement])
async def search_requirements(
    query: str = Query(..., description="Search query"),
    project_id: Optional[int] = Query(None, description="Filter by project ID"),
    status_id: Optional[int] = Query(None, description="Filter by status ID"),
    priority_id: Optional[int] = Query(None, description="Filter by priority ID"),
    type_id: Optional[int] = Query(None, description="Filter by type ID"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        100, le=1000, description="Maximum number of returned records"
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_read_user),
):
    """
    Search requirements by various criteria.

    Function 6 from requirements: Search requirement.
    Any employee with access rights to requirements of this project.

    Args:
        query: Search query (searches in title and description)
        project_id: Filter by project ID
        status_id: Filter by status ID
        priority_id: Filter by priority ID
        type_id: Filter by type ID
        skip: Number of records to skip
        limit: Maximum number of returned records
        db: Database session
        current_user: Current user

    Returns:
        List[schemas.Requirement]: Filtered list of requirements
    """
    filters = {}
    if project_id:
        filters["project_id"] = project_id
    if status_id:
        filters["status_id"] = status_id
    if priority_id:
        filters["priority_id"] = priority_id
    if type_id:
        filters["type_id"] = type_id

    requirements = await crud.requirement.search_requirements(
        db, search_term=query, skip=skip, limit=limit, **filters
    )
    return requirements


@router.get("/", response_model=List[schemas.Requirement])
async def get_requirements(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    project_id: Optional[int] = Query(None, description="Filter by project ID"),
    status_id: Optional[int] = Query(None, description="Filter by status ID"),
    priority_id: Optional[int] = Query(None, description="Filter by priority ID"),
    type_id: Optional[int] = Query(None, description="Filter by type ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_read_user),
):
    """
    Get list of requirements with filtering.

    Args:
        skip: Number of records to skip
        limit: Maximum number of returned records
        project_id: Filter by project ID
        status_id: Filter by status ID
        priority_id: Filter by priority ID
        type_id: Filter by type ID
        db: Database session
        current_user: Current user

    Returns:
        List[schemas.Requirement]: List of requirements
    """
    filters = {}
    if status_id:
        filters["status_id"] = status_id
    if priority_id:
        filters["priority_id"] = priority_id
    if type_id:
        filters["type_id"] = type_id

    if project_id:
        requirements = await crud.requirement.get_by_project(
            db, project_id=project_id, skip=skip, limit=limit, **filters
        )
    else:
        requirements = await crud.requirement.get_multi_with_filters(
            db, skip=skip, limit=limit, **filters
        )

    return requirements


@router.post(
    "/", response_model=schemas.Requirement, status_code=status.HTTP_201_CREATED
)
async def create_requirement(
    requirement_in: schemas.RequirementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_write_user),
):
    """
    Create a new requirement.

    Args:
        requirement_in: Data for the requirement being created
        db: Database session
        current_user: Current user

    Returns:
        schemas.Requirement: Created requirement

    Raises:
        HTTPException: If project is not found or reference data is incorrect
    """
    # Check project existence
    project = await crud.project.get(db, id=requirement_in.project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    # Check existence of type, priority and status
    if requirement_in.type_id:
        req_type = await crud.requirement_type.get(db, id=requirement_in.type_id)
        if not req_type:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Requirement type not found"
            )

    if requirement_in.priority_id:
        priority = await crud.requirement_priority.get(
            db, id=requirement_in.priority_id
        )
        if not priority:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Requirement priority not found",
            )

    if requirement_in.status_id:
        status_obj = await crud.requirement_status.get(db, id=requirement_in.status_id)
        if not status_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Requirement status not found",
            )

    # Check release existence (if specified)
    if hasattr(requirement_in, 'release_id') and requirement_in.release_id:
        release = await crud.release.get(db, id=requirement_in.release_id)
        if not release:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Release not found",
            )

    # Check specification existence (if specified)
    if hasattr(requirement_in, 'spec_id') and requirement_in.spec_id:
        spec = await crud.spec.get(db, id=requirement_in.spec_id)
        if not spec:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Specification not found",
            )

    # Create requirement with author_id
    requirement = await crud.requirement.create(
        db, obj_in=requirement_in, author_id=current_user.id
    )
    return requirement


@router.get("/{requirement_id}", response_model=schemas.RequirementWithDetails)
async def get_requirement(
    requirement_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_read_user),
):
    """
    Get requirement by ID with detailed information.

    Args:
        requirement_id: Requirement ID
        db: Database session
        current_user: Current user

    Returns:
        schemas.RequirementWithDetails: Requirement with additional information

    Raises:
        HTTPException: If requirement is not found
    """
    requirement = await crud.requirement.get_with_details(
        db, id=requirement_id
    )
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found"
        )
    return requirement


@router.put("/{requirement_id}", response_model=schemas.Requirement)
async def update_requirement(
    requirement_id: int,
    requirement_in: schemas.RequirementUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_write_user),
):
    """
    Update requirement data.

    Args:
        requirement_id: Requirement ID
        requirement_in: Updated requirement data
        db: Database session
        current_user: Current user

    Returns:
        schemas.Requirement: Updated requirement

    Raises:
        HTTPException: If requirement is not found or data is incorrect
    """
    requirement = await crud.requirement.get(db, id=requirement_id)
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found"
        )

    # Check existence of related entities if they have changed
    if requirement_in.type_id and requirement_in.type_id != requirement.type_id:
        req_type = await crud.requirement_type.get(db, id=requirement_in.type_id)
        if not req_type:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Requirement type not found"
            )

    if (
        requirement_in.priority_id
        and requirement_in.priority_id != requirement.priority_id
    ):
        priority = await crud.requirement_priority.get(
            db, id=requirement_in.priority_id
        )
        if not priority:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Requirement priority not found",
            )

    if requirement_in.status_id and requirement_in.status_id != requirement.status_id:
        status_obj = await crud.requirement_status.get(db, id=requirement_in.status_id)
        if not status_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Requirement status not found",
            )

    # Check release existence (if specified and changed)
    if (hasattr(requirement_in, 'release_id') and 
        requirement_in.release_id and 
        requirement_in.release_id != requirement.release_id):
        release = await crud.release.get(db, id=requirement_in.release_id)
        if not release:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Release not found",
            )

    # Check specification existence (if specified and changed)  
    if (hasattr(requirement_in, 'spec_id') and 
        requirement_in.spec_id and 
        requirement_in.spec_id != requirement.spec_id):
        spec = await crud.spec.get(db, id=requirement_in.spec_id)
        if not spec:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Specification not found",
            )

    requirement = await crud.requirement.update(
        db, db_obj=requirement, obj_in=requirement_in
    )
    return requirement


@router.delete("/{requirement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_requirement(
    requirement_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_delete_user),
):
    """
    Delete requirement.

    Args:
        requirement_id: Requirement ID
        db: Database session
        current_user: Current user

    Raises:
        HTTPException: If requirement is not found
    """
    requirement = await crud.requirement.get(db, id=requirement_id)
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found"
        )

    await crud.requirement.remove(db, id=requirement_id)


@router.post("/{requirement_id}/change-status", response_model=schemas.Requirement)
async def change_requirement_status(
    requirement_id: int,
    status_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_write_user),
):
    """
    Change requirement status.

    Args:
        requirement_id: Requirement ID
        status_id: New status ID
        db: Database session
        current_user: Current user

    Returns:
        schemas.Requirement: Updated requirement

    Raises:
        HTTPException: If requirement or status are not found
    """
    requirement = await crud.requirement.get(db, id=requirement_id)
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found"
        )

    # Check status existence
    status_obj = await crud.requirement_status.get(db, id=status_id)
    if not status_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requirement status not found",
        )

    # Update status
    requirement = await crud.requirement.update(
        db, db_obj=requirement, obj_in={"status_id": status_id}
    )
    return requirement


@router.get("/{requirement_id}/tests", response_model=List[schemas.TestResult])
async def get_requirement_tests(
    requirement_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_read_user),
):
    """
    Get requirement testing results.

    Args:
        requirement_id: Requirement ID
        skip: Number of records to skip
        limit: Maximum number of returned records
        db: Database session
        current_user: Current user

    Returns:
        List[schemas.TestResult]: List of test results

    Raises:
        HTTPException: If requirement is not found
    """
    requirement = await crud.requirement.get(db, id=requirement_id)
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found"
        )

    test_results = await crud.test_result.get_by_requirement(
        db, requirement_id=requirement_id, skip=skip, limit=limit
    )
    return test_results


@router.get(
    "/{requirement_id}/relationships", response_model=List[schemas.Relationship]
)
async def get_requirement_relationships(
    requirement_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_read_user),
):
    """
    Get requirement relationships with other requirements.

    Args:
        requirement_id: Requirement ID
        db: Database session
        current_user: Current user

    Returns:
        List[schemas.Relationship]: List of requirement relationships

    Raises:
        HTTPException: If requirement is not found
    """
    requirement = await crud.requirement.get(db, id=requirement_id)
    if not requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Requirement not found"
        )

    relationships = await crud.relationship.get_by_requirement(
        db, requirement_id=requirement_id
    )
    return relationships


@router.post(
    "/{requirement_id}/relationships",
    response_model=schemas.Relationship,
    status_code=status.HTTP_201_CREATED,
)
async def create_requirement_relationship(
    requirement_id: int,
    relationship_in: schemas.RelationshipCreateForRequirement,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_requirements_write_user),
):
    """
    Create relationship between requirements.

    Args:
        requirement_id: Source requirement ID
        relationship_in: Data for the relationship being created
        db: Database session
        current_user: Current user

    Returns:
        schemas.Relationship: Created relationship

    Raises:
        HTTPException: If requirements or relationship type are not found
    """
    # Check source requirement existence
    source_requirement = await crud.requirement.get(db, id=requirement_id)
    if not source_requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source requirement not found",
        )

    # Check target requirement existence
    target_requirement = await crud.requirement.get(
        db, id=relationship_in.target_requirement_id
    )
    if not target_requirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target requirement not found",
        )

    # Check relationship type existence
    relationship_type = await crud.relationship_type.get(
        db, id=relationship_in.relationship_type_id
    )
    if not relationship_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Relationship type not found"
        )

    # Create relationship with correct field names for the model
    relationship_data = {
        "source_id": requirement_id,
        "target_id": relationship_in.target_requirement_id,
        "type_id": relationship_in.relationship_type_id,
    }

    relationship = await crud.relationship.create(db, obj_in=relationship_data)
    return relationship
