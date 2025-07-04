import { apiClient } from '../../../shared/api/client';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
  actions?: NotificationAction[];
  relatedEntity?: {
    type: 'project' | 'requirement' | 'test' | 'release' | 'user';
    id: string;
    name: string;
    url?: string;
  };
  sender?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  url?: string;
  confirmationMessage?: string;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  categories: {
    projectUpdates: boolean;
    requirementChanges: boolean;
    testResults: boolean;
    releaseAnnouncements: boolean;
    mentions: boolean;
    assignments: boolean;
    systemAlerts: boolean;
    comments: boolean;
    deadlines: boolean;
    approvals: boolean;
  };
  frequency: {
    immediate: boolean;
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    timezone: string;
  };
  channels: {
    email: {
      enabled: boolean;
      address: string;
    };
    slack: {
      enabled: boolean;
      webhookUrl?: string;
      channel?: string;
    };
    teams: {
      enabled: boolean;
      webhookUrl?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSummary {
  totalCount: number;
  unreadCount: number;
  categoryCounts: {
    info: number;
    success: number;
    warning: number;
    error: number;
  };
  recentNotifications: Notification[];
}

export interface CreateNotificationRequest {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  recipientIds?: string[];
  recipientGroups?: string[];
  actions?: Omit<NotificationAction, 'id'>[];
  relatedEntity?: {
    type: string;
    id: string;
    name: string;
    url?: string;
  };
  expiresAt?: string;
  metadata?: Record<string, any>;
  sendEmail?: boolean;
  sendPush?: boolean;
  sendSms?: boolean;
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: Array<'info' | 'success' | 'warning' | 'error'>;
  categories?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  senderIds?: string[];
  relatedEntityTypes?: string[];
  relatedEntityIds?: string[];
}

export interface NotificationSearchParams {
  query?: string;
  filters?: NotificationFilters;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'type';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

class NotificationsApi {
  // Get all notifications for current user
  async getNotifications(params?: NotificationSearchParams): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const response = await apiClient.get<{
      notifications: Notification[];
      total: number;
      page: number;
      limit: number;
      hasNext: boolean;
      hasPrev: boolean;
    }>('/notifications', { params });
    return response.data;
  }

  // Get notification summary/counts
  async getNotificationSummary(): Promise<NotificationSummary> {
    const response = await apiClient.get<NotificationSummary>('/notifications/summary');
    return response.data;
  }

  // Get specific notification
  async getNotification(notificationId: string): Promise<Notification> {
    const response = await apiClient.get<Notification>(`/notifications/${notificationId}`);
    return response.data;
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.put<void>(`/notifications/${notificationId}/read`);
  }

  // Mark notification as unread
  async markAsUnread(notificationId: string): Promise<void> {
    await apiClient.put<void>(`/notifications/${notificationId}/unread`);
  }

  // Mark multiple notifications as read
  async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    await apiClient.put<void>('/notifications/bulk/read', { notificationIds });
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await apiClient.put<void>('/notifications/all/read');
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete<void>(`/notifications/${notificationId}`);
  }

  // Delete multiple notifications
  async deleteMultiple(notificationIds: string[]): Promise<void> {
    await apiClient.delete<void>('/notifications/bulk', { data: { notificationIds } });
  }

  // Clear all notifications
  async clearAll(): Promise<void> {
    await apiClient.delete<void>('/notifications/all');
  }

  // Execute notification action
  async executeAction(notificationId: string, actionId: string): Promise<{
    success: boolean;
    result?: any;
    message?: string;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      result?: any;
      message?: string;
    }>(`/notifications/${notificationId}/actions/${actionId}`);
    return response.data;
  }

  // Get notification settings
  async getSettings(): Promise<NotificationSettings> {
    const response = await apiClient.get<NotificationSettings>('/notifications/settings');
    return response.data;
  }

  // Update notification settings
  async updateSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const response = await apiClient.put<NotificationSettings>('/notifications/settings', settings);
    return response.data;
  }

  // Create notification (admin/system use)
  async createNotification(request: CreateNotificationRequest): Promise<{
    notificationId: string;
    recipientCount: number;
  }> {
    const response = await apiClient.post<{
      notificationId: string;
      recipientCount: number;
    }>('/notifications', request);
    return response.data;
  }

  // Subscribe to real-time notifications
  async subscribeToRealTime(): Promise<EventSource> {
    const token = localStorage.getItem('access_token');
    const eventSource = new EventSource(`/api/notifications/stream?token=${token}`);
    
    return eventSource;
  }

  // Test notification delivery
  async testNotification(channel: 'email' | 'push' | 'sms'): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>(`/notifications/test/${channel}`);
    return response.data;
  }

  // Get notification templates (admin use)
  async getTemplates(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    template: {
      title: string;
      message: string;
      type: 'info' | 'success' | 'warning' | 'error';
    };
    variables: string[];
    isActive: boolean;
  }>> {
    const response = await apiClient.get<Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      template: {
        title: string;
        message: string;
        type: 'info' | 'success' | 'warning' | 'error';
      };
      variables: string[];
      isActive: boolean;
    }>>('/notifications/templates');
    return response.data;
  }

  // Create notification from template
  async createFromTemplate(templateId: string, variables: Record<string, any>, recipientIds: string[]): Promise<{
    notificationId: string;
    recipientCount: number;
  }> {
    const response = await apiClient.post<{
      notificationId: string;
      recipientCount: number;
    }>(`/notifications/templates/${templateId}/send`, {
      variables,
      recipientIds,
    });
    return response.data;
  }

  // Schedule notification
  async scheduleNotification(request: CreateNotificationRequest & {
    scheduledFor: string;
    timezone?: string;
  }): Promise<{
    scheduledNotificationId: string;
  }> {
    const response = await apiClient.post<{
      scheduledNotificationId: string;
    }>('/notifications/schedule', request);
    return response.data;
  }

  // Get scheduled notifications
  async getScheduledNotifications(): Promise<Array<{
    id: string;
    notification: CreateNotificationRequest;
    scheduledFor: string;
    timezone: string;
    status: 'pending' | 'sent' | 'failed' | 'cancelled';
    createdAt: string;
    sentAt?: string;
    error?: string;
  }>> {
    const response = await apiClient.get<Array<{
      id: string;
      notification: CreateNotificationRequest;
      scheduledFor: string;
      timezone: string;
      status: 'pending' | 'sent' | 'failed' | 'cancelled';
      createdAt: string;
      sentAt?: string;
      error?: string;
    }>>('/notifications/scheduled');
    return response.data;
  }

  // Cancel scheduled notification
  async cancelScheduledNotification(scheduledNotificationId: string): Promise<void> {
    await apiClient.delete<void>(`/notifications/scheduled/${scheduledNotificationId}`);
  }

  // Get notification analytics
  async getAnalytics(period: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<{
    totalSent: number;
    totalRead: number;
    readRate: number;
    averageReadTime: number;
    typeBreakdown: Record<string, number>;
    categoryBreakdown: Record<string, number>;
    channelBreakdown: Record<string, number>;
    timeline: Array<{
      date: string;
      sent: number;
      read: number;
    }>;
  }> {
    const response = await apiClient.get<{
      totalSent: number;
      totalRead: number;
      readRate: number;
      averageReadTime: number;
      typeBreakdown: Record<string, number>;
      categoryBreakdown: Record<string, number>;
      channelBreakdown: Record<string, number>;
      timeline: Array<{
        date: string;
        sent: number;
        read: number;
      }>;
    }>(`/notifications/analytics?period=${period}`);
    return response.data;
  }
}

export const notificationsApi = new NotificationsApi(); 