import React, { Suspense, ComponentType, ReactNode } from 'react';

/**
 * Configuration for lazy loading behavior
 */
export interface LazyLoadConfig {
  /** Whether to enable lazy loading (default: true) */
  enabled?: boolean;
  /** Preload on hover (only for interactive elements) */
  preloadOnHover?: boolean;
  /** Fallback component to show while loading */
  suspenseFallback?: ReactNode;
  /** Custom error boundary component */
  errorBoundary?: ComponentType<{ error: Error; retry: () => void }>;
  /** T095: Custom Suspense fallback factory function for dynamic fallbacks */
  fallbackFactory?: (componentName: string) => ReactNode;
  /** T095: Timeout in ms to show fallback (useful for fast components) */
  fallbackDelay?: number;
}

/**
 * Enhanced lazy wrapper with optional preloading capability
 *
 * Wraps React.lazy() with a Suspense boundary and optional preload support.
 * Helps reduce initial bundle size by code-splitting components.
 *
 * @example
 * ```tsx
 * // Basic lazy loading
 * const HeavyComponent = lazyWithPreload(() => import('./Heavy'));
 *
 * function App() {
 *   return (
 *     <lazyWithPreload.Suspense fallback={<Loader />}>
 *       <HeavyComponent />
 *     </lazyWithPreload.Suspense>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With preloading on hover
 * const LazyModal = lazyWithPreload(
 *   () => import('./Modal'),
 *   { preloadOnHover: true }
 * );
 *
 * function Button() {
 *   return (
 *     <button onMouseEnter={() => LazyModal.preload?.()}>
 *       Open Modal
 *     </button>
 *   );
 * }
 * ```
 */
export function lazyWithPreload<P extends Record<string, any>>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  config?: LazyLoadConfig
) {
  // Create lazy component
  const LazyComponent = React.lazy(importFunc);

  // Store preload function for optional use
  let preloadPromise: Promise<{ default: ComponentType<P> }> | null = null;

  /**
   * Preload the component by initiating the import
   */
  const preload = () => {
    if (!preloadPromise) {
      preloadPromise = importFunc();
    }
    return preloadPromise;
  };

  /**
   * Wrapper component that handles preloading on hover
   */
  const LazyWrapper = (props: P & { onMouseEnter?: () => void; onMouseLeave?: () => void }) => {
    const { onMouseEnter, onMouseLeave, ...restProps } = props;

    const handleMouseEnter = () => {
      if (config?.preloadOnHover) {
        preload();
      }
      onMouseEnter?.();
    };

    return (
      <div onMouseEnter={handleMouseEnter} onMouseLeave={onMouseLeave} style={{ display: 'contents' }}>
        <LazyComponent {...(restProps as P)} />
      </div>
    );
  };

  // Attach preload function to component for external access
  (LazyWrapper as any).preload = preload;

  // Attach Suspense for convenience
  (LazyWrapper as any).Suspense = Suspense;

  // Default fallback
  const defaultFallback = config?.suspenseFallback || <div>Loading...</div>;

  /**
   * Wrapped component with integrated Suspense boundary
   */
  const WithSuspense = (props: P) => (
    <Suspense fallback={defaultFallback}>
      <LazyWrapper {...props} />
    </Suspense>
  );

  (WithSuspense as any).preload = preload;
  (WithSuspense as any).Suspense = Suspense;

  return WithSuspense as ComponentType<P> & {
    preload: () => Promise<{ default: ComponentType<P> }>;
    Suspense: typeof Suspense;
  };
}

/**
 * Create a batch of lazy components with shared preloading strategy
 *
 * Useful for code-splitting a route or feature module
 *
 * @example
 * ```tsx
 * const lazyPages = lazyBatch({
 *   UserList: () => import('./pages/UserList'),
 *   UserDetail: () => import('./pages/UserDetail'),
 *   UserForm: () => import('./pages/UserForm'),
 * }, {
 *   preloadOnHover: true,
 *   suspenseFallback: <PageLoader />
 * });
 *
 * function App() {
 *   return (
 *     <Routes>
 *       <Route path="/users" element={<lazyPages.UserList />} />
 *       <Route path="/users/:id" element={<lazyPages.UserDetail />} />
 *     </Routes>
 *   );
 * }
 * ```
 */
export function lazyBatch<T extends Record<string, () => Promise<{ default: ComponentType<any> }>>>(
  modules: T,
  config?: LazyLoadConfig
) {
  return Object.entries(modules).reduce((acc, [key, importFunc]) => {
    acc[key as keyof T] = lazyWithPreload(importFunc, config);
    return acc;
  }, {} as T);
}

/**
 * Preload multiple components in parallel
 *
 * Useful for preloading components before user interaction
 *
 * @example
 * ```tsx
 * // Preload critical components on app mount
 * useEffect(() => {
 *   preloadComponents([UserComponent.preload, SettingsComponent.preload]);
 * }, []);
 * ```
 */
export function preloadComponents(
  preloaders: Array<() => Promise<any>>
) {
  return Promise.all(preloaders.map(preload => preload()));
}

/**
 * Higher-order component to wrap lazy-loaded components with error boundary
 *
 * @example
 * ```tsx
 * const SafeLazyComponent = withLazyErrorBoundary(LazyComponent, {
 *   fallback: <ErrorMessage />
 * });
 * ```
 */
export function withLazyErrorBoundary<P extends Record<string, any>>(
  Component: ComponentType<P>,
  config?: { fallback?: ReactNode }
) {
  const Wrapper = (props: P) => {
    const [error, setError] = React.useState<Error | null>(null);

    if (error) {
      return config?.fallback || <div>Error loading component</div>;
    }

    return (
      <ErrorBoundary onError={setError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  return Wrapper;
}

/**
 * Simple error boundary implementation
 */
class ErrorBoundary extends React.Component<
  { children: ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onError: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

/**
 * T095: Hook to preload a lazy component on demand
 * Useful for imperative preloading scenarios
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const preload = usePreloadLazy(HeavyComponent);
 *
 *   return (
 *     <button onMouseEnter={preload}>
 *       Hover to preload
 *     </button>
 *   );
 * }
 * ```
 */
export function usePreloadLazy<P extends Record<string, any>>(
  component: ComponentType<P> & { preload?: () => Promise<any> }
) {
  return React.useCallback(() => {
    if (component.preload) {
      component.preload();
    }
  }, [component]);
}

/**
 * T095: Hook to preload multiple lazy components
 * Useful for preloading a set of components before user navigation
 *
 * @example
 * ```tsx
 * function Navigation() {
 *   usePreloadLazyBatch([UserList, UserDetail, UserForm]);
 *
 *   return <nav>...</nav>;
 * }
 * ```
 */
export function usePreloadLazyBatch(
  components: Array<ComponentType<any> & { preload?: () => Promise<any> }>
) {
  return React.useCallback(() => {
    components.forEach(component => {
      if (component.preload) {
        component.preload();
      }
    });
  }, [components]);
}

/**
 * T095: Hook to preload lazy components on viewport intersection
 * Useful for preloading components that are likely to be scrolled into view
 *
 * @example
 * ```tsx
 * function LazySection() {
 *   const ref = usePreloadOnViewport(ExpensiveComponent);
 *
 *   return <div ref={ref}>Content goes here</div>;
 * }
 * ```
 */
export function usePreloadOnViewport<P extends Record<string, any>>(
  component: ComponentType<P> & { preload?: () => Promise<any> }
) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ref.current || !component.preload) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            component.preload?.();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [component]);

  return ref;
}
