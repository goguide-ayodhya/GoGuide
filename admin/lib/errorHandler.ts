/**
 * Reusable error handler for API validation errors
 * Extracts field-level and general errors from API responses
 */

export interface FieldErrors {
  [key: string]: string;
}

export interface ParsedError {
  message: string;
  fieldErrors: FieldErrors;
  hasFieldErrors: boolean;
}

/**
 * Parse API error response and extract field-level and general errors
 * @param error - The error object from fetch or catch block
 * @param response - The JSON response from the API (if available)
 * @returns Parsed error object with message and field-level errors
 */
export function parseApiError(error: any, response?: any): ParsedError {
  const fieldErrors: FieldErrors = {};
  let message = "An error occurred";

  // If we have a response object with errors structure
  if (response?.errors && typeof response.errors === "object") {
    Object.assign(fieldErrors, response.errors);
  }

  // Get the main error message
  if (response?.message) {
    message = response.message;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }

  return {
    message,
    fieldErrors,
    hasFieldErrors: Object.keys(fieldErrors).length > 0,
  };
}

/**
 * Get error message for a specific field
 * @param fieldName - The field name to get error for
 * @param fieldErrors - The field errors object
 * @returns The error message or empty string if no error
 */
export function getFieldError(
  fieldName: string,
  fieldErrors: FieldErrors
): string {
  return fieldErrors[fieldName] || "";
}

/**
 * Check if a field has an error
 * @param fieldName - The field name to check
 * @param fieldErrors - The field errors object
 * @returns True if field has an error
 */
export function hasFieldError(
  fieldName: string,
  fieldErrors: FieldErrors
): boolean {
  return !!fieldErrors[fieldName];
}

/**
 * Validate empty fields client-side before API call
 * @param fields - Object with field names and values to validate
 * @returns Object with validation errors
 */
export function validateRequiredFields(
  fields: Record<string, string | undefined>
): FieldErrors {
  const errors: FieldErrors = {};

  for (const [key, value] of Object.entries(fields)) {
    if (!value || value.trim() === "") {
      // Convert camelCase to readable format
      const fieldLabel = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
      errors[key] = `${fieldLabel} is required`;
    }
  }

  return errors;
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns Error message or empty string if valid
 */
export function validateEmail(email: string): string {
  if (!email) return "Email is required";
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email address";
  }

  return "";
}

/**
 * Validate password
 * @param password - Password to validate
 * @param minLength - Minimum password length (default: 6)
 * @returns Error message or empty string if valid
 */
export function validatePassword(password: string, minLength = 6): string {
  if (!password) return "Password is required";

  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }

  return "";
}

/**
 * Validate phone number
 * @param phone - Phone to validate
 * @returns Error message or empty string if valid
 */
export function validatePhone(phone: string): string {
  if (!phone) return "Phone number is required";

  const phoneRegex = /^[0-9]{10,}$/;
  if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
    return "Phone number must be at least 10 digits";
  }

  return "";
}
