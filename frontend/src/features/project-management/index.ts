// Project management feature exports - project CRUD and management using project entity

// Export project management API
export { projectManagementApi } from './api';

// Export project management models and hooks  
export { useProjectManagement, useProjectForm, getStatusColor } from './model';
export type { 
  ProjectManagementState,
  ProjectFormData
} from './model';

// Export project management UI components
export { 
  ProjectManagementDashboard,
  ProjectForm,
  ProjectList,
  ProjectDetails,
  ProjectSettings
} from './ui'; 