/**
 * Base Platform Adapter Interface
 * Defines the contract for platform-specific implementations
 *
 * @module config/platformAdapters/base
 */

import type { ReactNode } from 'react';

/**
 * Platform feature capabilities
 */
export type PlatformFeature =
  | 'metadata' // Document head manipulation
  | 'lazyLoading' // Code splitting and lazy loading
  | 'suspense' // React Suspense support
  | 'documentHead' // Direct document.head access
  | 'intersectionObserver'; // IntersectionObserver API

/**
 * Metadata configuration interface
 */
export interface MetadataConfig<F = any, Q = any> {
  title?: string | ((props: any) => string);
  description?: string | ((props: any) => string);
  documentLang?: string;
  keywords?: string[] | ((props: any) => string[]);
  openGraph?: OpenGraphConfig<F, Q>;
  structuredData?: StructuredDataConfig<F, Q>;
  aiHints?: AIHintsConfig<F, Q>;
  robots?: RobotsConfig;
  customMeta?: MetaTag[] | ((props: any) => MetaTag[]);
}

/**
 * Open Graph metadata configuration
 */
export interface OpenGraphConfig<F = any, Q = any> {
  type?: 'website' | 'article' | 'product' | 'profile';
  title?: string | ((props: any) => string);
  description?: string | ((props: any) => string);
  image?: string | ((props: any) => string);
  url?: string | ((props: any) => string);
  siteName?: string;
  locale?: string;
}

/**
 * Structured data configuration (JSON-LD)
 */
export interface StructuredDataConfig<F = any, Q = any> {
  type: 'Article' | 'Product' | 'WebPage' | 'FAQPage' | 'Organization' | 'Person';
  schema: Record<string, any> | ((props: any) => Record<string, any>);
}

/**
 * AI crawler hints configuration
 */
export interface AIHintsConfig<F = any, Q = any> {
  contentClassification?: string | ((props: any) => string);
  modelHints?: string[] | ((props: any) => string[]);
  contextualInfo?: string | ((props: any) => string);
}

/**
 * Robots meta tag configuration
 */
export interface RobotsConfig {
  noindex?: boolean;
  nofollow?: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
  maxImagePreview?: 'none' | 'standard' | 'large';
  maxSnippet?: number;
}

/**
 * Custom meta tag
 */
export interface MetaTag {
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
  customPageContainer?: any;
  customLayoutComponent?: any;
  [key: string]: any;
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
