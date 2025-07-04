// Shared layer exports - for common utilities, types, and components
// Used across multiple features and pages

// API utilities and client (specific exports to avoid conflicts)
export { ApiClient, apiClient, AuthApi, authApi } from "./api";
export { CommentsApi, RelationshipsApi, ReferenceApi, referenceApi } from "./api";
export { SpecificationsApi, specificationsApi } from "./api";

// Shared types (specific exports to avoid conflicts)
export type { ApiResponse, ApiError, PaginatedResponse } from "./types/api";
export type { UserProfile, LoginRequest, LoginResponse } from "./types/api";
export type { Comment, CommentCreate, CommentUpdate } from "./types/api";
export type { Specification, SpecificationCreate, SpecificationUpdate } from "./types/api";
export type { Relationship, RelationshipCreate, RelationshipUpdate } from "./types/api";

// UI components
export * from "./ui";

// Custom hooks
export * from "./hooks";

// Utilities
export * from "./utils";

// External library adapters
export * from "./lib";
