/**
 * React Native Platform Adapter
 * Implements platform-specific features for React Native
 *
 * @module config/platformAdapters/native
 */

import React, { ReactNode, ComponentType } from 'react';
import type {
  PlatformAdapter,
  PlatformFeature,
  MetadataConfig,
  ViewSettings,
} from './base';

/**
 * Extended view settings for React Native platform
 * Includes React Native-specific components
 */
interface NativeViewSettings extends ViewSettings {
  customScrollView?: ComponentType<unknown>;
  refreshControl?: ComponentType<unknown>;
}

/**
 * React Native platform adapter implementation
 * Provides graceful degradation for React Native environments
 * - Metadata: No-op (no document.head)
 * - Containers: Maps to View/ScrollView components
 * - Features: Limited support (no IntersectionObserver, no document head)
 */
export const nativeAdapter: PlatformAdapter = {
  name: 'native',

  injectMetadata(metadata: MetadataConfig): void {
    // React Native doesn't have document.head
    // Metadata can be logged for debugging or stored for SSR/analytics
    if (
      typeof console !== 'undefined' &&
      process.env.NODE_ENV === 'development'
    ) {
      console.log(
        '[PlatformAdapter:Native] Metadata (no-op on React Native):',
        metadata,
      );
    }

    // For React Native apps with web target (Expo web), metadata could be
    // stored in a context and used during SSR. This is left to consumer apps.
  },

  renderContainer(children: ReactNode, settings: ViewSettings): ReactNode {
    // Try to use custom container if provided
    if (settings.customPageContainer) {
      const CustomContainer =
        settings.customPageContainer as React.ComponentType<any>;
      return React.createElement(
        CustomContainer,
        { withoutPadding: settings.withoutPadding },
        children,
      );
    }

    // Fallback: Use a simple wrapper (consumer app should provide actual View component)
    // We can't import 'react-native' here as this is a library that might not have it installed
    // Instead, we'll just return children wrapped in a fragment
    // The consumer app should provide customPageContainer for proper React Native rendering
    return React.createElement(React.Fragment, {}, children);
  },

  renderScrollView(children: ReactNode, settings: ViewSettings): ReactNode {
    // Similar to renderContainer, we can't directly import ScrollView
    // Consumer apps should provide customScrollView via settings
    const nativeSettings = settings as unknown as NativeViewSettings;
    if (nativeSettings.customScrollView) {
      const CustomScrollView =
        nativeSettings.customScrollView as React.ComponentType<any>;
      return React.createElement(
        CustomScrollView,
        {
          contentContainerStyle: {
            padding: settings.withoutPadding ? 0 : 16,
          },
          refreshControl: settings.disableRefreshing
            ? undefined
            : nativeSettings.refreshControl,
        } as any,
        children,
      );
    }

    // Fallback: just return children
    return React.createElement(React.Fragment, {} as any, children);
  },

  supportsFeature(feature: PlatformFeature): boolean {
    switch (feature) {
      case 'lazyLoading':
      case 'suspense':
        // React Native supports React.lazy and Suspense with Metro bundler
        return true;

      case 'metadata':
      case 'documentHead':
      case 'intersectionObserver':
        // Not available in React Native
        return false;

      default:
        return false;
    }
  },
};

/**
 * Helper to detect if running in React Native environment
 */
export function isReactNative(): boolean {
  return (
    typeof navigator !== 'undefined' && navigator.product === 'ReactNative'
  );
}

/**
 * Helper to create a React Native specific adapter with custom components
 *
 * @example
 * ```typescript
 * import { View, ScrollView } from 'react-native';
 *
 * const customNativeAdapter = createNativeAdapter({
 *   PageContainer: View,
 *   ScrollViewComponent: ScrollView,
 * });
 * ```
 */
export function createNativeAdapter(components: {
  PageContainer?: ComponentType<unknown>;
  ScrollViewComponent?: ComponentType<unknown>;
  RefreshControl?: ComponentType<unknown>;
}): PlatformAdapter {
  return {
    ...nativeAdapter,

    renderContainer(children: ReactNode, settings: ViewSettings): ReactNode {
      const Container =
        settings.customPageContainer || components.PageContainer;

      if (!Container) {
        return children;
      }

      return React.createElement(
        Container,
        {
          style: {
            flex: 1,
            padding: settings.withoutPadding ? 0 : 16,
          },
        } as any,
        children,
      );
    },

    renderScrollView(children: ReactNode, settings: ViewSettings): ReactNode {
      const nativeSettings = settings as unknown as NativeViewSettings;
      const ScrollViewComponent =
        nativeSettings.customScrollView || components.ScrollViewComponent;

      if (!ScrollViewComponent) {
        return children;
      }

      const refreshControl =
        !settings.disableRefreshing && components.RefreshControl
          ? React.createElement(components.RefreshControl, {
              refreshing: false,
              onRefresh: () => {},
            } as any)
          : undefined;

      return React.createElement(
        ScrollViewComponent,
        {
          contentContainerStyle: {
            padding: settings.withoutPadding ? 0 : 16,
          },
          refreshControl,
        } as any,
        children,
      );
    },
  };
}
