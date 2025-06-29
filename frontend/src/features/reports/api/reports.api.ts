import { apiClient } from '../../../shared/api/client';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'project' | 'requirements' | 'testing' | 'release';
  parameters: Array<{
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean' | 'select';
    required: boolean;
    options?: Array<{ value: string; label: string }>;
  }>;
}

export interface GenerateReportRequest {
  templateId: string;
  projectId: string;
  parameters?: Record<string, any>;
  dateFrom?: string;
  dateTo?: string;
}

export interface ReportStatus {
  id: string;
  name: string;
  templateId: string;
  projectId: string;
  status: 'generating' | 'ready' | 'failed';
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  error?: string;
}

export interface ReportSummary {
  totalReports: number;
  readyReports: number;
  generatingReports: number;
  failedReports: number;
  recentReports: ReportStatus[];
}

class ReportsApi {
  // Get all available report templates
  async getTemplates(): Promise<ReportTemplate[]> {
    const response = await apiClient.get('/reports/templates');
    return response.data;
  }

  // Get specific report template
  async getTemplate(templateId: string): Promise<ReportTemplate> {
    const response = await apiClient.get(`/reports/templates/${templateId}`);
    return response.data;
  }

  // Generate a new report
  async generateReport(request: GenerateReportRequest): Promise<{ reportId: string }> {
    const response = await apiClient.post('/reports/generate', request);
    return response.data;
  }

  // Get all reports for a project
  async getProjectReports(projectId: string): Promise<ReportStatus[]> {
    const response = await apiClient.get(`/reports/projects/${projectId}`);
    return response.data;
  }

  // Get all reports for current user
  async getUserReports(): Promise<ReportStatus[]> {
    const response = await apiClient.get('/reports/my-reports');
    return response.data;
  }

  // Get specific report status
  async getReportStatus(reportId: string): Promise<ReportStatus> {
    const response = await apiClient.get(`/reports/${reportId}/status`);
    return response.data;
  }

  // Download report
  async downloadReport(reportId: string): Promise<Blob> {
    const response = await apiClient.get(`/reports/${reportId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Cancel report generation
  async cancelReport(reportId: string): Promise<void> {
    await apiClient.post(`/reports/${reportId}/cancel`);
  }

  // Delete report
  async deleteReport(reportId: string): Promise<void> {
    await apiClient.delete(`/reports/${reportId}`);
  }

  // Get reports summary/dashboard
  async getReportsSummary(): Promise<ReportSummary> {
    const response = await apiClient.get('/reports/summary');
    return response.data;
  }

  // Schedule report generation
  async scheduleReport(request: GenerateReportRequest & {
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly';
      dayOfWeek?: number; // 0-6 for weekly
      dayOfMonth?: number; // 1-31 for monthly
      time: string; // HH:mm format
    };
  }): Promise<{ scheduleId: string }> {
    const response = await apiClient.post('/reports/schedule', request);
    return response.data;
  }

  // Get scheduled reports
  async getScheduledReports(): Promise<Array<{
    id: string;
    templateId: string;
    projectId: string;
    schedule: any;
    nextRun: string;
    active: boolean;
  }>> {
    const response = await apiClient.get('/reports/scheduled');
    return response.data;
  }

  // Update scheduled report
  async updateScheduledReport(scheduleId: string, updates: any): Promise<void> {
    await apiClient.put(`/reports/scheduled/${scheduleId}`, updates);
  }

  // Delete scheduled report
  async deleteScheduledReport(scheduleId: string): Promise<void> {
    await apiClient.delete(`/reports/scheduled/${scheduleId}`);
  }
}

export const reportsApi = new ReportsApi(); 