import { AuthState } from "@gaddario98/react-auth";
import { ContentItem, PageProps, ViewSettings } from "../types";
import { FormManagerConfig, Submit } from "@gaddario98/react-form";
import { FieldValues } from "react-hook-form";
import { QueriesArray } from "@gaddario98/react-queries";
import { setMetadata, getMetadata, resetMetadata } from "./metadata";
import { MetadataConfig, LazyLoadingConfig } from "./types";

export interface DefaultContainerProps<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
> {
  children?: React.JSX.Element[];
  allContents: (ContentItem<F, Q> | FormManagerConfig<F> | Submit<F>)[];
  handleRefresh?: () => Promise<void>;
  hasQueries: boolean;
  viewSettings?: ViewSettings;
  pageId?: string;
}

export interface PageConfigProps {
  HeaderContainer: <
    F extends FieldValues = FieldValues,
    Q extends QueriesArray = QueriesArray,
  >(
    props: Omit<DefaultContainerProps<F, Q>, "viewSettings"> &
      ViewSettings["header"]
  ) => React.ReactNode;
  FooterContainer: <
    F extends FieldValues = FieldValues,
    Q extends QueriesArray = QueriesArray,
  >(
    props: Omit<DefaultContainerProps<F, Q>, "viewSettings"> &
      ViewSettings["footer"]
  ) => React.ReactNode;
  BodyContainer: <
    F extends FieldValues = FieldValues,
    Q extends QueriesArray = QueriesArray,
  >(
    props: DefaultContainerProps<F, Q>
  ) => React.ReactNode;
  authPageImage: string;
  authPageProps: PageProps;
  isLogged: (val: AuthState | null) => boolean;
  ItemsContainer: (props: { children: React.ReactNode }) => React.ReactNode;
  LoaderComponent?: (props: {
    loading?: boolean;
    message?: string;
    ns?: string;
  }) => React.ReactNode;
  PageContainer: (props: {
    children: React.ReactNode;
    id: string;
  }) => React.ReactNode;
  meta?: {
    title?: string;
    description?: string;
  };
  // NEW: Metadata configuration
  defaultMetadata: MetadataConfig;
  setMetadata: (config: MetadataConfig) => void;
  getMetadata: () => MetadataConfig;
  resetMetadata: () => void;
  // NEW: Lazy loading configuration
  lazyLoading: LazyLoadingConfig;
}

const DefaultContainer = <
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
>({
  children,
}: DefaultContainerProps<F, Q>) => {
  return children;
};

// Lazy initialization to avoid side effects at module load time
// This ensures tree-shaking works correctly by deferring singleton creation
let _pageConfig: PageConfigProps | undefined;

/**
 * Get or initialize the page configuration singleton
 * Uses lazy initialization to avoid module-level side effects for better tree-shaking
 */
function initializePageConfig(): PageConfigProps {
  if (!_pageConfig) {
    _pageConfig = {
      HeaderContainer: DefaultContainer,
      FooterContainer: DefaultContainer,
      BodyContainer: DefaultContainer,
      authPageImage: "",
      authPageProps: { id: "auth-page" },
      isLogged: (val: AuthState | null) => !!val?.id && !!val?.isLogged,
      ItemsContainer: ({ children }) => children,
      PageContainer: ({ children }) => children,
      meta: {
        title: "",
        description: "",
      },
      // Metadata configuration
      defaultMetadata: {},
      setMetadata,
      getMetadata,
      resetMetadata,
      // Lazy loading configuration
      lazyLoading: {
        enabled: true,
        preloadOnHover: false,
        preloadOnFocus: false,
        timeout: 30000,
        logMetrics: process.env.NODE_ENV === 'development',
      },
    };
  }
  return _pageConfig;
}

// Getter for pageConfig - initializes on first access
export function getPageConfig(): PageConfigProps {
  return initializePageConfig();
}

// Legacy export for backward compatibility
export const pageConfig = new Proxy({} as PageConfigProps, {
  get: (target, prop) => {
    return initializePageConfig()[prop as keyof PageConfigProps];
  },
  set: (target, prop, value) => {
    initializePageConfig()[prop as keyof PageConfigProps] = value;
    return true;
  },
});

export const setPageConfig = (config: Partial<PageConfigProps>) => {
  const current = initializePageConfig();
  Object.assign(current, config);
};

// Re-export metadata functions and types for convenience
export { setMetadata, getMetadata, resetMetadata } from "./metadata";
export type { MetadataConfig, MetaTag, MetadataProvider, LazyLoadingConfig } from "./types";
