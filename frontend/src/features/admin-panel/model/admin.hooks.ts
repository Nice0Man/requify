import { useState, useEffect, useCallback, useReducer } from 'react';
import { adminApi } from '../api/admin.api';
import { useAuth } from '@/features/auth';
import type {
  AdminDashboardState,
  AdminUserManagementState,
  AdminSystemState,
  AdminAction,
  AdminUserFilters,
  AdminExportOptions,
  AdminBackupConfig,
  UserManagement,
} from './admin.types';

// =============================================================================
// Admin Dashboard Hook
// =============================================================================

const initialDashboardState: AdminDashboardState = {
  isLoading: false,
  lastUpdated: null,
  error: null,
  systemInfo: null,
  metrics: null,
  stats: null,
  recentLogs: [],
  securityEvents: [],
  healthSummary: null,
  securitySummary: null,
};

function dashboardReducer(state: AdminDashboardState, action: AdminAction): AdminDashboardState {
  switch (action.type) {
    case 'DASHBOARD_LOAD_START':
      return { ...state, isLoading: true, error: null };
    case 'DASHBOARD_LOAD_SUCCESS':
      return {
        ...state,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
        ...action.payload,
      };
    case 'DASHBOARD_LOAD_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

export const useAdminDashboard = (autoRefresh: boolean = true, refreshInterval: number = 30000) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialDashboardState);
  const { hasPermission } = useAuth();

  const loadDashboardData = useCallback(async () => {
    if (!hasPermission('admin:read')) {
      dispatch({ type: 'DASHBOARD_LOAD_ERROR', payload: 'Insufficient permissions' });
      return;
    }

    try {
      dispatch({ type: 'DASHBOARD_LOAD_START' });

      const [dashboardData, healthSummary, securitySummary] = await Promise.all([
        adminApi.getDashboardData(),
        adminApi.getSystemHealthSummary(),
        adminApi.getSecuritySummary(),
      ]);

      dispatch({
        type: 'DASHBOARD_LOAD_SUCCESS',
        payload: {  
          ...dashboardData,
          healthSummary,
          securitySummary,
          recentLogs: dashboardData.recentLogs.items,
          securityEvents: dashboardData.securityEvents.items,
        },
      });
    } catch (error) {
      dispatch({
        type: 'DASHBOARD_LOAD_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load dashboard data',
      });
    }
  }, [hasPermission]);

  // Auto-refresh effect
  useEffect(() => {
    loadDashboardData();

    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadDashboardData, autoRefresh, refreshInterval]);

  const refresh = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    ...state,
    refresh,
    canManageSystem: hasPermission('admin:write'),
    canViewLogs: hasPermission('admin:logs:read'),
    canManageUsers: hasPermission('admin:users:write'),
  };
};

// =============================================================================
// Admin User Management Hook
// =============================================================================

const initialUserState: AdminUserManagementState = {
  isLoading: false,
  users: [],
  total: 0,
  currentPage: 1,
  totalPages: 0,
  filters: {
    search: '',
    role: [],
    status: [],
    department: '',
    dateFrom: '',
    dateTo: '',
    limit: 20,
  },
  selectedUsers: [],
  bulkOperationInProgress: false,
  error: null,
};

function userManagementReducer(state: AdminUserManagementState, action: AdminAction): AdminUserManagementState {
  switch (action.type) {
    case 'USERS_LOAD_START':
      return { ...state, isLoading: true, error: null };
    case 'USERS_LOAD_SUCCESS':
      return {
        ...state,
        isLoading: false,
        error: null,
        users: action.payload.users,
        total: action.payload.total,
        currentPage: action.payload.page,
        totalPages: action.payload.totalPages,
      };
    case 'USERS_LOAD_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'USERS_SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'USERS_SELECT':
      return { ...state, selectedUsers: action.payload };
    case 'USERS_BULK_OPERATION_START':
      return { ...state, bulkOperationInProgress: true, error: null };
    case 'USERS_BULK_OPERATION_SUCCESS':
      return { ...state, bulkOperationInProgress: false, selectedUsers: [] };
    case 'USERS_BULK_OPERATION_ERROR':
      return { ...state, bulkOperationInProgress: false, error: action.payload };
    default:
      return state;
  }
}

export const useAdminUserManagement = () => {
  const [state, dispatch] = useReducer(userManagementReducer, initialUserState);
  const { hasPermission } = useAuth();

  const loadUsers = useCallback(async (page: number = 1) => {
    if (!hasPermission('admin:users:read')) {
      dispatch({ type: 'USERS_LOAD_ERROR', payload: 'Insufficient permissions' });
      return;
    }

    try {
      dispatch({ type: 'USERS_LOAD_START' });

      const filters = { ...state.filters, page, limit: state.filters.limit };
      const response = await adminApi.getFilteredUsers(filters);

      dispatch({
        type: 'USERS_LOAD_SUCCESS',
        payload: {
          users: response.items,
          total: response.total,
          page: response.page,
          totalPages: response.pages,
        },
      });
    } catch (error) {
      dispatch({
        type: 'USERS_LOAD_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load users',
      });
    }
  }, [state.filters, hasPermission]);

  const updateFilters = useCallback((newFilters: Partial<AdminUserFilters>) => {
    dispatch({ type: 'USERS_SET_FILTERS', payload: newFilters });
  }, []);

  const selectUsers = useCallback((userIds: number[]) => {
    dispatch({ type: 'USERS_SELECT', payload: userIds });
  }, []);

  const bulkUpdateUsers = useCallback(async (updates: Partial<UserManagement>) => {
    if (!hasPermission('admin:users:write')) {
      dispatch({ type: 'USERS_BULK_OPERATION_ERROR', payload: 'Insufficient permissions' });
      return;
    }

    try {
      dispatch({ type: 'USERS_BULK_OPERATION_START' });
      
      await adminApi.bulkUpdateUsers(state.selectedUsers, updates);
      
      dispatch({ type: 'USERS_BULK_OPERATION_SUCCESS' });
      await loadUsers(state.currentPage);
    } catch (error) {
      dispatch({
        type: 'USERS_BULK_OPERATION_ERROR',
        payload: error instanceof Error ? error.message : 'Bulk operation failed',
      });
    }
  }, [state.selectedUsers, state.currentPage, hasPermission, loadUsers]);

  const exportUsers = useCallback(async (options: AdminExportOptions) => {
    if (!hasPermission('admin:users:read')) {
      throw new Error('Insufficient permissions');
    }

    return adminApi.exportSystemData({
      include_users: options.includeUsers,
      format: options.format as 'csv' | 'excel' | 'json',
    });
  }, [hasPermission]);

  // Load users on filter change
  useEffect(() => {
    loadUsers(1);
  }, [state.filters]);

  return {
    ...state,
    loadUsers,
    updateFilters,
    selectUsers,
    bulkUpdateUsers,
    exportUsers,
    canManageUsers: hasPermission('admin:users:write'),
    canDeleteUsers: hasPermission('admin:users:delete'),
  };
};

// =============================================================================
// Admin System Management Hook
// =============================================================================

const initialSystemState: AdminSystemState = {
  isLoading: false,
  backups: [],
  systemLogs: [],
  securityEvents: [],
  settings: {},
  maintenanceMode: false,
  error: null,
  logFilters: {
    level: [],
    module: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  },
  securityFilters: {
    eventType: [],
    severity: [],
    resolved: null,
    dateFrom: '',
    dateTo: '',
  },
};

function systemReducer(state: AdminSystemState, action: AdminAction): AdminSystemState {
  switch (action.type) {
    case 'SYSTEM_LOAD_START':
      return { ...state, isLoading: true, error: null };
    case 'SYSTEM_LOAD_SUCCESS':
      return { ...state, isLoading: false, error: null, ...action.payload };
    case 'SYSTEM_LOAD_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'SYSTEM_SET_LOG_FILTERS':
      return { ...state, logFilters: { ...state.logFilters, ...action.payload } };
    case 'SYSTEM_SET_SECURITY_FILTERS':
      return { ...state, securityFilters: { ...state.securityFilters, ...action.payload } };
    case 'SYSTEM_TOGGLE_MAINTENANCE':
      return { ...state, maintenanceMode: action.payload };
    default:
      return state;
  }
}

export const useAdminSystem = () => {
  const [state, dispatch] = useReducer(systemReducer, initialSystemState);
  const { hasPermission } = useAuth();

  const loadSystemData = useCallback(async () => {
    if (!hasPermission('admin:system:read')) {
      dispatch({ type: 'SYSTEM_LOAD_ERROR', payload: 'Insufficient permissions' });
      return;
    }

    try {
      dispatch({ type: 'SYSTEM_LOAD_START' });

      const [backups, logs, securityEvents] = await Promise.all([
        adminApi.getBackups(),
        adminApi.getSystemLogs(state.logFilters),
        adminApi.getSecurityEvents({
          ...state.securityFilters,
          resolved: state.securityFilters.resolved ?? undefined,
        }),
      ]);

      dispatch({
        type: 'SYSTEM_LOAD_SUCCESS',
        payload: {
          backups: backups.items,
          systemLogs: logs.items,
          securityEvents: securityEvents.items,
        },
      });
    } catch (error) {
      dispatch({
        type: 'SYSTEM_LOAD_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load system data',
      });
    }
  }, [state.logFilters, state.securityFilters, hasPermission]);

  const createBackup = useCallback(async (config: AdminBackupConfig) => {
    if (!hasPermission('admin:backup:create')) {
      throw new Error('Insufficient permissions');
    }

    const backupData = await adminApi.createBackup({
      name: config.name,
      type: config.type,
      description: config.description,
      include_database: config.includeDatabase,
      include_uploads: config.includeUploads,
      include_system_config: config.includeSystemConfig,
    });

    await loadSystemData();
    return backupData;
  }, [hasPermission, loadSystemData]);

  const updateLogFilters = useCallback((filters: Partial<AdminSystemState['logFilters']>) => {
    dispatch({ type: 'SYSTEM_SET_LOG_FILTERS', payload: filters });
  }, []);

  const updateSecurityFilters = useCallback((filters: Partial<AdminSystemState['securityFilters']>) => {
    dispatch({ type: 'SYSTEM_SET_SECURITY_FILTERS', payload: filters });
  }, []);

  const resolveSecurityEvent = useCallback(async (eventId: number, notes?: string) => {
    if (!hasPermission('admin:security:resolve')) {
      throw new Error('Insufficient permissions');
    }

    await adminApi.resolveSecurityEvent(eventId, { resolution_notes: notes });
    await loadSystemData();
  }, [hasPermission, loadSystemData]);

  const toggleMaintenanceMode = useCallback(async () => {
    if (!hasPermission('admin:system:maintenance')) {
      throw new Error('Insufficient permissions');
    }

    const newMode = !state.maintenanceMode;
    dispatch({ type: 'SYSTEM_TOGGLE_MAINTENANCE', payload: newMode });

    try {
      await adminApi.updateSystemSettings([{
        category: 'general',
        key: 'maintenance_mode',
        value: String(newMode),
        data_type: 'boolean',
      }]);
    } catch (error) {
      // Revert on error
      dispatch({ type: 'SYSTEM_TOGGLE_MAINTENANCE', payload: state.maintenanceMode });
      throw error;
    }
  }, [state.maintenanceMode, hasPermission]);

  // Load system data on mount and filter changes
  useEffect(() => {
    loadSystemData();
  }, [state.logFilters, state.securityFilters]);

  return {
    ...state,
    loadSystemData,
    createBackup,
    updateLogFilters,
    updateSecurityFilters,
    resolveSecurityEvent,
    toggleMaintenanceMode,
    canManageSystem: hasPermission('admin:system:write'),
    canCreateBackups: hasPermission('admin:backup:create'),
    canManageSecurity: hasPermission('admin:security:resolve'),
    canToggleMaintenance: hasPermission('admin:system:maintenance'),
  };
};

// =============================================================================
// Combined Admin Hook
// =============================================================================

export const useAdmin = () => {
  const dashboard = useAdminDashboard();
  const userManagement = useAdminUserManagement();
  const system = useAdminSystem();

  return {
    dashboard,
    userManagement,
    system,
  };
}; 