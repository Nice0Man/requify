/**
 * Trace Matrix Entity Utils - Утилиты для работы с матрицей трассируемости
 */

import type { 
  TraceMatrix,
  TraceNode,
  TraceLink,
  TraceMatrixStatistics,
  VisualNode,
  VisualEdge,
  CoverageAnalysis,
  ImpactAnalysis,
} from './types';

// =============================================================================
// Matrix Navigation Utils
// =============================================================================

/**
 * Поиск требования в матрице по ID
 */
export function findRequirementInMatrix(matrix: TraceNode[][], requirementId: number): TraceNode | null {
  for (const level of matrix) {
    for (const node of level) {
      if (node.requirement_id === requirementId) {
        return node;
      }
      // Рекурсивный поиск в дочерних элементах
      const found = findInChildren(node, requirementId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Рекурсивный поиск в дочерних узлах
 */
function findInChildren(node: TraceNode, requirementId: number): TraceNode | null {
  for (const child of node.children) {
    if (child.requirement_id === requirementId) {
      return child;
    }
    const found = findInChildren(child, requirementId);
    if (found) return found;
  }
  return null;
}

/**
 * Получение пути от корневого требования до указанного
 */
export function getPathToRequirement(
  matrix: TraceNode[][],
  targetId: number
): TraceNode[] | null {
  for (const level of matrix) {
    for (const node of level) {
      const path = findPath(node, targetId, []);
      if (path) return path;
    }
  }
  return null;
}

function findPath(node: TraceNode, targetId: number, currentPath: TraceNode[]): TraceNode[] | null {
  const newPath = [...currentPath, node];
  
  if (node.requirement_id === targetId) {
    return newPath;
  }
  
  for (const child of node.children) {
    const path = findPath(child, targetId, newPath);
    if (path) return path;
  }
  
  return null;
}

/**
 * Получение всех связанных требований
 */
export function getConnectedRequirements(
  matrix: TraceMatrix,
  requirementId: number
): {
  direct: number[];
  indirect: number[];
  all: number[];
} {
  const direct = new Set<number>();
  const indirect = new Set<number>();
  
  // Прямые связи из links
  matrix.links.forEach(link => {
    if (link.source_id === requirementId) {
      direct.add(link.target_id);
    }
    if (link.target_id === requirementId) {
      direct.add(link.source_id);
    }
  });
  
  // Непрямые связи через промежуточные узлы
  const visited = new Set([requirementId]);
  const queue = Array.from(direct);
  
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    
    matrix.links.forEach(link => {
      let nextId: number | null = null;
      
      if (link.source_id === currentId && !visited.has(link.target_id)) {
        nextId = link.target_id;
      } else if (link.target_id === currentId && !visited.has(link.source_id)) {
        nextId = link.source_id;
      }
      
      if (nextId && !direct.has(nextId)) {
        indirect.add(nextId);
        queue.push(nextId);
      }
    });
  }
  
  return {
    direct: Array.from(direct),
    indirect: Array.from(indirect),
    all: Array.from(new Set([...direct, ...indirect])),
  };
}

// =============================================================================
// Matrix Analysis Utils
// =============================================================================

/**
 * Анализ покрытия матрицы трассируемости
 */
export function analyzeCoverage(matrix: TraceMatrix): CoverageAnalysis {
  const allRequirements = getAllRequirementsFromMatrix(matrix);
  const connectedRequirements = new Set<number>();
  
  // Подсчет связанных требований
  matrix.links.forEach(link => {
    connectedRequirements.add(link.source_id);
    connectedRequirements.add(link.target_id);
  });
  
  const total = allRequirements.length;
  const connected = connectedRequirements.size;
  const coverage = total > 0 ? (connected / total) * 100 : 0;
  
  // Анализ по типам
  const coverageByType: Record<string, number> = {};
  const typeGroups: Record<string, Set<number>> = {};
  
  allRequirements.forEach(req => {
    if (!typeGroups[req.requirement_type]) {
      typeGroups[req.requirement_type] = new Set();
    }
    typeGroups[req.requirement_type].add(req.requirement_id);
  });
  
  Object.entries(typeGroups).forEach(([type, ids]) => {
    const connectedInType = Array.from(ids).filter(id => connectedRequirements.has(id)).length;
    coverageByType[type] = ids.size > 0 ? (connectedInType / ids.size) * 100 : 0;
  });
  
  // Несвязанные требования
  const uncovered = allRequirements
    .filter(req => !connectedRequirements.has(req.requirement_id))
    .map(req => ({
      id: req.requirement_id,
      title: req.requirement_title,
      type: req.requirement_type,
      reason: 'No incoming or outgoing links',
    }));
  
  return {
    total_coverage: Math.round(coverage * 100) / 100,
    forward_coverage: 0, // TODO: реализовать
    backward_coverage: 0, // TODO: реализовать
    coverage_by_type: coverageByType,
    uncovered_requirements: uncovered,
    coverage_gaps: [], // TODO: реализовать
  };
}

/**
 * Анализ влияния изменений
 */
export function analyzeImpact(matrix: TraceMatrix, changedRequirementId: number): ImpactAnalysis {
  const connected = getConnectedRequirements(matrix, changedRequirementId);
  const impactMap: Record<number, number[]> = {};
  
  // Построение карты влияния
  matrix.links.forEach(link => {
    if (!impactMap[link.source_id]) {
      impactMap[link.source_id] = [];
    }
    impactMap[link.source_id].push(link.target_id);
  });
  
  // Расчет влияния
  const calculateImpact = (requirementId: number, visited = new Set<number>()): number[] => {
    if (visited.has(requirementId)) return [];
    visited.add(requirementId);
    
    const directlyAffected = impactMap[requirementId] || [];
    const indirectlyAffected: number[] = [];
    
    directlyAffected.forEach(id => {
      indirectlyAffected.push(...calculateImpact(id, new Set(visited)));
    });
    
    return [...directlyAffected, ...indirectlyAffected];
  };
  
  const affected = calculateImpact(changedRequirementId);
  const uniqueAffected = Array.from(new Set(affected));
  
  const highImpactRequirements = [
    {
      id: changedRequirementId,
      title: matrix.requirement_title,
      impact_score: uniqueAffected.length,
      affected_count: uniqueAffected.length,
      risk_level: uniqueAffected.length > 10 ? 'critical' : 
                  uniqueAffected.length > 5 ? 'high' : 
                  uniqueAffected.length > 2 ? 'medium' : 'low' as const,
    }
  ];
  
  return {
    high_impact_requirements: highImpactRequirements,
    change_impact_map: { [changedRequirementId]: uniqueAffected },
    ripple_effects: [
      {
        requirement_id: changedRequirementId,
        affected_levels: Math.max(...uniqueAffected.map(id => 
          getRequirementLevel(matrix, id) || 0
        )) - (getRequirementLevel(matrix, changedRequirementId) || 0),
        total_affected: uniqueAffected.length,
      }
    ],
  };
}

/**
 * Получение уровня требования в матрице
 */
export function getRequirementLevel(matrix: TraceMatrix, requirementId: number): number | null {
  for (let level = 0; level < matrix.matrix.length; level++) {
    for (const node of matrix.matrix[level]) {
      if (node.requirement_id === requirementId) {
        return level;
      }
    }
  }
  return null;
}

/**
 * Получение всех требований из матрицы
 */
export function getAllRequirementsFromMatrix(matrix: TraceMatrix): TraceNode[] {
  const requirements: TraceNode[] = [];
  const visited = new Set<number>();
  
  matrix.matrix.forEach(level => {
    level.forEach(node => {
      if (!visited.has(node.requirement_id)) {
        visited.add(node.requirement_id);
        requirements.push(node);
      }
      collectNodesRecursively(node, requirements, visited);
    });
  });
  
  return requirements;
}

function collectNodesRecursively(node: TraceNode, collection: TraceNode[], visited: Set<number>) {
  node.children.forEach(child => {
    if (!visited.has(child.requirement_id)) {
      visited.add(child.requirement_id);
      collection.push(child);
      collectNodesRecursively(child, collection, visited);
    }
  });
}

// =============================================================================
// Visualization Utils
// =============================================================================

/**
 * Преобразование матрицы в узлы для визуализации
 */
export function convertToVisualNodes(matrix: TraceMatrix): VisualNode[] {
  const nodes: VisualNode[] = [];
  const requirements = getAllRequirementsFromMatrix(matrix);
  
  requirements.forEach((req, index) => {
    const connections = getConnectedRequirements(matrix, req.requirement_id);
    
    nodes.push({
      id: req.requirement_id.toString(),
      label: req.requirement_title,
      type: req.requirement_type,
      level: req.level,
      size: Math.min(Math.max(connections.all.length * 5 + 10, 10), 50),
      color: getNodeColorByType(req.requirement_type),
      shape: getNodeShapeByType(req.requirement_type),
      requirement_id: req.requirement_id,
      requirement_data: {
        title: req.requirement_title,
        type: req.requirement_type,
        status: req.requirement_status || 'unknown',
        priority: req.requirement_priority || 'medium',
        project: req.project_name || 'Unknown',
      },
      connections: {
        incoming: connections.direct.length,
        outgoing: connections.direct.length,
        total: connections.all.length,
      },
    });
  });
  
  return nodes;
}

/**
 * Преобразование связей в рёбра для визуализации
 */
export function convertToVisualEdges(matrix: TraceMatrix): VisualEdge[] {
  return matrix.links.map((link, index) => ({
    id: `${link.source_id}-${link.target_id}`,
    source: link.source_id.toString(),
    target: link.target_id.toString(),
    type: link.relationship_type,
    strength: link.strength,
    color: getEdgeColorByType(link.relationship_type),
    width: Math.max(link.strength * 3, 1),
    style: getEdgeStyleByType(link.relationship_type),
    relationship_type: link.relationship_type,
    created_at: link.created_at,
  }));
}

/**
 * Получение цвета узла по типу требования
 */
export function getNodeColorByType(type: string): string {
  const colorMap: Record<string, string> = {
    functional: '#3B82F6',     // blue
    non_functional: '#10B981', // green
    business: '#F59E0B',       // yellow
    technical: '#8B5CF6',      // purple
    user_story: '#EF4444',     // red
    epic: '#F97316',           // orange
    feature: '#06B6D4',        // cyan
    bug: '#DC2626',            // red-600
    default: '#6B7280',        // gray
  };
  return colorMap[type.toLowerCase()] || colorMap.default;
}

/**
 * Получение формы узла по типу требования
 */
export function getNodeShapeByType(type: string): 'circle' | 'square' | 'diamond' | 'triangle' {
  const shapeMap: Record<string, 'circle' | 'square' | 'diamond' | 'triangle'> = {
    functional: 'circle',
    non_functional: 'square',
    business: 'diamond',
    technical: 'triangle',
    user_story: 'circle',
    epic: 'square',
    feature: 'diamond',
    bug: 'triangle',
  };
  return shapeMap[type.toLowerCase()] || 'circle';
}

/**
 * Получение цвета рёбра по типу связи
 */
export function getEdgeColorByType(type: string): string {
  const colorMap: Record<string, string> = {
    depends_on: '#DC2626',     // red
    implements: '#10B981',     // green
    derives_from: '#3B82F6',   // blue
    refines: '#8B5CF6',        // purple
    tests: '#F59E0B',          // yellow
    blocks: '#EF4444',         // red
    relates_to: '#6B7280',     // gray
    default: '#9CA3AF',        // gray-400
  };
  return colorMap[type.toLowerCase()] || colorMap.default;
}

/**
 * Получение стиля рёбра по типу связи
 */
export function getEdgeStyleByType(type: string): 'solid' | 'dashed' | 'dotted' {
  const styleMap: Record<string, 'solid' | 'dashed' | 'dotted'> = {
    depends_on: 'solid',
    implements: 'solid',
    derives_from: 'dashed',
    refines: 'dashed',
    tests: 'dotted',
    blocks: 'solid',
    relates_to: 'dotted',
  };
  return styleMap[type.toLowerCase()] || 'solid';
}

// =============================================================================
// Statistics Utils
// =============================================================================

/**
 * Расчет детальной статистики матрицы
 */
export function calculateDetailedStatistics(matrix: TraceMatrix): TraceMatrixStatistics {
  const requirements = getAllRequirementsFromMatrix(matrix);
  const totalRequirements = requirements.length;
  const totalLinks = matrix.links.length;
  
  // Статистика по типам требований
  const requirementsByType: Record<string, number> = {};
  requirements.forEach(req => {
    requirementsByType[req.requirement_type] = (requirementsByType[req.requirement_type] || 0) + 1;
  });
  
  // Статистика по уровням
  const requirementsByLevel: Record<number, number> = {};
  requirements.forEach(req => {
    requirementsByLevel[req.level] = (requirementsByLevel[req.level] || 0) + 1;
  });
  
  // Статистика по типам связей
  const linksByType: Record<string, number> = {};
  matrix.links.forEach(link => {
    linksByType[link.relationship_type] = (linksByType[link.relationship_type] || 0) + 1;
  });
  
  // Среднее количество связей на требование
  const averageConnections = totalRequirements > 0 ? totalLinks / totalRequirements : 0;
  
  // Наиболее связанное требование
  const connectionCounts: Record<number, number> = {};
  matrix.links.forEach(link => {
    connectionCounts[link.source_id] = (connectionCounts[link.source_id] || 0) + 1;
    connectionCounts[link.target_id] = (connectionCounts[link.target_id] || 0) + 1;
  });
  
  const mostConnectedId = Object.entries(connectionCounts)
    .reduce((max, [id, count]) => count > max.count ? { id: parseInt(id), count } : max, 
            { id: 0, count: 0 });
  
  const mostConnectedReq = requirements.find(r => r.requirement_id === mostConnectedId.id);
  
  return {
    ...matrix.statistics,
    requirements_by_type: requirementsByType,
    requirements_by_level: requirementsByLevel,
    links_by_type: linksByType,
    average_connections_per_requirement: Math.round(averageConnections * 100) / 100,
    most_connected_requirement: mostConnectedReq ? {
      id: mostConnectedReq.requirement_id,
      title: mostConnectedReq.requirement_title,
      connections: mostConnectedId.count,
    } : undefined,
  };
}

// =============================================================================
// Export Utils
// =============================================================================

/**
 * Подготовка данных для экспорта в различные форматы
 */
export function prepareExportData(matrix: TraceMatrix, format: string) {
  const requirements = getAllRequirementsFromMatrix(matrix);
  
  switch (format.toLowerCase()) {
    case 'csv':
      return prepareCsvData(requirements, matrix.links);
    case 'json':
      return JSON.stringify(matrix, null, 2);
    case 'table':
      return prepareTableData(requirements, matrix.links);
    default:
      return matrix;
  }
}

function prepareCsvData(requirements: TraceNode[], links: TraceLink[]): string {
  const headers = ['ID', 'Title', 'Type', 'Level', 'Connected To', 'Connection Types'];
  const rows = requirements.map(req => {
    const connections = links
      .filter(link => link.source_id === req.requirement_id || link.target_id === req.requirement_id)
      .map(link => ({
        id: link.source_id === req.requirement_id ? link.target_id : link.source_id,
        type: link.relationship_type,
      }));
    
    return [
      req.requirement_id.toString(),
      req.requirement_title,
      req.requirement_type,
      req.level.toString(),
      connections.map(c => c.id).join(';'),
      connections.map(c => c.type).join(';'),
    ];
  });
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function prepareTableData(requirements: TraceNode[], links: TraceLink[]) {
  return requirements.map(req => {
    const connections = links
      .filter(link => link.source_id === req.requirement_id || link.target_id === req.requirement_id);
    
    return {
      id: req.requirement_id,
      title: req.requirement_title,
      type: req.requirement_type,
      level: req.level,
      connections_count: connections.length,
      connections: connections.map(link => ({
        target_id: link.source_id === req.requirement_id ? link.target_id : link.source_id,
        relationship: link.relationship_type,
        strength: link.strength,
      })),
    };
  });
}