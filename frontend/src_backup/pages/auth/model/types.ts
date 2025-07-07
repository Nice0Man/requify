// Auth pages types
// В соответствии с FSD принципами, здесь определяются типы специфичные для страниц

// Типы для компонентов страниц
export interface LoginPageProps {
  redirectTo?: string;
  showWelcome?: boolean;
}

export interface RegisterPageProps {
  inviteCode?: string;
  redirectAfterRegister?: string;
}

export interface ForgotPasswordPageProps {
  email?: string;
}

export interface ResetPasswordPageProps {
  token?: string;
  email?: string;
}

export interface ChangePasswordPageProps {
  requireCurrentPassword?: boolean;
}

export interface VerifyEmailPageProps {
  token?: string;
  email?: string;
}

// Типы для состояния auth страниц
export interface AuthPageState {
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  redirectUrl: string | null;
}

// Типы для форм
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  inviteCode?: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
  token: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Типы для валидации
export interface AuthFormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Enum для типов auth страниц
export enum AuthPageType {
  LOGIN = 'login',
  REGISTER = 'register',
  FORGOT_PASSWORD = 'forgot-password',
  RESET_PASSWORD = 'reset-password',
  CHANGE_PASSWORD = 'change-password',
  VERIFY_EMAIL = 'verify-email',
}

// Типы для конфигурации auth страниц
export interface AuthPageConfig {
  title: string;
  description: string;
  showBackButton: boolean;
  allowGuestAccess: boolean;
  requireAuth: boolean;
}

// Типы для редиректов
export interface AuthRedirect {
  from: string;
  to: string;
  condition: 'authenticated' | 'unauthenticated' | 'always';
} 