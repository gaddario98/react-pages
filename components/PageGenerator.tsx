import { useEffect, useMemo, useState } from "react";
import { withMemo } from "@gaddario98/utiles";
import { PageProps } from "../types";
import { FieldValues } from "react-hook-form";
import { QueriesArray, QueryConfigArray } from "@gaddario98/react-queries";
import { useAuthValue } from "@gaddario98/react-auth";
import { pageConfig as GlobalPageConfig } from "../config";
import { useGenerateContent } from "../hooks/useGenerateContent";
import { usePageConfig } from "../hooks";
import { PlatformAdapterProvider } from "../config/PlatformAdapterProvider";
import { defaultAdapter } from "../config/platformAdapters";
import { validateAndLogPageProps } from "../utils/validation";
import { validatePagePropsLazy, logLazyValidationErrors } from "../utils/lazyValidation";
import { MetadataManager } from "./MetadataManager";

/**
 * Main page generator component that orchestrates page rendering
 * Handles authentication, content generation, and layout management
 * @param enableAuthControl - Whether to enable authentication control
 * @param meta - Page metadata configuration
 * @param props - Additional page properties
 */
const PageGenerator = withMemo(
  <F extends FieldValues = FieldValues, Q extends QueriesArray = QueriesArray>({
    enableAuthControl = true,
    meta,
    ...props
  }: PageProps<F, Q>) => {
    const user = useAuthValue();

    const authControl = useMemo(
      () => enableAuthControl && !GlobalPageConfig.isLogged(user),
      [enableAuthControl, user]
    );

    const [usedProps, setUsedProps] = useState<"auth" | "page">(
      enableAuthControl && authControl ? "auth" : "page"
    );

    // Validate PageProps configuration (development mode only)
    useEffect(() => {
      if (process.env.NODE_ENV === 'development') {
        validateAndLogPageProps({ ...props, meta, enableAuthControl });

        // T098: Validate lazy loading configuration
        const lazyValidation = validatePagePropsLazy({ ...props, meta, enableAuthControl });
        logLazyValidationErrors(lazyValidation, `Page: ${props.id}`);
      }
    }, [props, meta, enableAuthControl]);

    useEffect(() => {
      const newUsedProps = authControl ? "auth" : "page";
      if (newUsedProps !== usedProps) setUsedProps(newUsedProps);
    }, [authControl, usedProps]);

    const selectedProps = useMemo(
      () =>
        usedProps === "auth"
          ? (GlobalPageConfig.authPageProps as PageProps<F, Q>)
          : props,
      [props, usedProps]
    );

    const {
      ns,
      contents = [],
      queries = [] as QueryConfigArray<Q>,
      form,
      id,
      onValuesChange,
      viewSettings,
      // T074-T078: Lifecycle callbacks and custom configuration
      lifecycleCallbacks,
      customConfig,
    } = selectedProps;

    const config = usePageConfig<F, Q>({
      queries,
      form,
      onValuesChange,
      ns: ns ?? "",
      viewSettings,
      // T075, T083: Pass lifecycle callbacks and custom config
      lifecycleCallbacks,
      customConfig,
    });

    const { handleRefresh, hasQueries, isLoading, mappedViewSettings } = config;
    const { allContents, body, footer, header } = useGenerateContent<F, Q>({
      contents,
      pageId: id,
      ns,
      pageConfig: config,
    });

    const Layout = useMemo(() => {
      return mappedViewSettings?.customLayoutComponent ?? GlobalPageConfig.BodyContainer;
    }, [mappedViewSettings?.customLayoutComponent]);

    const PageContainer = useMemo(() => {
      return mappedViewSettings?.customPageContainer ?? GlobalPageConfig.PageContainer;
    }, [mappedViewSettings?.customPageContainer]);

    const pageContent = useMemo(
      () => (
        <>
          {/* T066: Integrate MetadataManager for dynamic metadata updates */}
          <MetadataManager<F, Q>
            meta={meta}
            formValues={config.formValues}
            allQuery={config.allQuery}
            allMutation={config.allMutation}
            setValue={config.setValue}
            ns={ns}
            pageId={id}
          />
          <GlobalPageConfig.HeaderContainer<F, Q>
            allContents={allContents}
            handleRefresh={handleRefresh}
            hasQueries={hasQueries}
            {...mappedViewSettings?.header}
            pageId={id}
          >
            {header}
          </GlobalPageConfig.HeaderContainer>
          {!!isLoading &&
            !!GlobalPageConfig.LoaderComponent &&
            GlobalPageConfig.LoaderComponent({ loading: isLoading })}
        </>
      ),
      [meta, config.formValues, config.allQuery, config.allMutation, config.setValue, allContents, handleRefresh, hasQueries, mappedViewSettings?.header, id, header, isLoading, ns]
    );

    const layoutBody = useMemo(() => body, [body]);
    const layoutContent = useMemo(
      () => (
        <Layout<F, Q>
          allContents={allContents}
          handleRefresh={handleRefresh}
          hasQueries={hasQueries}
          viewSettings={mappedViewSettings}
          pageId={id}
          key={id}
        >
          {layoutBody}
        </Layout>
      ),
      [Layout, allContents, handleRefresh, hasQueries, id, layoutBody, mappedViewSettings]
    );

    const footerContent = useMemo(
      () => (
        <GlobalPageConfig.FooterContainer<F, Q>
          allContents={allContents}
          handleRefresh={handleRefresh}
          hasQueries={hasQueries}
          {...mappedViewSettings?.footer}
          pageId={id}
        >
          {footer}
        </GlobalPageConfig.FooterContainer>
      ),
      [
        allContents,
        handleRefresh,
        hasQueries,
        mappedViewSettings?.footer,
        id,
        footer,
      ]
    );

    return (
      <PlatformAdapterProvider adapter={defaultAdapter}>
        <PageContainer id={id ?? ""} key={id}>
          {pageContent}
          {layoutContent}
          {footerContent}
        </PageContainer>
      </PlatformAdapterProvider>
    );
  }
);

export default PageGenerator;
