// Re-export shared types avoiding conflicts
export type {
  LoginRequest,
  LoginResponse,
  UserRole as AuthUserRole,
} from "./auth";

export * from "./dashboard";
export * from "./common";

export type { User, UserProfile, UserSettings } from "./user";

export * from "./project";
export * from "./requirement";

// New shared types for FSD compliance
export * from "./activity";
export type {
  SidebarItem,
  BottomNavItem,
  SidebarItemType,
  UserRole as SidebarUserRole,
} from "./sidebar";
