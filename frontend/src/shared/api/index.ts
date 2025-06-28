// Centralized API exports for all Requify API services
// This file provides a single import point for all API functionality

// Core API client
export { ApiClient, type ApiResponse } from './client';

// Authentication & Users
export { authApi } from '@/features/auth/api/auth.api';
export { usersApi } from '@/features/auth/api/users.api';
export type * from '@/features/auth/types/auth.types';

// Projects
export { projectsApi } from '@/features/projects/api/projects.api';
export type * from '@/features/projects/api/projects.api';

// Requirements
export { requirementsApi } from '@/features/requirements/api/requirements.api';
export type * from '@/features/requirements/api/requirements.api';

// Releases
export { releasesApi } from '@/features/releases/api/releases.api';
export type * from '@/features/releases/api/releases.api';

// Testing
export { testingApi } from '@/features/testing/api/testing.api';
export type * from '@/features/testing/api/testing.api';

// Admin
export { adminApi } from '@/features/admin/api/admin.api';
export type * from '@/features/admin/api/admin.api';

// Reference Data
export { referenceApi } from './reference.api';
export type * from './reference.api';

// Specifications
export { specificationsApi } from './specifications.api';
export type * from './specifications.api';

// Relationships
export { relationshipsApi } from './relationships.api';
export type * from './relationships.api';

// Comments
export { commentsApi } from './comments.api';
export type * from './comments.api';

// Centralized API object for easy access
export const api = {
  auth: authApi,
  users: usersApi,
  projects: projectsApi,
  requirements: requirementsApi,
  releases: releasesApi,
  testing: testingApi,
  admin: adminApi,
  reference: referenceApi,
  specifications: specificationsApi,
  relationships: relationshipsApi,
  comments: commentsApi
} as const;

// API endpoints summary for documentation
export const API_ENDPOINTS_SUMMARY = {
  auth: {
    count: 10,
    endpoints: [
      'POST /auth/register',
      'POST /auth/login', 
      'POST /auth/refresh',
      'POST /auth/logout',
      'POST /auth/validate-token',
      'POST /auth/change-password',
      'POST /auth/reset-password',
      'POST /auth/reset-password/confirm',
      'GET /auth/sessions',
      'POST /auth/sessions/revoke'
    ]
  },
  users: {
    count: 9,
    endpoints: [
      'GET /users/',
      'POST /users/',
      'GET /users/me',
      'PUT /users/me',
      'GET /users/{user_id}',
      'PUT /users/{user_id}',
      'DELETE /users/{user_id}',
      'POST /users/{user_id}/activate',
      'POST /users/{user_id}/deactivate'
    ]
  },
  projects: {
    count: 8,
    endpoints: [
      'GET /projects/',
      'POST /projects/',
      'GET /projects/{project_id}',
      'PUT /projects/{project_id}',
      'DELETE /projects/{project_id}',
      'GET /projects/{project_id}/requirements',
      'GET /projects/{project_id}/releases',
      'GET /projects/{project_id}/stats'
    ]
  },
  requirements: {
    count: 10,
    endpoints: [
      'GET /requirements/search',
      'GET /requirements/',
      'POST /requirements/',
      'GET /requirements/{requirement_id}',
      'PUT /requirements/{requirement_id}',
      'DELETE /requirements/{requirement_id}',
      'POST /requirements/{requirement_id}/change-status',
      'GET /requirements/{requirement_id}/tests',
      'GET /requirements/{requirement_id}/relationships',
      'POST /requirements/{requirement_id}/relationships'
    ]
  },
  releases: {
    count: 10,
    endpoints: [
      'GET /releases/',
      'POST /releases/',
      'GET /releases/{release_id}',
      'PUT /releases/{release_id}',
      'DELETE /releases/{release_id}',
      'POST /releases/create-from-requirements',
      'POST /releases/{release_id}/generate-specification',
      'POST /releases/{release_id}/publish',
      'GET /releases/{release_id}/requirements',
      'GET /releases/{release_id}/changelog'
    ]
  },
  testing: {
    count: 13,
    endpoints: [
      'GET /testing/results',
      'GET /testing/plans',
      'POST /testing/plans',
      'GET /testing/plans/{plan_id}',
      'GET /testing/cases',
      'POST /testing/cases',
      'GET /testing/executions',
      'POST /testing/executions',
      'GET /testing/reports/summary',
      'POST /testing/asuts/requirement-status',
      'POST /testing/asuts/release-status',
      'POST /testing/integration/run',
      'GET /testing/integration/status/{job_id}'
    ]
  },
  admin: {
    count: 12,
    endpoints: [
      'GET /admin/users',
      'GET /admin/system-info',
      'GET /admin/health',
      'GET /admin/metrics',
      'GET /admin/logs',
      'GET /admin/users-stats',
      'GET /admin/projects-stats',
      'POST /admin/backup',
      'GET /admin/backups',
      'POST /admin/system-settings',
      'GET /admin/system-settings',
      'GET /admin/audit-log'
    ]
  },
  reference: {
    count: 8,
    endpoints: [
      'GET /reference/requirement-types',
      'POST /reference/requirement-types',
      'GET /reference/requirement-priorities',
      'POST /reference/requirement-priorities',
      'GET /reference/requirement-statuses',
      'POST /reference/requirement-statuses',
      'GET /reference/relationship-types',
      'POST /reference/relationship-types'
    ]
  },
  specifications: {
    count: 7,
    endpoints: [
      'GET /specifications/',
      'POST /specifications/',
      'GET /specifications/{spec_id}',
      'PUT /specifications/{spec_id}',
      'DELETE /specifications/{spec_id}',
      'GET /specifications/{spec_id}/requirements',
      'POST /specifications/{spec_id}/generate-document'
    ]
  },
  relationships: {
    count: 10,
    endpoints: [
      'GET /relationships/',
      'POST /relationships/',
      'GET /relationships/{relationship_id}',
      'PUT /relationships/{relationship_id}',
      'DELETE /relationships/{relationship_id}',
      'GET /relationships/requirements/{requirement_id}/relationships',
      'POST /relationships/requirements/{requirement_id}/relationships',
      'GET /relationships/requirements/{requirement_id}/dependencies',
      'GET /relationships/requirements/{requirement_id}/dependents',
      'GET /relationships/requirements/{requirement_id}/trace-matrix'
    ]
  },
  comments: {
    count: 6,
    endpoints: [
      'GET /comments/',
      'POST /comments/',
      'GET /comments/{comment_id}',
      'PUT /comments/{comment_id}',
      'DELETE /comments/{comment_id}',
      'GET /comments/{comment_id}/replies'
    ]
  }
} as const;

// Total endpoint count: 103 endpoints
export const TOTAL_API_ENDPOINTS = Object.values(API_ENDPOINTS_SUMMARY)
  .reduce((total, category) => total + category.count, 0);

export default api; 