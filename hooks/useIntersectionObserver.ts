/**
 * useIntersectionObserver Hook
 * Detects when an element enters the viewport for lazy loading triggers
 * SSR-safe with React Native graceful degradation
 *
 * @module hooks/useIntersectionObserver
 */

import { useEffect, useRef, useState } from 'react';

/**
 * Configuration options for the intersection observer
 */
export interface UseIntersectionObserverOptions {
  /** Threshold(s) at which to trigger the callback (0.0 to 1.0) */
  threshold?: number | number[];

  /** Root element for intersection calculation (null = viewport) */
  root?: Element | null;

  /** Margin around the root element */
  rootMargin?: string;

  /** If true, stops observing after first intersection */
  triggerOnce?: boolean;

  /** If true, element is initially considered in view (for SSR) */
  initialInView?: boolean;
}

/**
 * Hook for detecting element visibility in the viewport
 * Used for lazy loading content when it enters the viewport
 *
 * @example
 * ```typescript
 * function LazyImage({ src }: { src: string }) {
 *   const { ref, inView } = useIntersectionObserver({
 *     threshold: 0.1,
 *     rootMargin: '100px',
 *     triggerOnce: true
 *   });
 *
 *   return (
 *     <div ref={ref}>
 *       {inView ? <img src={src} /> : <div>Loading...</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useIntersectionObserver<T extends Element = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): {
  ref: React.RefObject<T>;
  inView: boolean;
  entry?: IntersectionObserverEntry;
} {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    triggerOnce = true,
    initialInView = false,
  } = options;

  const ref = useRef<T>(null);
  const [inView, setInView] = useState(initialInView);
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    // SSR safety check - IntersectionObserver not available on server
    if (typeof IntersectionObserver === 'undefined') {
      // On server or unsupported environment, default to visible
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInView(true);
      return;
    }

    // React Native detection - IntersectionObserver not available
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      // On React Native, immediately load content (no viewport detection)
      setInView(true);
      return;
    }

    if (!ref.current) {
      return;
    }

    // If triggerOnce and already triggered, don't observe again
    if (triggerOnce && hasTriggered) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        setInView(isIntersecting);
        setEntry(entry);

        if (isIntersecting && triggerOnce) {
          setHasTriggered(true);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, triggerOnce, hasTriggered]);

  return { ref, inView, entry };
}

/**
 * Hook variant for detecting when element is visible and has stayed visible
 * Useful for tracking user engagement with content
 */
export function useInViewport<T extends Element = HTMLDivElement>(
  options: UseIntersectionObserverOptions & {
    /** Minimum time in ms element must be visible to count as "in viewport" */
    minVisibleTime?: number;
  } = {}
): {
  ref: React.RefObject<T>;
  inView: boolean;
  hasBeenVisible: boolean;
} {
  const { minVisibleTime = 0, ...observerOptions } = options;
  const { ref, inView } = useIntersectionObserver<T>(observerOptions);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const visibleTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (inView && !hasBeenVisible) {
      if (minVisibleTime > 0) {
        visibleTimeoutRef.current = setTimeout(() => {
          setHasBeenVisible(true);
        }, minVisibleTime);
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHasBeenVisible(true);
      }
    } else if (!inView && visibleTimeoutRef.current) {
      clearTimeout(visibleTimeoutRef.current);
    }

    return () => {
      if (visibleTimeoutRef.current) {
        clearTimeout(visibleTimeoutRef.current);
      }
    };
  }, [inView, hasBeenVisible, minVisibleTime]);

  return { ref, inView, hasBeenVisible };
}
