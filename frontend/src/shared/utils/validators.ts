// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Phone validation (basic international format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Password strength validation
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Required field validation
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

// Numeric validations
export const isPositiveNumber = (value: number): boolean => {
  return !isNaN(value) && value > 0;
};

export const isInRange = (value: number, min: number, max: number): boolean => {
  return !isNaN(value) && value >= min && value <= max;
};

// String validations
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

// File validation
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const isValidFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

// Date validations
export const isValidDate = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

export const isFutureDate = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isValidDate(dateObj) && dateObj > new Date();
};

export const isPastDate = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isValidDate(dateObj) && dateObj < new Date();
};

// Form validation helpers
export const validateField = (
  value: any,
  rules: Array<{
    validator: (value: any) => boolean;
    message: string;
  }>
): string | null => {
  for (const rule of rules) {
    if (!rule.validator(value)) {
      return rule.message;
    }
  }
  return null;
};

// Common validation rule sets
export const emailValidationRules = [
  {
    validator: isRequired,
    message: 'Email is required',
  },
  {
    validator: isValidEmail,
    message: 'Please enter a valid email address',
  },
];

export const passwordValidationRules = [
  {
    validator: isRequired,
    message: 'Password is required',
  },
  {
    validator: (value: string) => validatePassword(value).isValid,
    message: 'Password does not meet security requirements',
  },
];

export const phoneValidationRules = [
  {
    validator: isRequired,
    message: 'Phone number is required',
  },
  {
    validator: isValidPhone,
    message: 'Please enter a valid phone number',
  },
];

// Custom validation builders
export const requiredRule = (message = 'This field is required') => ({
  validator: isRequired,
  message,
});

export const minLengthRule = (minLength: number, message?: string) => ({
  validator: (value: string) => hasMinLength(value, minLength),
  message: message || `Must be at least ${minLength} characters`,
});

export const maxLengthRule = (maxLength: number, message?: string) => ({
  validator: (value: string) => hasMaxLength(value, maxLength),
  message: message || `Must not exceed ${maxLength} characters`,
});

export const rangeRule = (min: number, max: number, message?: string) => ({
  validator: (value: number) => isInRange(value, min, max),
  message: message || `Must be between ${min} and ${max}`,
}); 