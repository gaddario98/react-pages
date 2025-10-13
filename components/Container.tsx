import { QueriesArray } from "@gaddario98/react-queries";
import { useMemo } from "react";
import { FieldValues } from "react-hook-form";
import { withMemo } from "@gaddario98/utiles";
import { useGenerateContentRender } from "../hooks/useGenerateContentRender";
import { pageConfig } from "../config";
import { ItemContainerProps } from "./types";
import { RenderComponent } from "./RenderComponent";

export const Container = withMemo(
  <F extends FieldValues, Q extends QueriesArray>({
    content,
    ns,
    pageId,
    allMutation,
    allQuery,
    formValues,
    setValue,
  }: ItemContainerProps<F, Q>) => {
    const { components } = useGenerateContentRender<F, Q>({
      allMutation,
      allQuery,
      formValues,
      pageId,
      isAllQueryMapped: true,
      formData: false,
      contents: content.items,
      ns,
      setValue,
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

    const Layout = useMemo(
      () => content?.component ?? pageConfig.ItemsContainer,
      [content?.component]
    );
    return <Layout>{components?.map((el) => el.element)}</Layout>;
  }
);
