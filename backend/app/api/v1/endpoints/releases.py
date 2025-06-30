"""
API эндпоинты для работы с релизами.

Включает операции CRUD для релизов и управление их жизненным циклом.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_db,
    get_releases_read_user,
    get_releases_write_user,
    get_releases_delete_user,
)
from app.core.config import settings
from app import crud, schemas
from app.models.requirement import Requirement
from app.schemas.release import (
    ReleaseCreate,
    ReleaseUpdate,
    ReleaseFromRequirementsCreate,
    ReleaseCreationSummary,
    ReleaseWithLinkedRequirements,
    RequirementSummary,
)

router = APIRouter()


async def _analyze_requirement_relationships(
    db: AsyncSession, 
    requirements: List[Requirement], 
    project_id: int
) -> Dict[str, Any]:
    """
    Analyze requirement relationships for release creation.
    
    Function 11 enhancement: Considers requirement relationships when creating releases.
    
    Args:
        db: Database session
        requirements: List of requirements to analyze
        project_id: Project ID for scope validation
    
    Returns:
        Dict containing analysis results:
        - missing_dependencies: List of required dependencies not in the requirements list
        - circular_dependencies: List of circular dependency chains detected
        - dependency_graph: Complete dependency mapping
        - suggested_requirements: Additional requirements that should be considered
    """
    requirement_ids = [req.id for req in requirements]
    analysis_result = {
        "missing_dependencies": [],
        "circular_dependencies": [],
        "dependency_graph": {},
        "suggested_requirements": [],
        "relationship_count": 0
    }
    
    # Get all relationships for these requirements
    all_relationships = []
    for req in requirements:
        # Get outgoing relationships (dependencies)
        outgoing_rels = await crud.relationship.get_outgoing_relationships(
            db, requirement_id=req.id
        )
        # Get incoming relationships (dependents)
        incoming_rels = await crud.relationship.get_incoming_relationships(
            db, requirement_id=req.id
        )
        all_relationships.extend(outgoing_rels)
        all_relationships.extend(incoming_rels)
    
    analysis_result["relationship_count"] = len(all_relationships)
    
    # Build dependency graph
    dependency_graph = {}
    for req in requirements:
        dependency_graph[req.id] = {
            "title": req.title,
            "dependencies": [],  # Requirements this one depends on
            "dependents": []     # Requirements that depend on this one
        }
    
    # Populate dependency graph and find missing dependencies
    missing_deps = []
    for relationship in all_relationships:
        source_id = relationship.source_id
        target_id = relationship.target_id
        
        # Only consider dependencies (not all relationship types)
        # Assuming relationship type 1 is "depends on" or similar
        if relationship.type_id == 1:  # Dependency relationship
            if source_id in requirement_ids:
                # This requirement depends on target_id
                if target_id not in requirement_ids:
                    # Missing dependency
                    target_req = await crud.requirement.get_with_details(db, id=target_id)
                    if target_req and target_req.project_id == project_id:
                        missing_deps.append({
                            "id": target_id,
                            "title": target_req.title,
                            "required_by": [r.title for r in requirements if r.id == source_id]
                        })
                else:
                    # Valid internal dependency
                    dependency_graph[source_id]["dependencies"].append(target_id)
                    dependency_graph[target_id]["dependents"].append(source_id)
    
    analysis_result["missing_dependencies"] = missing_deps
    analysis_result["dependency_graph"] = dependency_graph
    
    # Detect circular dependencies using DFS
    visited = set()
    rec_stack = set()
    circular_deps = []
    
    def has_cycle(node_id, path):
        if node_id in rec_stack:
            # Found a cycle, extract the cycle path
            cycle_start = path.index(node_id)
            cycle = path[cycle_start:] + [node_id]
            cycle_titles = []
            for req_id in cycle:
                req_title = next((req.title for req in requirements if req.id == req_id), f"ID:{req_id}")
                cycle_titles.append(req_title)
            return cycle_titles
        
        if node_id in visited:
            return None
        
        visited.add(node_id)
        rec_stack.add(node_id)
        path.append(node_id)
        
        for dep_id in dependency_graph.get(node_id, {}).get("dependencies", []):
            cycle = has_cycle(dep_id, path[:])
            if cycle:
                return cycle
        
        rec_stack.remove(node_id)
        return None
    
    for req_id in requirement_ids:
        if req_id not in visited:
            cycle = has_cycle(req_id, [])
            if cycle:
                circular_deps.append(cycle)
    
    analysis_result["circular_dependencies"] = circular_deps
    
    # Suggest additional requirements based on common dependencies
    suggested = []
    for missing_dep in missing_deps[:3]:  # Limit suggestions
        suggested.append({
            "id": missing_dep["id"],
            "title": missing_dep["title"],
            "reason": f"Required by: {', '.join(missing_dep['required_by'])}"
        })
    
    analysis_result["suggested_requirements"] = suggested
    
    return analysis_result


@router.get("/", response_model=List[schemas.Release])
async def get_releases(
    skip: int = 0,
    limit: int = 100,
    project_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_read_user),
):
    """
    Получить список релизов.

    Args:
        skip: Количество пропускаемых записей
        limit: Максимальное количество возвращаемых записей
        project_id: Фильтр по ID проекта
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.Release]: Список релизов
    """
    if project_id:
        releases = await crud.release.get_by_project(
            db, project_id=project_id, skip=skip, limit=limit
        )
    else:
        releases = await crud.release.get_multi(db, skip=skip, limit=limit)

    return releases


@router.post("/", response_model=schemas.Release, status_code=status.HTTP_201_CREATED)
async def create_release(
    release_data: ReleaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_write_user),
):
    """
    Создать новый релиз.

    Args:
        release_data: Данные релиза
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Release: Созданный релиз
    """
    # Проверяем существование проекта
    project = await crud.project.get(db, id=release_data.project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    # Проверяем уникальность версии в рамках проекта
    existing_release = await crud.release.get_by_version(
        db, project_id=release_data.project_id, version=release_data.version
    )
    if existing_release:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Release with this version already exists in the project",
        )

    release = await crud.release.create(db, obj_in=release_data)
    return release


@router.get("/{release_id}", response_model=schemas.Release)
async def get_release(
    release_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_read_user),
):
    """
    Получить релиз по ID.

    Args:
        release_id: ID релиза
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Release: Данные релиза

    Raises:
        HTTPException: Если релиз не найден
    """
    release = await crud.release.get(db, id=release_id)
    if not release:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Release not found"
        )

    return release


@router.put("/{release_id}", response_model=schemas.Release)
async def update_release(
    release_id: int,
    release_data: ReleaseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_write_user),
):
    """
    Обновить данные релиза.

    Args:
        release_id: ID релиза
        release_data: Обновленные данные релиза
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        schemas.Release: Обновленные данные релиза

    Raises:
        HTTPException: Если релиз не найден
    """
    release = await crud.release.get(db, id=release_id)
    if not release:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Release not found"
        )

    # Если обновляется версия, проверяем уникальность
    if release_data.version and release_data.version != release.version:
        existing_release = await crud.release.get_by_version(
            db, project_id=release.project_id, version=release_data.version
        )
        if existing_release:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Release with this version already exists in the project",
            )

    updated_release = await crud.release.update(db, db_obj=release, obj_in=release_data)
    return updated_release


@router.delete("/{release_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_release(
    release_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_delete_user),
):
    """
    Удалить релиз.

    Args:
        release_id: ID релиза
        db: Сессия базы данных
        current_user: Текущий пользователь

    Raises:
        HTTPException: Если релиз не найден
    """
    release = await crud.release.get(db, id=release_id)
    if not release:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Release not found"
        )

    await crud.release.remove(db, id=release_id)


@router.post(
    "/create-from-requirements",
    response_model=schemas.ReleaseCreationSummary,
    status_code=status.HTTP_201_CREATED,
)
async def create_release_from_requirements(
    release_data: ReleaseFromRequirementsCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_write_user),
):
    """
    Create release from requirements.

    Function 11 from TZ: Create release considering requirement relationships.
    User role: Project manager or higher.

    Args:
        release_data: Release data with list of requirements
        db: Database session
        current_user: Current user

    Returns:
        schemas.ReleaseCreationSummary: Created release with linked requirements summary

    Raises:
        HTTPException: If data is invalid
    """
    # Validate project exists
    project = await crud.project.get(db, id=release_data.project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    # Check if version already exists in project
    existing_release = await crud.release.get_by_version(
        db, project_id=release_data.project_id, version=release_data.version
    )
    if existing_release:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Release with this version already exists in the project",
        )

    # Validate and get requirements
    requirements = []
    invalid_requirements = []
    wrong_project_requirements = []

    for req_id in release_data.requirement_ids:
        requirement = await crud.requirement.get_with_details(db, id=req_id)
        if not requirement:
            invalid_requirements.append(req_id)
            continue

        if requirement.project_id != release_data.project_id:
            wrong_project_requirements.append(req_id)
            continue

        requirements.append(requirement)

    # Report validation errors
    if invalid_requirements:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Requirements not found: {invalid_requirements}",
        )

    if wrong_project_requirements:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Requirements {wrong_project_requirements} do not belong to project {release_data.project_id}",
        )

    # FUNCTION 11 ENHANCEMENT: Analyze requirement relationships
    auto_included_requirements = []
    if release_data.analyze_dependencies:
        relationship_analysis = await _analyze_requirement_relationships(
            db, requirements, release_data.project_id
        )
        
        # Handle missing dependencies
        if relationship_analysis["missing_dependencies"]:
            missing_deps = relationship_analysis["missing_dependencies"]
            
            if release_data.auto_include_dependencies:
                # Automatically include missing dependencies
                for missing_dep in missing_deps:
                    missing_req = await crud.requirement.get_with_details(db, id=missing_dep["id"])
                    if missing_req:
                        requirements.append(missing_req)
                        auto_included_requirements.append({
                            "id": missing_req.id,
                            "title": missing_req.title,
                            "reason": missing_dep["required_by"]
                        })
                
                # Re-analyze after including dependencies to check for new missing deps
                relationship_analysis = await _analyze_requirement_relationships(
                    db, requirements, release_data.project_id
                )
            else:
                # Throw error if auto-include is disabled
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "message": "Some required dependencies are missing from the release",
                        "missing_dependencies": missing_deps,
                        "suggestion": "Include the missing dependencies, enable auto_include_dependencies, or remove requirements that depend on them"
                    }
                )
        
        # Check for circular dependencies (always error)
        if relationship_analysis["circular_dependencies"]:
            circular_deps = relationship_analysis["circular_dependencies"]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Circular dependencies detected in requirements",
                    "circular_dependencies": circular_deps,
                    "suggestion": "Remove or modify requirements to break circular dependencies"
                }
            )
    else:
        # If dependency analysis is disabled, create minimal analysis result
        relationship_analysis = {
            "missing_dependencies": [],
            "circular_dependencies": [],
            "dependency_graph": {},
            "suggested_requirements": [],
            "relationship_count": 0
        }

    # Generate description if requested
    description = release_data.description
    auto_generated = False

    if release_data.auto_description:
        if not description:
            auto_generated = True
            if release_data.include_requirement_details:
                req_details = [
                    f"- {req.title} ({req.type.name if req.type else 'Unknown Type'})"
                    for req in requirements
                ]
                description = (
                    f"Release created based on {len(requirements)} requirements:\n"
                    + "\n".join(req_details)
                )
            else:
                description = (
                    f"Release created based on {len(requirements)} requirements"
                )

    # Create release
    release_create_data = ReleaseCreate(
        name=release_data.name,
        version=release_data.version,
        description=description,
        project_id=release_data.project_id,
        status=release_data.status,
        planned_date=release_data.planned_date,
        release_date=release_data.release_date,
    )

    release = await crud.release.create(db, obj_in=release_create_data)

    # Link requirements to release
    for requirement in requirements:
        await crud.requirement.update(
            db, db_obj=requirement, obj_in={"release_id": release.id}
        )

    # Prepare response with requirement summaries
    requirement_summaries = []
    for req in requirements:
        req_summary = RequirementSummary(
            id=req.id,
            title=req.title,
            description=req.description,
            type_name=req.type.name if req.type else None,
            priority_name=req.priority.name if req.priority else None,
            status_name=req.status.name if req.status else None,
        )
        requirement_summaries.append(req_summary)

    # Build response
    release_with_requirements = ReleaseWithLinkedRequirements(
        **release.__dict__,
        linked_requirements=requirement_summaries,
        requirements_count=len(requirement_summaries),
        auto_generated_description=auto_generated,
    )

    operation_summary = {
        "created_release_id": release.id,
        "linked_requirements_count": len(requirements),
        "auto_generated_description": auto_generated,
        "release_status": release.status,
        "project_id": release.project_id,
        "requirements_by_type": {
            req_type: len(
                [r for r in requirements if r.type and r.type.name == req_type]
            )
            for req_type in set(r.type.name for r in requirements if r.type)
        },
        "requirements_by_priority": {
            priority: len(
                [r for r in requirements if r.priority and r.priority.name == priority]
            )
            for priority in set(r.priority.name for r in requirements if r.priority)
        },
        # FUNCTION 11 ENHANCEMENT: Include relationship analysis
        "relationship_analysis": {
            "total_relationships": relationship_analysis["relationship_count"],
            "dependency_graph_size": len(relationship_analysis["dependency_graph"]),
            "missing_dependencies_resolved": len(relationship_analysis["missing_dependencies"]) == 0,
            "circular_dependencies_detected": len(relationship_analysis["circular_dependencies"]) > 0,
            "suggested_requirements_available": len(relationship_analysis["suggested_requirements"]) > 0,
            "dependency_validation_passed": (
                len(relationship_analysis["missing_dependencies"]) == 0 and 
                len(relationship_analysis["circular_dependencies"]) == 0
            ),
            "auto_included_requirements": auto_included_requirements,
            "auto_included_count": len(auto_included_requirements),
            "analysis_enabled": release_data.analyze_dependencies,
            "auto_include_enabled": release_data.auto_include_dependencies
        }
    }

    return ReleaseCreationSummary(
        release=release_with_requirements,
        operation_summary=operation_summary,
    )


@router.post("/{release_id}/generate-specification", response_model=dict)
async def generate_release_specification(
    release_id: int,
    spec_options: dict = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_write_user),
):
    """
    Генерация спецификации релиза.

    Функция 12 из ТЗ: Автоматическая генерация спецификаций.
    Роль пользователя: Аналитик или вышестоящая роль.

    Args:
        release_id: ID релиза
        spec_options: Опции генерации спецификации
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Информация о сгенерированной спецификации

    Raises:
        HTTPException: Если релиз не найден
    """
    release = await crud.release.get_with_requirements(db, id=release_id)
    if not release:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Release not found"
        )

    if spec_options is None:
        spec_options = {}

    # Получаем требования релиза
    requirements = await crud.requirement.get_by_release(db, release_id=release_id)

    # Создаем спецификацию
    from datetime import datetime, UTC
    from app.schemas.spec import SpecCreate

    spec_data = SpecCreate(
        name=f"Specification for {release.name} {release.version}",
        description=f"Auto-generated specification for release {release.name}",
        content={
            "release_info": {
                "name": release.name,
                "version": release.version,
                "description": release.description,
            },
            "requirements": [
                {
                    "id": req.id,
                    "title": req.title,
                    "description": req.description,
                    "type": req.type.name if req.type else None, # type: RequirementType
                    "priority": req.priority.name if req.priority else None, # type: RequirementPriority
                    "status": req.status.name if req.status else None, # type: RequirementStatus
                }
                for req in requirements # type: List["Requirement"]
            ],
            "sections": [
                "Введение",
                "Функциональные требования",
                "Нефункциональные требования",
                "Интерфейсы",
                "Тестирование",
            ],
            "generated_at": datetime.now(UTC).isoformat(),
            "generated_by": current_user.id if hasattr(current_user, "id") else None,
            "format": spec_options.get("format", "pdf"),
            "language": spec_options.get("language", "ru"),
        },
        version="1.0",
        project_id=release.project_id,
    )

    spec = await crud.spec.create(db, obj_in=spec_data)

    return {
        "release_id": release_id,
        "specification_id": spec.id,
        "format": spec_options.get("format", "pdf"),
        "language": spec_options.get("language", "ru"),
        "sections": spec_data.content["sections"],
        "generated_at": spec_data.content["generated_at"],
        "download_url": f"/api/v1/specs/{spec.id}/download",
        "status": "generated",
        "requirements_count": len(requirements),
    }


@router.post("/{release_id}/publish", response_model=dict)
async def publish_release(
    release_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_write_user),
):
    """
    Опубликовать релиз.

    Args:
        release_id: ID релиза
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Результат публикации

    Raises:
        HTTPException: Если релиз не найден или не готов к публикации
    """
    release = await crud.release.get(db, id=release_id)
    if not release:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Release not found"
        )

    # Проверяем, готов ли релиз к публикации
    if release.status in ["cancelled", "published"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot publish release with status '{release.status}'",
        )

    from datetime import datetime, UTC

    # Обновляем статус релиза
    updated_release = await crud.release.update(
        db,
        db_obj=release,
        obj_in={
            "status": "published",
            "release_date": datetime.now(UTC).replace(tzinfo=None),
        },
    )

    return {
        "release_id": release_id,
        "status": "published",
        "published_at": (
            updated_release.release_date.isoformat()
            if updated_release.release_date
            else None
        ),
        "published_by": current_user.id if hasattr(current_user, "id") else None,
        "notification_sent": True,
    }


@router.get("/{release_id}/requirements", response_model=List[schemas.Requirement])
async def get_release_requirements(
    release_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_id: Optional[int] = Query(None, description="Фильтр по ID статуса"),
    priority_id: Optional[int] = Query(None, description="Фильтр по ID приоритета"),
    type_id: Optional[int] = Query(None, description="Фильтр по ID типа"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_read_user),
):
    """
    Получить все требования релиза.

    Args:
        release_id: ID релиза
        skip: Количество пропускаемых записей
        limit: Максимальное количество записей
        status_id: Фильтр по ID статуса
        priority_id: Фильтр по ID приоритета
        type_id: Фильтр по ID типа
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        List[schemas.Requirement]: Список требований релиза

    Raises:
        HTTPException: Если релиз не найден
    """
    # Проверяем существование релиза
    release = await crud.release.get(db, id=release_id)
    if not release:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Релиз не найден"
        )

    # Формируем фильтры
    filters = {}
    if status_id:
        filters["status_id"] = status_id
    if priority_id:
        filters["priority_id"] = priority_id
    if type_id:
        filters["type_id"] = type_id

    # Получаем требования релиза
    requirements = await crud.requirement.get_by_release(
        db, release_id=release_id, skip=skip, limit=limit, **filters
    )

    return requirements


@router.get("/{release_id}/changelog", response_model=dict)
async def get_release_changelog(
    release_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_read_user),
):
    """
    Получить changelog релиза.

    Args:
        release_id: ID релиза
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        dict: Changelog релиза

    Raises:
        HTTPException: Если релиз не найден
    """
    release = await crud.release.get(db, id=release_id)
    if not release:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Release not found"
        )

    # Получаем требования релиза
    requirements = await crud.requirement.get_by_release(db, release_id=release_id)

    # Группируем требования по типам
    changelog = {
        "release_info": {
            "id": release.id,
            "name": release.name,
            "version": release.version,
            "description": release.description,
            "status": release.status,
            "release_date": (
                release.release_date.isoformat() if release.release_date else None
            ),
        },
        "changes": {
            "new_features": [],
            "improvements": [],
            "bug_fixes": [],
            "breaking_changes": [],
            "other": [],
        },
        "statistics": {
            "total_requirements": len(requirements),
            "by_type": {},
            "by_priority": {},
            "by_status": {},
        },
    }

    for req in requirements:
        req_info = {
            "id": req.id,
            "name": req.name,
            "description": req.description,
            "type": req.type.name if req.type else "unknown",
            "priority": req.priority.name if req.priority else "unknown",
            "status": req.status.name if req.status else "unknown",
        }

        # Классифицируем по типам изменений
        if req.type and req.type.name.lower() in ["feature", "новая функция"]:
            changelog["changes"]["new_features"].append(req_info)
        elif req.type and req.type.name.lower() in ["improvement", "улучшение"]:
            changelog["changes"]["improvements"].append(req_info)
        elif req.type and req.type.name.lower() in ["bug", "ошибка", "bug fix"]:
            changelog["changes"]["bug_fixes"].append(req_info)
        elif req.type and req.type.name.lower() in [
            "breaking",
            "критическое изменение",
        ]:
            changelog["changes"]["breaking_changes"].append(req_info)
        else:
            changelog["changes"]["other"].append(req_info)

        # Статистика по типам
        type_name = req.type.name if req.type else "unknown"
        changelog["statistics"]["by_type"][type_name] = (
            changelog["statistics"]["by_type"].get(type_name, 0) + 1
        )

        # Статистика по приоритетам
        priority_name = req.priority.name if req.priority else "unknown"
        changelog["statistics"]["by_priority"][priority_name] = (
            changelog["statistics"]["by_priority"].get(priority_name, 0) + 1
        )

        # Статистика по статусам
        status_name = req.status.name if req.status else "unknown"
        changelog["statistics"]["by_status"][status_name] = (
            changelog["statistics"]["by_status"].get(status_name, 0) + 1
        )

    return changelog


@router.post("/{release_id}/sync-project-requirements", response_model=Dict[str, Any])
async def sync_project_requirements_to_release(
    release_id: int,
    project_id: Optional[int] = None,
    requirement_ids: Optional[List[int]] = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_releases_write_user),
):
    """
    Синхронизировать требования проекта с релизом.

    Args:
        release_id: ID релиза
        project_id: ID проекта для синхронизации всех требований (опционально)
        requirement_ids: Список ID конкретных требований для синхронизации (опционально)
        db: Сессия базы данных
        current_user: Текущий пользователь

    Returns:
        Dict[str, Any]: Результат синхронизации

    Raises:
        HTTPException: Если релиз не найден или данные некорректны
    """
    # Проверяем существование релиза
    release = await crud.release.get(db, id=release_id)
    if not release:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Релиз не найден"
        )

    try:
        synced_count = 0

        if project_id:
            # Синхронизируем все требования проекта
            project_requirements = await crud.requirement.get_by_project(
                db, project_id=project_id, skip=0, limit=10000
            )

            for req in project_requirements:
                if req.release_id != release_id:
                    req.release_id = release_id
                    db.add(req)
                    synced_count += 1

        elif requirement_ids:
            # Синхронизируем конкретные требования
            for req_id in requirement_ids:
                requirement = await crud.requirement.get(db, id=req_id)
                if requirement and requirement.release_id != release_id:
                    requirement.release_id = release_id
                    db.add(requirement)
                    synced_count += 1
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Необходимо указать либо project_id, либо requirement_ids",
            )

        await db.commit()

        return {
            "message": f"Синхронизировано {synced_count} требований с релизом",
            "release_id": release_id,
            "synced_requirements": synced_count,
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка синхронизации: {str(e)}",
        )
