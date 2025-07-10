import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { Add, FolderOpen, Assignment, RocketLaunch } from '@mui/icons-material';
import { QuickAction, NotificationItem, SearchResult } from './types';

export const useHeaderSearch = () => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: `Проект "${searchQuery}"`,
          type: 'project',
          url: '/projects/1',
          description: 'Основной проект разработки',
        },
        {
          id: '2', 
          title: `Требование REQ-${searchQuery}`,
          type: 'requirement',
          url: '/requirements/2',
          description: 'Функциональное требование',
        },
      ].filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setResults(mockResults);
      setLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [query, performSearch]);

  return {
    query,
    setQuery,
    focused,
    setFocused,
    results,
    loading,
    performSearch,
  };
};

export const useQuickActions = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'new-project',
      label: 'Новый проект',
      icon: Add,
      action: () => navigate('/projects/new'),
      color: theme.palette.primary.main,
    },
    {
      id: 'add-requirement',
      label: 'Добавить требование',
      icon: Assignment,
      action: () => navigate('/requirements/new'),
      color: theme.palette.success.main,
    },
    {
      id: 'create-release',
      label: 'Создать релиз',
      icon: RocketLaunch,
      action: () => navigate('/releases/new'),
      color: theme.palette.info.main,
    },
    {
      id: 'open-projects',
      label: 'Открыть проекты',
      icon: FolderOpen,
      action: () => navigate('/projects'),
      color: theme.palette.secondary.main,
    },
  ], [navigate, theme]);

  return { quickActions };
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const mockNotifications: NotificationItem[] = useMemo(() => [
    {
      id: '1',
      title: 'Новое требование',
      message: 'REQ-123 требует вашего внимания',
      time: '5 мин назад',
      type: 'info',
      actionUrl: '/requirements/123',
    },
    {
      id: '2',
      title: 'Обновление проекта',
      message: 'Проект Alpha обновлен',
      time: '1 час назад',
      type: 'success',
      actionUrl: '/projects/alpha',
    },
    {
      id: '3',
      title: 'Релиз готов',
      message: 'Релиз v1.2.0 готов к развертыванию',
      time: '2 часа назад',
      type: 'warning',
      actionUrl: '/releases/v1.2.0',
    },
    {
      id: '4',
      title: 'Системное уведомление',
      message: 'Запланированное обслуживание в 02:00',
      time: '3 часа назад',
      type: 'info',
    },
  ], []);

  useEffect(() => {
    setNotifications(mockNotifications);
  }, [mockNotifications]);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length,
    [notifications]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, [mockNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    fetchNotifications,
  };
};

export const useHeader = () => {
  const search = useHeaderSearch();
  const { quickActions } = useQuickActions();
  const notifications = useNotifications();

  return {
    search,
    quickActions,
    notifications,
  };
}; 