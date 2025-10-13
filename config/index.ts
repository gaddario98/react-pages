import { AuthState } from "@gaddario98/react-auth";
import { ContentItem, PageProps, ViewSettings } from "../types";
import { FormManagerConfig, Submit } from "@gaddario98/react-form";
import { FieldValues } from "react-hook-form";
import { QueriesArray } from "@gaddario98/react-queries";

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
}

const DefaultContainer = <
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
>({
  children,
}: DefaultContainerProps<F, Q>) => {
  return children;
};

export let pageConfig: PageConfigProps = {
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
};

export const setPageConfig = (config: Partial<PageConfigProps>) => {
  pageConfig = { ...pageConfig, ...config };
};
