/**
 * Utility function to extract human-readable error messages from API responses
 * Handles various error formats including validation errors from FastAPI/Pydantic
 */
export const extractErrorMessage = (error: any, defaultMessage: string = 'An error occurred'): string => {
  // Check if we have a response with error details
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    
    // Handle validation errors (array of error objects)
    if (Array.isArray(detail)) {
      return detail.map((err: any) => {
        if (typeof err === 'string') return err;
        if (err.msg) return err.msg;
        if (err.message) return err.message;
        return 'Validation error';
      }).join(', ');
    } 
    // Handle single validation error object
    else if (typeof detail === 'object' && detail.msg) {
      return detail.msg;
    }
    // Handle string detail
    else if (typeof detail === 'string') {
      return detail;
    }
  }
  
  // Check for other common error message properties
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error_description) {
    return error.response.data.error_description;
  }
  
  if (error.message) {
    return error.message;
  }
  
  // Return default message if nothing else is found
  return defaultMessage;
};

/**
 * Utility function to handle API errors consistently
 * Extracts error message and optionally shows toast notification
 */
export const handleApiError = (
  error: any,
  defaultMessage: string = 'An error occurred',
  setError?: (message: string) => void,
  showToast?: (message: string) => void
): string => {
  const errorMessage = extractErrorMessage(error, defaultMessage);
  
  if (setError) {
    setError(errorMessage);
  }
  
  if (showToast) {
    showToast(errorMessage);
  }
  
  return errorMessage;
}; 