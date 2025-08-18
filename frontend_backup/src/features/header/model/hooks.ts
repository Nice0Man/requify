import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";
import { Add, FolderOpen, Assignment, RocketLaunch } from "@mui/icons-material";
import { HeaderAction, NotificationItem, SearchResult } from "./types";
import { projectApi } from "@/features/projects/api/projectApi";

export const useHeaderSearch = () => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setResults(await projectApi.search(searchQuery));
    setLoading(false);
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

export const useHeaderActions = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const quickActions: HeaderAction[] = useMemo(
    () => [
      {
        id: "new-project",
        label: "Новый проект",
        icon: Add,
        action: () => navigate("/projects/new"),
        color: theme.palette.primary.main,
      },
      {
        id: "add-requirement",
        label: "Добавить требование",
        icon: Assignment,
        action: () => navigate("/requirements/new"),
        color: theme.palette.success.main,
      },
      {
        id: "create-release",
        label: "Создать релиз",
        icon: RocketLaunch,
        action: () => navigate("/releases/new"),
        color: theme.palette.info.main,
      },
      {
        id: "open-projects",
        label: "Открыть проекты",
        icon: FolderOpen,
        action: () => navigate("/projects"),
        color: theme.palette.secondary.main,
      },
    ],
    [navigate, theme]
  );

  return { quickActions };
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);


  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setNotifications(await projectApi.getNotifications());
    setLoading(false);
  }, []);

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
  const { quickActions } = useHeaderActions();
  const notifications = useNotifications();

  return {
    search,
    quickActions,
    notifications,
  };
};
