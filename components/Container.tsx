import { QueriesArray } from "@gaddario98/react-queries";
import { useMemo, memo } from "react";
import { FieldValues } from "react-hook-form";
import { useGenerateContentRender } from "../hooks/useGenerateContentRender";
import { pageConfig } from "../config";
import { ItemContainerProps } from "./types";
import { RenderComponent } from "./RenderComponent";
import { deepEqual } from "../utils/optimization";

const ContainerImpl = <F extends FieldValues, Q extends QueriesArray>({
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
};

// Export with React.memo and fast-deep-equal comparator for optimal performance
export const Container = memo(
  ContainerImpl,
  (prevProps, nextProps) => {
    // Return true if props are equal (component should NOT re-render)
    return deepEqual(prevProps, nextProps);
  }
) as typeof ContainerImpl;
