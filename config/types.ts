/**
 * Metadata Configuration Types
 * Custom metadata system replacing react-helmet-async
 * Platform-agnostic: works on web, React Native, and SSR
 */

import { FieldValues } from "react-hook-form";
import { QueriesArray } from "@gaddario98/react-queries";
import { MappedProps, PageProps } from "../types";

/**
 * Context passed to dynamic metadata evaluator functions
 * Provides access to form values, queries, and page state
 */
export type MetadataEvaluatorContext<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
> = MappedProps<F, Q>;

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

/**
 * Open Graph Configuration (Facebook, LinkedIn, Twitter/X)
 */
export interface OpenGraphConfig<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
> {
  type?: "website" | "article" | "product" | "profile";
  title?: string | ((context: MetadataEvaluatorContext<F, Q>) => string);
  description?: string | ((context: MetadataEvaluatorContext<F, Q>) => string);
  /** URL to preview image (must be absolute) */
  image?: string | ((context: MetadataEvaluatorContext<F, Q>) => string);
  /** Canonical URL */
  url?: string | ((context: MetadataEvaluatorContext<F, Q>) => string);
  siteName?: string;
  /** Locale (e.g., "en_US", "it_IT") */
  locale?: string;
}

/**
 * Structured Data Configuration (schema.org JSON-LD)
 */
export interface StructuredDataConfig<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
> {
  type:
    | "Article"
    | "Product"
    | "WebPage"
    | "FAQPage"
    | "Organization"
    | "Person";
  schema:
    | Record<string, unknown>
    | ((context: MetadataEvaluatorContext<F, Q>) => Record<string, unknown>);
}

/**
 * AI Crawler Hints (for AI search engines and LLMs)
 */
export interface AIHintsConfig<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
> {
  /** Content classification (e.g., "documentation", "tutorial", "reference") */
  contentClassification?:
    | string
    | ((context: MetadataEvaluatorContext<F, Q>) => string);
  /** Hints for AI models (e.g., ["code-heavy", "technical"]) */
  modelHints?:
    | string[]
    | ((context: MetadataEvaluatorContext<F, Q>) => string[]);
  /** Additional context for AI understanding */
  contextualInfo?:
    | string
    | ((context: MetadataEvaluatorContext<F, Q>) => string);
  /** Exclude this page from AI crawler indexing */
  excludeFromIndexing?: boolean;
}

/**
 * Robots Configuration (indexing directives)
 */
export interface RobotsConfig {
  /** Prevent indexing */
  noindex?: boolean;
  /** Don't follow links */
  nofollow?: boolean;
  /** Don't cache page */
  noarchive?: boolean;
  /** Don't show snippets in search results */
  nosnippet?: boolean;
  /** Image preview size in search results */
  maxImagePreview?: "none" | "standard" | "large";
  /** Max snippet length in search results */
  maxSnippet?: number;
}

/**
 * Complete Metadata Configuration (Generic over F and Q for dynamic metadata)
 */
export interface MetadataConfig<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
> {
  // Basic Metadata
  /** Page title - sets document.title on web */
  title?: string | ((context: MetadataEvaluatorContext<F, Q>) => string);
  /** Page description meta tag */
  description?: string | ((context: MetadataEvaluatorContext<F, Q>) => string);
  /** HTML lang attribute (e.g., "en", "it") */
  documentLang?: string;
  /** Keywords for SEO */
  keywords?: string[] | ((context: MetadataEvaluatorContext<F, Q>) => string[]);

  // Open Graph (Social Media)
  openGraph?: OpenGraphConfig<F, Q>;

  // Structured Data (Search Engines)
  structuredData?: StructuredDataConfig<F, Q>;

  // AI Crawler Hints (NEW)
  aiHints?: AIHintsConfig<F, Q>;

  // Robots Meta Tags
  robots?: RobotsConfig;

  // Additional custom meta tags
  customMeta?:
    | MetaTag[]
    | ((context: MetadataEvaluatorContext<F, Q>) => MetaTag[]);

  // Additional meta tags (alias for customMeta for backward compatibility)
  otherMetaTags?:
    | MetaTag[]
    | ((context: MetadataEvaluatorContext<F, Q>) => MetaTag[]);

  // Disable search engine indexing
  disableIndexing?: boolean;

  // Legacy fields (backward compatibility)
  /** @deprecated Use openGraph.image instead */
  ogImage?: string;
  /** @deprecated Use openGraph.title instead */
  ogTitle?: string;
  /** @deprecated Use openGraph.url instead */
  canonical?: string;
  /** @deprecated Use documentLang instead */
  lang?: string;
  /** Author meta tag */
  author?: string;
  /** Viewport meta tag (defaults to "width=device-width, initial-scale=1") */
  viewport?: string;
  /** Theme color for browser UI */
  themeColor?: string;
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
export interface LazyLoadingConfig<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
> {
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
  /** IntersectionObserver threshold (0-1, default: 0.1) - alias for intersectionThreshold */
  threshold?: number | number[];
  /** IntersectionObserver threshold (0-1, default: 0.1) */
  intersectionThreshold?: number | number[];
  /** IntersectionObserver root margin (default: "100px") - alias for intersectionRootMargin */
  rootMargin?: string;
  /** IntersectionObserver root margin (default: "100px") */
  intersectionRootMargin?: string;
  /** Trigger type for lazy loading: viewport (IntersectionObserver), interaction (manual), or conditional (based on function) */
  trigger?: "viewport" | "interaction" | "conditional";
  /** Conditional function to determine if content should load (for trigger: "conditional") */
  condition?: (context: MetadataEvaluatorContext<F, Q>) => boolean;
  /** Placeholder component to show before lazy content loads */
  placeholder?: React.ReactNode;
}

/**
 * Platform-specific configuration overrides
 * Allows different behavior on web vs React Native
 * Note: This is a partial type - it will be completed in types.ts with full PageProps type
 */
export interface PlatformOverrides<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
> {
  /** Web-specific overrides (React DOM) */
  web?: Partial<PageProps<F, Q>>; // Will be Partial<PageProps<F, Q>> when imported in types.ts
  /** React Native-specific overrides */
  native?: Partial<PageProps<F, Q>>; // Will be Partial<PageProps<F, Q>> when imported in types.ts
}
