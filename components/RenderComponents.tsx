import { memo, useMemo } from "react";
import { usePageConfigValue } from "../config";
import { usePageValues } from "../hooks/usePageValues";
import { deepEqual } from "../utils/optimization";
import { RenderComponent } from "./RenderComponent";
import type { FieldValues } from "@gaddario98/react-form";
import type { QueriesArray } from "@gaddario98/react-queries";
import type { ContentItem, RenderComponentsProps } from "../types";
import type { ItemContainerProps } from "./types";

export interface PageContentItemProps<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> {
  item: ContentItem<F, Q, V>;
  pageId: string;
  ns: string;
  initialValues?: V;
}

const PageContentItemInner = <
  F extends FieldValues,
  Q extends QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
>({
  item,
  pageId,
  ns,
  initialValues,
}: PageContentItemProps<F, Q, V>) => {
  const { get, set, refreshAllQueries } = usePageValues<F, Q, V>({ pageId, initialValues });

  const isHidden = useMemo(() => {
    if (typeof item.hidden === "function") {
      return item.hidden({ get, set, refreshAllQueries });
    }
    return !!item.hidden;
  }, [get, item, set, refreshAllQueries]);

  if (isHidden) return null;

  return (
    <RenderComponents<F, Q, V>
      content={item}
      ns={ns}
      pageId={pageId}
      key={item.key ?? ""}
      initialValues={initialValues}
    />
  );
};

export const PageContentItem = memo(
  PageContentItemInner,
) as typeof PageContentItemInner;

const ContainerImpl = <
  F extends FieldValues,
  Q extends QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
>({
  content,
  ns,
  pageId,
  initialValues,
}: ItemContainerProps<F, Q, V>) => {
  const { ItemsContainer } = usePageConfigValue();
  const { get, set, refreshAllQueries } = usePageValues<F, Q, V>({ pageId, initialValues });

  const items = useMemo(() => {
    if (typeof content.items === "function") {
      return content.items({ get, set, refreshAllQueries });
    }
    return Array.isArray(content.items) ? content.items : [];
  }, [content.items, get, set, refreshAllQueries]);

  const sortedItems = useMemo(() => {
    return items
      .map((item, index) => ({
        item,
        index: item.index ?? index,
        key: item.key ?? `content-${index}`,
      }))
      .sort(
        (a, b) =>
          a.index - b.index || String(a.key).localeCompare(String(b.key)),
      );
  }, [items]);

  const CustomContainer = useMemo(() => content.component, [content.component]);
  const children = useMemo(
    () =>
      sortedItems.map(({ item, key }) => (
        <PageContentItem<F, Q, V>
          item={item}
          ns={ns}
          pageId={pageId}
          key={key}
          initialValues={initialValues}
        />
      )),
    [sortedItems, ns, pageId, initialValues],
  );

  if (!CustomContainer) {
    return <ItemsContainer>{children}</ItemsContainer>;
  }
  return <CustomContainer>{children}</CustomContainer>;
};

export const Container = memo(ContainerImpl, (prevProps, nextProps) => {
  return deepEqual(prevProps, nextProps);
}) as typeof ContainerImpl;

export const RenderComponents = <
  F extends FieldValues,
  Q extends QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
>(
  props: RenderComponentsProps<F, Q, V>,
) => {
  const renderKey = props.content.key ?? "";

  if (props.content.type === "container") {
    return (
      <Container<F, Q, V>
        key={renderKey}
        content={props.content}
        ns={props.ns}
        pageId={props.pageId}
        initialValues={props.initialValues}
      />
    );
  }
  return (
    <RenderComponent<F, Q, V>
      key={renderKey}
      content={props.content}
      ns={props.ns}
      pageId={props.pageId}
      initialValues={props.initialValues}
    />
  );
};
