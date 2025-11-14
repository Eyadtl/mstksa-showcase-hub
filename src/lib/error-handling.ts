/**
 * Centralized Error Handling Utility
 * 
 * Provides consistent error handling, logging, and user-friendly error messages
 * across the application.
 */

import { toast } from 'sonner';

/**
 * Error types for categorization
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  FILE_UPLOAD = 'FILE_UPLOAD',
  DATABASE = 'DATABASE',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Structured error interface
 */
export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  originalError?: any;
  code?: string;
  retryable?: boolean;
  details?: Record<string, any>;
}

/**
 * Error classification based on error properties
 */
export const classifyError = (error: any): ErrorType => {
  // Network errors
  if (
    error?.message?.includes('fetch') ||
    error?.message?.includes('network') ||
    error?.message?.includes('Failed to fetch') ||
    error?.code === 'NETWORK_ERROR' ||
    error?.name === 'NetworkError'
  ) {
    return ErrorType.NETWORK;
  }

  // Authentication errors
  if (
    error?.message?.includes('auth') ||
    error?.message?.includes('unauthorized') ||
    error?.message?.includes('Invalid login credentials') ||
    error?.message?.includes('session') ||
    error?.code === 'PGRST301' || // JWT expired
    error?.status === 401
  ) {
    return ErrorType.AUTHENTICATION;
  }

  // Validation errors
  if (
    error?.message?.includes('validation') ||
    error?.message?.includes('invalid') ||
    error?.message?.includes('required') ||
    error?.code === 'INVALID_FILE_TYPE' ||
    error?.code === 'FILE_TOO_LARGE' ||
    error?.name === 'ValidationError'
  ) {
    return ErrorType.VALIDATION;
  }

  // File upload errors
  if (
    error?.message?.includes('upload') ||
    error?.message?.includes('file') ||
    error?.code === 'UPLOAD_FAILED' ||
    error?.code === 'STORAGE_ERROR'
  ) {
    return ErrorType.FILE_UPLOAD;
  }

  // Database errors
  if (
    error?.message?.includes('database') ||
    error?.message?.includes('query') ||
    error?.code?.startsWith('PGRST') ||
    error?.code?.startsWith('23') // PostgreSQL error codes
  ) {
    return ErrorType.DATABASE;
  }

  // Permission errors
  if (
    error?.message?.includes('permission') ||
    error?.message?.includes('forbidden') ||
    error?.message?.includes('access denied') ||
    error?.status === 403
  ) {
    return ErrorType.PERMISSION;
  }

  // Not found errors
  if (
    error?.message?.includes('not found') ||
    error?.status === 404 ||
    error?.code === 'PGRST116'
  ) {
    return ErrorType.NOT_FOUND;
  }

  return ErrorType.UNKNOWN;
};

/**
 * Get user-friendly error message based on error type
 */
export const getUserFriendlyMessage = (
  error: any,
  type: ErrorType,
  context?: string
): string => {
  // If error already has a user-friendly message, use it
  if (error?.userMessage) {
    return error.userMessage;
  }

  // If error is a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If error has a message property that looks user-friendly, use it
  if (error?.message && !error.message.includes('Error:') && error.message.length < 200) {
    return error.message;
  }

  // Generate user-friendly message based on error type
  switch (type) {
    case ErrorType.NETWORK:
      return 'Unable to connect to the server. Please check your internet connection and try again.';

    case ErrorType.AUTHENTICATION:
      if (error?.message?.includes('Invalid login credentials')) {
        return 'Invalid email or password. Please try again.';
      }
      if (error?.message?.includes('session')) {
        return 'Your session has expired. Please log in again.';
      }
      return 'Authentication failed. Please log in again.';

    case ErrorType.VALIDATION:
      if (error?.code === 'INVALID_FILE_TYPE') {
        return error.message || 'Invalid file type. Please select a valid file.';
      }
      if (error?.code === 'FILE_TOO_LARGE') {
        return error.message || 'File size is too large. Please select a smaller file.';
      }
      return error.message || 'Please check your input and try again.';

    case ErrorType.FILE_UPLOAD:
      return 'Failed to upload file. Please try again.';

    case ErrorType.DATABASE:
      if (error?.code === '23505') {
        return 'This item already exists. Please use a different name.';
      }
      if (error?.code === '23503') {
        return 'Cannot delete this item because it is being used elsewhere.';
      }
      return context
        ? `Failed to ${context}. Please try again.`
        : 'A database error occurred. Please try again.';

    case ErrorType.PERMISSION:
      return 'You do not have permission to perform this action.';

    case ErrorType.NOT_FOUND:
      return 'The requested item was not found.';

    case ErrorType.UNKNOWN:
    default:
      return context
        ? `Failed to ${context}. Please try again or contact support if the problem persists.`
        : 'An unexpected error occurred. Please try again or contact support if the problem persists.';
  }
};

/**
 * Check if an error is retryable
 */
export const isRetryable = (type: ErrorType): boolean => {
  return [
    ErrorType.NETWORK,
    ErrorType.FILE_UPLOAD,
    ErrorType.DATABASE,
    ErrorType.UNKNOWN,
  ].includes(type);
};

/**
 * Create a structured AppError from any error
 */
export const createAppError = (
  error: any,
  context?: string,
  additionalDetails?: Record<string, any>
): AppError => {
  const type = classifyError(error);
  const userMessage = getUserFriendlyMessage(error, type, context);
  const retryable = isRetryable(type);

  return {
    type,
    message: error?.message || String(error),
    userMessage,
    originalError: error,
    code: error?.code,
    retryable,
    details: {
      context,
      ...additionalDetails,
      timestamp: new Date().toISOString(),
    },
  };
};

/**
 * Log error to console with structured information
 */
export const logError = (appError: AppError): void => {
  const logData = {
    type: appError.type,
    message: appError.message,
    code: appError.code,
    retryable: appError.retryable,
    details: appError.details,
    stack: appError.originalError?.stack,
  };

  // Use different console methods based on error type
  if (appError.type === ErrorType.NETWORK) {
    console.warn('🌐 Network Error:', logData);
  } else if (appError.type === ErrorType.AUTHENTICATION) {
    console.warn('🔒 Authentication Error:', logData);
  } else if (appError.type === ErrorType.VALIDATION) {
    console.info('✋ Validation Error:', logData);
  } else {
    console.error('❌ Error:', logData);
  }
};

/**
 * Display error toast notification with appropriate styling
 */
export const showErrorToast = (appError: AppError, customMessage?: string): void => {
  const message = customMessage || appError.userMessage;
  
  // Add retry suggestion for retryable errors
  const description = appError.retryable
    ? `${message} ${appError.type === ErrorType.NETWORK ? 'Check your connection and try again.' : 'Please try again.'}`
    : message;

  toast.error(description, {
    duration: appError.type === ErrorType.VALIDATION ? 4000 : 5000,
  });
};

/**
 * Handle error with logging and user notification
 * 
 * @param error - The error to handle
 * @param context - Context description (e.g., "save catalog", "delete category")
 * @param options - Additional options
 * @returns The structured AppError
 */
export const handleError = (
  error: any,
  context?: string,
  options?: {
    showToast?: boolean;
    customMessage?: string;
    additionalDetails?: Record<string, any>;
  }
): AppError => {
  const { showToast = true, customMessage, additionalDetails } = options || {};

  // Create structured error
  const appError = createAppError(error, context, additionalDetails);

  // Log error
  logError(appError);

  // Show toast notification
  if (showToast) {
    showErrorToast(appError, customMessage);
  }

  return appError;
};

/**
 * Wrap async function with error handling
 * 
 * @param fn - Async function to wrap
 * @param context - Context description
 * @param options - Error handling options
 * @returns Wrapped function that handles errors
 */
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: string,
  options?: {
    showToast?: boolean;
    onError?: (error: AppError) => void;
  }
): T => {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = handleError(error, context, {
        showToast: options?.showToast ?? true,
      });

      if (options?.onError) {
        options.onError(appError);
      }

      throw appError;
    }
  }) as T;
};

/**
 * Retry async operation with exponential backoff
 * 
 * @param fn - Async function to retry
 * @param options - Retry options
 * @returns Result of the async function
 */
export const retryOperation = async <T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: any) => void;
  }
): Promise<T> => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    onRetry,
  } = options || {};

  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if it's not a retryable error
      const errorType = classifyError(error);
      if (!isRetryable(errorType)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay);

      // Call onRetry callback
      if (onRetry) {
        onRetry(attempt, error);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};
