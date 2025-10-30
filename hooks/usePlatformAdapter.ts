/**
 * usePlatformAdapter Hook
 * Provides access to the current platform adapter from context
 *
 * @module hooks/usePlatformAdapter
 */

import { useContext } from 'react';
import { PlatformAdapterContext } from '../config/PlatformAdapterProvider';
import { defaultAdapter } from '../config/platformAdapters';
import type { PlatformAdapter } from '../config/platformAdapters/base';

/**
 * Hook to access the current platform adapter
 * Returns the adapter from context, or the default adapter if no context exists
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const adapter = usePlatformAdapter();
 *
 *   // Check feature support
 *   const canUseMetadata = adapter.supportsFeature('metadata');
 *
 *   // Inject metadata
 *   useEffect(() => {
 *     if (canUseMetadata) {
 *       adapter.injectMetadata({
 *         title: 'My Page',
 *         description: 'Page description',
 *       });
 *     }
 *   }, [adapter, canUseMetadata]);
 *
 *   return <div>Content</div>;
 * }
 * ```
 */
export function usePlatformAdapter(): PlatformAdapter {
  const adapter = useContext(PlatformAdapterContext);

  // Return adapter from context, or fall back to default
  return adapter || defaultAdapter;
}

/**
 * Hook to check if a specific platform feature is supported
 * Convenience wrapper around adapter.supportsFeature()
 *
 * @example
 * ```typescript
 * function MetadataComponent() {
 *   const supportsMetadata = usePlatformFeature('metadata');
 *
 *   if (!supportsMetadata) {
 *     return null; // Don't render metadata on platforms that don't support it
 *   }
 *
 *   return <MetadataManager {...props} />;
 * }
 * ```
 */
export function usePlatformFeature(feature: string): boolean {
  const adapter = usePlatformAdapter();
  return adapter.supportsFeature(feature as any);
}

/**
 * Hook to get the current platform name
 *
 * @example
 * ```typescript
 * function PlatformSpecificComponent() {
 *   const platform = usePlatformName();
 *
 *   if (platform === 'native') {
 *     return <NativeView />;
 *   }
 *
 *   return <WebView />;
 * }
 * ```
 */
export function usePlatformName(): 'web' | 'native' {
  const adapter = usePlatformAdapter();
  return adapter.name;
}

/**
 * Hook to conditionally render content based on platform
 *
 * @example
 * ```typescript
 * function ResponsiveComponent() {
 *   const { isWeb, isNative } = usePlatformCheck();
 *
 *   return (
 *     <>
 *       {isWeb && <WebOnlyFeature />}
 *       {isNative && <NativeOnlyFeature />}
 *       <SharedFeature />
 *     </>
 *   );
 * }
 * ```
 */
export function usePlatformCheck(): {
  isWeb: boolean;
  isNative: boolean;
  platform: 'web' | 'native';
} {
  const adapter = usePlatformAdapter();

  return {
    isWeb: adapter.name === 'web',
    isNative: adapter.name === 'native',
    platform: adapter.name,
  };
}
