import { DefaultValues, FieldValues, UseFormSetValue } from "react-hook-form";
import { ComponentProps, JSX } from "react";
import {
  AllMutation,
  ExtractQuery,
  MultipleQueryResponse,
  MutationConfig,
  QueriesArray,
  QueryAtIndex,
  QueryDefinition,
  QueryProps,
} from "@gaddario98/react-queries";
import { FormManager, FormManagerConfig, Submit } from "@gaddario98/react-form";
import { pageConfig } from "./config";
import { MetadataConfig, LazyLoadingConfig } from "./config/types";

/* ======================================================
   MAPPABLE PROPS E FUNZIONI DI MAPPING
====================================================== */
type MappedProps<F extends FieldValues, Q extends QueriesArray> = {
  allQuery: MultipleQueryResponse<Q>;
  allMutation: AllMutation<Q>;
  formValues: F;
  //  queryClient: QueryClient;
  setValue: UseFormSetValue<F>;
};

type MappedItemsFunction<
  F extends FieldValues,
  Q extends QueriesArray,
  ComponentType,
> = (props: MappedProps<F, Q>) => ComponentType;

/**
 * Context passed to lifecycle callbacks
 * Provides access to form, queries, mutations, and utilities
 */
type LifecycleContext<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray
> = MappedProps<F, Q> & {
  ns?: string;
  pageId?: string;
  pageConfig?: PageProps<F, Q>;
};

/* ======================================================
   CONTENT ITEMS & CONTAINER ITEMS
====================================================== */
type Items<F extends FieldValues, Q extends QueriesArray> = {
  type: "custom";
  component:
    | React.JSX.Element
    | ((props: MappedProps<F, Q>) => React.JSX.Element);

  // Layout & positioning
  index?: number;
  usedBoxes?: number;
  renderInFooter?: boolean;
  renderInHeader?: boolean;
  hidden?: boolean;

  // Dependency tracking (for selective re-rendering)
  usedQueries?: Array<Q[number]["key"]>;
  usedFormValues?: Array<keyof F>;

  // Interaction & behavior
  isDraggable?: boolean;
  isInDraggableView?: boolean;

  // React optimization
  key?: string;

  // NEW IN 2.0: Lazy loading support
  lazy?: boolean;
  lazyTrigger?: "viewport" | "interaction" | "conditional";
  lazyCondition?: MappedItemsFunction<F, Q, boolean>;
};

type ContainerItem<F extends FieldValues, Q extends QueriesArray> = {
  type: "container";
  component?: typeof pageConfig.ItemsContainer;
  items: ContentItemsType<F, Q>;

  // Layout & positioning
  index?: number;
  usedBoxes?: number;
  renderInFooter?: boolean;
  renderInHeader?: boolean;
  hidden?: boolean;

  // Dependency tracking (for selective re-rendering)
  usedQueries?: Array<Q[number]["key"]>;
  usedFormValues?: Array<keyof F>;

  // Interaction & behavior
  isDraggable?: boolean;
  isInDraggableView?: boolean;

  // React optimization
  key?: string;

  // NEW IN 2.0: Lazy loading support
  lazy?: boolean;
  lazyTrigger?: "viewport" | "interaction" | "conditional";
  lazyCondition?: MappedItemsFunction<F, Q, boolean>;
};

type ContentItem<F extends FieldValues, Q extends QueriesArray> =
  | Items<F, Q>
  | ContainerItem<F, Q>;

type MappedContents<
  F extends FieldValues,
  Q extends QueriesArray,
> = MappedItemsFunction<F, Q, ContentItem<F, Q>[]>;

type ContentItemsType<
  F extends FieldValues,
  Q extends QueriesArray = QueriesArray,
> = ContentItem<F, Q>[] | MappedContents<F, Q>;

/* ======================================================
   FORM PAGE & MODAL TYPES
====================================================== */
type FormPageProps<F extends FieldValues, Q extends QueriesArray> = Omit<
  ComponentProps<typeof FormManager<F>>,
  "updateFormValues" | "submit" | "data"
> & {
  defaultValueQueryKey?: string[];
  defaultValueQueryMap?: (
    props: ExtractQuery<Q>["response"]
  ) => DefaultValues<F>;
  submit?: Array<Submit<F>> | MappedItemsFunction<F, Q, Array<Submit<F>>>;
  index?: number;
  usedQueries?: Array<Q[number]["key"]>;
  data?: Array<
    FormManagerConfig<F> | MappedItemsFunction<F, Q, FormManagerConfig<F>>
  >;
  // NEW IN 2.0: Debounce delay for form value changes (ms, default: 300)
  debounceDelay?: number;
};

/* ======================================================
   PAGE PROPS & VIEW SETTINGS
====================================================== */

type MappedQueryProps<F extends FieldValues, Q extends QueriesArray> = Omit<
  MappedProps<F, Q>,
  "allMutation" | "allQuery"
>;
type SingleQueryConfig<
  F extends FieldValues,
  Q extends QueryDefinition<any, any, any, any, any>,
> =
  Q extends QueryDefinition<infer K, infer T, infer P, infer R, infer C>
    ? T extends "mutation"
      ? {
          type: "mutation";
          mutationConfig:
            | ((props: MappedQueryProps<F, Q[]>) => MutationConfig<P, R, C>)
            | MutationConfig<P, R, C>;
          key: K;
        }
      : {
          type: "query";
          queryConfig?:
            | ((
                props: MappedQueryProps<F, Q[]>
              ) => Omit<QueryProps<K, R>, "keyToMap">)
            | Omit<QueryProps<K, R>, "keyToMap">;
          key: K;
        }
    : never;

type QueryPageConfigArray<F extends FieldValues, Q extends QueriesArray> = {
  [I in keyof Q]: SingleQueryConfig<F, QueryAtIndex<Q, I>>;
};
interface PageProps<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
> {
  // Core identification
  id: string;
  ns?: string;

  // Data management
  contents?: ContentItemsType<F, Q>;
  queries?: QueryPageConfigArray<F, Q>;
  form?: FormPageProps<F, Q>;

  // Layout and view configuration
  viewSettings?: MappedItemsFunction<F, Q, ViewSettings> | ViewSettings;

  // NEW IN 2.0: Metadata & SEO (generic over F and Q for dynamic metadata)
  meta?: MetadataConfig<F, Q>;

  // NEW IN 2.0: Lazy loading configuration
  lazyLoading?: LazyLoadingConfig;

  // NEW IN 2.0: Platform-specific overrides
  platformOverrides?: PlatformOverrides<F, Q>;

  // Lifecycle hooks
  onValuesChange?: MappedItemsFunction<F, Q, void>;

  // NEW IN 2.0: Complete lifecycle callbacks (T074-T078)
  lifecycleCallbacks?: {
    onMountComplete?: (context: LifecycleContext<F, Q>) => void | Promise<void>;
    onQuerySuccess?: (context: LifecycleContext<F, Q>, queryKey: string, data: unknown) => void | Promise<void>;
    onQueryError?: (context: LifecycleContext<F, Q>, queryKey: string, error: Error) => void | Promise<void>;
    onFormSubmit?: (context: LifecycleContext<F, Q>, result: unknown) => void | Promise<void>;
    onValuesChange?: MappedItemsFunction<F, Q, void>;
  };

  // NEW IN 2.0: Custom configuration for extensibility (T083)
  customConfig?: Record<string, unknown>;

  // Feature flags
  enableAuthControl?: boolean;
}

/**
 * Platform-specific configuration overrides (proper type with PageProps reference)
 * Allows different behavior on web vs React Native
 */
export type PlatformOverrides<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray
> = {
  /** Web-specific overrides (React DOM) */
  web?: Partial<PageProps<F, Q>>;
  /** React Native-specific overrides */
  native?: Partial<PageProps<F, Q>>;
};

type ViewSettings = {
  withoutPadding?: boolean;
  header?: {
    withoutPadding?: boolean;
  };
  footer?: {
    withoutPadding?: boolean;
  };
  disableRefreshing?: boolean;
  customLayoutComponent?: typeof pageConfig.BodyContainer;
  customPageContainer?: typeof pageConfig.PageContainer;
};
type UsePageConfigReturn = {
  formControl: any;
  formValues: any;
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
  usedQueries: string[];
  usedFormValues: string[];
  usedMutations: string[];
  parentComponent: string | null;
  childComponents: string[];
}

/**
 * Dependency Graph
 * Maps component IDs to their dependency nodes for selective re-rendering
 */
export interface DependencyGraph {
  nodes: Map<string, DependencyNode>;
  addNode: (node: DependencyNode) => void;
  getNode: (componentId: string) => DependencyNode | undefined;
  getAffectedComponents: (changedKeys: string[]) => string[];
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

// Backward compatibility: PageMetadataProps is now MetadataConfig
export type { MetadataConfig as PageMetadataProps } from "./config/types";

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
  UsePageConfigReturn,
  MappedProps,
  QueryPageConfigArray,
};

// Re-export all new configuration types from config
export type {
  MetadataConfig,
  MetaTag,
  LazyLoadingConfig,
  OpenGraphConfig,
  StructuredDataConfig,
  AIHintsConfig,
  RobotsConfig,
} from "./config/types";
