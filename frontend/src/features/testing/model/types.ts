export interface TestManagementState {
  testCases: any[];
  selectedTestCase: any | null;
  isPending: boolean;
  error: string | null;
}

export interface TestCaseFormData {
  title: string;
  description: string;
  priority: string;
  status: string;
  projectId: string;
  steps: string[];
}
