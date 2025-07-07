// Release entity types - main exports for release functionality
// Re-export from release.types.ts and add missing types and helpers

export * from './release.types';
import type { Release } from './release.types';

// Additional types that may be needed for UI
export interface ReleaseBase {
  name: string;
  version: string;
  description?: string;
  project_id: number;
  status: string;
}

export interface ReleaseWithStats extends Release {
  total_requirements?: number;
  completed_requirements?: number;
  progress?: number;
  requirements_count?: number;
  test_pass_rate?: number;
}

export interface ReleaseCreateFromRequirements {
  name: string;
  version: string;
  project_id: number;
  requirement_ids: number[];
  description?: string;
  planned_date?: string;
}

export interface ReleaseSpecification {
  id: number;
  release_id: number;
  content: string;
  format: 'html' | 'pdf' | 'markdown';
  generated_at: string;
  download_url?: string;
}

export interface ReleaseChangelog {
  id: number;
  release_id: number;
  content: string;
  format: 'markdown' | 'html' | 'json';
  generated_at: string;
  sections: Array<{
    type: 'new_feature' | 'improvement' | 'bug_fix' | 'breaking_change';
    items: Array<{
      title: string;
      description?: string;
      requirement_id?: number;
    }>;
  }>;
}

export interface ReleaseRequirement {
  id: number;
  release_id: number;
  requirement_id: number;
  requirement_title: string;
  requirement_description?: string;
  status: string;
  priority: string;
  implementation_status: string;
  test_status: string;
  added_at: string;
  completed_at?: string;
}

// Constants
export const RELEASE_STATUSES = {
  DRAFT: 'draft',
  PLANNED: 'planned', 
  IN_PROGRESS: 'in_progress',
  TESTING: 'testing',
  READY: 'ready',
  PUBLISHED: 'published',
  RELEASED: 'released',
  CANCELLED: 'cancelled',
} as const;

// Helper functions
export const getReleaseProgress = (release: ReleaseWithStats): number => {
  if (release.progress !== undefined) {
    return release.progress;
  }
  
  if (release.total_requirements && release.completed_requirements !== undefined) {
    return Math.round((release.completed_requirements / release.total_requirements) * 100);
  }
  
  // Default progress based on status
  switch (release.status?.toLowerCase()) {
    case 'draft': return 0;
    case 'planned': return 10;
    case 'in_progress': return 50;
    case 'testing': return 80;
    case 'ready': return 95;
    case 'published':
    case 'released': return 100;
    case 'cancelled': return 0;
    default: return 0;
  }
};

export const isReleaseOverdue = (release: Release): boolean => {
  if (!release.planned_date) return false;
  const plannedDate = new Date(release.planned_date);
  const now = new Date();
  return plannedDate < now && !['published', 'released', 'cancelled'].includes(release.status?.toLowerCase());
};

export const getReleaseStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'draft': return '#8c8c8c';
    case 'planned': return '#1890ff';
    case 'in_progress': return '#fadb14';
    case 'testing': return '#fa8c16';
    case 'ready': return '#722ed1';
    case 'published': return '#52c41a';
    case 'released': return '#389e0d';
    case 'cancelled': return '#ff4d4f';
    default: return '#d9d9d9';
  }
};

export const formatReleaseDate = (date?: string): string => {
  if (!date) return 'Not set';
  
  const releaseDate = new Date(date);
  const now = new Date();
  const diffTime = releaseDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `Released ${Math.abs(diffDays)} days ago`;
  } else if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays <= 7) {
    return `In ${diffDays} days`;
  } else {
    return releaseDate.toLocaleDateString();
  }
};

export const getReleaseHealthScore = (release: ReleaseWithStats): 'good' | 'warning' | 'critical' => {
  const progress = getReleaseProgress(release);
  const isOverdue = isReleaseOverdue(release);
  
  if (isOverdue || progress < 30) return 'critical';
  if (progress < 70) return 'warning';
  return 'good';
};

export const canPublishRelease = (release: ReleaseWithStats): boolean => {
  const progress = getReleaseProgress(release);
  return progress >= 100 && release.status?.toLowerCase() === 'ready';
};

export const getReleaseVersionSuggestion = (lastVersion: string): string => {
  const versionParts = lastVersion.split('.');
  if (versionParts.length >= 3) {
    const patch = parseInt(versionParts[2]) + 1;
    return `${versionParts[0]}.${versionParts[1]}.${patch}`;
  }
  return '1.0.0';
}; 