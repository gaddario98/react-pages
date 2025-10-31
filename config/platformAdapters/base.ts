/**
 * Base Platform Adapter Interface
 * Defines the contract for platform-specific implementations
 *
 * @module config/platformAdapters/base
 */

import type { ReactNode, ComponentType } from 'react';
import type {
  MetadataConfig,
  OpenGraphConfig,
  StructuredDataConfig,
  AIHintsConfig,
  RobotsConfig,
  MetaTag
} from '../types';

/**
 * Platform feature capabilities
 */
export type PlatformFeature =
  | 'metadata' // Document head manipulation
  | 'lazyLoading' // Code splitting and lazy loading
  | 'suspense' // React Suspense support
  | 'documentHead' // Direct document.head access
  | 'intersectionObserver'; // IntersectionObserver API

// Re-export types from config/types for backward compatibility
export type {
  MetadataConfig,
  OpenGraphConfig,
  StructuredDataConfig,
  AIHintsConfig,
  RobotsConfig,
  MetaTag
} from '../types';

export interface ReadonlyMetaTag {
  name?: string;
  property?: string;
  content: string;
  id?: string;
}

/**
 * View settings for container rendering
 */
export interface ViewSettings {
  withoutPadding?: boolean;
  disableRefreshing?: boolean;
  customPageContainer?: ComponentType<unknown>;
  customLayoutComponent?: ComponentType<unknown>;
  [key: string]: unknown;
}

/**
 * Platform adapter interface
 * Provides platform-specific implementations for metadata, rendering, and feature detection
 */
export interface PlatformAdapter {
  /** Platform identifier */
  name: 'web' | 'native';

  /**
   * Inject metadata into platform-specific head/manifest
   * @param metadata Resolved metadata configuration
   */
  injectMetadata(metadata: MetadataConfig): void;

  /**
   * Render page container with platform-appropriate wrapper
   * @param children Page content
   * @param settings View settings configuration
   */
  renderContainer(children: ReactNode, settings: ViewSettings): ReactNode;

  /**
   * Render scrollable container
   * @param children Scrollable content
   * @param settings View settings configuration
   */
  renderScrollView(children: ReactNode, settings: ViewSettings): ReactNode;

  /**
   * Check if platform supports a specific feature
   * @param feature Feature name to check
   */
  supportsFeature(feature: PlatformFeature): boolean;
}

/**
 * Default no-op adapter for unsupported platforms
 */
export const noopAdapter: PlatformAdapter = {
  name: 'web',
  injectMetadata: () => {},
  renderContainer: (children) => children,
  renderScrollView: (children) => children,
  supportsFeature: () => false,
};
