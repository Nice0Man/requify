// Project management queries
export {
  useProjects,
  useProject,
  useProjectStats,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  projectQueryKeys,
} from "@/features/project-management/model/useProjectQuery";

// Requirement management queries
export {
  useRequirements,
  useRequirement,
  useRequirementStats,
  useCreateRequirement,
  useUpdateRequirement,
  useDeleteRequirement,
  requirementKeys,
} from "@/features/requirement-management/model/useRequirementQuery";

// Release management queries
export {
  useReleases,
  useRelease,
  useReleaseStats,
  useCreateRelease,
  useUpdateRelease,
  useDeleteRelease,
  releaseQueryKeys,
} from "@/features/release-management/model/useReleaseQuery";

// Test management queries
export {
  useTestCases,
  useTestCase,
  useTestStats,
  useCreateTestCase,
  useUpdateTestCase,
  useDeleteTestCase,
  useTestSuites,
  useTestSuite,
  useCreateTestSuite,
  useUpdateTestSuite,
  useDeleteTestSuite,
  testQueryKeys,
} from "@/features/test-management/model/useTestQuery";

// Dashboard queries
export {
  useDashboardStats,
  useDashboardActivity,
  dashboardQueryKeys,
} from "@/features/dashboard/model/useDashboardQuery";

// Auth queries
export {
  useCurrentUser,
  useLogin,
  useLogout, 
  useRegister,
  useRefreshTokens,
  useUserSessions,
  useRevokeSessions,
  useAuthStatus,
  useForgotPassword,
  useResetPassword,
  authKeys,
} from "@/features/auth/model/useAuthQuery";

// Auth mutations (aliases for backward compatibility)
export { useLogin as useLoginMutation } from "@/features/auth/model/useAuthQuery";
export { useLogout as useLogoutMutation } from "@/features/auth/model/useAuthQuery";
export { useRegister as useRegisterMutation } from "@/features/auth/model/useAuthQuery";
export { useForgotPassword as useForgotPasswordMutation } from "@/features/auth/model/useAuthQuery";
export { useResetPassword as useResetPasswordMutation } from "@/features/auth/model/useAuthQuery";

// Auth keys alias
export { authKeys as authQueryKeys } from "@/features/auth/model/useAuthQuery";

// Notification queries
export {
  useNotifications,
  useNotification,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useArchiveNotification,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  notificationQueryKeys,
} from "@/features/notification-management/model/useNotificationQuery";

// Query client utilities
export { useQueryClient } from "@tanstack/react-query";
