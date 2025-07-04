import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { adminApi } from "../api/admin.api";
import type {
  SystemInfo,
  SystemMetrics,
  UserManagement,
  AdminStats,
  UserCreate,
  UserUpdate,
  AdminFilters,
} from "@/entities/admin";

interface UseAdminPanelReturn {
  // System health
  systemInfo: SystemInfo | null;
  systemMetrics: SystemMetrics | null;
  adminStats: AdminStats | null;

  // User management
  users: UserManagement[];
  totalUsers: number;

  // Loading states
  isLoadingSystem: boolean;
  isLoadingUsers: boolean;
  isLoadingStats: boolean;

  // Error states
  systemError: string | null;
  usersError: string | null;
  statsError: string | null;

  // Actions
  loadSystemData: () => Promise<void>;
  loadUsers: (filters?: AdminFilters) => Promise<void>;
  loadAdminStats: () => Promise<void>;
  createUser: (userData: UserCreate) => Promise<void>;
  updateUser: (userId: number, userData: UserUpdate) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  activateUser: (userId: number) => Promise<void>;
  deactivateUser: (userId: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useAdminPanel = (): UseAdminPanelReturn => {
  // System state
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(
    null
  );
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [isLoadingSystem, setIsLoadingSystem] = useState(false);
  const [systemError, setSystemError] = useState<string | null>(null);

  // Users state
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Stats state
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Load system data
  const loadSystemData = useCallback(async () => {
    try {
      setIsLoadingSystem(true);
      setSystemError(null);

      const [infoResponse, metricsResponse] = await Promise.all([
        adminApi.getSystemInfo(),
        adminApi.getMetrics().catch(() => null),
      ]);

      setSystemInfo(infoResponse.data);
      if (metricsResponse) {
        setSystemMetrics(metricsResponse.data);
      }
    } catch (error: any) {
      console.error("Failed to load system data:", error);
      setSystemError(error.message || "Failed to load system data");
      toast.error("Failed to load system data");
    } finally {
      setIsLoadingSystem(false);
    }
  }, []);

  // Load admin stats
  const loadAdminStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      setStatsError(null);

      const response = await adminApi.getUserStats();
      setAdminStats(response.data);
    } catch (error: any) {
      console.error("Failed to load admin stats:", error);
      setStatsError(error.message || "Failed to load admin stats");
      toast.error("Failed to load admin stats");
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Load users
  const loadUsers = useCallback(async (filters?: AdminFilters) => {
    try {
      setIsLoadingUsers(true);
      setUsersError(null);

      const response = await adminApi.getUsers(filters);
      setUsers(response.data.items);
      setTotalUsers(response.data.total);
    } catch (error: any) {
      console.error("Failed to load users:", error);
      setUsersError(error.message || "Failed to load users");
      toast.error("Failed to load users");
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  // Create user
  const createUser = useCallback(
    async (userData: UserCreate) => {
      try {
        await adminApi.createUser(userData);
        toast.success("User created successfully");
        await loadUsers(); // Refresh users list
        await loadAdminStats(); // Refresh stats
      } catch (error: any) {
        console.error("Failed to create user:", error);
        toast.error(error.message || "Failed to create user");
        throw error;
      }
    },
    [loadUsers, loadAdminStats]
  );

  // Update user
  const updateUser = useCallback(
    async (userId: number, userData: UserUpdate) => {
      try {
        await adminApi.updateUser(userId, userData);
        toast.success("User updated successfully");
        await loadUsers(); // Refresh users list
        await loadAdminStats(); // Refresh stats
      } catch (error: any) {
        console.error("Failed to update user:", error);
        toast.error(error.message || "Failed to update user");
        throw error;
      }
    },
    [loadUsers, loadAdminStats]
  );

  // Delete user
  const deleteUser = useCallback(
    async (userId: number) => {
      try {
        await adminApi.deleteUser(userId);
        toast.success("User deleted successfully");
        await loadUsers(); // Refresh users list
        await loadAdminStats(); // Refresh stats
      } catch (error: any) {
        console.error("Failed to delete user:", error);
        toast.error(error.message || "Failed to delete user");
        throw error;
      }
    },
    [loadUsers, loadAdminStats]
  );

  // Activate user
  const activateUser = useCallback(
    async (userId: number) => {
      try {
        await adminApi.activateUser(userId);
        toast.success("User activated successfully");
        await loadUsers(); // Refresh users list
        await loadAdminStats(); // Refresh stats
      } catch (error: any) {
        console.error("Failed to activate user:", error);
        toast.error(error.message || "Failed to activate user");
        throw error;
      }
    },
    [loadUsers, loadAdminStats]
  );

  // Deactivate user
  const deactivateUser = useCallback(
    async (userId: number) => {
      try {
        await adminApi.deactivateUser(userId);
        toast.success("User deactivated successfully");
        await loadUsers(); // Refresh users list
        await loadAdminStats(); // Refresh stats
      } catch (error: any) {
        console.error("Failed to deactivate user:", error);
        toast.error(error.message || "Failed to deactivate user");
        throw error;
      }
    },
    [loadUsers, loadAdminStats]
  );

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([loadSystemData(), loadUsers(), loadAdminStats()]);
  }, [loadSystemData, loadUsers, loadAdminStats]);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    // System health
    systemInfo,
    systemMetrics,
    adminStats,

    // User management
    users,
    totalUsers,

    // Loading states
    isLoadingSystem,
    isLoadingUsers,
    isLoadingStats,

    // Error states
    systemError,
    usersError,
    statsError,

    // Actions
    loadSystemData,
    loadUsers,
    loadAdminStats,
    createUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
    refreshData,
  };
};
