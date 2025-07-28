// Демо-проект
export interface DemoProject {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'planning';
  progress: number;
  requirementsCount: number;
  testsCount: number;
  team: DemoUser[];
  startDate: string;
  endDate: string;
}

// Демо-пользователь
export interface DemoUser {
  id: string;
  name: string;
  role: 'admin' | 'project_manager' | 'analyst' | 'developer' | 'tester';
  avatar?: string;
  email: string;
  isOnline: boolean;
}

// Демо-требование
export interface DemoRequirement {
  id: string;
  title: string;
  description: string;
  type: 'functional' | 'non-functional' | 'technical';
  priority: 'high' | 'medium' | 'low';
  status: 'draft' | 'review' | 'approved' | 'implemented' | 'tested';
  assignee: DemoUser;
  projectId: string;
  createdDate: string;
  dueDate: string;
  progress: number;
}

// Демо-тест
export interface DemoTest {
  id: string;
  title: string;
  status: 'passed' | 'failed' | 'pending';
  requirementId: string;
  executedBy: DemoUser;
  executedDate: string;
}

// Демо-метрики
export interface DemoMetrics {
  totalProjects: number;
  activeProjects: number;
  totalRequirements: number;
  completedRequirements: number;
  totalTests: number;
  passedTests: number;
  teamMembers: number;
  avgProjectCompletion: number;
}

// Демо-активность
export interface DemoActivity {
  id: string;
  type: 'project_created' | 'requirement_updated' | 'test_executed' | 'user_joined';
  title: string;
  description: string;
  user: DemoUser;
  timestamp: string;
  projectId?: string;
  requirementId?: string;
} 