// === UI exports ===
export * from './ui';

// === Model exports ===
export * from './model';

// === API exports ===
export { userDAO } from './api/userDAO';

// === Re-exports with aliases to avoid conflicts ===
export type {
  User as UserEntity,
  UserRole as UserRoleEntity,
  UserRole, // Добавляем прямой экспорт для обратной совместимости
} from './model'; 
