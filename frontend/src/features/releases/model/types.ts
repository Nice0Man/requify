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
