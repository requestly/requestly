/**
 * Performance monitoring utilities for Requestly API Client & Interceptor
 * Provides comprehensive performance tracking and optimization features
 */

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: number;
  context?: Record<string, any>;
  memoryUsage?: number;
}

/**
 * Performance monitor class
 */
export class RequestlyPerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics: number = 1000;
  private observers: Map<string, PerformanceObserver> = new Map();
  private startTimes: Map<string, number> = new Map();

  constructor(private appName: string = 'requestly') {}

  /**
   * Start timing an operation
   */
  startTimer(operation: string): void {
    this.startTimes.set(operation, performance.now());
  }

  /**
   * End timing an operation and record the result
   */
  endTimer(operation: string, context?: Record<string, any>): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) {
      console.warn(`Timer for operation '${operation}' was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.startTimes.delete(operation);

    const metric: PerformanceMetrics = {
      operation,
      duration,
      timestamp: Date.now(),
      context,
      memoryUsage: this.getMemoryUsage(),
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    console.log(`[${this.appName}] ${operation}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  /**
   * Get performance statistics for an operation
   */
  getStats(operation: string): {
    count: number;
    total: number;
    average: number;
    min: number;
    max: number;
    median: number;
    p95: number;
    p99: number;
  } | null {
    const operationMetrics = this.metrics.filter(m => m.operation === operation);
    if (operationMetrics.length === 0) {
      return null;
    }

    const durations = operationMetrics.map(m => m.duration).sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);

    return {
      count: durations.length,
      total: sum,
      average: sum / durations.length,
      min: durations[0],
      max: durations[durations.length - 1],
      median: durations[Math.floor(durations.length / 2)],
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)],
    };
  }

  /**
   * Get all performance statistics
   */
  getAllStats(): Record<string, ReturnType<typeof this.getStats>> {
    const stats: Record<string, ReturnType<typeof this.getStats>> = {};
    const operations = [...new Set(this.metrics.map(m => m.operation))];
    
    operations.forEach(operation => {
      stats[operation] = this.getStats(operation);
    });

    return stats;
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Start monitoring Web Vitals
   */
  startWebVitalsMonitoring(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Monitor Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log(`[${this.appName}] LCP: ${lastEntry.startTime.toFixed(2)}ms`);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);
    } catch (error) {
      console.warn('Failed to start LCP monitoring:', error);
    }

    // Monitor First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const fid = (entry as any).processingStart - entry.startTime;
          console.log(`[${this.appName}] FID: ${fid}ms`);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);
    } catch (error) {
      console.warn('Failed to start FID monitoring:', error);
    }

    // Monitor Cumulative Layout Shift (CLS)
    try {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        console.log(`[${this.appName}] CLS: ${clsValue.toFixed(4)}`);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);
    } catch (error) {
      console.warn('Failed to start CLS monitoring:', error);
    }
  }

  /**
   * Stop all observers
   */
  stopMonitoring(): void {
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = [];
    this.startTimes.clear();
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }
}

/**
 * Network performance monitoring
 */
export class NetworkPerformanceMonitor {
  private requests: Map<string, any> = new Map();
  private maxRequests: number = 500;

  constructor() {
    this.startMonitoring();
  }

  /**
   * Start monitoring network requests
   */
  private startMonitoring(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'navigation' || entry.entryType === 'resource') {
            this.recordRequest(entry);
          }
        });
      });
      observer.observe({ entryTypes: ['navigation', 'resource'] });
    } catch (error) {
      console.warn('Failed to start network monitoring:', error);
    }
  }

  /**
   * Record a network request
   */
  private recordRequest(entry: PerformanceEntry): void {
    const request = {
      name: entry.name,
      type: entry.entryType,
      duration: entry.duration,
      startTime: entry.startTime,
      endTime: entry.startTime + entry.duration,
      size: (entry as any).transferSize || 0,
    };

    // Use unique key to preserve duplicate requests for the same URL
    const uniqueKey = `${entry.name}:${entry.startTime}`;
    this.requests.set(uniqueKey, request);

    // Keep only recent requests
    if (this.requests.size > this.maxRequests) {
      const firstKey = this.requests.keys().next().value;
      this.requests.delete(firstKey);
    }
  }

  /**
   * Get network statistics
   */
  getNetworkStats(): {
    totalRequests: number;
    avgDuration: number;
    maxDuration: number;
    minDuration: number;
    totalSize: number;
    avgSize: number;
  } | null {
    const requests = Array.from(this.requests.values());
    if (requests.length === 0) {
      return null;
    }

    const durations = requests.map(r => r.duration);
    const sizes = requests.map(r => r.size);

    return {
      totalRequests: requests.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
      totalSize: sizes.reduce((a, b) => a + b, 0),
      avgSize: sizes.reduce((a, b) => a + b, 0) / sizes.length,
    };
  }
}

/**
 * API request performance tracking
 */
export class APIRequestTracker {
  private requests: Map<string, any> = new Map();
  private performanceMonitor: RequestlyPerformanceMonitor;

  constructor(performanceMonitor: RequestlyPerformanceMonitor) {
    this.performanceMonitor = performanceMonitor;
  }

  /**
   * Track API request start
   */
  startRequest(requestId: string, url: string, method: string): void {
    this.requests.set(requestId, {
      url,
      method,
      startTime: Date.now(),
      status: 'pending',
    });

    this.performanceMonitor.startTimer(`api-request-${requestId}`);
  }

  /**
   * Track API request completion
   */
  endRequest(requestId: string, status: number, responseSize?: number): void {
    const request = this.requests.get(requestId);
    if (!request) {
      console.warn(`Request ${requestId} not found`);
      return;
    }

    const duration = this.performanceMonitor.endTimer(`api-request-${requestId}`, {
      url: request.url,
      method: request.method,
      status,
      responseSize,
    });

    request.endTime = Date.now();
    request.duration = duration;
    request.status = status;
    request.responseSize = responseSize;

    // Log slow requests
    if (duration > 1000) {
      console.warn(`[requestly] Slow API request: ${request.method} ${request.url} (${duration.toFixed(2)}ms)`);
    }
  }

  /**
   * Track API request error
   */
  trackError(requestId: string, error: Error): void {
    const request = this.requests.get(requestId);
    if (!request) {
      console.warn(`Request ${requestId} not found`);
      return;
    }

    this.performanceMonitor.endTimer(`api-request-${requestId}`, {
      url: request.url,
      method: request.method,
      error: error.message,
    });

    request.error = error.message;
    request.status = 'error';
  }

  /**
   * Get request statistics
   */
  getRequestStats(): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgDuration: number;
    slowRequests: number;
  } {
    const requests = Array.from(this.requests.values());
    const successfulRequests = requests.filter(r => r.status >= 200 && r.status < 400).length;
    const failedRequests = requests.filter(r => r.status >= 400 || r.error).length;
    const slowRequests = requests.filter(r => r.duration > 1000).length;

    const avgDuration = requests.length > 0 
      ? requests.reduce((sum, r) => sum + (r.duration || 0), 0) / requests.length 
      : 0;

    return {
      totalRequests: requests.length,
      successfulRequests,
      failedRequests,
      avgDuration,
      slowRequests,
    };
  }
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitoring() {
  const performanceMonitor = useMemo(() => new RequestlyPerformanceMonitor('requestly'), []);
  const networkMonitor = useMemo(() => new NetworkPerformanceMonitor(), []);
  const apiTracker = useMemo(() => new APIRequestTracker(performanceMonitor), [performanceMonitor]);

  useEffect(() => {
    performanceMonitor.startWebVitalsMonitoring();
    
    return () => {
      performanceMonitor.stopMonitoring();
    };
  }, [performanceMonitor]);

  const startTimer = useCallback((operation: string) => {
    performanceMonitor.startTimer(operation);
  }, [performanceMonitor]);

  const endTimer = useCallback((operation: string, context?: Record<string, any>) => {
    return performanceMonitor.endTimer(operation, context);
  }, [performanceMonitor]);

  const getStats = useCallback((operation: string) => {
    return performanceMonitor.getStats(operation);
  }, [performanceMonitor]);

  const getAllStats = useCallback(() => {
    return performanceMonitor.getAllStats();
  }, [performanceMonitor]);

  const getNetworkStats = useCallback(() => {
    return networkMonitor.getNetworkStats();
  }, [networkMonitor]);

  const getRequestStats = useCallback(() => {
    return apiTracker.getRequestStats();
  }, [apiTracker]);

  const startRequest = useCallback((requestId: string, url: string, method: string) => {
    apiTracker.startRequest(requestId, url, method);
  }, [apiTracker]);

  const endRequest = useCallback((requestId: string, status: number, responseSize?: number) => {
    apiTracker.endRequest(requestId, status, responseSize);
  }, [apiTracker]);

  const trackError = useCallback((requestId: string, error: Error) => {
    apiTracker.trackError(requestId, error);
  }, [apiTracker]);

  return {
    startTimer,
    endTimer,
    getStats,
    getAllStats,
    getNetworkStats,
    getRequestStats,
    startRequest,
    endRequest,
    trackError,
  };
}

// Global performance monitor instance
export const globalPerformanceMonitor = new RequestlyPerformanceMonitor('requestly-global');
export const globalNetworkMonitor = new NetworkPerformanceMonitor();
export const globalAPITracker = new APIRequestTracker(globalPerformanceMonitor);

// Start global monitoring
if (typeof window !== 'undefined') {
  globalPerformanceMonitor.startWebVitalsMonitoring();
}
