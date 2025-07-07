import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/app/store';
import { selectIsAuthenticated, selectAuthError, selectIsLoading } from '@/features/auth/model/authSlice';
import { useNavigation } from '@/features/navigation';
import { 
  AuthPageType, 
  AuthPageState, 
  AuthFormValidation,
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  ChangePasswordFormData 
} from './types';

// Hook для общего состояния auth страниц
export const useAuthPageState = (): AuthPageState => {
  const [searchParams] = useSearchParams();
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectAuthError);
  
  return {
    isLoading,
    error,
    isSubmitting: isLoading,
    redirectUrl: searchParams.get('redirectTo'),
  };
};

// Hook для автоматического редиректа аутентифицированных пользователей
export const useAuthRedirect = (pageType: AuthPageType) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    if (isAuthenticated && shouldRedirectWhenAuthenticated(pageType)) {
      const redirectTo = searchParams.get('redirectTo') || '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, pageType, navigate, searchParams]);
  
  return { shouldRender: !isAuthenticated || !shouldRedirectWhenAuthenticated(pageType) };
};

// Вспомогательная функция для определения нужности редиректа
const shouldRedirectWhenAuthenticated = (pageType: AuthPageType): boolean => {
  const noRedirectPages = [AuthPageType.CHANGE_PASSWORD];
  return !noRedirectPages.includes(pageType);
};

// Hook для валидации форм
export const useAuthFormValidation = <T extends Record<string, any>>(
  formData: T,
  pageType: AuthPageType
): AuthFormValidation => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const validateField = useCallback((field: string, value: any): string => {
    switch (field) {
      case 'email':
        if (!value) return 'Email обязателен';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Неверный формат email';
        return '';
      
      case 'password':
        if (!value) return 'Пароль обязателен';
        if (value.length < 8) return 'Пароль должен содержать минимум 8 символов';
        return '';
      
      case 'confirmPassword':
        if (!value) return 'Подтверждение пароля обязательно';
        if (value !== formData.password) return 'Пароли не совпадают';
        return '';
      
      case 'firstName':
        if (!value) return 'Имя обязательно';
        if (value.length < 2) return 'Имя должно содержать минимум 2 символа';
        return '';
      
      case 'lastName':
        if (!value) return 'Фамилия обязательна';
        if (value.length < 2) return 'Фамилия должна содержать минимум 2 символа';
        return '';
      
      case 'agreeToTerms':
        if (pageType === AuthPageType.REGISTER && !value) {
          return 'Необходимо согласие с условиями';
        }
        return '';
      
      default:
        return '';
    }
  }, [formData, pageType]);
  
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);
  
  const touchField = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);
  
  const touchAllFields = useCallback(() => {
    const allTouched = Object.keys(formData).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);
  }, [formData]);
  
  // Валидируем форму при изменении данных
  useEffect(() => {
    validateForm();
  }, [validateForm]);
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    touched,
  };
};

// Hook для работы с URL параметрами auth страниц
export const useAuthUrlParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const getParam = (key: string): string | null => {
    return searchParams.get(key);
  };
  
  const setParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);
    setSearchParams(newParams);
  };
  
  const removeParam = (key: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(key);
    setSearchParams(newParams);
  };
  
  return {
    redirectTo: getParam('redirectTo'),
    token: getParam('token'),
    email: getParam('email'),
    inviteCode: getParam('inviteCode'),
    getParam,
    setParam,
    removeParam,
  };
};

// Hook для обработки форм login
export const useLoginForm = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { redirectTo } = useAuthUrlParams();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const validation = useAuthFormValidation(formData, AuthPageType.LOGIN);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validation.isValid) {
      return;
    }
    
    try {
      // Логика авторизации будет реализована при интеграции с Redux
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация API вызова
      
      // Перенаправляем после успешной авторизации
      navigation.navigateToRoute(redirectTo || '/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return {
    formData,
    setFormData,
    validation,
    handleSubmit,
  };
};

// Hook для обработки форм register
export const useRegisterForm = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { inviteCode, redirectTo } = useAuthUrlParams();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    inviteCode: inviteCode || '',
  });
  
  const validation = useAuthFormValidation(formData, AuthPageType.REGISTER);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validation.isValid) {
      return;
    }
    
    try {
      // Логика регистрации будет реализована при интеграции с Redux
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация API вызова
      
      // Перенаправляем после успешной регистрации
      navigation.navigateToLogin();
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };
  
  return {
    formData,
    setFormData,
    validation,
    handleSubmit,
  };
};

// Hook для состояния загрузки auth страниц
export const useAuthPageLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };
  
  const stopLoading = () => {
    setIsLoading(false);
  };
  
  const setAuthError = (error: string) => {
    setError(error);
    setIsLoading(false);
  };
  
  const clearError = () => {
    setError(null);
  };
  
  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setAuthError,
    clearError,
  };
}; 