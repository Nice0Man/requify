// Test case entity types
export interface TestCase {
  id: string;
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  requirementId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestCaseRequest {
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  requirementId: string;
  priority: TestCase['priority'];
} 