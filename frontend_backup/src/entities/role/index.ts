// === UI exports ===
export * from './ui';

// === Model exports ===
export * from './model';

// === API exports ===
export { roleDAO } from './api/roleDAO';

// === Re-exports with aliases to avoid conflicts ===
export type {
  Role as RoleEntity,
  Permission as PermissionEntity,
} from './model';