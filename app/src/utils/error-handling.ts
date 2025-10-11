/**
 * Enhanced error handling utilities for Requestly API Client & Interceptor
 * Provides comprehensive error management and user feedback
 */

import { useCallback, useEffect, useRef } from 'react';

/**
 * Custom error classes for Requestly
 */
export class RequestlyError extends Error {
  public readonly code: string;
  public readonly details: Record<string, any>;
  public readonly timestamp: string;
  public readonly context?: string;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    details: Record<string, any> = {},
    context?: string
  ) {
    super(message);
    this.name = 'RequestlyError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.context = context;
    this.stack = this.stack || (new Error()).stack;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack,
    };
  }
}

export class APIRequestError extends RequestlyError {
  constructor(
    message: string,
    url: string,
    method: string,
    status?: number,
    details: Record<string, any> = {}
  ) {
    super(
      message,
      'API_REQUEST_ERROR',
      { url, method, status, ...details },
      'API Request'
    );
    this.name = 'APIRequestError';
  }
}

export class NetworkError extends RequestlyError {
  constructor(
    message: string,
    url: string,
    details: Record<string, any> = {}
  ) {
    super(
      message,
      'NETWORK_ERROR',
      { url, ...details },
      'Network'
    );
    this.name = 'NetworkError';
  }
}

export class ConfigurationError extends RequestlyError {
  constructor(
    message: string,
    configKey: string,
    details: Record<string, any> = {}
  ) {
    super(
      message,
      'CONFIGURATION_ERROR',
      { configKey, ...details },
      'Configuration'
    );
    this.name = 'ConfigurationError';
  }
}

export class ValidationError extends RequestlyError {
  constructor(
    message: string,
    field: string,
    value: any,
    details: Record<string, any> = {}
  ) {
    super(
      message,
      'VALIDATION_ERROR',
      { field, value, ...details },
      'Validation'
    );
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends RequestlyError {
  constructor(
    message: string,
    details: Record<string, any> = {}
  ) {
    super(
      message,
      'AUTHENTICATION_ERROR',
      details,
      'Authentication'
    );
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends RequestlyError {
  constructor(
    message: string,
    resource: string,
    details: Record<string, any> = {}
  ) {
    super(
      message,
      'AUTHORIZATION_ERROR',
      { resource, ...details },
      'Authorization'
    );
    this.name = 'AuthorizationError';
  }
}

export class ProxyError extends RequestlyError {
  constructor(
    message: string,
    proxyUrl: string,
    details: Record<string, any> = {}
  ) {
    super(
      message,
      'PROXY_ERROR',
      { proxyUrl, ...details },
      'Proxy'
    );
    this.name = 'ProxyError';
  }
}

export class InterceptorError extends RequestlyError {
  constructor(
    message: string,
    ruleId: string,
    details: Record<string, any> = {}
  ) {
    super(
      message,
      'INTERCEPTOR_ERROR',
      { ruleId, ...details },
      'Interceptor'
    );
    this.name = 'InterceptorError';
  }
}

/**
 * Error handler class
 */
export class ErrorHandler {
  private errors: Array<{
    error: RequestlyError;
    context?: string;
    severity: 'error' | 'warning' | 'info';
    timestamp: string;
    userAgent: string;
    url: string;
  }> = [];
  private maxErrors: number = 1000;
  private listeners: Map<string, Array<(errorInfo: any) => void>> = new Map();

  constructor() {
    this.setupGlobalHandlers();
  }

  /**
   * Handle an error
   */
  handleError(
    error: Error | RequestlyError,
    context?: string,
    severity: 'error' | 'warning' | 'info' = 'error'
  ): void {
    const requestlyError = error instanceof RequestlyError 
      ? error 
      : new RequestlyError(error.message, 'UNKNOWN_ERROR', { originalError: error }, context);

    const errorInfo = {
      error: requestlyError,
      context,
      severity,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
    };

    // Add to error log
    this.errors.push(errorInfo);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console
    console.error(`[${severity.toUpperCase()}] ${context ? `[${context}] ` : ''}${error.message}`, error);

    // Notify listeners
    this.notifyListeners(errorInfo);

    // Show user notification if needed
    if (severity === 'error') {
      this.showUserNotification(errorInfo);
    }
  }

  /**
   * Add error listener
   */
  addListener(event: string, callback: (errorInfo: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Remove error listener
   */
  removeListener(event: string, callback: (errorInfo: any) => void): void {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Notify listeners
   */
  private notifyListeners(errorInfo: any): void {
    const callbacks = this.listeners.get('error') || [];
    callbacks.forEach(callback => {
      try {
        callback(errorInfo);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }

  /**
   * Show user notification
   */
  private showUserNotification(errorInfo: any): void {
    // Try to use toast notification if available
    if (typeof window !== 'undefined' && (window as any).toast) {
      (window as any).toast.error(errorInfo.error.message);
    } else {
      // Fallback to browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Requestly Error', {
          body: errorInfo.error.message,
          icon: '/favicon.ico',
        });
      }
    }
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalHandlers(): void {
    if (typeof window === 'undefined') return;

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'Unhandled Promise Rejection', 'error');
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'Global Error', 'error');
    });
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byCode: Record<string, number>;
    byContext: Record<string, number>;
    recent: any[];
  } {
    const stats = {
      total: this.errors.length,
      bySeverity: {} as Record<string, number>,
      byCode: {} as Record<string, number>,
      byContext: {} as Record<string, number>,
      recent: this.errors.slice(-10),
    };

    this.errors.forEach(errorInfo => {
      // Count by severity
      stats.bySeverity[errorInfo.severity] = (stats.bySeverity[errorInfo.severity] || 0) + 1;
      
      // Count by error code
      const code = errorInfo.error.code;
      stats.byCode[code] = (stats.byCode[code] || 0) + 1;
      
      // Count by context
      const context = errorInfo.context || 'Unknown';
      stats.byContext[context] = (stats.byContext[context] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear error log
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Export errors for debugging
   */
  exportErrors(): {
    errors: any[];
    stats: any;
    timestamp: string;
  } {
    return {
      errors: this.errors,
      stats: this.getErrorStats(),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Async error handling utilities
 */
export class AsyncErrorHandler {
  /**
   * Wrap async function with error handling
   */
  static wrapAsync<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: string
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        globalErrorHandler.handleError(error as Error, context, 'error');
        throw error;
      }
    };
  }

  /**
   * Handle promise rejection
   */
  static handlePromiseRejection<T>(
    promise: Promise<T>,
    context?: string
  ): Promise<T> {
    return promise.catch(error => {
      globalErrorHandler.handleError(error, context, 'error');
      throw error;
    });
  }

  /**
   * Retry async operation with exponential backoff
   */
  static async retryAsync<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context?: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          globalErrorHandler.handleError(error as Error, context, 'error');
          throw error;
        }
        
        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        globalErrorHandler.handleError(error as Error, `${context} (attempt ${attempt}/${maxRetries})`, 'warning');
      }
    }
    
    throw lastError!;
  }
}

/**
 * API-specific error handling
 */
export class APIErrorHandler {
  /**
   * Handle API request errors
   */
  static handleAPIError(
    error: Error,
    url: string,
    method: string,
    status?: number
  ): APIRequestError {
    const apiError = new APIRequestError(
      `API request failed: ${error.message}`,
      url,
      method,
      status,
      { originalError: error }
    );
    
    globalErrorHandler.handleError(apiError, 'API Request', 'error');
    return apiError;
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(error: Error, url: string): NetworkError {
    const networkError = new NetworkError(
      `Network request failed: ${error.message}`,
      url,
      { originalError: error }
    );
    
    globalErrorHandler.handleError(networkError, 'Network Request', 'error');
    return networkError;
  }

  /**
   * Handle fetch errors with retry
   */
  static async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    maxRetries: number = 3
  ): Promise<Response> {
    return AsyncErrorHandler.retryAsync(
      async () => {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response;
      },
      maxRetries,
      1000,
      `Network Request: ${url}`
    );
  }
}

/**
 * Configuration error handling
 */
export class ConfigurationErrorHandler {
  /**
   * Handle configuration errors
   */
  static handleConfigurationError(
    error: Error,
    configKey: string
  ): ConfigurationError {
    const configError = new ConfigurationError(
      `Configuration error: ${error.message}`,
      configKey,
      { originalError: error }
    );
    
    globalErrorHandler.handleError(configError, 'Configuration', 'error');
    return configError;
  }

  /**
   * Validate configuration
   */
  static validateConfiguration(
    config: Record<string, any>,
    schema: Record<string, { required?: boolean; type?: string; validator?: (value: any) => boolean }>
  ): boolean {
    try {
      for (const key in schema) {
        const fieldSchema = schema[key];
        
        if (fieldSchema.required && !(key in config)) {
          throw new Error(`Missing required configuration: ${key}`);
        }
        
        if (key in config && fieldSchema.type) {
          const actualType = typeof config[key];
          const expectedType = fieldSchema.type;
          
          if (actualType !== expectedType) {
            throw new Error(`Invalid type for ${key}: expected ${expectedType}, got ${actualType}`);
          }
        }
        
        if (key in config && fieldSchema.validator) {
          if (!fieldSchema.validator(config[key])) {
            throw new Error(`Invalid value for ${key}: ${config[key]}`);
          }
        }
      }
      
      return true;
    } catch (error) {
      this.handleConfigurationError(error as Error, 'validation');
      return false;
    }
  }
}

/**
 * React hook for error handling
 */
export function useErrorHandling() {
  const handleError = useCallback((
    error: Error | RequestlyError,
    context?: string,
    severity: 'error' | 'warning' | 'info' = 'error'
  ) => {
    return globalErrorHandler.handleError(error, context, severity);
  }, []);

  const handleAsyncError = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: string
  ) => {
    return AsyncErrorHandler.wrapAsync(fn, context);
  }, []);

  const handlePromiseRejection = useCallback(<T>(
    promise: Promise<T>,
    context?: string
  ) => {
    return AsyncErrorHandler.handlePromiseRejection(promise, context);
  }, []);

  const retryAsync = useCallback(<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context?: string
  ) => {
    return AsyncErrorHandler.retryAsync(fn, maxRetries, delay, context);
  }, []);

  const handleAPIError = useCallback((
    error: Error,
    url: string,
    method: string,
    status?: number
  ) => {
    return APIErrorHandler.handleAPIError(error, url, method, status);
  }, []);

  const handleNetworkError = useCallback((error: Error, url: string) => {
    return APIErrorHandler.handleNetworkError(error, url);
  }, []);

  const fetchWithRetry = useCallback((
    url: string,
    options: RequestInit = {},
    maxRetries: number = 3
  ) => {
    return APIErrorHandler.fetchWithRetry(url, options, maxRetries);
  }, []);

  const handleConfigurationError = useCallback((
    error: Error,
    configKey: string
  ) => {
    return ConfigurationErrorHandler.handleConfigurationError(error, configKey);
  }, []);

  const validateConfiguration = useCallback((
    config: Record<string, any>,
    schema: Record<string, { required?: boolean; type?: string; validator?: (value: any) => boolean }>
  ) => {
    return ConfigurationErrorHandler.validateConfiguration(config, schema);
  }, []);

  const getErrorStats = useCallback(() => {
    return globalErrorHandler.getErrorStats();
  }, []);

  const clearErrors = useCallback(() => {
    globalErrorHandler.clearErrors();
  }, []);

  const exportErrors = useCallback(() => {
    return globalErrorHandler.exportErrors();
  }, []);

  return {
    handleError,
    handleAsyncError,
    handlePromiseRejection,
    retryAsync,
    handleAPIError,
    handleNetworkError,
    fetchWithRetry,
    handleConfigurationError,
    validateConfiguration,
    getErrorStats,
    clearErrors,
    exportErrors,
  };
}

// Global error handler instance
export const globalErrorHandler = new ErrorHandler();
