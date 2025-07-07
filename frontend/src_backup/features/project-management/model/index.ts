// Project management model exports
export { useProjectManagement, useProjectForm } from './project-management.hooks';
export type { 
  ProjectManagementState,
  ProjectFormData
} from './project-management.types';

// Helper functions
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'active': '#52c41a',
    'inactive': '#d9d9d9',
    'planning': '#1890ff',
    'development': '#722ed1',
    'testing': '#fa8c16',
    'completed': '#52c41a',
    'cancelled': '#ff4d4f',
    'on_hold': '#fadb14',
    'draft': '#d9d9d9',
    'archived': '#8c8c8c',
  };
  
  return statusColors[status.toLowerCase()] || '#d9d9d9';
}; 