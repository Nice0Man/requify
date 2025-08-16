export interface ReleaseManagementState {
  releases: any[];
  selectedRelease: any | null;
  isPending: boolean;
  error: string | null;
}

export interface ReleaseFormData {
  name: string;
  version: string;
  description: string;
  status: string;
  projectId: string;
  releaseDate: string;
}

export interface ReleaseFilters {
  search?: string;
  status?: string;
  projectId?: string;
  version?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface Release {
  id: string;
  name: string;
  version: string;
  description?: string;
  status: string;
  projectId: string;
  releaseDate: string;
  createdAt: string;
  updatedAt: string;
  features?: string[];
  bugfixes?: string[];
}

export interface CreateReleaseData {
  name: string;
  version: string;
  description?: string;
  status: string;
  projectId: string;
  releaseDate: string;
}

export interface UpdateReleaseData {
  name?: string;
  version?: string;
  description?: string;
  status?: string;
  releaseDate?: string;
}

export interface ReleaseStats {
  totalCount: number;
  statusDistribution: Record<string, number>;
  recentReleases: number;
  upcomingReleases: number;
}
