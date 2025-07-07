export interface RequirementManagementState {
  requirements: any[];
  selectedRequirement: any | null;
  isPending: boolean;
  error: string | null;
}

export interface RequirementFormData {
  title: string;
  description: string;
  priority: string;
  status: string;
  projectId: string;
}
