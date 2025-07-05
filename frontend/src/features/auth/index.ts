// Auth feature exports - business logic for authentication
// Uses user entity and handles login, registration, password management

// Export auth API
export { authApi, usersApi } from './api';

// Export auth models and hooks  
export { AuthProvider, useAuth, usePermissions } from './model';
export type { AuthState, AuthContextType } from './model';

// Export auth UI components
export { 
  LoginForm, 
  RegisterForm, 
  PasswordResetForm,
  AuthGuard,
  AuthLayout
} from './ui'; 