import { useEffect, useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { withMemo } from "@gaddario98/utiles";
import { PageProps, PageMetadataProps } from "../types";
import { FieldValues } from "react-hook-form";
import { QueriesArray, QueryConfigArray } from "@gaddario98/react-queries";
import { useAuthValue } from "@gaddario98/react-auth";
import { Helmet } from "react-helmet-async";
import { pageConfig as GlobalPageConfig, pageConfig } from "../config";
import { useGenerateContent } from "../hooks/useGenerateContent";
import { usePageConfig } from "../hooks";
import { PlatformAdapterProvider } from "../config/PlatformAdapterProvider";
import { defaultAdapter } from "../config/platformAdapters";

/**
 * Renders page metadata using react-helmet-async
 * @param title - Page title
 * @param description - Page description
 * @param documentLang - Document language
 * @param otherMetaTags - Additional meta tags
 * @param disableIndexing - Whether to disable search engine indexing
 */
const PageMetadata = ({
  title = "Addario Giosuè App",
  description,
  documentLang = "it",
  otherMetaTags,
  disableIndexing,
}: PageMetadataProps) => {
  return (
    <Helmet>
      <html lang={documentLang} />
      <title>{title || pageConfig.meta?.title || ""}</title>
      {
        <meta
          name="description"
          content={description || pageConfig.meta?.description || ""}
        />
      }
      <meta
        name="robots"
        content={disableIndexing ? "noindex, nofollow" : "index, follow"}
      />
      {otherMetaTags}
    </Helmet>
  );
};

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
      [enableAuthControl, user, GlobalPageConfig.isLogged]
    );

    const [usedProps, setUsedProps] = useState<"auth" | "page">(
      enableAuthControl && authControl ? "auth" : "page"
    );

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
    } = selectedProps;

    const { t, i18n } = useTranslation(ns);
    const pageMetadata = useMemo(
      (): PageMetadataProps => ({
        ...meta,
        title: meta?.title ? t(meta?.title, { ns: "meta" }) : "",
        description: meta?.description
          ? t(meta?.description, { ns: "meta" })
          : "",
        documentLang: i18n.language,
      }),
      [t, i18n.language, meta]
    );

    const config = usePageConfig<F, Q>({
      queries,
      form,
      onValuesChange,
      ns: ns ?? "",
      viewSettings,
    });

    const { handleRefresh, hasQueries, isLoading, mappedViewSettings } = config;
    const { allContents, body, footer, header } = useGenerateContent<F, Q>({
      contents,
      pageId: id,
      ns,
      pageConfig: config,
    });

    const layoutComponentRef = useRef<typeof GlobalPageConfig.BodyContainer>();
    const pageContainerRef = useRef<typeof GlobalPageConfig.PageContainer>();

    const Layout = useMemo(() => {
      const newComponent = mappedViewSettings?.customLayoutComponent ?? GlobalPageConfig.BodyContainer;
      if (layoutComponentRef.current !== newComponent) {
        layoutComponentRef.current = newComponent;
      }
      return layoutComponentRef.current;
    }, [mappedViewSettings?.customLayoutComponent]);

    const PageContainer = useMemo(() => {
      const newComponent = mappedViewSettings?.customPageContainer ?? GlobalPageConfig.PageContainer;
      if (pageContainerRef.current !== newComponent) {
        pageContainerRef.current = newComponent;
      }
      return pageContainerRef.current;
    }, [mappedViewSettings?.customPageContainer]);

    const pageContent = useMemo(
      () => (
        <>
          <PageMetadata {...pageMetadata} />
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
      [
        pageMetadata,
        allContents,
        handleRefresh,
        hasQueries,
        mappedViewSettings?.header,
        id,
        header,
        isLoading,
      ]
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
      [layoutBody]
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
