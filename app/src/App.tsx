import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routesV2 } from "routes";
import * as Sentry from "@sentry/react";
import { useErrorHandling } from "./utils/error-handling";
import { useAccessibility } from "./utils/accessibility";
import { usePerformanceMonitoring } from "./utils/performance";
import { useEffect, useState } from "react";

declare global {
  namespace globalThis {
    var globalUnhandledRejectionHandlers: Set<(event: PromiseRejectionEvent) => void>;
  }
}

/** Common things which do not depend on routes for App **/
const App = () => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Initialize utilities
  const { handleError, handleAsyncError } = useErrorHandling();
  const { announce, announceError, announceSuccess } = useAccessibility();
  const { startTimer, endTimer } = usePerformanceMonitoring();

  // Enhanced router creation with error handling
  const createRouter = handleAsyncError(() => {
    startTimer('router-creation');
    const router = Sentry.wrapCreateBrowserRouter(createBrowserRouter)(routesV2);
    endTimer('router-creation');
    return router;
  }, 'Router Creation');

  const router = createRouter();

  // Error boundary handler
  const handleAppError = (error: Error) => {
    setHasError(true);
    setErrorMessage(error.message);
    announceError('Application error occurred');
    handleError(error, 'App Error Boundary', 'error');
  };

  // Setup global error handlers
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      handleAppError(event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleAppError(new Error(event.reason));
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Announce app startup
    announceSuccess('Requestly application started successfully');

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [announceSuccess, announceError, handleError]);

  // Error boundary UI
  if (hasError) {
    return (
      <div 
        className="error-boundary" 
        role="alert" 
        aria-labelledby="error-title"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '2rem',
          textAlign: 'center'
        }}
      >
        <h1 id="error-title" style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '1.5rem' }}>
          Application Error
        </h1>
        <p style={{ marginBottom: '2rem', maxWidth: '500px', lineHeight: '1.6' }}>
          {errorMessage || 'An unexpected error occurred. Please try reloading the application.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#4ecdc4',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#45b7b8'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#4ecdc4'}
          aria-label="Reload the application"
        >
          Reload Application
        </button>
      </div>
    );
  }

  return (
    <div id="app" role="application" aria-label="Requestly API Client and Interceptor">
      {/* Screen reader announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only" 
        id="announcements"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}
      />
      
      {/* Skip to main content link */}
      <a 
        href="#main-content" 
        className="skip-link sr-only-focusable"
        style={{
          position: 'absolute',
          top: '-40px',
          left: '6px',
          background: '#000',
          color: '#fff',
          padding: '8px',
          textDecoration: 'none',
          borderRadius: '4px',
          zIndex: 1000,
          transition: 'top 0.3s ease'
        }}
        onFocus={(e) => e.currentTarget.style.top = '6px'}
        onBlur={(e) => e.currentTarget.style.top = '-40px'}
      >
        Skip to main content
      </a>
      
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
