// Auth feature типы - импортируем базовые типы из других слоев
// Этот файл содержит только типы, специфичные для auth фичи

// Импорты из shared слоя (API контракты)
export type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  TokenValidationRequest,
  TokenValidationResponse,
  PasswordChangeRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  EmailVerificationRequest,
  EmailVerificationConfirm,
  EmailVerificationResponse,
  ActiveSession,
  SessionListResponse,
  RevokeSessionRequest,
} from '@/shared/types/api';

// Импорты из entities слоя (бизнес-сущности)
export type {
  User,
  UserCreate,
  UserUpdate,
  UserProfile,
  UserRole,
} from '@/entities/user/model/types';

// =============================================================================
// Auth Feature-Specific Types
// =============================================================================

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  requirement_updates: boolean;
  test_results: boolean;
  system_alerts: boolean;
}

export interface AuthError {
  error: string;
  error_description: string;
  error_details?: Record<string, any>;
}

export interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  permissions: string[];
  sessions: ActiveSession[];
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: UserCreate) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokenMethod: () => Promise<string | null>;
  changePassword: (request: PasswordChangeRequest) => Promise<void>;
  requestPasswordReset: (request: PasswordResetRequest) => Promise<void>;
  confirmPasswordReset: (request: PasswordResetConfirm) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUserData: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
} 