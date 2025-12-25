/**
 * ErrorBoundary Unit Tests
 * Properties 4 Creations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ErrorBoundary, createGlobalErrorBoundary, createPropertiesErrorBoundary } from '../../src/js/utils/errorBoundary.js';

describe('ErrorBoundary', () => {
  let errorBoundary;
  let originalErrorHandler;
  let originalUnhandledRejection;
  const mockError = new Error('Test error');
  const mockContext = { type: 'test', source: 'test-source' };

  beforeEach(() => {
    // Store original handlers
    originalErrorHandler = window.onerror;
    originalUnhandledRejection = window.onunhandledrejection;
    
    // Clear any previous error boundary instances
    delete window.ErrorBoundaryInstance;
    
    // Create fresh instance for each test
    errorBoundary = new ErrorBoundary({
      enableLogging: false,
      enableMonitoring: false,
      enableRetry: false
    });
  });

  afterEach(() => {
    errorBoundary.destroy();
    
    // Restore original handlers
    window.onerror = originalErrorHandler;
    window.onunhandledrejection = originalUnhandledRejection;
    
    // Clean up global reference
    delete window.ErrorBoundaryInstance;
  });

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      const boundary = new ErrorBoundary();
      expect(boundary.options.fallbackUI).toBeNull();
      expect(boundary.options.enableLogging).toBe(true);
      expect(boundary.options.enableMonitoring).toBe(true);
      expect(boundary.options.enableRetry).toBe(true);
      expect(boundary.options.maxRetries).toBe(3);
      expect(boundary.errorCount).toBe(0);
      expect(boundary.lastError).toBeNull();
      expect(boundary.retryCount).toBe(0);
      expect(boundary.errorHistory).toEqual([]);
      boundary.destroy();
    });

    it('should initialize with custom options', () => {
      const customBoundary = new ErrorBoundary({
        fallbackUI: () => '<div>Custom UI</div>',
        enableLogging: false,
        maxRetries: 5
      });
      
      expect(customBoundary.options.fallbackUI).toBeDefined();
      expect(customBoundary.options.enableLogging).toBe(false);
      expect(customBoundary.options.maxRetries).toBe(5);
      customBoundary.destroy();
    });
  });

  describe('Global Error Handlers', () => {
    it('should set up global error handler', () => {
      expect(window.onerror).not.toBe(originalErrorHandler);
      expect(typeof window.onerror).toBe('function');
    });

    it('should set up unhandled rejection handler', () => {
      expect(window.onunhandledrejection).not.toBe(originalUnhandledRejection);
      expect(typeof window.onunhandledrejection).toBe('function');
    });

    it('should call original error handler if it exists', () => {
      const originalHandler = vi.fn();
      window.onerror = originalHandler;
      
      const boundary = new ErrorBoundary({ enableLogging: false });
      const testError = new Error('Test error');
      
      // Simulate error
      window.onerror('Test message', 'test.js', 1, 1, testError);
      
      expect(originalHandler).toHaveBeenCalled();
      boundary.destroy();
    });

    it('should prevent default browser behavior for unhandled rejections', () => {
      const event = {
        reason: mockError,
        promise: Promise.reject(mockError),
        preventDefault: vi.fn()
      };
      
      window.onunhandledrejection(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('handleError', () => {
    it('should handle errors correctly', () => {
      errorBoundary.handleError(mockError, mockContext);
      
      expect(errorBoundary.errorCount).toBe(1);
      expect(errorBoundary.lastError).toBeDefined();
      expect(errorBoundary.lastError.message).toBe('Test error');
      expect(errorBoundary.errorHistory).toHaveLength(1);
    });

    it('should prevent infinite recursion', () => {
      errorBoundary.isReportingError = true;
      
      expect(() => {
        errorBoundary.handleError(mockError, mockContext);
      }).not.toThrow();
      
      expect(errorBoundary.errorCount).toBe(0);
    });

    it('should enhance error with additional information', () => {
      errorBoundary.handleError(mockError, mockContext);
      
      const enhancedError = errorBoundary.lastError;
      expect(enhancedError.message).toBe('Test error');
      expect(enhancedError.name).toBe('Error');
      expect(enhancedError.timestamp).toBeDefined();
      expect(enhancedError.url).toBe('http://localhost');
      expect(enhancedError.context).toEqual(mockContext);
      expect(enhancedError.errorId).toBeDefined();
    });

    it('should maintain error history limit', () => {
      // Add more errors than the limit
      for (let i = 0; i < 15; i++) {
        errorBoundary.handleError(new Error(`Error ${i}`), mockContext);
      }
      
      expect(errorBoundary.errorHistory).toHaveLength(10); // Should be limited to 10
    });
  });

  describe('enhanceError', () => {
    it('should enhance error with browser information', () => {
      const enhanced = errorBoundary.enhanceError(mockError, mockContext);
      
      expect(enhanced.userAgent).toBeDefined();
      expect(enhanced.viewport).toEqual({
        width: expect.any(Number),
        height: expect.any(Number)
      });
      expect(enhanced.errorId).toBeDefined();
    });

    it('should handle different error contexts', () => {
      const runtimeContext = {
        type: 'runtime',
        source: 'test.js',
        lineno: 10,
        colno: 5
      };
      
      const rejectionContext = {
        type: 'unhandledRejection',
        promise: Promise.resolve()
      };
      
      const runtimeError = errorBoundary.enhanceError(mockError, runtimeContext);
      const rejectionError = errorBoundary.enhanceError(mockError, rejectionContext);
      
      expect(runtimeError.source).toBe('test.js');
      expect(runtimeError.lineno).toBe(10);
      expect(runtimeError.colno).toBe(5);
      
      expect(rejectionError.promise).toBeDefined();
    });

    it('should generate unique error IDs', () => {
      const error1 = errorBoundary.enhanceError(mockError, {});
      const error2 = errorBoundary.enhanceError(mockError, {});
      
      expect(error1.errorId).not.toBe(error2.errorId);
    });
  });

  describe('logError', () => {
    it('should log error when enabled', () => {
      const boundary = new ErrorBoundary({ enableLogging: true });
      const consoleSpy = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      boundary.handleError(mockError, mockContext);
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      boundary.destroy();
    });

    it('should not log error when disabled', () => {
      const boundary = new ErrorBoundary({ enableLogging: false });
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      boundary.handleError(mockError, mockContext);
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      boundary.destroy();
    });
  });

  describe('reportToMonitoring', () => {
    it('should attempt to report to Sentry if available', () => {
      window.Sentry = {
        withScope: vi.fn((callback) => {
          const scope = { setTag: vi.fn(), setContext: vi.fn(), captureException: vi.fn() };
          callback(scope);
          return scope;
        })
      };
      
      const boundary = new ErrorBoundary({ enableMonitoring: true });
      boundary.reportToMonitoring(errorBoundary.enhanceError(mockError, {}), {});
      
      expect(window.Sentry.withScope).toHaveBeenCalled();
      delete window.Sentry;
      boundary.destroy();
    });

    it('should attempt to report to Rollbar if available', () => {
      window.Rollbar = { error: vi.fn() };
      
      const boundary = new ErrorBoundary({ enableMonitoring: true });
      boundary.reportToMonitoring(errorBoundary.enhanceError(mockError, {}), {});
      
      expect(window.Rollbar.error).toHaveBeenCalled();
      delete window.Rollbar;
      boundary.destroy();
    });

    it('should attempt custom endpoint if no monitoring service available', () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({});
      
      const boundary = new ErrorBoundary({ enableMonitoring: true });
      boundary.reportToMonitoring(errorBoundary.enhanceError(mockError, {}), {});
      
      expect(fetchSpy).toHaveBeenCalled();
      
      fetchSpy.mockRestore();
      boundary.destroy();
    });

    it('should handle monitoring failures gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
      
      const boundary = new ErrorBoundary({ enableMonitoring: true });
      boundary.reportToMonitoring(errorBoundary.enhanceError(mockError, {}), {});
      
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      fetchSpy.mockRestore();
      boundary.destroy();
    });
  });

  describe('displayFallbackUI', () => {
    it('should use custom fallback UI if provided', () => {
      const customUI = vi.fn(() => '<div>Custom Error UI</div>');
      const boundary = new ErrorBoundary({ fallbackUI: customUI });
      
      boundary.displayFallbackUI(errorBoundary.enhanceError(mockError, {}));
      
      expect(customUI).toHaveBeenCalled();
      
      boundary.destroy();
    });

    it('should use default fallback UI if no custom UI provided', () => {
      const boundary = new ErrorBoundary({ enableRetry: false });
      
      boundary.displayFallbackUI(errorBoundary.enhanceError(mockError, {}));
      
      const fallbackElement = document.querySelector('.error-boundary');
      expect(fallbackElement).toBeDefined();
      
      boundary.destroy();
    });

    it('should set up global error boundary instance for callbacks', () => {
      boundary.displayFallbackUI(errorBoundary.enhanceError(mockError, {}));
      
      expect(window.ErrorBoundaryInstance).toBe(errorBoundary);
    });
  });

  describe('createDefaultFallbackUI', () => {
    it('should create appropriate UI for critical errors', () => {
      errorBoundary.errorCount = 5; // Above critical threshold
      
      const ui = errorBoundary.createDefaultFallbackUI(errorBoundary.enhanceError(mockError, {}));
      
      expect(ui).toContain('System Error');
      expect(ui).toContain('technical difficulties');
    });

    it('should create appropriate UI for non-critical errors', () => {
      errorBoundary.errorCount = 1;
      
      const ui = errorBoundary.createDefaultFallbackUI(errorBoundary.enhanceError(mockError, {}));
      
      expect(ui).toContain('Something went wrong');
      expect(ui).toContain('Try Again');
    });

    it('should include retry button when retry is available', () => {
      const ui = errorBoundary.createDefaultFallbackUI(errorBoundary.enhanceError(mockError, {}));
      
      expect(ui).toContain('Try Again');
    });

    it('should include refresh button', () => {
      const ui = errorBoundary.createDefaultFallbackUI(errorBoundary.enhanceError(mockError, {}));
      
      expect(ui).toContain('Refresh Page');
    });

    it('should include details section', () => {
      const ui = errorBoundary.createDefaultFallbackUI(errorBoundary.enhanceError(mockError, {}));
      
      expect(ui).toContain('Show Details');
      expect(ui).toContain('Error ID:');
      expect(ui).toContain('Technical Details');
    });
  });

  describe('renderFallbackUI', () => {
    it('should render UI to app container', () => {
      const container = document.getElementById('app');
      const content = '<div>Test Error UI</div>';
      
      errorBoundary.renderFallbackUI(content);
      
      expect(container.innerHTML).toBe(content);
    });

    it('should fall back to document.body if app container not found', () => {
      document.body.innerHTML = '';
      const content = '<div>Test Error UI</div>';
      
      errorBoundary.renderFallbackUI(content);
      
      expect(document.body.innerHTML).toBe(content);
    });

    it('should inject CSS styles', () => {
      errorBoundary.renderFallbackUI('<div class="error-boundary">Test</div>');
      
      const styles = document.getElementById('error-boundary-styles');
      expect(styles).toBeDefined();
      expect(styles.textContent).toContain('.error-boundary');
    });

    it('should focus first focusable element for accessibility', () => {
      document.body.innerHTML = '<button>Focus me</button>';
      
      errorBoundary.renderFallbackUI('<div><button>Focus me</button></div>');
      
      const focusedElement = document.activeElement;
      expect(focusedElement.tagName).toBe('BUTTON');
    });
  });

  describe('retry functionality', () => {
    beforeEach(() => {
      errorBoundary = new ErrorBoundary({
        enableRetry: true,
        maxRetries: 2
      });
    });

    it('should allow retry when under retry limit', () => {
      errorBoundary.retryCount = 1;
      
      expect(() => {
        errorBoundary.retry();
      }).not.toThrow();
    });

    it('should not allow retry when at retry limit', () => {
      errorBoundary.retryCount = 2; // At limit
      
      errorBoundary.retry();
      
      expect(errorBoundary.retryCount).toBe(2); // Should not increase
    });

    it('should reload page on retry', () => {
      const locationSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});
      
      errorBoundary.retry();
      
      expect(locationSpy).toHaveBeenCalled();
      
      locationSpy.mockRestore();
    });
  });

  describe('showDetails', () => {
    it('should toggle details visibility', () => {
      document.body.innerHTML = '<div id='error-details' style='display: none;'>Details</div>';
      
      errorBoundary.showDetails();
      
      const detailsElement = document.getElementById('error-details');
      expect(detailsElement.style.display).toBe('block');
      
      errorBoundary.showDetails();
      expect(detailsElement.style.display).toBe('none');
    });
  });

  describe('getStats', () => {
    it('should return error statistics', () => {
      errorBoundary.handleError(new Error('Error 1'), {});
      errorBoundary.handleError(new Error('Error 2'), {});
      
      const stats = errorBoundary.getStats();
      
      expect(stats.errorCount).toBe(2);
      expect(stats.lastError).toBeDefined();
      expect(stats.retryCount).toBe(0);
      expect(stats.errorHistory).toHaveLength(2);
      expect(stats.isActive).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      errorBoundary.handleError(mockError, {});
      errorBoundary.retryCount = 1;
      
      errorBoundary.reset();
      
      expect(errorBoundary.errorCount).toBe(0);
      expect(errorBoundary.lastError).toBeNull();
      expect(errorBoundary.retryCount).toBe(0);
      expect(errorBoundary.errorHistory).toEqual([]);
      expect(errorBoundary.isReportingError).toBe(false);
    });
  });

  describe('destroy', () => {
    it('should restore original handlers', () => {
      errorBoundary.destroy();
      
      expect(window.onerror).toBe(originalErrorHandler);
      expect(window.onunhandledrejection).toBe(originalUnhandledRejection);
    });

    it('should clear state', () => {
      errorBoundary.handleError(mockError, {});
      errorBoundary.destroy();
      
      expect(errorBoundary.errorCount).toBe(0);
    });

    it('should remove global reference', () => {
      window.ErrorBoundaryInstance = errorBoundary;
      errorBoundary.destroy();
      
      expect(window.ErrorBoundaryInstance).toBeUndefined();
    });
  });

  describe('getSessionId', () => {
    it('should return existing session ID', () => {
      sessionStorage.setItem('error_boundary_session', 'test-session-id');
      
      const sessionId = errorBoundary.getSessionId();
      
      expect(sessionId).toBe('test-session-id');
    });

    it('should generate new session ID if none exists', () => {
      const sessionId = errorBoundary.getSessionId();
      
      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(sessionStorage.getItem('error_boundary_session')).toBe(sessionId);
    });
  });

  describe('attemptRecovery', () => {
    it('should reset retry count after delay', () => {
      errorBoundary.retryCount = 1;
      
      errorBoundary.attemptRecovery(mockError);
      
      expect(errorBoundary.retryCount).toBe(1); // Still 1 before delay
      
      // Wait for the timeout
      return new Promise(resolve => {
        setTimeout(() => {
          expect(errorBoundary.retryCount).toBe(0); // Reset after 30 seconds
          resolve();
        }, 31000); // 31 seconds to be safe
      });
    });
  });
});

describe('Factory Functions', () => {
  afterEach(() => {
    delete window.ErrorBoundaryInstance;
  });

  describe('createGlobalErrorBoundary', () => {
    it('should create and store global error boundary', () => {
      const boundary = createGlobalErrorBoundary();
      
      expect(boundary).toBeInstanceOf(ErrorBoundary);
      expect(window.ErrorBoundaryInstance).toBe(boundary);
      
      boundary.destroy();
    });
  });

  describe('createPropertiesErrorBoundary', () => {
    it('should create error boundary with Properties 4 Creations defaults', () => {
      const boundary = createPropertiesErrorBoundary();
      
      expect(boundary.options.fallbackUI).toBeDefined();
      expect(boundary.options.enableLogging).toBe(true);
      expect(boundary.options.enableMonitoring).toBe(true);
      expect(boundary.options.enableRetry).toBe(true);
      expect(boundary.options.maxRetries).toBe(2);
      
      // Test that custom fallback UI is used
      const enhancedError = boundary.enhanceError(new Error('Test error'), {});
      const ui = boundary.options.fallbackUI(enhancedError, {});
      
      expect(ui).toContain('Properties 4 Creations');
      expect(ui).toContain('housing services');
      expect(ui).toContain('Contact Support');
      
      boundary.destroy();
    });
  });
});

describe('ErrorBoundary Integration', () => {
  it('should handle real-world error scenarios', () => {
    const boundary = new ErrorBoundary({
      enableLogging: false,
      enableMonitoring: false,
      maxRetries: 1
    });

    // Simulate runtime error
    const runtimeError = new Error('Network request failed');
    boundary.handleError(runtimeError, {
      type: 'runtime',
      source: 'api.js',
      lineno: 42
    });

    // Verify error was processed
    expect(boundary.errorCount).toBe(1);
    expect(boundary.lastError.message).toBe('Network request failed');

    // Simulate unhandled promise rejection
    const rejectionError = new Error('Promise rejected');
    boundary.handleError(rejectionError, {
      type: 'unhandledRejection'
    });

    expect(boundary.errorCount).toBe(2);

    boundary.destroy();
  });
});
