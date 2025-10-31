/**
 * PlatformAdapterProvider Component
 * Context provider for platform adapter injection
 *
 * @module config/PlatformAdapterProvider
 */

import React, { createContext, ReactNode, useMemo } from 'react';
import type { PlatformAdapter } from './platformAdapters/base';
import { defaultAdapter } from './platformAdapters';

/**
 * Context for platform adapter
 */
export const PlatformAdapterContext = createContext<PlatformAdapter | null>(
  null,
);

/**
 * Props for PlatformAdapterProvider
 */
export interface PlatformAdapterProviderProps {
  /** Platform adapter instance to use */
  adapter?: PlatformAdapter;

  /** Child components */
  children: ReactNode;
}

/**
 * Provider component for platform adapter
 * Injects the platform adapter into the React context tree
 *
 * @example
 * ```typescript
 * import { PlatformAdapterProvider, webAdapter } from '@gaddario98/react-pages';
 *
 * function App() {
 *   return (
 *     <PlatformAdapterProvider adapter={webAdapter}>
 *       <PageGenerator {...pageProps} />
 *     </PlatformAdapterProvider>
 *   );
 * }
 * ```
 *
 * @example Custom adapter for React Native
 * ```typescript
 * import { PlatformAdapterProvider, createNativeAdapter } from '@gaddario98/react-pages';
 * import { View, ScrollView } from 'react-native';
 *
 * const customAdapter = createNativeAdapter({
 *   PageContainer: View,
 *   ScrollViewComponent: ScrollView,
 * });
 *
 * function App() {
 *   return (
 *     <PlatformAdapterProvider adapter={customAdapter}>
 *       <PageGenerator {...pageProps} />
 *     </PlatformAdapterProvider>
 *   );
 * }
 * ```
 */
export function PlatformAdapterProvider({
  adapter = defaultAdapter,
  children,
}: PlatformAdapterProviderProps): JSX.Element {
  // Memoize adapter to prevent unnecessary re-renders
  const memoizedAdapter = useMemo(() => adapter, [adapter]);
  return (
    <PlatformAdapterContext.Provider value={memoizedAdapter}>
      {children}
    </PlatformAdapterContext.Provider>
  );
}

/**
 * HOC to wrap a component with PlatformAdapterProvider
 *
 * @example
 * ```typescript
 * const PageWithAdapter = withPlatformAdapter(PageGenerator, webAdapter);
 *
 * // Usage
 * <PageWithAdapter {...pageProps} />
 * ```
 */
export function withPlatformAdapter<P extends object>(
  Component: React.ComponentType<P>,
  adapter?: PlatformAdapter,
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <PlatformAdapterProvider adapter={adapter}>
      <Component {...props} />
    </PlatformAdapterProvider>
  );

  WrappedComponent.displayName = `withPlatformAdapter(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
}
