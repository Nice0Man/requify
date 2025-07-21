// Release entity types
export interface Release {
  releaseDate(releaseDate: any): import("react").ReactNode;
  id: string;
  name: string;
  version: string;
  description: string;
  projectId: string;
  status: 'planned' | 'in_progress' | 'testing' | 'released' | 'cancelled';
  plannedDate: string;
  actualDate?: string;
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