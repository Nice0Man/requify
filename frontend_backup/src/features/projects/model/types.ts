export interface ProjectManagementState {
  projects: any[];
  selectedProject: any | null;
  isPending: boolean;
  error: string | null;
}

export interface ProjectFormData {
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  teamMembers: string[];
}
