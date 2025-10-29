/* eslint-disable @typescript-eslint/no-explicit-any */
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

/* ======================================================
   CONTENT ITEMS & CONTAINER ITEMS
====================================================== */
type Items<F extends FieldValues, Q extends QueriesArray> = {
  type: "custom";
  component:
    | React.JSX.Element
    | ((props: MappedProps<F, Q>) => React.JSX.Element);
  index?: number;
  usedBoxes?: number;
  usedQueries?: Array<Q[number]["key"]>;
  renderInFooter?: boolean;
  usedFormValues?: Array<keyof F>;
  isDraggable?: boolean;
  isInDraggableView?: boolean;
  renderInHeader?: boolean;
  key?: string;
  hidden?: boolean;
};

type ContainerItem<F extends FieldValues, Q extends QueriesArray> = {
  type: "container";
  component?: typeof pageConfig.ItemsContainer;
  items: ContentItemsType<F, Q>;
  index?: number;
  usedBoxes?: number;
  usedQueries?: Array<Q[number]["key"]>;
  renderInFooter?: boolean;
  usedFormValues?: Array<keyof F>;
  isDraggable?: boolean;
  isInDraggableView?: boolean;
  renderInHeader?: boolean;
  key?: string;
  hidden?: boolean;
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
  id: string;
  ns?: string;
  contents?: ContentItemsType<F, Q>;
  queries?: QueryPageConfigArray<F, Q>;
  form?: FormPageProps<F, Q>;
  viewSettings?: MappedItemsFunction<F, Q, ViewSettings> | ViewSettings;
  onValuesChange?: MappedItemsFunction<F, Q, void>;
  enableAuthControl?: boolean;
  meta?: PageMetadataProps;
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
  customLayoutComponent?: typeof pageConfig.BodyContainer;
  customPageContainer?: typeof pageConfig.PageContainer;
};
type UsePageConfigReturn = {
  formControl: any;
  formValues: any;
};

interface PageMetadataProps {
  title?: string;
  description?: string;
  documentLang?: string;
  otherMetaTags?: JSX.Element[];
  disableIndexing?: boolean;
}
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
  PageMetadataProps,
  QueryPageConfigArray,
};
