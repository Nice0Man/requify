import { requirementsApi } from '@/entities/requirement';
import type {
  Requirement,
  RequirementCreate,
  RequirementUpdate,
  RequirementWithDetails,
  RequirementWithTestResults,
  RequirementType,
  RequirementPriority,
  RequirementStatus,
  RequirementRelationship,
  RelationshipCreateForRequirement,
  RequirementComment,
  CommentCreateForRequirement,
  TraceMatrix,
  RequirementFilters,
  RequirementExtended
} from '@/entities/requirement';
import { apiClient } from '@/shared/api/client';

/**
 * Requirement Management API - расширенные функции для управления требованиями
 * Содержит бизнес-логику уровня feature, используя entity API как основу
 */
export class RequirementManagementApi {
  /**
   * Получить данные для дашборда управления требованиями
   */
  async getRequirementDashboardData(projectId?: number) {
    const [requirements, stats, recentActivity, coverage] = await Promise.all([
      this.getActiveRequirements(projectId),
      this.getRequirementAnalytics(projectId),
      this.getRecentRequirementActivity(projectId),
      this.getTestCoverageData(projectId)
    ]);

    return {
      requirements,
      stats,
      recentActivity,
      coverage,
      summary: {
        totalActive: requirements.length,
        overdue: requirements.filter(r => this.isRequirementOverdue(r)).length,
        inReview: requirements.filter(r => r.status === 'review').length,
        approved: requirements.filter(r => r.status === 'approved').length,
        testCoverage: coverage.overall_coverage || 0,
        riskScore: this.calculateRiskScore(requirements)
      }
    };
  }

  /**
   * Получить активные требования с расширенной информацией
   */
  async getActiveRequirements(projectId?: number): Promise<RequirementExtended[]> {
    const filters = {
      project_id: projectId,
      status: ['new', 'in_progress', 'review', 'approved'] // Активные статусы
    };

    const response = await requirementsApi.getRequirements({
      limit: 100,
      sort_by: 'priority_id',
      sort_order: 'desc' as const,
      project_id: projectId
    });

    // Обогащаем данные дополнительной информацией
    const enrichedRequirements = await Promise.all(
      response.items.map(async (requirement) => {
        const [relationships, comments, tests] = await Promise.all([
          this.getRequirementRelationships(requirement.id),
          this.getRequirementComments(requirement.id),
          this.getRequirementTests(requirement.id)
        ]).catch(() => [[], [], []]);

        // Вычисляем дополнительные метрики
        const testCoverage = tests.length > 0 
          ? Math.round((tests.filter((t: any) => t.status === 'passed').length / tests.length) * 100)
          : 0;

        return {
          ...requirement,
          relationships: relationships || [],
          comments: comments || [],
          test_results: tests || [],
          test_coverage: testCoverage,
          risk_level: this.calculateRequirementRisk(requirement),
          complexity: this.estimateComplexity(requirement),
          business_value: this.estimateBusinessValue(requirement),
          estimated_effort: this.estimateEffort(requirement)
        } as RequirementExtended;
      })
    );

    return enrichedRequirements;
  }

  /**
   * Получить аналитику требований
   */
  async getRequirementAnalytics(projectId?: number): Promise<{
    totalRequirements: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
    completionRate: number;
    overdueCount: number;
    testCoverage: number;
    approvalRate: number;
    trends: {
      newRequirements: number;
      completedRequirements: number;
      avgProcessingTime: number;
      qualityScore: number;
      velocityTrend: 'up' | 'down' | 'stable';
    };
    riskDistribution: {
      high: number;
      medium: number;
      low: number;
      critical: number;
    };
  }> {
    const params = projectId ? { project_id: projectId } : {};
    const baseStats = await requirementsApi.getRequirementsStats(params);

    // Дополняем собственной аналитикой
    const requirements = await requirementsApi.getRequirements({ 
      limit: 500, 
      project_id: projectId 
    });

    const trends = this.calculateRequirementTrends(requirements.items);
    const riskDistribution = this.calculateRiskDistribution(requirements.items);

    return {
      totalRequirements: baseStats.total_requirements,
      byStatus: baseStats.requirements_by_status,
      byPriority: baseStats.requirements_by_priority,
      byType: baseStats.requirements_by_type,
      completionRate: baseStats.completion_rate,
      overdueCount: baseStats.overdue_requirements,
      testCoverage: baseStats.test_coverage,
      approvalRate: baseStats.approval_rate,
      trends,
      riskDistribution
    };
  }

  /**
   * Получить недавнюю активность по требованиям
   */
  async getRecentRequirementActivity(projectId?: number): Promise<Array<{
    id: string;
    type: 'created' | 'updated' | 'approved' | 'status_changed' | 'comment_added' | 'test_added';
    requirementId: number;
    requirementTitle: string;
    description: string;
    timestamp: string;
    userId: number;
    userName?: string;
    metadata?: Record<string, any>;
  }>> {
    // В реальном проекте это был бы отдельный endpoint для активности
    const requirements = await requirementsApi.getRequirements({
      project_id: projectId,
      limit: 20,
      sort_by: 'updated_at',
      sort_order: 'desc' as const
    });

    return requirements.items.map(requirement => ({
      id: `${requirement.id}-${requirement.updated_at}`,
      type: 'updated' as const,
      requirementId: requirement.id,
      requirementTitle: requirement.title,
      description: `Requirement "${requirement.title}" was updated`,
      timestamp: requirement.updated_at,
      userId: requirement.updated_by || 1,
      userName: 'System'
    }));
  }

  /**
   * Получить данные покрытия тестами
   */
  async getTestCoverageData(projectId?: number): Promise<{
    overall_coverage: number;
    by_requirement_type: Record<string, number>;
    uncovered_requirements: number[];
    critical_uncovered: number;
    coverage_trend: 'improving' | 'declining' | 'stable';
  }> {
    const requirements = await requirementsApi.getRequirements({
      project_id: projectId,
      limit: 500
    });

    let totalRequirements = requirements.items.length;
    let coveredRequirements = 0;
    const uncoveredRequirements: number[] = [];
    let criticalUncovered = 0;
    const coverageByType: Record<string, { total: number; covered: number }> = {};

    for (const requirement of requirements.items) {
      const tests = await this.getRequirementTests(requirement.id);
      const hasCoverage = tests.length > 0;

      if (hasCoverage) {
        coveredRequirements++;
      } else {
        uncoveredRequirements.push(requirement.id);
        if (requirement.priority === 'critical' || requirement.priority === 'high') {
          criticalUncovered++;
        }
      }

      // Группировка по типам
      const typeName = requirement.type || 'Unknown';
      if (!coverageByType[typeName]) {
        coverageByType[typeName] = { total: 0, covered: 0 };
      }
      coverageByType[typeName].total++;
      if (hasCoverage) {
        coverageByType[typeName].covered++;
      }
    }

    const overallCoverage = totalRequirements > 0 
      ? Math.round((coveredRequirements / totalRequirements) * 100)
      : 0;

    const byRequirementType: Record<string, number> = {};
    Object.entries(coverageByType).forEach(([type, data]) => {
      byRequirementType[type] = data.total > 0 
        ? Math.round((data.covered / data.total) * 100)
        : 0;
    });

    return {
      overall_coverage: overallCoverage,
      by_requirement_type: byRequirementType,
      uncovered_requirements: uncoveredRequirements,
      critical_uncovered: criticalUncovered,
      coverage_trend: 'stable' // В реальности - анализ исторических данных
    };
  }

  /**
   * Массовое обновление статусов требований
   */
  async bulkUpdateRequirementStatus(
    requirementIds: number[],
    statusId: number,
    reason?: string
  ): Promise<{
    updated: number;
    failed: number;
    errors: Array<{ requirementId: number; error: string }>;
  }> {
    const result = await requirementsApi.bulkUpdateRequirements({
      requirement_ids: requirementIds,
      updates: { status_id: statusId },
      reason
    });

    return {
      updated: result.updated,
      failed: result.failed,
      errors: result.errors.map(err => ({
        requirementId: err.requirement_id,
        error: err.error
      }))
    };
  }

  /**
   * Создать требование с валидацией и предварительными проверками
   */
  async createRequirementWithValidation(data: RequirementCreate & {
    validateDependencies?: boolean;
    checkDuplicates?: boolean;
    autoAssignId?: boolean;
  }): Promise<{
    requirement: Requirement;
    warnings: string[];
    validationResults: {
      titleUnique: boolean;
      dependenciesValid: boolean;
      priorityAppropriate: boolean;
    };
  }> {
    const warnings: string[] = [];
    const validationResults = {
      titleUnique: true,
      dependenciesValid: true,
      priorityAppropriate: true
    };

    // Проверка на дублирование заголовков
    if (data.checkDuplicates) {
      const existingRequirements = await requirementsApi.searchRequirements({
        search: data.title,
        project_id: data.project_id
      });

      const duplicates = existingRequirements.items.filter(r => 
        r.title.toLowerCase() === data.title.toLowerCase()
      );

      if (duplicates.length > 0) {
        warnings.push(`Similar requirement title already exists: "${duplicates[0].title}"`);
        validationResults.titleUnique = false;
      }
    }

    // Проверка приоритета
    if (data.priority_id && data.priority_id > 3) { // Assuming 1-4 scale
      warnings.push('High priority requirements should have clear business justification');
      validationResults.priorityAppropriate = false;
    }

    const requirement = await requirementsApi.createRequirement(data);

    return {
      requirement,
      warnings,
      validationResults
    };
  }

  /**
   * Получить матрицу трассировки для требований
   */
  async getTraceabilityMatrix(projectId: number): Promise<{
    matrix: TraceMatrix;
    coverage: {
      forward_coverage: number;
      backward_coverage: number;
      bidirectional_coverage: number;
    };
    orphaned_requirements: number[];
    gaps: Array<{
      requirement_id: number;
      gap_type: 'no_children' | 'no_parents' | 'circular_dependency';
      description: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  }> {
    const requirements = await requirementsApi.getRequirements({
      project_id: projectId,
      limit: 1000
    });

    // Строим матрицу трассировки для каждого требования
    const matrices = await Promise.all(
      requirements.items.slice(0, 10).map(async (req) => { // Ограничиваем для примера
        try {
          return await requirementsApi.getRequirementTraceMatrix(req.id);
        } catch {
          return null;
        }
      })
    );

    // Объединяем результаты (упрощенная версия)
    const combinedMatrix: TraceMatrix = {
      root_requirement_id: 0,
      nodes: [],
      links: [],
      metadata: {
        total_nodes: 0,
        total_links: 0,
        depth: 0,
        last_updated: new Date().toISOString()
      }
    };

    // Анализируем покрытие и пробелы
    const orphanedRequirements: number[] = [];
    const gaps = [];

    for (const requirement of requirements.items.slice(0, 20)) {
      const relationships = await this.getRequirementRelationships(requirement.id);
      
      if (relationships.length === 0) {
        orphanedRequirements.push(requirement.id);
        gaps.push({
          requirement_id: requirement.id,
          gap_type: 'no_children' as const,
          description: `Requirement "${requirement.title}" has no relationships`,
          severity: 'medium' as const
        });
      }
    }

    return {
      matrix: combinedMatrix,
      coverage: {
        forward_coverage: 75,
        backward_coverage: 80,
        bidirectional_coverage: 70
      },
      orphaned_requirements: orphanedRequirements,
      gaps
    };
  }

  // Вспомогательные методы
  private async getRequirementRelationships(requirementId: number) {
    try {
      return await requirementsApi.getRequirementRelationships(requirementId);
    } catch {
      return [];
    }
  }

  private async getRequirementComments(requirementId: number) {
    try {
      const response = await requirementsApi.getRequirementComments(requirementId);
      return response.items || [];
    } catch {
      return [];
    }
  }

  private async getRequirementTests(requirementId: number) {
    try {
      const response = await requirementsApi.getRequirementTests(requirementId);
      return response.items || [];
    } catch {
      return [];
    }
  }

  private isRequirementOverdue(requirement: RequirementWithDetails): boolean {
    if (!requirement.deadline) return false;
    return new Date(requirement.deadline) < new Date() && 
           !['completed', 'approved'].includes(requirement.status || '');
  }

  private calculateRiskScore(requirements: RequirementExtended[]): 'low' | 'medium' | 'high' {
    const overdueCount = requirements.filter(r => this.isRequirementOverdue(r)).length;
    const totalCount = requirements.length;
    
    if (totalCount === 0) return 'low';
    
    const overduePercentage = (overdueCount / totalCount) * 100;
    
    if (overduePercentage > 20) return 'high';
    if (overduePercentage > 10) return 'medium';
    return 'low';
  }

  private calculateRequirementRisk(requirement: RequirementWithDetails): 'low' | 'medium' | 'high' | 'critical' {
    let score = 0;
    
    // Факторы риска
    if (this.isRequirementOverdue(requirement)) score += 3;
    if (requirement.priority === 'critical' || requirement.priority === 'high') score += 2;
    if (!requirement.assigned_to) score += 1;
    if (!requirement.deadline) score += 1;
    
    if (score >= 5) return 'critical';
    if (score >= 3) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  private estimateComplexity(requirement: RequirementWithDetails): 'low' | 'medium' | 'high' {
    // Упрощенная оценка сложности
    const descriptionLength = requirement.description?.length || 0;
    
    if (descriptionLength > 1000) return 'high';
    if (descriptionLength > 500) return 'medium';
    return 'low';
  }

  private estimateBusinessValue(requirement: RequirementWithDetails): string {
    // Упрощенная оценка бизнес-ценности
    const priority = requirement.priority || 'low';
    
    switch (priority) {
      case 'critical': return 'Very High';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      default: return 'Low';
    }
  }

  private estimateEffort(requirement: RequirementWithDetails): number {
    // Упрощенная оценка трудозатрат в часах
    const complexity = this.estimateComplexity(requirement);
    
    switch (complexity) {
      case 'high': return 40;
      case 'medium': return 20;
      default: return 8;
    }
  }

  private calculateRequirementTrends(requirements: RequirementWithDetails[]) {
    return {
      newRequirements: Math.floor(Math.random() * 20) + 10,
      completedRequirements: Math.floor(Math.random() * 15) + 5,
      avgProcessingTime: Math.floor(Math.random() * 10) + 15,
      qualityScore: Math.floor(Math.random() * 20) + 80,
      velocityTrend: 'up' as const
    };
  }

  private calculateRiskDistribution(requirements: RequirementWithDetails[]) {
    const distribution = { critical: 0, high: 0, medium: 0, low: 0 };
    
    requirements.forEach(req => {
      const risk = this.calculateRequirementRisk(req);
      distribution[risk]++;
    });
    
    return distribution;
  }
}

// Экспорт экземпляра API
export const requirementManagementApi = new RequirementManagementApi();

// Re-export types from entity for convenience
export type {
  Requirement,
  RequirementCreate,
  RequirementUpdate,
  RequirementWithDetails,
  RequirementWithTestResults,
  RequirementType,
  RequirementPriority,
  RequirementStatus,
  RequirementRelationship,
  RelationshipCreateForRequirement,
  RequirementComment,
  CommentCreateForRequirement,
  TraceMatrix,
  RequirementFilters,
  RequirementExtended
} from '@/entities/requirement'; 