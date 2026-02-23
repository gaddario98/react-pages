import type { DeepKeys, DeepValue } from "@tanstack/react-form";
import type { ComponentProps } from "react";
import type {
  AllMutation,
  ExtractQuery,
  MultipleQueryResponse,
  MutationConfig,
  QueriesArray,
  QueryAtIndex,
  QueryDefinition,
  QueryProps,
} from "@gaddario98/react-queries";
import type {
  FieldValues,
  FormManager,
  FormManagerConfig,
  SetValueFunction,
  Submit,
} from "@gaddario98/react-form";
import type { DefaultContainerProps, PageConfigProps } from "./config";

/* ======================================================
   MAPPABLE PROPS E FUNZIONI DI MAPPING
====================================================== */

type StringKey<T> = Extract<keyof T, string>;

type VariableTopKey<V> = StringKey<V>;
type VariableValue<V, K extends VariableTopKey<V>> = V[K];

// Helper types for GetFunction
type QueryTopKey<Q extends QueriesArray> = StringKey<MultipleQueryResponse<Q>>;
type QuerySubKey<Q extends QueriesArray, K extends QueryTopKey<Q>> = StringKey<
  MultipleQueryResponse<Q>[K]
>;
type QueryCompositeKey<Q extends QueriesArray> = {
  [K in QueryTopKey<Q>]: K | `${K}.${QuerySubKey<Q, K>}`;
}[QueryTopKey<Q>];
type QueryValue<
  Q extends QueriesArray,
  K extends QueryCompositeKey<Q>,
> = K extends `${infer Top}.${infer Sub}`
  ? Top extends QueryTopKey<Q>
    ? Sub extends QuerySubKey<Q, Top>
      ? MultipleQueryResponse<Q>[Top][Sub]
      : never
    : never
  : K extends QueryTopKey<Q>
    ? MultipleQueryResponse<Q>[K]
    : never;

type MutationTopKey<Q extends QueriesArray> = StringKey<AllMutation<Q>>;
type MutationSubKey<
  Q extends QueriesArray,
  K extends MutationTopKey<Q>,
> = StringKey<AllMutation<Q>[K]>;
type MutationCompositeKey<Q extends QueriesArray> = {
  [K in MutationTopKey<Q>]: K | `${K}.${MutationSubKey<Q, K>}`;
}[MutationTopKey<Q>];
type MutationValue<
  Q extends QueriesArray,
  K extends MutationCompositeKey<Q>,
> = K extends `${infer Top}.${infer Sub}`
  ? Top extends MutationTopKey<Q>
    ? Sub extends MutationSubKey<Q, Top>
      ? AllMutation<Q>[Top][Sub]
      : never
    : never
  : K extends MutationTopKey<Q>
    ? AllMutation<Q>[K]
    : never;

export type GetFunction<
  F extends FieldValues,
  Q extends QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> = {
  // Queries (from GetApiValuesFunction)
  <K extends QueryTopKey<Q>>(
    type: "query",
    key: K,
  ): MultipleQueryResponse<Q>[K];
  <K extends QueryCompositeKey<Q>>(type: "query", key: K): QueryValue<Q, K>;
  <K extends QueryCompositeKey<Q>>(
    type: "query",
    key: K,
    defaultValue: unknown,
  ): NonNullable<QueryValue<Q, K>>;
  <K extends QueryTopKey<Q>>(
    type: "query",
    key: K,
    defaultValue: MultipleQueryResponse<Q>[K]["data"],
  ): MultipleQueryResponse<Q>[K]["data"];
  <K extends QueryCompositeKey<Q>>(
    type: "query",
    key: K,
    defaultValue: QueryValue<Q, K>,
  ): NonNullable<QueryValue<Q, K>>;

  // Mutations (from GetApiValuesFunction)
  <K extends MutationTopKey<Q>>(type: "mutation", key: K): AllMutation<Q>[K];
  <K extends MutationCompositeKey<Q>>(
    type: "mutation",
    key: K,
  ): MutationValue<Q, K>;
  <K extends MutationCompositeKey<Q>>(
    type: "mutation",
    key: K,
    defaultValue: unknown,
  ): NonNullable<MutationValue<Q, K>>;
  <K extends MutationTopKey<Q>>(
    type: "mutation",
    key: K,
    defaultValue: AllMutation<Q>[K]["data"],
  ): AllMutation<Q>[K]["data"];
  <K extends MutationCompositeKey<Q>>(
    type: "mutation",
    key: K,
    defaultValue: MutationValue<Q, K>,
  ): NonNullable<MutationValue<Q, K>>;

  // State
  <K extends VariableTopKey<V>>(type: "state", key: K): VariableValue<V, K>;
  <K extends VariableTopKey<V>>(
    type: "state",
    key: K,
    defaultValue: VariableValue<V, K>,
  ): NonNullable<VariableValue<V, K>>;

  // Form values
  <TField extends DeepKeys<F>>(
    type: "form",
    key: TField,
  ): DeepValue<F, TField> | undefined;
  <TField extends DeepKeys<F>>(
    type: "form",
    key: TField,
    defaultValue: DeepValue<F, TField>,
  ): NonNullable<DeepValue<F, TField>>;
};

export type SetFunction<
  F extends FieldValues,
  V extends Record<string, unknown> = Record<string, unknown>,
> = {
  (type: "form"): SetValueFunction<F>;
  (
    type: "state",
  ): <K extends VariableTopKey<V>>(key: K, value: VariableValue<V, K>) => void;
};

export type FunctionProps<
  F extends FieldValues,
  Q extends QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> = {
  /**
   * Read the current query/mutation value by key.
   * Example: get('query', 'bookings')
   */
  get: GetFunction<F, Q, V>;
  /**
   * Generic setter accessor.
   * - set('form') returns `setValue`
   * - set('state') returns state setter
   */
  set: SetFunction<F, V>;
};

type MappedItemsFunction<
  F extends FieldValues,
  Q extends QueriesArray,
  ComponentType,
  V extends Record<string, unknown> = Record<string, unknown>,
> = (props: FunctionProps<F, Q, V>) => ComponentType;

/* ======================================================
   CONTENT ITEMS & CONTAINER ITEMS
====================================================== */
type Items<
  F extends FieldValues,
  Q extends QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> = {
  type: "custom";
  component:
    | React.JSX.Element
    | ((props: FunctionProps<F, Q, V>) => React.JSX.Element);

  // Layout & positioning
  index?: number;
  usedBoxes?: number;
  renderInFooter?: boolean;
  renderInHeader?: boolean;
  hidden?: boolean | MappedItemsFunction<F, Q, boolean, V>;

  // Interaction & behavior
  isDraggable?: boolean;
  isInDraggableView?: boolean;

  // React optimization
  key?: string;

  /** @deprecated Query dependencies for selective rendering */
  usedQueries?: string[];

  // NEW IN 2.0: Lazy loading support
  lazy?: boolean;
  lazyTrigger?: "viewport" | "interaction" | "conditional";
  lazyCondition?: MappedItemsFunction<F, Q, boolean, V>;
};

type ContainerItem<
  F extends FieldValues,
  Q extends QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> = {
  type: "container";
  component?: PageConfigProps["ItemsContainer"];
  items: ContentItemsType<F, Q, V>;

  // Layout & positioning
  index?: number;
  usedBoxes?: number;
  renderInFooter?: boolean;
  renderInHeader?: boolean;
  hidden?: boolean | MappedItemsFunction<F, Q, boolean, V>;

  // Interaction & behavior
  isDraggable?: boolean;
  isInDraggableView?: boolean;

  // React optimization
  key?: string;

  /** @deprecated Query dependencies for selective rendering */
  usedQueries?: string[];

  // NEW IN 2.0: Lazy loading support
  lazy?: boolean;
  lazyTrigger?: "viewport" | "interaction" | "conditional";
  lazyCondition?: MappedItemsFunction<F, Q, boolean, V>;
};

type ContentItem<
  F extends FieldValues,
  Q extends QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> = Items<F, Q, V> | ContainerItem<F, Q, V>;

type MappedContents<
  F extends FieldValues,
  Q extends QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> = MappedItemsFunction<F, Q, Array<ContentItem<F, Q, V>>, V>;

type ContentItemsType<
  F extends FieldValues,
  Q extends QueriesArray = QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> = Array<ContentItem<F, Q, V>> | MappedContents<F, Q, V>;

/* ======================================================
   FORM PAGE & MODAL TYPES
====================================================== */
type FormPageProps<
  F extends FieldValues,
  Q extends QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> = Omit<
  ComponentProps<typeof FormManager<F>>,
  "updateFormValues" | "submit" | "data"
> & {
  defaultValueQueryKey?: Array<string>;
  defaultValueQueryMap?: (props: ExtractQuery<Q>["response"]) => F;
  submit?: Array<Submit<F>> | MappedItemsFunction<F, Q, Array<Submit<F>>, V>;
  index?: number;
  data?: Array<
    FormManagerConfig<F> | MappedItemsFunction<F, Q, FormManagerConfig<F>, V>
  >;
  // NEW IN 2.0: Debounce delay for form value changes (ms, default: 300)
  debounceDelay?: number;
  hidden?: boolean | MappedItemsFunction<F, Q, boolean, V>;
};

/* ======================================================
   PAGE PROPS & VIEW SETTINGS
====================================================== */

type SingleQueryConfig<
  F extends FieldValues,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Q extends QueryDefinition<any, any, any, any, any>,
  V extends Record<string, unknown> = Record<string, unknown>,
> =
  Q extends QueryDefinition<infer K, infer T, infer P, infer R, infer C>
    ? T extends "mutation"
      ? {
          type: "mutation";
          mutationConfig:
            | (<Qa extends QueriesArray>(
                props: FunctionProps<F, Qa, V>,
              ) => MutationConfig<P, R, C>)
            | MutationConfig<P, R, C>;
          key: K;
        }
      : {
          type: "query";
          queryConfig?:
            | (<Qa extends QueriesArray>(
                props: FunctionProps<F, Qa, V>,
              ) => Omit<QueryProps<K, R>, "keyToMap">)
            | Omit<QueryProps<K, R>, "keyToMap">;
          key: K;
        }
    : never;

type QueryPageConfigArray<
  F extends FieldValues,
  Q extends QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> = {
  [I in keyof Q]: SingleQueryConfig<F, QueryAtIndex<Q, I>, V>;
};
interface PageProps<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> {
  // Core identification
  id: string;
  ns?: string;

  // Data management
  contents?: ContentItemsType<F, Q, V>;
  queries?: QueryPageConfigArray<F, Q, V>;
  form?: FormPageProps<F, Q, V>;
  variables?: V;

  // Layout and view configuration
  viewSettings?: MappedItemsFunction<F, Q, ViewSettings, V> | ViewSettings;

  // NEW IN 2.0: Metadata & SEO (generic over F and Q for dynamic metadata)
  meta?: MetadataConfig<F, Q, V>;

  // Feature flags
  enableAuthControl?: boolean;
}

type ViewSettings = {
  withoutPadding?: boolean;
  header?: {
    withoutPadding?: boolean;
  };
  footer?: {
    withoutPadding?: boolean;
  };
  disableRefreshing?: boolean;

  // New optimized props
  layoutComponent?: <
    F extends FieldValues = FieldValues,
    Q extends QueriesArray = QueriesArray,
    V extends Record<string, unknown> = Record<string, unknown>,
  >(
    props: DefaultContainerProps<F, Q, V> & Record<string, unknown>,
  ) => React.ReactNode;

  layoutProps?: Record<string, unknown>;
  pageContainerComponent?: React.ComponentType<
    { children: React.ReactNode; id: string } & Record<string, unknown>
  >;
  pageContainerProps?: Record<string, unknown>;
  /** @deprecated Use layoutComponent instead */
  customLayoutComponent?: PageConfigProps["BodyContainer"];
  /** @deprecated Use pageContainerComponent instead */
  customPageContainer?: PageConfigProps["PageContainer"];
};

// Note: PageMetadataProps is now deprecated in favor of MetadataConfig
// The old interface is kept for reference but not exported (use MetadataConfig instead)
/* ======================================================
   PERFORMANCE OPTIMIZATION TYPES
====================================================== */

/**
 * Dependency Graph Node
 * Tracks which queries, form values, and mutations a component depends on
 */
export interface DependencyNode {
  componentId: string;
  parentComponent: string | null;
  childComponents: Array<string>;
}

/**
 * Dependency Graph
 * Maps component IDs to their dependency nodes for selective re-rendering
 */
export interface DependencyGraph {
  nodes: Map<string, DependencyNode>;
  addNode: (node: DependencyNode) => void;
  getNode: (componentId: string) => DependencyNode | undefined;
  getAffectedComponents: (changedKeys: Array<string>) => Array<string>;
}

/**
 * Memoization Cache Types
 * For tracking memoized computations and their cache hits
 */
export interface MemoizationCacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
}

export interface RenderComponentsProps<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> {
  content: ContentItem<F, Q, V>;
  ns: string;
  pageId: string;
  key: string;
}

// Backward compatibility: PageMetadataProps is now MetadataConfig
export type { MetadataConfig as PageMetadataProps };

export type {
  MappedItemsFunction,
  Items,
  ContainerItem,
  ContentItem,
  MappedContents,
  ContentItemsType,
  FormPageProps,
  PageProps,
  ViewSettings,
  QueryPageConfigArray,
};

export type MetadataEvaluatorContext<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> = FunctionProps<F, Q, V>;

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

// ─── Open Graph ──────────────────────────────────────────────

/**
 * Open Graph Image Configuration
 */
export interface OpenGraphImage {
  /** Absolute URL to the image */
  url: string;
  /** Alt text for the image */
  alt?: string;
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
  /** MIME type (e.g., "image/jpeg", "image/png") */
  type?: string;
}

/**
 * Open Graph Article Configuration (when type='article')
 */
export interface OpenGraphArticle {
  /** ISO 8601 date string */
  publishedTime?: string;
  /** ISO 8601 date string */
  modifiedTime?: string;
  /** ISO 8601 date string */
  expirationTime?: string;
  /** Author name or URL */
  author?: string | Array<string>;
  /** Article section/category */
  section?: string;
  /** Article tags */
  tags?: Array<string>;
}

/**
 * Open Graph Configuration (Facebook, LinkedIn, etc.)
 */
export interface OpenGraphConfig<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> {
  type?: "website" | "article" | "product" | "profile";
  title?: string | ((context: MetadataEvaluatorContext<F, Q, V>) => string);
  description?:
    | string
    | ((context: MetadataEvaluatorContext<F, Q, V>) => string);
  /** Single image URL or full image config */
  image?:
    | string
    | OpenGraphImage
    | ((context: MetadataEvaluatorContext<F, Q, V>) => string | OpenGraphImage);
  /** Multiple images for the page */
  images?:
    | Array<OpenGraphImage>
    | ((context: MetadataEvaluatorContext<F, Q, V>) => Array<OpenGraphImage>);
  /** Canonical URL */
  url?: string | ((context: MetadataEvaluatorContext<F, Q, V>) => string);
  siteName?: string;
  /** Locale (e.g., "en_US", "it_IT") */
  locale?: string;
  /** Article-specific metadata (when type='article') */
  article?: OpenGraphArticle;
}

// ─── Twitter Card ────────────────────────────────────────────

/**
 * Twitter Card Configuration
 */
export interface TwitterCardConfig<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Card type */
  card?: "summary" | "summary_large_image" | "app" | "player";
  /** @username of the website */
  site?: string;
  /** @username of the content creator */
  creator?: string;
  /** Title (falls back to og:title then page title) */
  title?: string | ((context: MetadataEvaluatorContext<F, Q, V>) => string);
  /** Description (falls back to og:description then page description) */
  description?:
    | string
    | ((context: MetadataEvaluatorContext<F, Q, V>) => string);
  /** Image URL (falls back to og:image) */
  image?: string | ((context: MetadataEvaluatorContext<F, Q, V>) => string);
  /** Alt text for the image */
  imageAlt?: string | ((context: MetadataEvaluatorContext<F, Q, V>) => string);
}

// ─── Alternates / hreflang ───────────────────────────────────

/**
 * Alternate languages/URLs configuration for i18n SEO
 */
export interface AlternatesConfig {
  /** Canonical URL for this page */
  canonical?: string;
  /** Map of locale → URL for hreflang tags (e.g., { "en": "/en/page", "it": "/it/page" }) */
  languages?: Record<string, string>;
  /** Media-specific alternates (e.g., mobile version) */
  media?: Record<string, string>;
  /** RSS/Atom feed alternates */
  types?: Record<string, Array<{ url: string; title?: string }>>;
}

// ─── Icons / Manifest / PWA ──────────────────────────────────

/**
 * Icon configuration
 */
export interface IconConfig {
  /** URL to the icon */
  url: string;
  /** Icon type (e.g., "image/png", "image/svg+xml") */
  type?: string;
  /** Icon sizes (e.g., "32x32", "192x192") */
  sizes?: string;
  /** Color for SVG mask icons */
  color?: string;
}

/**
 * Icons & PWA configuration
 */
export interface IconsConfig {
  /** Standard favicon(s) - link[rel="icon"] */
  icon?: string | IconConfig | Array<IconConfig>;
  /** Apple touch icon(s) - link[rel="apple-touch-icon"] */
  apple?: string | IconConfig | Array<IconConfig>;
  /** Shortcut icon (legacy) */
  shortcut?: string;
}

// ─── Structured Data ─────────────────────────────────────────

/**
 * Structured Data Configuration (schema.org JSON-LD)
 */
export interface StructuredDataConfig<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> {
  type:
    | "Article"
    | "Product"
    | "WebPage"
    | "FAQPage"
    | "Organization"
    | "Person"
    | "WebSite"
    | "BreadcrumbList";
  schema:
    | Record<string, unknown>
    | ((context: MetadataEvaluatorContext<F, Q, V>) => Record<string, unknown>);
}

// ─── AI Hints ────────────────────────────────────────────────

/**
 * AI Crawler Hints (for AI search engines and LLMs)
 */
export interface AIHintsConfig<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Content classification (e.g., "documentation", "tutorial", "reference") */
  contentClassification?:
    | string
    | ((context: MetadataEvaluatorContext<F, Q, V>) => string);
  /** Hints for AI models (e.g., ["code-heavy", "technical"]) */
  modelHints?:
    | Array<string>
    | ((context: MetadataEvaluatorContext<F, Q, V>) => Array<string>);
  /** Additional context for AI understanding */
  contextualInfo?:
    | string
    | ((context: MetadataEvaluatorContext<F, Q, V>) => string);
  /** Exclude this page from AI crawler indexing */
  excludeFromIndexing?: boolean;
}

// ─── Robots ──────────────────────────────────────────────────

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

// ─── Resolved Metadata (all values are plain strings/objects) ─

/**
 * Resolved Metadata - all dynamic functions have been evaluated.
 * This is the output of resolveMetadata() and is what gets applied to the DOM
 * or passed to framework helpers (toNextMetadata, etc.).
 */
export interface ResolvedMetadata {
  // Basic
  title?: string;
  description?: string;
  canonical?: string;
  lang?: string;
  keywords?: Array<string>;
  author?: string;
  viewport?: string;
  themeColor?: string;

  // Open Graph
  openGraph?: {
    type?: "website" | "article" | "product" | "profile";
    title?: string;
    description?: string;
    image?: string | OpenGraphImage;
    images?: Array<OpenGraphImage>;
    url?: string;
    siteName?: string;
    locale?: string;
    article?: OpenGraphArticle;
  };

  // Twitter Card
  twitter?: {
    card?: "summary" | "summary_large_image" | "app" | "player";
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    image?: string;
    imageAlt?: string;
  };

  // Alternates / hreflang
  alternates?: AlternatesConfig;

  // Icons / PWA
  icons?: IconsConfig;
  /** Web app manifest URL */
  manifest?: string;

  // Structured Data
  structuredData?: {
    type: string;
    schema: Record<string, unknown>;
  };

  // AI Hints
  aiHints?: {
    contentClassification?: string;
    modelHints?: Array<string>;
    contextualInfo?: string;
    excludeFromIndexing?: boolean;
  };

  // Robots
  robots?: RobotsConfig;

  // Disable search engine indexing (shorthand for robots.noindex + robots.nofollow)
  disableIndexing?: boolean;

  // Custom meta tags
  customMeta?: Array<MetaTag>;
}

// ─── MetadataConfig (input, with dynamic functions) ──────────

/**
 * Complete Metadata Configuration (Generic over F and Q for dynamic metadata)
 * This is the "input" type — values can be strings or evaluator functions.
 * Use resolveMetadata() to convert this to ResolvedMetadata.
 */
export interface MetadataConfig<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> {
  // Basic Metadata
  /** Page title - sets document.title on web */
  title?: string | ((context: MetadataEvaluatorContext<F, Q, V>) => string);
  /** Page description meta tag */
  description?:
    | string
    | ((context: MetadataEvaluatorContext<F, Q, V>) => string);
  /** Canonical URL for the page */
  canonical?: string | ((context: MetadataEvaluatorContext<F, Q, V>) => string);
  /** HTML lang attribute (e.g., "en", "it") */
  lang?: string;
  /**
   * @deprecated Use `lang` instead. Will be removed in a future version.
   */
  documentLang?: string;
  /** Keywords for SEO */
  keywords?:
    | Array<string>
    | ((context: MetadataEvaluatorContext<F, Q, V>) => Array<string>);

  // Open Graph (Social Media)
  openGraph?: OpenGraphConfig<F, Q, V>;

  // Twitter Card
  twitter?: TwitterCardConfig<F, Q, V>;

  // Alternates / hreflang (i18n SEO)
  alternates?: AlternatesConfig;

  // Icons / PWA
  icons?: IconsConfig;
  /** Web app manifest URL */
  manifest?: string;

  // Structured Data (Search Engines)
  structuredData?: StructuredDataConfig<F, Q, V>;

  // AI Crawler Hints
  aiHints?: AIHintsConfig<F, Q, V>;

  // Robots Meta Tags
  robots?: RobotsConfig;

  // Additional custom meta tags
  customMeta?:
    | Array<MetaTag>
    | ((context: MetadataEvaluatorContext<F, Q, V>) => Array<MetaTag>);

  // Disable search engine indexing (shorthand for robots.noindex + robots.nofollow)
  disableIndexing?: boolean;

  /** Author meta tag */
  author?: string;
  /** Viewport meta tag (defaults to "width=device-width, initial-scale=1") */
  viewport?: string;
  /** Theme color for browser UI */
  themeColor?: string;
}

// ─── Metadata Store & Provider ───────────────────────────────

/**
 * Request-scoped metadata store.
 * In SSR each request gets its own store to avoid cross-request leaks.
 * On the client, a single global store is used.
 */
export interface MetadataStore {
  /** Get current resolved metadata */
  getMetadata: () => ResolvedMetadata;
  /** Set (merge) resolved metadata into the store */
  setMetadata: (meta: ResolvedMetadata) => void;
  /** Reset store to empty */
  reset: () => void;
}

export interface MetadataProvider {
  /** Apply metadata configuration to the page */
  setMetadata: (config: MetadataConfig) => void;
  /** Get current metadata configuration */
  getMetadata: () => MetadataConfig;
  /** Reset all metadata to defaults */
  resetMetadata: () => void;
}

// ─── LLMs.txt ────────────────────────────────────────────────

/**
 * Entry for the llms.txt file
 */
export interface LlmsTxtEntry {
  /** URL of the page */
  url: string;
  /** Short title / label for this page */
  title: string;
  /** Brief description for the LLM */
  description?: string;
}

/**
 * Configuration for llms.txt generation
 */
export interface LlmsTxtConfig {
  /** Site title / name shown at the top of llms.txt */
  siteName: string;
  /** Brief description of the site */
  siteDescription?: string;
  /** Curated list of pages to expose in llms.txt */
  entries: Array<LlmsTxtEntry>;
}
