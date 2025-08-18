// Release entity types
export interface ReleaseStats {
  total_requirements: number;
  completed_requirements: number;
  bugs_fixed?: number;
}

export interface Release {
  id: string;
  name: string;
  version: string;
  description: string;
  projectId: string;
  status:
    | "draft"
    | "planned"
    | "in_progress"
    | "ready"
    | "published"
    | "archived";
  plannedDate?: string;
  releaseDate?: string;
  stats?: ReleaseStats;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReleaseRequest {
  name: string;
  version: string;
  description: string;
  projectId: string;
  plannedDate: string;
}

export interface ReleaseFilters {
  search?: string;
  status?: Release["status"];
  projectId?: string;
}

export interface ReleaseUpdate {
  name?: string;
  version?: string;
  description?: string;
  projectId?: string;
  plannedDate?: string;
}

export interface ReleaseCreate {
  name: string;
  version: string;
  description: string;
  projectId: string;
  plannedDate: string;
}
