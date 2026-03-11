import { useCallback, useMemo } from "react";
import { queriesAtom } from "@gaddario98/react-queries";
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "jotai";
import { useGenerateContent } from "../hooks/useGenerateContent";
import { usePageConfig } from "../hooks";
import { usePageConfigValue } from "../config";
import { MetadataManager } from "./MetadataManager";
import type { FieldValues } from "@gaddario98/react-form";
import type { QueriesArray } from "@gaddario98/react-queries";
import type { PageProps, QueryPageConfigArray } from "../types";

const PageGenerator = <
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
>({
  enableAuthControl = true,
  meta,
  variables,
  ...props
}: PageProps<F, Q, V>) => {
  const {
    BodyContainer,
    FooterContainer,
    HeaderContainer,
    PageContainer,
    isLogged,
    authValues,
    authPageProps,
  } = usePageConfigValue();

  const isUnlogged = useMemo(
    () => enableAuthControl && !isLogged(authValues ? authValues : null),
    [enableAuthControl, authValues, isLogged],
  );

  const selectedProps = useMemo(() => {
    return isUnlogged
      ? (authPageProps as unknown as PageProps<F, Q, V>)
      : props;
  }, [isUnlogged, authPageProps, props]);

  const {
    contents = [],
    queries = [] as QueryPageConfigArray<F, Q, V>,
    form,
    id = "default-page-id",
    viewSettings,
    ns,
  } = useMemo(() => selectedProps, [selectedProps]);

  const { mergedConfig, refreshQueries } = usePageConfig<F, Q, V>({
    queries,
    form,
    ns: ns ?? "",
    viewSettings,
    pageId: id,
    variables,
  });

  const { allContents, body, footer, header } = useGenerateContent<F, Q, V>({
    contents,
    pageId: id,
    ns,
    pageConfig: mergedConfig,
  });

  const { mappedViewSettings } = mergedConfig;
  const LayoutComponent = useMemo(() => {
    return mappedViewSettings.layoutComponent ?? BodyContainer;
  }, [mappedViewSettings.layoutComponent, BodyContainer]);

  const layoutProps = useMemo(() => {
    return mappedViewSettings.layoutProps ?? {};
  }, [mappedViewSettings.layoutProps]);

  const PageContainerComponent = useMemo(() => {
    return mappedViewSettings.pageContainerComponent ?? PageContainer;
  }, [mappedViewSettings.pageContainerComponent, PageContainer]);

  const pageContainerProps = useMemo(() => {
    return mappedViewSettings.pageContainerProps ?? {};
  }, [mappedViewSettings.pageContainerProps]);

  const layoutBody = useMemo(() => body, [body]);

  return (
    <PageContainerComponent id={id} key={id} {...pageContainerProps}>
      <MetadataManager<F, Q, V> meta={meta} ns={ns} pageId={id} />
      <HeaderContainer<F, Q, V>
        allContents={allContents}
        handleRefresh={refreshQueries}
        {...mappedViewSettings.header}
        pageId={id}
      >
        {header}
      </HeaderContainer>

      <LayoutComponent<F, Q, V>
        key={id}
        allContents={allContents}
        handleRefresh={refreshQueries}
        viewSettings={mappedViewSettings}
        pageId={id}
        {...layoutProps}
      >
        {layoutBody}
      </LayoutComponent>

      <FooterContainer<F, Q, V>
        allContents={allContents}
        handleRefresh={refreshQueries}
        {...mappedViewSettings.footer}
        pageId={id}
      >
        {footer}
      </FooterContainer>
    </PageContainerComponent>
  );
};

export default PageGenerator;
