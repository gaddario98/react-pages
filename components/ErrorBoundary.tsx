/**
 * ErrorBoundary Component (T092)
 * Catches errors from lazy-loaded components without crashing entire page
 * Provides retry functionality and graceful degradation
 *
 * @module components/ErrorBoundary
 */

import React, { ReactNode, ReactElement } from 'react';

/**
 * Props for ErrorBoundary component
 */
export interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;

  /** Custom fallback UI when error occurs */
  fallback?: (error: Error, retry: () => void) => ReactNode;

  /** Optional error handler callback */
  onError?: (error: Error, info: { componentStack: string }) => void;

  /** Optional error logger for debugging */
  onErrorLog?: (message: string, error: Error) => void;

  /** ID for debugging and tracking */
  boundaryId?: string;
}

/**
 * Internal state for ErrorBoundary
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack: string } | null;
  retryCount: number;
}

/**
 * ErrorBoundary component for catching lazy loading errors
 * Uses React Error Boundaries to prevent entire page crashes
 * Provides built-in retry mechanism and custom error UI support
 *
 * @example With custom fallback
 * ```typescript
 * <ErrorBoundary
 *   fallback={(error, retry) => (
 *     <div>
 *       <h2>Failed to load component</h2>
 *       <p>{error.message}</p>
 *       <button onClick={retry}>Try Again</button>
 *     </div>
 *   )}
 * >
 *   <LazyLoadedComponent />
 * </ErrorBoundary>
 * ```
 *
 * @example With error callback
 * ```typescript
 * <ErrorBoundary
 *   onError={(error, info) => {
 *     console.error('Component error:', error);
 *     sentryClient.captureException(error);
 *   }}
 * >
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  /**
   * Update state so the next render will show the fallback UI
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Log error details for debugging
   */
  componentDidCatch(
    error: Error,
    errorInfo: { componentStack: string }
  ): void {
    // Store error info in state
    this.setState({
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `[ErrorBoundary${this.props.boundaryId ? `:${this.props.boundaryId}` : ''}] Caught error:`,
        error
      );
      console.error('Component stack:', errorInfo.componentStack);
    }

    // Call optional error logger
    if (this.props.onErrorLog) {
      this.props.onErrorLog(
        `Error caught by ErrorBoundary${
          this.props.boundaryId ? ` (${this.props.boundaryId})` : ''
        }`,
        error
      );
    }
  }

  /**
   * Retry loading the component
   */
  private handleRetry = (): void => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  render(): ReactElement {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, boundaryId } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return <>{fallback(error, this.handleRetry)}</>;
      }

      // Default fallback UI
      return (
        <div
          style={{
            padding: '20px',
            margin: '20px 0',
            border: '1px solid #f5a6a6',
            borderRadius: '4px',
            backgroundColor: '#ffebee',
          }}
        >
          <h3
            style={{
              color: '#c62828',
              margin: '0 0 10px 0',
              fontSize: '16px',
            }}
          >
            Failed to load component
            {boundaryId && ` (${boundaryId})`}
          </h3>
          <p
            style={{
              color: '#d32f2f',
              margin: '0 0 10px 0',
              fontSize: '14px',
            }}
          >
            {error.message}
          </p>
          {errorInfo && process.env.NODE_ENV === 'development' && (
            <details style={{ fontSize: '12px', color: '#666' }}>
              <summary>Stack trace</summary>
              <pre
                style={{
                  overflow: 'auto',
                  backgroundColor: '#f5f5f5',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                }}
              >
                {errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleRetry}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return <>{children}</>;
  }
}

/**
 * Hook to create an error boundary with custom configuration
 * @param config - Configuration for the error boundary
 * @returns Component that wraps children in an error boundary
 */
export function createErrorBoundary(
  config?: Partial<ErrorBoundaryProps>
): React.FC<{ children: ReactNode }> {
  return function ErrorBoundaryWrapper({ children }) {
    return <ErrorBoundary {...config}>{children}</ErrorBoundary>;
  };
}

/**
 * Hook to use within a component to access error boundary context
 * (Note: This is a placeholder - actual implementation would need context)
 * @returns Object with retry function
 */
export function useErrorBoundary() {
  return {
    /**
     * Reset error state (requires Error Boundary context)
     */
    resetError: () => {
      // This would be provided by ErrorBoundary context
    },
  };
}
