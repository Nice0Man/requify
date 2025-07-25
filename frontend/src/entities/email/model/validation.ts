import * as yup from "yup";

// Email validation schema
export const emailSchema = yup.object({
  email: yup
    .string()
    .min(1, "email.validation.required")
    .email("email.validation.invalid")
    .max(255, "email.validation.tooLong"),
});

export type EmailFormData = yup.InferType<typeof emailSchema>;

// Email validation function
export const isValidEmail = (email: string): boolean => {
  try {
    emailSchema.validateSync({ email });
    return true;
  } catch {
    return false;
  }
};

// Validation error type
export interface EmailValidationError {
  field: "email";
  message: string;
}

// Validate email and return error if invalid
export const validateEmail = (email: string): EmailValidationError | null => {
  try {
    emailSchema.validateSync({ email });
    return null;
  } catch (error: any) {
    if (error instanceof yup.ValidationError) {
      const firstError = error.errors[0];
      return {
        field: "email",
        message: firstError,
      };
    }
    return {
      field: "email",
      message: "email.validation.invalid",
    };
  }
};

// Email subscription state interface
export interface EmailSubscriptionState {
  email: string;
  isLoading: boolean;
  error: string;
  showSuccess: boolean;
}

// Email subscription actions
export interface EmailSubscriptionActions {
  setEmail: (email: string) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setShowSuccess: (success: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}
