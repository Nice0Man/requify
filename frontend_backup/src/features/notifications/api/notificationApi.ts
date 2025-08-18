import { client } from '@/app/providers/client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'read' | 'unread' | 'archived';
  createdAt: string;
  userId: string;
  actionUrl?: string;
}

export interface NotificationFilters {
  status?: 'read' | 'unread' | 'archived';
  type?: string;
  userId?: string;
  limit?: number;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId: string;
  actionUrl?: string;
}

export const notificationApi = {
  getNotifications: async (filters?: NotificationFilters): Promise<Notification[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await client.get(`/notifications?${params}`);
    return response.data;
  },

  getNotification: async (id: string): Promise<Notification> => {
    const response = await client.get(`/notifications/${id}`);
    return response.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await client.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAsUnread: async (id: string): Promise<Notification> => {
    const response = await client.patch(`/notifications/${id}/unread`);
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await client.patch(`/notifications/read-all`);
  },

  archiveNotification: async (id: string): Promise<Notification> => {
    const response = await client.patch(`/notifications/${id}/archive`);
    return response.data;
  },

  deleteNotification: async (id: string): Promise<void> => {
    await client.delete(`/notifications/${id}`);
  },

  createNotification: async (data: CreateNotificationRequest): Promise<Notification> => {
    const response = await client.post('/notifications', data);
    return response.data;
  },

  bulkMarkAsRead: async (ids: string[]): Promise<void> => {
    await client.patch('/notifications/bulk/read', { ids });
  },

  bulkArchive: async (ids: string[]): Promise<void> => {
    await client.patch('/notifications/bulk/archive', { ids });
  },

  bulkDelete: async (ids: string[]): Promise<void> => {
    await client.delete('/notifications/bulk', { data: { ids } });
  },

  getStats: async (): Promise<{ unreadCount: number; totalCount: number }> => {
    const response = await client.get('/notifications/stats');
    return response.data;
  },

  getPreferences: async (userId: string): Promise<NotificationPreferences> => {
    const response = await client.get(`/notifications/preferences/${userId}`);
    return response.data;
  },

  updateNotificationPreferences: async (userId: string, preferences: NotificationPreferences): Promise<NotificationPreferences> => {
    const response = await client.put(`/notifications/preferences/${userId}`, preferences);
    return response.data;
  },

  testNotification: async (data: CreateNotificationRequest): Promise<void> => {
    await client.post('/notifications/test', data);
  },

  subscribeToWebPush: async (subscription: any): Promise<void> => {
    await client.post('/notifications/web-push/subscribe', { subscription });
  },

  unsubscribeFromWebPush: async (endpoint: string): Promise<void> => {
    await client.post('/notifications/web-push/unsubscribe', { endpoint });
  },
}; 
