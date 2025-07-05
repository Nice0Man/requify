
// Core API client and types
export { ApiClient, apiClient } from "./client";
export type { ApiResponse, ApiError, TokenManager } from "./client";

// API classes for shared functionality
export { CommentsApi } from "./comments.api";
export { RelationshipsApi } from "./relationships.api";
export { ReferenceApi, referenceApi } from "./reference.api";
export { SpecificationsApi, specificationsApi } from "./specifications.api";

// Authentication API
export { AuthApi, authApi } from "./auth.api";
export { usersApi } from "@/features/auth/api/auth.api";

// Entity APIs - Re-export from entities for convenience
export { projectsApi } from "@/entities/project";
export { requirementsApi } from "@/entities/requirement";
export { releasesApi } from "@/entities/release";

// Feature APIs
export { dashboardApi } from "@/features/dashboard";
export { adminApi } from "@/features/admin-panel/api";
export { testingApi, testManagementApi } from "@/features/test-management/api";

// Types are exported from shared/types instead to avoid duplication
