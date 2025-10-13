import { useMemo } from "react";
import { QueriesArray } from "@gaddario98/react-queries";
import { FieldValues } from "react-hook-form";
import { useGenerateContentRender } from "./useGenerateContentRender";
import { ContentItemsType } from "../types";
import { usePageConfig } from "./usePageConfig";
import { Container } from "../components/Container";
import { RenderComponent } from "../components/RenderComponent";

export interface GenerateContentProps<
  F extends FieldValues,
  Q extends QueriesArray,
> {
  pageId: string;
  ns?: string;
  contents: ContentItemsType<F, Q>;
  pageConfig: ReturnType<typeof usePageConfig<F, Q>>;
}

export const useGenerateContent = <
  F extends FieldValues,
  Q extends QueriesArray,
>({
  pageId,
  ns = "",
  contents = [],
  pageConfig,
}: GenerateContentProps<F, Q>) => {
  const {
    allMutation,
    allQuery,
    formData,
    formValues,
    isAllQueryMapped,
    setValue,
  } = pageConfig;
  const { allContents, components } = useGenerateContentRender<F, Q>({
    allMutation,
    allQuery,
    formData,
    formValues,
    pageId,
    contents,
    isAllQueryMapped,
    setValue,
    ns,
    renderComponent: (props) => {
      if (props.content.type === "container") {
        return (
          <Container<F, Q>
            key={props.key}
            content={props.content}
            ns={props.ns}
            pageId={props.pageId}
            allMutation={props.allMutation}
            allQuery={props.allQuery}
            formValues={props.formValues}
            setValue={props.setValue}
          />
        );
      }
      return (
        <RenderComponent<F, Q>
          key={props.key}
          content={props.content}
          ns={props.ns}
          formValues={props.formValues}
          pageId={props.pageId}
          allMutation={props.allMutation}
          allQuery={props.allQuery}
          setValue={props.setValue}
        />
      );
    },
  });
  const body = useMemo(
    () =>
      components
        .filter((el) => !el.renderInFooter && !el.renderInHeader)
        .map((item) => item.element),
    [components]
  );
  const header = useMemo(
    () =>
      components.filter((el) => el.renderInHeader).map((item) => item.element),
    [components]
  );
  const footer = useMemo(
    () =>
      components.filter((el) => el.renderInFooter).map((item) => item.element),
    [components]
  );
  return { header, body, footer, allContents };
};
