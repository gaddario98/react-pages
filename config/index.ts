import { atomStateGenerator } from "@gaddario98/react-state";

import type { ContentItem, PageProps, ViewSettings } from "../types";
import type { MetadataConfig } from "../types";
import type { QueriesArray } from "@gaddario98/react-queries";
import type {
  FieldValues,
  FormManagerConfig,
  Submit,
} from "@gaddario98/react-form";

export interface DefaultContainerProps<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> {
  children?: Array<React.JSX.Element>;
  allContents: Array<ContentItem<F, Q, V> | FormManagerConfig<F> | Submit<F>>;
  handleRefresh?: () => void;
  viewSettings?: ViewSettings;
  pageId?: string;
}
export type PageAuthState = {
  id: string;
  accountVerified?: boolean;
  isLogged?: boolean;
  token?: string;
  phoneNumber?: string;
  email?: string;
};
export interface PageTranslationOptions {
  [key: string]: string | number | boolean | undefined;
  ns?: string;
}
export interface PageConfigProps {
  HeaderContainer: <
    F extends FieldValues = FieldValues,
    Q extends QueriesArray = QueriesArray,
    V extends Record<string, unknown> = Record<string, unknown>,
  >(
    props: Omit<DefaultContainerProps<F, Q, V>, "viewSettings"> &
      ViewSettings["header"],
  ) => React.ReactNode;
  FooterContainer: <
    F extends FieldValues = FieldValues,
    Q extends QueriesArray = QueriesArray,
    V extends Record<string, unknown> = Record<string, unknown>,
  >(
    props: Omit<DefaultContainerProps<F, Q, V>, "viewSettings"> &
      ViewSettings["footer"],
  ) => React.ReactNode;
  BodyContainer: <
    F extends FieldValues = FieldValues,
    Q extends QueriesArray = QueriesArray,
    V extends Record<string, unknown> = Record<string, unknown>,
  >(
    props: DefaultContainerProps<F, Q, V>,
  ) => React.ReactNode;
  authPageImage: string;
  authPageProps: PageProps;
  isLogged: (val: PageAuthState | null) => boolean;
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
  // Metadata configuration
  defaultMetadata: MetadataConfig;
  authValues?: PageAuthState | null;
  locale?: string;
  translateText?: (key: string, options?: PageTranslationOptions) => string;
}

const DefaultContainer = <
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
>({
  children,
}: DefaultContainerProps<F, Q, V>) => {
  return children;
};

const _pageConfig: PageConfigProps = {
  HeaderContainer: DefaultContainer,
  FooterContainer: DefaultContainer,
  BodyContainer: DefaultContainer,
  authPageImage: "",
  authPageProps: { id: "auth-page" },
  isLogged: (val: PageAuthState | null) => !!val?.id && !!val.isLogged,
  ItemsContainer: ({ children }) => children,
  PageContainer: ({ children }) => children,
  meta: {
    title: "",
    description: "",
  },
  // Metadata configuration
  defaultMetadata: {},
};

// Getter for current pageConfig singleton
export function getPageConfig(): PageConfigProps {
  return _pageConfig;
}

export const {
  atom: pageConfigAtom,
  useValue: usePageConfigValue,
  useState: usePageConfigState,
  useReset: usePageConfigReset,
} = atomStateGenerator<PageConfigProps>({
  key: "pageConfig",
  defaultValue: _pageConfig,
  persist: false,
});

// Re-export new metadata architecture
export {
  applyMetadataToDom,
} from "./metadata";

// Re-export logging utilities
export {
  setMetadataLogging,
  logMetadata,
  getMetadataLog,
  clearMetadataLog,
} from "./metadataLogger";

// Re-export types
export type {
  MetadataConfig,

  OpenGraphConfig,
  OpenGraphImage,
  OpenGraphArticle,
  TwitterCardConfig,
  AlternatesConfig,
  IconsConfig,
  IconConfig,
  StructuredDataConfig,
  AIHintsConfig,
  RobotsConfig,

} from "../types";
