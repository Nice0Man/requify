// Release entity types - используют контракты из shared/api
// В соответствии с принципами FSD, entities используют типы из shared

import type {
  Release as ReleaseSchema,
  ReleaseCreate as ReleaseCreateSchema,
  ReleaseUpdate as ReleaseUpdateSchema,
  ReleaseWithStats as ReleaseWithStatsSchema,
  ReleaseBase as ReleaseBaseSchema,
  ReleaseCreateFromRequirements as ReleaseCreateFromRequirementsSchema,
  ReleaseSpecification as ReleaseSpecificationSchema,
  ReleaseChangelog as ReleaseChangelogSchema,
  ReleaseRequirement as ReleaseRequirementSchema,
  ReleaseStatus,
} from '@/shared/api/types';

// =============================================================================
// Re-export API types for entity usage
// =============================================================================

export type ReleaseBase = ReleaseBaseSchema;
export type Release = ReleaseSchema;
export type ReleaseCreate = ReleaseCreateSchema;
export type ReleaseUpdate = ReleaseUpdateSchema;
export type ReleaseWithStats = ReleaseWithStatsSchema;
export type ReleaseCreateFromRequirements = ReleaseCreateFromRequirementsSchema;
export type ReleaseSpecification = ReleaseSpecificationSchema;
export type ReleaseChangelog = ReleaseChangelogSchema;
export type ReleaseRequirement = ReleaseRequirementSchema;

// =============================================================================
// Release Status Types (UI specific)
// =============================================================================

export type { ReleaseStatus };

export const RELEASE_STATUSES: Record<ReleaseStatus, string> = {
  planning: 'Планирование',
  development: 'Разработка',
  testing: 'Тестирование',
  staging: 'Стейджинг',
  production: 'Продакшн',
  released: 'Выпущен',
  archived: 'Архивирован',
  cancelled: 'Отменен',
};

// =============================================================================
// Extended UI Types (не в API, только для UI)
// =============================================================================

export interface ReleaseWithDetails extends ReleaseWithStats {
  project_name?: string;
  author_name?: string;
  requirements_details?: Array<{
    id: number;
    title: string;
    status: string;
    priority: string;
    completion_percentage: number;
  }>;
  team_members?: Array<{
    id: number;
    name: string;
    role: string;
    email: string;
  }>;
  milestones?: Array<{
    id: number;
    name: string;
    date: string;
    completed: boolean;
    description?: string;
  }>;
}

// =============================================================================
// UI State Types
// =============================================================================

export interface ReleaseState {
  releases: Release[];
  currentRelease: Release | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  per_page: number;
}

export interface ReleaseFilters {
  search?: string;
  project_id?: number;
  status?: ReleaseStatus[];
  author_id?: number;
  created_from?: string;
  created_to?: string;
  release_date_from?: string;
  release_date_to?: string;
  tags?: string[];
  version_pattern?: string;
}

// =============================================================================
// Release Progress and Metrics (UI specific)
// =============================================================================

export interface ReleaseMetrics {
  total_requirements: number;
  completed_requirements: number;
  in_progress_requirements: number;
  pending_requirements: number;
  test_coverage: number;
  quality_score: number;
  completion_rate: number;
  estimated_effort: number;
  actual_effort: number;
  days_remaining: number;
  is_on_schedule: boolean;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

// =============================================================================
// UI Helper Functions
// =============================================================================

export const getReleaseProgress = (release: ReleaseWithStats): number => {
  if (release.total_requirements === 0) return 0;
  return Math.round((release.requirements_completed / release.total_requirements) * 100);
};

export const isReleaseOverdue = (release: Release): boolean => {
  if (!release.release_date) return false;
  const releaseDate = new Date(release.release_date);
  const now = new Date();
  return releaseDate < now && release.status !== 'released';
};

export const getReleaseStatusColor = (status: ReleaseStatus): string => {
  switch (status) {
    case 'planning': return '#1890ff';
    case 'development': return '#fadb14';
    case 'testing': return '#fa8c16';
    case 'staging': return '#722ed1';
    case 'production': return '#13c2c2';
    case 'released': return '#52c41a';
    case 'archived': return '#8c8c8c';
    case 'cancelled': return '#ff4d4f';
    default: return '#d9d9d9';
  }
};

export const formatReleaseDate = (date?: string): string => {
  if (!date) return 'Не установлена';
  
  const releaseDate = new Date(date);
  const now = new Date();
  const diffTime = releaseDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `Просрочен на ${Math.abs(diffDays)} дн.`;
  } else if (diffDays === 0) {
    return 'Сегодня';
  } else if (diffDays === 1) {
    return 'Завтра';
  } else if (diffDays <= 7) {
    return `Через ${diffDays} дн.`;
  } else {
    return releaseDate.toLocaleDateString('ru-RU');
  }
};

export const getReleaseHealthScore = (release: ReleaseWithStats): 'good' | 'warning' | 'critical' => {
  const progress = getReleaseProgress(release);
  const isOverdue = isReleaseOverdue(release);
  
  if (isOverdue) return 'critical';
  if (progress >= 80) return 'good';
  if (progress >= 50) return 'warning';
  return 'critical';
};

export const canPublishRelease = (release: Release): boolean => {
  return release.status === 'production' && !isReleaseOverdue(release);
};

export const getReleaseVersionSuggestion = (existingVersions: string[]): string => {
  if (existingVersions.length === 0) return '1.0.0';
  
  // Simple version increment logic - можно улучшить
  const lastVersion = existingVersions
    .map(v => v.split('.').map(Number))
    .sort((a, b) => {
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const diff = (a[i] || 0) - (b[i] || 0);
        if (diff !== 0) return diff;
      }
      return 0;
    })
    .pop();
  
  if (!lastVersion) return '1.0.0';
  
  return `${lastVersion[0]}.${lastVersion[1]}.${(lastVersion[2] || 0) + 1}`;
}; 