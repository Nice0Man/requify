// Existing hooks
export { useDebounce } from './useDebounce';
export { useLocalStorage } from './useLocalStorage';

// New hooks
export { useApi, useCrudApi } from './useApi';
export { usePagination, useServerPagination } from './usePagination';
export { usePermissions } from './usePermissions';
export { useAuth } from './useAuth';
export type { AuthState, UseAuthReturn, RegisterData } from './useAuth'; 