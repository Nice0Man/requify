import {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "@/features/projects/model/useProjectQuery";

import {
  useRequirements,
  useRequirement,
  useCreateRequirement,
  useUpdateRequirement,
  useDeleteRequirement,
  useRequirementStats,
} from "@/features/requirements/model/useRequirementQuery";

import {
  useReleases,
  useRelease,
  useCreateRelease,
  useUpdateRelease,
  useDeleteRelease,
  useReleaseStats,
} from "@/features/releases/model/useReleaseQuery";

import {
  useTestCases,
  useTestCase,
  useCreateTestCase,
  useUpdateTestCase,
  useDeleteTestCase,
  useExecuteTestCase,
  useTestStats,
  useTestSuites,
  useTestSuite,
  useCreateTestSuite,
  useUpdateTestSuite,
  useDeleteTestSuite,
} from "@/features/testing/model/useTestQuery";

import {
  useNotifications,
  useNotification,
  useCreateNotification,
  useDeleteNotification,
  useMarkAsRead,
  useMarkAllAsRead,
  useNotificationStats,
  useUnreadCount,
} from "@/features/notifications/model/useNotificationQuery";

// Re-export all hooks for centralized access
export {
  // Projects
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  
  // Requirements
  useRequirements,
  useRequirement,
  useCreateRequirement,
  useUpdateRequirement,
  useDeleteRequirement,
  useRequirementStats,
  
  // Releases
  useReleases,
  useRelease,
  useCreateRelease,
  useUpdateRelease,
  useDeleteRelease,
  useReleaseStats,
  
  // Testing
  useTestCases,
  useTestCase,
  useCreateTestCase,
  useUpdateTestCase,
  useDeleteTestCase,
  useExecuteTestCase,
  useTestStats,
  useTestSuites,
  useTestSuite,
  useCreateTestSuite,
  useUpdateTestSuite,
  useDeleteTestSuite,
  
  // Notifications
  useNotifications,
  useNotification,
  useCreateNotification,
  useDeleteNotification,
  useMarkAsRead,
  useMarkAllAsRead,
  useNotificationStats,
  useUnreadCount,
};
