import { useState, useEffect, useCallback } from 'react';
import { 
  notificationManagementApi, 
  Notification, 
  NotificationPreferences 
} from '../api/notification-management.api';

/**
 * Hook for managing user notifications
 */
export function useNotifications() {
  const [state, setState] = useState<{
    notifications: Notification[];
    unreadCount: number;
    total: number;
    loading: boolean;
    error: string | null;
  }>({
    notifications: [],
    unreadCount: 0,
    total: 0,
    loading: false,
    error: null,
  });

  const loadNotifications = useCallback(async (params?: {
    unread_only?: boolean;
    type?: string;
  }) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await notificationManagementApi.getUserNotifications(params);
      setState(prev => ({
        ...prev,
        notifications: data.notifications,
        unreadCount: data.unread_count,
        total: data.total,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load notifications',
      }));
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationManagementApi.markAsRead(notificationId);
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationManagementApi.markAllAsRead();
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await notificationManagementApi.deleteNotification(notificationId);
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== notificationId),
        total: prev.total - 1,
        unreadCount: prev.notifications.find(n => n.id === notificationId && !n.read) 
          ? prev.unreadCount - 1 
          : prev.unreadCount,
      }));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    ...state,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

/**
 * Hook for managing notification preferences
 */
export function useNotificationPreferences() {
  const [state, setState] = useState<{
    preferences: NotificationPreferences | null;
    loading: boolean;
    error: string | null;
  }>({
    preferences: null,
    loading: false,
    error: null,
  });

  const loadPreferences = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const preferences = await notificationManagementApi.getNotificationPreferences();
      setState(prev => ({
        ...prev,
        preferences,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load preferences',
      }));
    }
  }, []);

  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    if (!state.preferences) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const updatedPreferences = await notificationManagementApi.updateNotificationPreferences(updates);
      setState(prev => ({
        ...prev,
        preferences: updatedPreferences,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update preferences',
      }));
    }
  }, [state.preferences]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    ...state,
    loadPreferences,
    updatePreferences,
  };
}

/**
 * Main notification management hook
 */
export function useNotificationManagement() {
  const notifications = useNotifications();
  const preferences = useNotificationPreferences();

  const createNotification = useCallback(async (data: {
    title: string;
    message: string;
    type: string;
    priority?: 'low' | 'normal' | 'high';
    user_id: number;
    metadata?: any;
  }) => {
    try {
      const notification = await notificationManagementApi.createNotification(data);
      // Refresh notifications after creation
      await notifications.loadNotifications();
      return notification;
    } catch (error) {
      throw error;
    }
  }, [notifications]);

  return {
    notifications,
    preferences,
    createNotification,
  };
} 