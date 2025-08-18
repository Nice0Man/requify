// === UI exports ===
export * from './ui';

// === Model exports ===
export * from './model';

// === API exports ===
export { departmentDAO } from './api/departmentDAO';

// === Re-exports with aliases to avoid conflicts ===
export type {
  Department as DepartmentEntity,
  DepartmentType as DepartmentTypeEntity,
} from './model';