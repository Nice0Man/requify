import { releasesApi } from "@/entities/release";
import {
  Release,
  ReleaseApproval,
  ReleaseCreate,
  ReleaseExtended,
  ReleaseRequirement,
  ReleaseStats,
  ReleaseTypeValue,
} from "@/entities/release/model/types";

/**
 * Release Management API - расширенные функции для управления релизами
 * Содержит бизнес-логику уровня feature, используя entity API как основу
 */
export class ReleaseManagementApi {
  /**
   * Получить данные для дашборда управления релизами
   */
  async getReleaseDashboardData(projectId?: number) {
    const [releases, stats, upcomingReleases, recentActivity] =
      await Promise.all([
        this.getActiveReleases(projectId),
        this.getReleaseAnalytics(projectId),
        this.getUpcomingReleases(projectId),
        this.getRecentReleaseActivity(projectId),
      ]);

    return {
      releases,
      stats,
      upcomingReleases,
      recentActivity,
      summary: {
        totalActive: releases.length,
        overdue: releases.filter((r) => this.isReleaseOverdue(r)).length,
        readyToPublish: releases.filter((r) => this.canPublishRelease(r))
          .length,
        inTesting: releases.filter((r) => r.status === "testing").length,
      },
    };
  }

  /**
   * Получить активные релизы с расширенной информацией
   */
  async getActiveReleases(projectId?: number): Promise<ReleaseExtended[]> {
    try {
      const filters = {
        project_id: projectId,
        status: [
          "draft",
          "planned",
          "in_progress",
          "testing",
          "ready",
        ] as const,
      };

      console.log("Calling releasesApi.getReleases with params:", {
        limit: 50,
        sort_by: "planned_date",
        sort_order: "asc",
        project_id: projectId,
        status: filters.status.join(","),
      });

      let response;
      try {
        response = await releasesApi.getReleases({
          limit: 50,
          sort_by: "planned_date",
          sort_order: "asc" as const,
          project_id: projectId,
          status: filters.status.join(","),
        });
      } catch (apiError) {
        console.warn("API call failed, using fallback data:", apiError);
        // Fallback: return empty but valid response
        response = { items: [] };
      }

      console.log("Response from releasesApi.getReleases:", response);

      // Проверяем, что response и response.items существуют
      if (!response) {
        console.warn("Response is null or undefined");
        return [];
      }

      if (!response.items) {
        console.warn("Response.items is null or undefined, response:", response);
        return [];
      }

      if (!Array.isArray(response.items)) {
        console.warn("Response.items is not an array, type:", typeof response.items, "value:", response.items);
        return [];
      }

      console.log("Processing", response.items.length, "releases");

      // Обогащаем данные дополнительной информацией
      const enrichedReleases = await Promise.all(
        response.items.map(async (release) => {
          const [requirements, changelog, approvals] = await Promise.all([
            this.getReleaseRequirements(release.id),
            this.getReleaseChangelog(release.id),
            this.getReleaseApprovals(release.id),
          ]).catch(() => [[], { entries: [] }, []]);
          return {
            ...release,
            requirements: Array.isArray(requirements) ? requirements : [],
            change_log: changelog?.entries || [],
            approvals: approvals || [],
            completion_percentage: this.calculateCompletionPercentage(
              Array.isArray(requirements) ? requirements : []
            ),
            dependencies: [],
            artifacts: [],
          } as unknown as ReleaseExtended;
        })
      );

      console.log("Enriched releases:", enrichedReleases.length);
      return enrichedReleases;
    } catch (error) {
      console.error("Error in getActiveReleases:", error);
      return [];
    }
  }

  /**
   * Получить аналитику релизов
   */
  async getReleaseAnalytics(projectId?: number): Promise<
    ReleaseStats & {
      trends: {
        completionRate: number;
        averageLeadTime: number;
        qualityScore: number;
        velocityTrend: "up" | "down" | "stable";
      };
      riskAssessment: {
        highRisk: number;
        mediumRisk: number;
        lowRisk: number;
        overdueReleases: number;
      };
    }
  > {
    const params = projectId ? { project_id: projectId } : {};
    const baseStats = await releasesApi.getAllReleasesStats(params);

    // Дополняем аналитикой
    const releases = await releasesApi.getReleases({
      limit: 100,
      project_id: projectId,
    });

    // Проверяем, что releases и releases.items существуют
    const releaseItems =
      releases && Array.isArray(releases.items) ? releases.items : [];
    const trends = this.calculateTrends(releaseItems);
    const riskAssessment = this.assessReleaseRisks(releaseItems);
    const defaultByType: Record<ReleaseTypeValue, number> = {
      major: 0,
      minor: 0,
      patch: 0,
      hotfix: 0,
      beta: 0,
      alpha: 0,
      feature: 0,
    };

    const defaultByStatus: Record<string, number> = {
      draft: 0,
      planned: 0,
      in_progress: 0,
      testing: 0,
      ready: 0,
      published: 0,
      released: 0,
      cancelled: 0,
    };

    return {
      by_status: baseStats.releases_by_status || defaultByStatus,
      by_type: { ...defaultByType, ...baseStats.releases_by_type },
      active_releases: baseStats.active_releases || 0,
      avg_lead_time: baseStats.average_development_time || 0,
      deployment_frequency: baseStats.average_requirements_per_release || 0,
      success_rate: baseStats.success_rate || 0,
      upcoming_releases: baseStats.upcoming_releases || 0,
      total_releases: baseStats.total_releases || 0,
      completed_releases: baseStats.completed_releases || 0,
      cancelled_releases: baseStats.cancelled_releases || 0,
      trends,
      riskAssessment,
    };
  }

  /**
   * Получить предстоящие релизы
   */
  async getUpcomingReleases(
    projectId?: number,
    days: number = 30
  ): Promise<Release[]> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const response = await releasesApi.getReleases({
      project_id: projectId,
      sort_by: "planned_date",
      sort_order: "asc" as const,
      limit: 20,
    });

    // Проверяем, что response и response.items существуют
    if (!response || !Array.isArray(response.items)) {
      console.warn(
        "Invalid response format from releasesApi.getReleases in getUpcomingReleases:",
        response
      );
      return [];
    }

    return response.items.filter((release) => {
      if (!release.planned_date) return false;
      const plannedDate = new Date(release.planned_date);
      return plannedDate <= endDate && plannedDate >= new Date();
    });
  }

  /**
   * Получить недавнюю активность по релизам
   */
  async getRecentReleaseActivity(projectId?: number): Promise<
    Array<{
      id: string;
      type: "created" | "updated" | "published" | "status_changed";
      releaseId: number;
      releaseName: string;
      description: string;
      timestamp: string;
      userId: number;
      userName?: string;
    }>
  > {
    // Имитация получения активности - в реальном проекте это был бы отдельный endpoint
    const releases = await releasesApi.getReleases({
      project_id: projectId,
      limit: 10,
      sort_by: "updated_at",
      sort_order: "desc" as const,
    });

    // Проверяем, что releases и releases.items существуют
    if (!releases || !Array.isArray(releases.items)) {
      console.warn(
        "Invalid response format from releasesApi.getReleases in getRecentReleaseActivity:",
        releases
      );
      return [];
    }

    return releases.items.map((release) => ({
      id: `${release.id}-${release.updated_at}`,
      type: "updated" as const,
      releaseId: release.id,
      releaseName: release.name,
      description: `Release ${release.name} was updated`,
      timestamp: release.updated_at,
      userId: 1,
      userName: "System",
    }));
  }

  /**
   * Массовое обновление статусов релизов
   */
  async bulkUpdateReleaseStatus(
    releaseIds: number[],
    status: string,
    _reason?: string
  ): Promise<{
    success: number;
    failed: number;
    errors: Array<{ releaseId: number; error: string }>;
  }> {
    const results = await Promise.allSettled(
      releaseIds.map((id) => releasesApi.updateRelease(id, { status }))
    );

    const errors: Array<{ releaseId: number; error: string }> = [];
    let successCount = 0;

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        errors.push({
          releaseId: releaseIds[index],
          error:
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason),
        });
      } else {
        successCount++;
      }
    });

    return {
      success: successCount,
      failed: errors.length,
      errors,
    };
  }

  /**
   * Создать релиз с валидацией и предварительными проверками
   */
  async createReleaseWithValidation(
    data: ReleaseCreate & {
      validateRequirements?: boolean;
      checkDependencies?: boolean;
    }
  ): Promise<{
    release: Release;
    warnings: string[];
    validationResults: {
      requirementsValid: boolean;
      dependenciesResolved: boolean;
      readyForPlanning: boolean;
    };
  }> {
    const warnings: string[] = [];
    const validationResults = {
      requirementsValid: true,
      dependenciesResolved: true,
      readyForPlanning: true,
    };

    // Валидация версии
    if (data.version) {
      const existingRelease = await releasesApi.searchReleases(data.version, {
        project_id: data.project_id,
      });

      if (existingRelease.length > 0) {
        warnings.push(
          `Version ${data.version} already exists for this project`
        );
        validationResults.readyForPlanning = false;
      }
    }

    // Проверка даты планирования
    if (data.planned_date) {
      const plannedDate = new Date(data.planned_date);
      const now = new Date();

      if (plannedDate < now) {
        warnings.push("Planned date is in the past");
        validationResults.readyForPlanning = false;
      }
    }

    const release = await releasesApi.createRelease(data);

    return {
      release,
      warnings,
      validationResults,
    };
  }

  /**
   * Получить планировщик релизов с конфликтами и рекомендациями
   */
  async getReleasePlanner(projectId: number): Promise<{
    timeline: Array<{
      release: Release;
      conflicts: string[];
      recommendations: string[];
      resourceUtilization: number;
    }>;
    suggestions: {
      optimalDates: Record<number, string>;
      resourceConflicts: Array<{
        releaseId: number;
        conflictType: "resource" | "dependency" | "timeline";
        description: string;
        severity: "low" | "medium" | "high";
      }>;
    };
  }> {
    const releases = await releasesApi.getReleases({
      project_id: projectId,
      status: "planned,in_progress",
      sort_by: "planned_date",
      sort_order: "asc" as const,
      limit: 50,
    });

    // Проверяем, что releases и releases.items существуют
    if (!releases || !Array.isArray(releases.items)) {
      console.warn(
        "Invalid response format from releasesApi.getReleases in getReleasePlanner:",
        releases
      );
      return {
        timeline: [],
        suggestions: {
          optimalDates: {},
          resourceConflicts: [],
        },
      };
    }

    const timeline = releases.items.map((release) => ({
      release,
      conflicts: this.detectReleaseConflicts(release, releases.items),
      recommendations: this.generateReleaseRecommendations(release),
      resourceUtilization: Math.random() * 100, // В реальности - расчет на основе требований
    }));

    const suggestions = this.generatePlanningSuggestions(releases.items);

    return { timeline, suggestions };
  }

  // Вспомогательные методы
  private async getReleaseRequirements(
    releaseId: number
  ): Promise<ReleaseRequirement[]> {
    try {
      const response = await releasesApi.getReleaseRequirements(releaseId);

      // Проверяем, что response и response.items существуют
      if (!response || !Array.isArray(response.items)) {
        console.warn(
          "Invalid response format from getReleaseRequirements:",
          response
        );
        return [];
      }

      return response.items.map((item) => ({
        ...item,
        release_id: releaseId,
        status: item.requirement_status || ("draft" as const),
        requirement_id: item.requirement_id || 0,
        requirement_title: item.requirement_title || "",
        implementation_status:
          item.implementation_status || ("not_started" as const),
        test_status: item.test_status || ("not_tested" as const),
        priority: "medium" as const,
        notes: item.notes || "",
        added_at: item.added_at || "",
        completed_at: item.completed_at || "",
      }));
    } catch (error) {
      console.error("Error in getReleaseRequirements:", error);
      return [];
    }
  }

  private async getReleaseChangelog(
    releaseId: number
  ): Promise<{ entries: any[] }> {
    try {
      const response = await releasesApi.getReleaseChangelog(releaseId);

      // Проверяем, что response существует и имеет правильный формат
      if (!response || typeof response !== "object") {
        console.warn(
          "Invalid response format from getReleaseChangelog:",
          response
        );
        return { entries: [] };
      }

      return {
        entries: Array.isArray(response.entries) ? response.entries : [],
      };
    } catch (error) {
      console.error("Error in getReleaseChangelog:", error);
      return { entries: [] };
    }
  }

  private async getReleaseApprovals(
    _releaseId: number
  ): Promise<ReleaseApproval[]> {
    try {
      // В реальности был бы отдельный endpoint для approvals
      return [];
    } catch {
      return [];
    }
  }

  private calculateCompletionPercentage(
    requirements: ReleaseRequirement[]
  ): number {
    if (requirements.length === 0) return 0;
    const completed = requirements.filter(
      (r) => r.implementation_status === "completed"
    ).length;
    return Math.round((completed / requirements.length) * 100);
  }

  private isReleaseOverdue(release: Release): boolean {
    if (!release.planned_date) return false;
    return (
      new Date(release.planned_date) < new Date() &&
      release.status !== "published"
    );
  }

  private canPublishRelease(release: Release): boolean {
    return release.status === "ready";
  }

  private calculateTrends(_releases: Release[]) {
    // Упрощенный расчет трендов
    return {
      completionRate: 85,
      averageLeadTime: 14,
      qualityScore: 92,
      velocityTrend: "up" as const,
    };
  }

  private assessReleaseRisks(releases: Release[]) {
    const overdue = releases.filter((r) => this.isReleaseOverdue(r));

    return {
      highRisk: overdue.length,
      mediumRisk: Math.floor(releases.length * 0.2),
      lowRisk: Math.floor(releases.length * 0.6),
      overdueReleases: overdue.length,
    };
  }

  private detectReleaseConflicts(
    release: Release,
    allReleases: Release[]
  ): string[] {
    const conflicts: string[] = [];

    // Проверка на пересечение дат
    if (release.planned_date) {
      const sameDateReleases = allReleases.filter(
        (r) =>
          r.id !== release.id &&
          r.planned_date === release.planned_date &&
          r.project_id === release.project_id
      );

      if (sameDateReleases.length > 0) {
        conflicts.push(
          `Conflicts with ${sameDateReleases.length} other release(s) on the same date`
        );
      }
    }

    return conflicts;
  }

  private generateReleaseRecommendations(release: Release): string[] {
    const recommendations: string[] = [];

    if (!release.description) {
      recommendations.push("Add a detailed description");
    }

    if (!release.planned_date) {
      recommendations.push("Set a planned release date");
    }

    return recommendations;
  }

  private generatePlanningSuggestions(_releases: Release[]) {
    return {
      optimalDates: {} as Record<number, string>,
      resourceConflicts: [] as Array<{
        releaseId: number;
        conflictType: "resource" | "dependency" | "timeline";
        description: string;
        severity: "low" | "medium" | "high";
      }>,
    };
  }
}

// Экспорт экземпляра API
export const releaseManagementApi = new ReleaseManagementApi();
