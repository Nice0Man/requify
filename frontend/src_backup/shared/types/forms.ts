// Common form types
export interface FormErrors {
  [key: string]: string | string[];
}

export interface FormFieldProps {
  name: string;
  label: string;
  value: any;
  onChange: (value: any) => void;
  error?: string | string[];
  required?: boolean;
  disabled?: boolean;
} 