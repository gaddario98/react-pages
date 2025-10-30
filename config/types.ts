/**
 * Metadata Configuration Types
 * Custom metadata system replacing react-helmet-async
 * Platform-agnostic: works on web, React Native, and SSR
 */

export interface MetaTag {
  /** For <meta name="..." content="..." /> */
  name?: string;
  /** For <meta property="og:..." content="..." /> */
  property?: string;
  /** For <meta http-equiv="..." content="..." /> */
  httpEquiv?: string;
  /** Meta tag content */
  content: string;
  /** Unique identifier for updating existing tags */
  id?: string;
}

export interface MetadataConfig {
  /** Page title - sets document.title on web */
  title?: string;
  /** Page description meta tag */
  description?: string;
  /** Keywords for SEO (converted to comma-separated string) */
  keywords?: string[];
  /** Open Graph image URL (must be absolute) */
  ogImage?: string;
  /** Open Graph title (defaults to title if not specified) */
  ogTitle?: string;
  /** Open Graph description (defaults to description if not specified) */
  ogDescription?: string;
  /** Canonical URL for the page (must be absolute) */
  canonical?: string;
  /** Robots directive (e.g., "index, follow", "noindex, nofollow") */
  robots?: string;
  /** Language code (ISO 639-1, e.g., "en", "it", "en-US") */
  lang?: string;
  /** Author meta tag */
  author?: string;
  /** Viewport meta tag (defaults to "width=device-width, initial-scale=1") */
  viewport?: string;
  /** Theme color for browser UI */
  themeColor?: string;
  /** Additional custom meta tags */
  customMeta?: MetaTag[];
}

export interface MetadataProvider {
  /** Apply metadata configuration to the page */
  setMetadata: (config: MetadataConfig) => void;
  /** Get current metadata configuration */
  getMetadata: () => MetadataConfig;
  /** Reset all metadata to defaults */
  resetMetadata: () => void;
}

/**
 * Configuration for lazy loading and code splitting behavior
 * Enables deferred component loading to reduce initial bundle size
 */
export interface LazyLoadingConfig {
  /** Enable lazy loading (default: true) */
  enabled?: boolean;
  /** Preload on hover for interactive elements (default: false) */
  preloadOnHover?: boolean;
  /** Preload on focus for keyboard navigation (default: false) */
  preloadOnFocus?: boolean;
  /** Preload after render with delay (in ms, default: undefined - no delay) */
  preloadAfterRender?: number;
  /** Fallback component to show while loading (default: null) */
  suspenseFallback?: React.ReactNode;
  /** Custom error boundary component for lazy-loaded modules */
  errorBoundary?: React.ComponentType<{ error: Error; retry: () => void }>;
  /** Maximum time to wait before showing error state (in ms, default: 30000) */
  timeout?: number;
  /** Log performance metrics for lazy loading (development only) */
  logMetrics?: boolean;
}
