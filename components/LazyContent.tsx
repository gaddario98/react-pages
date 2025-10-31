/**
 * LazyContent Component (T089-T091)
 * Wrapper for lazy-loading content with viewport, interaction, and conditional triggers
 * Uses React.lazy() and Suspense with IntersectionObserver support
 *
 * @module components/LazyContent
 */

import React, { Suspense, useState, useMemo, ReactNode } from 'react';
import { FieldValues, UseFormSetValue } from 'react-hook-form';
import type { QueriesArray, AllMutation, MultipleQueryResponse } from '@gaddario98/react-queries';
import type { LazyLoadingConfig } from '../types';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

/**
 * Props for LazyContent component
 */
export interface LazyContentProps<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray
> {
  /** Component to lazy load */
  component: React.ComponentType<any>;

  /** Props to pass to the lazy component */
  componentProps: Record<string, any>;

  /** Lazy loading configuration */
  lazyConfig?: LazyLoadingConfig;

  /** Form values for conditional evaluation */
  formValues?: F;

  /** Query data for conditional evaluation */
  allQuery?: MultipleQueryResponse<Q>;

  /** Mutations for conditional evaluation */
  allMutation?: AllMutation<Q>;

  /** Form setValue for conditional evaluation */
  setValue?: UseFormSetValue<F>;

  /** Fallback component while loading (T089) */
  fallback?: ReactNode;

  /** Whether to show placeholder while not visible (T097) */
  showPlaceholder?: boolean;

  /** Custom error component for failed loads (T099) */
  errorFallback?: (error: Error, retry: () => void) => ReactNode;

  /** ID for debugging and tracking */
  contentId?: string;
}

/**
 * LazyContent component for on-demand code splitting
 * Supports three lazy loading triggers:
 * 1. Viewport: Loads when scrolled into view via IntersectionObserver
 * 2. Interaction: Loads on user interaction (hover, focus, click)
 * 3. Conditional: Loads when a condition evaluates to true
 *
 * @example Viewport-triggered lazy loading
 * ```typescript
 * <LazyContent
 *   component={HeavyComponent}
 *   componentProps={{ data }}
 *   lazyConfig={{ trigger: 'viewport', threshold: 0.1 }}
 *   fallback={<LoadingSkeleton />}
 * />
 * ```
 *
 * @example Conditional lazy loading
 * ```typescript
 * <LazyContent
 *   component={PremiumFeature}
 *   componentProps={{ feature: 'advanced' }}
 *   lazyConfig={{
 *     trigger: 'conditional',
 *     condition: ({ user }) => user.isPremium
 *   }}
 *   fallback={<div>Upgrade to unlock</div>}
 * />
 * ```
 */
export const LazyContent = React.memo(
  <F extends FieldValues = FieldValues, Q extends QueriesArray = QueriesArray>({
    component: Component,
    componentProps,
    lazyConfig,
    formValues,
    allQuery,
    allMutation,
    setValue,
    fallback = <div>Loading...</div>,
    showPlaceholder = true,
    errorFallback,
    contentId,
  }: LazyContentProps<F, Q>) => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // T090: Use IntersectionObserver for viewport-triggered loading
    const { ref: viewportRef, inView } = useIntersectionObserver({
      threshold: lazyConfig?.threshold ?? 0.1,
      rootMargin: lazyConfig?.rootMargin ?? '100px',
      triggerOnce: true,
    });

    // Determine if content should be loaded based on trigger type and condition
    const shouldLoad = useMemo(() => {
      // Check if lazy loading is disabled
      if (!lazyConfig) {
        return true;
      }

      const trigger = lazyConfig.trigger ?? 'viewport';

      // T091: Conditional lazy loading - evaluate condition with MappedProps
      if (trigger === 'conditional' && lazyConfig.condition) {
        try {
          const conditionResult = lazyConfig.condition({
            formValues: formValues ?? ({} as F),
            allQuery: allQuery ?? ({} as any),
            allMutation: allMutation ?? ({} as any),
          });
          return conditionResult;
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.error(`[LazyContent] Error evaluating condition for ${contentId}:`, e);
          }
          return false;
        }
      }

      // Viewport trigger
      if (trigger === 'viewport') {
        return inView;
      }

      // Interaction trigger - handled via onMouseEnter/onClick below
      if (trigger === 'interaction') {
        return isVisible;
      }

      return true;
    }, [lazyConfig, inView, isVisible, formValues, allQuery, allMutation, setValue, contentId]);

    // T089: Lazy component using React.lazy() and Suspense
    const LazyComponent = useMemo(() => {
      if (!shouldLoad) {
        return null;
      }

      return React.lazy(
        () => Promise.resolve({ default: Component })
      ) as React.ComponentType<any>;
    }, [shouldLoad, Component]);

    const handleInteraction = () => {
      if (lazyConfig?.trigger === 'interaction' && !isVisible) {
        setIsVisible(true);
      }
    };

    const retry = () => {
      setHasError(false);
      setError(null);
      setIsVisible(true);
    };

    // Placeholder to maintain layout (T097)
    if (!shouldLoad && showPlaceholder) {
      const placeholder = lazyConfig?.placeholder;
      if (placeholder && typeof placeholder === 'object' && 'style' in placeholder) {
        return (
          <div
            ref={lazyConfig?.trigger === 'viewport' ? viewportRef : undefined}
            onMouseEnter={handleInteraction}
            onClick={handleInteraction}
            style={(placeholder as any).style}
          >
            {(placeholder as any).content}
          </div>
        );
      }

      // Default placeholder
      if (lazyConfig?.trigger === 'viewport') {
        return (
          <div
            ref={viewportRef}
            style={{
              minHeight: '200px',
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}
          >
            <span style={{ color: '#999' }}>Content loading...</span>
          </div>
        );
      }

      return (
        <div
          onMouseEnter={handleInteraction}
          onClick={handleInteraction}
          style={{ cursor: 'pointer', padding: '16px', textAlign: 'center', color: '#666' }}
        >
          Click to load content
        </div>
      );
    }

    // Error boundary fallback (T099)
    if (hasError && error && errorFallback) {
      return <>{errorFallback(error, retry)}</>;
    }

    // Render lazy component with Suspense
    if (!LazyComponent) {
      return null;
    }

    return (
      <div
        ref={lazyConfig?.trigger === 'viewport' ? viewportRef : undefined}
        onMouseEnter={handleInteraction}
        onClick={handleInteraction}
      >
        <Suspense fallback={fallback}>
          <LazyComponent {...componentProps} />
        </Suspense>
      </div>
    );
  }
) as React.FC<LazyContentProps>;

LazyContent.displayName = 'LazyContent';


/**
 * Helper to create a lazy version of a component
 * @example
 * ```typescript
 * const LazyDashboard = createLazyComponent(() => import('./Dashboard'));
 * ```
 */
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>
): React.ComponentType<P> {
  return React.lazy(() => importFn()) as unknown as React.ComponentType<P>;
}
