import { AuthPageType, AuthPageConfig } from './types';

// Утилиты для конфигурации auth страниц
export const getAuthPageConfig = (pageType: AuthPageType): AuthPageConfig => {
  switch (pageType) {
    case AuthPageType.LOGIN:
      return {
        title: 'Вход в систему',
        description: 'Войдите в свою учетную запись',
        showBackButton: false,
        allowGuestAccess: true,
        requireAuth: false,
      };
    case AuthPageType.REGISTER:
      return {
        title: 'Регистрация',
        description: 'Создайте новую учетную запись',
        showBackButton: true,
        allowGuestAccess: true,
        requireAuth: false,
      };
    case AuthPageType.FORGOT_PASSWORD:
      return {
        title: 'Восстановление пароля',
        description: 'Восстановите доступ к учетной записи',
        showBackButton: true,
        allowGuestAccess: true,
        requireAuth: false,
      };
    case AuthPageType.RESET_PASSWORD:
      return {
        title: 'Новый пароль',
        description: 'Установите новый пароль для вашей учетной записи',
        showBackButton: false,
        allowGuestAccess: true,
        requireAuth: false,
      };
    case AuthPageType.CHANGE_PASSWORD:
      return {
        title: 'Изменение пароля',
        description: 'Изменить пароль учетной записи',
        showBackButton: true,
        allowGuestAccess: false,
        requireAuth: true,
      };
    case AuthPageType.VERIFY_EMAIL:
      return {
        title: 'Подтверждение email',
        description: 'Подтвердите ваш адрес электронной почты',
        showBackButton: false,
        allowGuestAccess: true,
        requireAuth: false,
      };
    default:
      return {
        title: 'Аутентификация',
        description: 'Страница аутентификации',
        showBackButton: false,
        allowGuestAccess: true,
        requireAuth: false,
      };
  }
};

// Утилиты для валидации данных форм
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email обязателен' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Неверный формат email' };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Пароль обязателен' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Пароль должен содержать минимум 8 символов' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, error: 'Пароль должен содержать строчные буквы' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, error: 'Пароль должен содержать заглавные буквы' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, error: 'Пароль должен содержать цифры' };
  }
  
  return { isValid: true };
};

export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): { isValid: boolean; error?: string } => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Подтверждение пароля обязательно' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Пароли не совпадают' };
  }
  
  return { isValid: true };
};

export const validateName = (name: string, fieldName: string): { isValid: boolean; error?: string } => {
  if (!name) {
    return { isValid: false, error: `${fieldName} обязательно` };
  }
  
  if (name.length < 2) {
    return { isValid: false, error: `${fieldName} должно содержать минимум 2 символа` };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: `${fieldName} не должно превышать 50 символов` };
  }
  
  if (!/^[a-zA-Zа-яА-ЯёЁ\s-']+$/.test(name)) {
    return { isValid: false, error: `${fieldName} содержит недопустимые символы` };
  }
  
  return { isValid: true };
};

// Утилиты для работы с URL-параметрами
export const buildAuthUrl = (pageType: AuthPageType, params?: Record<string, string>): string => {
  const baseUrls = {
    [AuthPageType.LOGIN]: '/login',
    [AuthPageType.REGISTER]: '/auth/register',
    [AuthPageType.FORGOT_PASSWORD]: '/auth/forgot-password',
    [AuthPageType.RESET_PASSWORD]: '/auth/reset-password',
    [AuthPageType.CHANGE_PASSWORD]: '/auth/change-password',
    [AuthPageType.VERIFY_EMAIL]: '/verify-email',
  };
  
  let url = baseUrls[pageType] || '/login';
  
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

// Утилиты для работы с токенами
export const parseTokenFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('token');
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    // Простая проверка формата JWT токена
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload.exp ? payload.exp < currentTime : false;
  } catch {
    return true;
  }
};

// Утилиты для хранения данных форм
export const saveFormDataToSession = (pageType: AuthPageType, data: any): void => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const key = `auth_form_${pageType}`;
    sessionStorage.setItem(key, JSON.stringify(data));
  }
};

export const loadFormDataFromSession = <T>(pageType: AuthPageType): T | null => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const key = `auth_form_${pageType}`;
    const stored = sessionStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  }
  return null;
};

export const clearFormDataFromSession = (pageType: AuthPageType): void => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const key = `auth_form_${pageType}`;
    sessionStorage.removeItem(key);
  }
};

// Утилиты для генерации безопасности
export const generateSecurePassword = (): string => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};

// Утилиты для оценки силы пароля
export const calculatePasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  let score = 0;
  const feedback: string[] = [];
  
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Добавьте больше символов');
  }
  
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Добавьте строчные буквы');
  }
  
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Добавьте заглавные буквы');
  }
  
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Добавьте цифры');
  }
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Добавьте специальные символы');
  }
  
  return { score, feedback };
};

// Утилиты для форматирования сообщений об ошибках
export const formatAuthError = (error: string): string => {
  const errorMap: Record<string, string> = {
    'invalid_credentials': 'Неверный email или пароль',
    'user_not_found': 'Пользователь не найден',
    'email_already_exists': 'Пользователь с таким email уже существует',
    'invalid_token': 'Недействительный или истекший токен',
    'token_expired': 'Токен истек, запросите новый',
    'email_not_verified': 'Email не подтвержден',
    'account_locked': 'Учетная запись заблокирована',
    'too_many_attempts': 'Слишком много попыток, попробуйте позже',
    'invalid_invite_code': 'Недействительный код приглашения',
  };
  
  return errorMap[error] || 'Произошла ошибка, попробуйте еще раз';
}; 