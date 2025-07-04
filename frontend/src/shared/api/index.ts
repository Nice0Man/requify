
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

// Types are exported from shared/types instead to avoid duplication
