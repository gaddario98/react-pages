import { QueriesArray } from "@gaddario98/react-queries";
import { FieldValues } from "react-hook-form";
import { withMemo } from "@gaddario98/utiles";
import { Props } from "./types";
import { RenderComponent } from "./RenderComponent";

export const ContentRenderer = withMemo(
  <F extends FieldValues, Q extends QueriesArray>({
    content,
    ns,
    formValues,
    pageId,
    allMutation,
    allQuery,
    setValue,
  }: Props<F, Q>) => {
    if (content.type === "container") {
      // Container items should be handled by the renderComponent function in useGenerateContentRender
      // This component is now primarily for direct usage of non-container items
      console.warn("ContentRenderer received a container item. Container items should be handled by the renderComponent function in useGenerateContentRender.");
      return null;
    }
    return (
      <RenderComponent<F, Q>
        content={content}
        ns={ns}
        formValues={formValues}
        pageId={pageId}
        allMutation={allMutation}
        allQuery={allQuery}
        setValue={setValue}
      />
    );
  }
);
