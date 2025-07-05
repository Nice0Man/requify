// Export user entity types
export type {
  User,
  UserBase,
  UserCreate,
  UserUpdate,
  UserWithStats,
  UserProfile,
  UserPreferences,
  UserSession,
  UserSettings,
  UserRoleValue,
  UserStatus,
  UserStatusValue,
  UserWithDetails,
  UserState,
  UserFilters,
  UserPermissions,
  TeamMember,
  UserActivity,
} from "./model/types";

// Export user constants and helpers
export {
  USER_ROLES,
  USER_STATUSES,
  UserRole,
  getUserFullName,
  getUserInitials,
  getUserStatusColor,
  getUserRoleColor,
  isUserActive,
  canUserAccessProject,
  canUserManageProject,
  getUserWorkloadColor,
  formatLastLogin,
} from "./model/types";

// Export user API
export { UsersApi, usersApi } from "./api";

// Export user UI components
export { UserCard, UserAvatar, UserInfo } from "./ui";
export { UserStatus as UserStatusComponent } from "./ui"; 