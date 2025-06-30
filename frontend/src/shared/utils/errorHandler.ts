// Comprehensive error handling utility for API responses

export interface ApiErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
  input?: any;
}

export interface ApiError {
  detail: string | ApiErrorDetail[];
  error?: string;
  error_description?: string;
}

export interface FormErrors {
  [field: string]: string;
}

/**
 * Extracts and formats error messages from API responses
 */
export const extractErrorMessage = (error: any, defaultMessage?: string): string => {
  // Handle different error structures
  if (error?.response?.data) {
    const data = error.response.data;
    
    // Handle validation errors with detail array
    if (data.detail && Array.isArray(data.detail)) {
      return data.detail.map((err: ApiErrorDetail) => err.msg).join(', ');
    }
    
    // Handle simple detail string
    if (typeof data.detail === 'string') {
      return data.detail;
    }
    
    // Handle error_description
    if (data.error_description) {
      return data.error_description;
    }
    
    // Handle error field
    if (data.error) {
      return data.error;
    }
    
    // Handle message field
    if (data.message) {
      return data.message;
    }
  }
  
  // Handle direct error message
  if (error?.message) {
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Default fallback
  return defaultMessage || 'An unexpected error occurred. Please try again.';
};

/**
 * Extracts field-specific validation errors from API responses
 */
export const extractFieldErrors = (error: any): FormErrors => {
  const fieldErrors: FormErrors = {};
  
  if (error?.response?.data?.detail && Array.isArray(error.response.data.detail)) {
    error.response.data.detail.forEach((err: ApiErrorDetail) => {
      if (err.loc && err.loc.length > 0) {
        // Get the field name (last element in loc array)
        const fieldName = err.loc[err.loc.length - 1];
        if (typeof fieldName === 'string') {
          fieldErrors[fieldName] = err.msg;
        }
      }
    });
  }
  
  return fieldErrors;
};

/**
 * Checks if an error is a validation error (422 status)
 */
export const isValidationError = (error: any): boolean => {
  return error?.response?.status === 422;
};

/**
 * Checks if an error is an authentication error (401 status)
 */
export const isAuthError = (error: any): boolean => {
  return error?.response?.status === 401;
};

/**
 * Checks if an error is a permission error (403 status)
 */
export const isPermissionError = (error: any): boolean => {
  return error?.response?.status === 403;
};

/**
 * Checks if an error is a not found error (404 status)
 */
export const isNotFoundError = (error: any): boolean => {
  return error?.response?.status === 404;
};

/**
 * Checks if an error is a server error (5xx status)
 */
export const isServerError = (error: any): boolean => {
  const status = error?.response?.status;
  return status && status >= 500 && status < 600;
};

/**
 * Gets user-friendly error message based on error type
 */
export const getUserFriendlyErrorMessage = (error: any): string => {
  if (isAuthError(error)) {
    return 'Your session has expired. Please sign in again.';
  }
  
  if (isPermissionError(error)) {
    return 'You do not have permission to perform this action.';
  }
  
  if (isNotFoundError(error)) {
    return 'The requested resource was not found.';
  }
  
  if (isServerError(error)) {
    return 'Server error occurred. Please try again later.';
  }
  
  if (isValidationError(error)) {
    return extractErrorMessage(error);
  }
  
  return extractErrorMessage(error);
};

/**
 * Handles API errors with appropriate user feedback
 */
export const handleApiError = (
  error: any,
  options: {
    showToast?: boolean;
    setFieldErrors?: (errors: FormErrors) => void;
    setGeneralError?: (error: string) => void;
    onAuthError?: () => void;
    customMessage?: string;
  } = {}
) => {
  const {
    showToast = true,
    setFieldErrors,
    setGeneralError,
    onAuthError,
    customMessage
  } = options;
  
  console.error('API Error:', error);
  
  // Handle authentication errors
  if (isAuthError(error) && onAuthError) {
    onAuthError();
    return;
  }
  
  // Extract field-specific errors for validation errors
  if (isValidationError(error) && setFieldErrors) {
    const fieldErrors = extractFieldErrors(error);
    if (Object.keys(fieldErrors).length > 0) {
      setFieldErrors(fieldErrors);
      return;
    }
  }
  
  // Set general error message
  const errorMessage = customMessage || getUserFriendlyErrorMessage(error);
  
  if (setGeneralError) {
    setGeneralError(errorMessage);
  }
  
  // Show toast notification if requested
  if (showToast && (window as any).toast) {
    (window as any).toast.error(errorMessage);
  }
};

/**
 * Formats validation errors for display in forms
 */
export const formatValidationErrors = (errors: FormErrors): string[] => {
  return Object.entries(errors).map(([field, message]) => {
    const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `${fieldName}: ${message}`;
  });
};

/**
 * Clears field errors when user starts typing
 */
export const clearFieldError = (
  fieldName: string,
  errors: FormErrors,
  setErrors: (errors: FormErrors) => void
) => {
  if (errors[fieldName]) {
    const newErrors = { ...errors };
    delete newErrors[fieldName];
    setErrors(newErrors);
  }
};

/**
 * Network error handling
 */
export const isNetworkError = (error: any): boolean => {
  return error?.code === 'NETWORK_ERROR' || 
         error?.message?.includes('Network Error') ||
         !error?.response;
};

/**
 * Timeout error handling
 */
export const isTimeoutError = (error: any): boolean => {
  return error?.code === 'ECONNABORTED' || 
         error?.message?.includes('timeout');
};

/**
 * Gets appropriate retry delay based on error type
 */
export const getRetryDelay = (error: any, attempt: number): number => {
  if (isServerError(error)) {
    // Exponential backoff for server errors
    return Math.min(1000 * Math.pow(2, attempt), 10000);
  }
  
  if (isNetworkError(error) || isTimeoutError(error)) {
    // Linear backoff for network issues
    return Math.min(2000 * attempt, 10000);
  }
  
  // Default delay
  return 1000;
}; 