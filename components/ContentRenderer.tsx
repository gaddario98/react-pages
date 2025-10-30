import React from "react";
import { QueriesArray } from "@gaddario98/react-queries";
import { FieldValues } from "react-hook-form";
import { withMemo } from "@gaddario98/utiles";
import { Props } from "./types";
import { RenderComponent } from "./RenderComponent";
import { LazyContent } from "./LazyContent";
import { ErrorBoundary } from "./ErrorBoundary";

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

    // T093-T094: Wrap lazy-loadable content with LazyContent component
    // Check if this item should be lazy-loaded
    const shouldBeLazy = content.lazy === true;
    const lazyTrigger = content.lazyTrigger ?? "viewport";
    const lazyCondition = content.lazyCondition;

    // Render component that will be lazily loaded
    const renderContent = (
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

    // If not lazy, return directly
    if (!shouldBeLazy) {
      return renderContent;
    }

    // T094: Apply lazy loading trigger logic
    // Wrap in LazyContent component with appropriate configuration
    return (
      <ErrorBoundary
        boundaryId={`content-${content.key || pageId}`}
        fallback={(error, retry) => (
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              color: "#d32f2f",
            }}
          >
            <p>Failed to load {content.key || "content"}</p>
            <button
              onClick={retry}
              style={{
                padding: "8px 16px",
                backgroundColor: "#d32f2f",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}
      >
        <LazyContent<F, Q>
          component={() => renderContent as any}
          componentProps={{}}
          lazyConfig={{
            trigger: lazyTrigger,
            condition: lazyCondition,
            threshold: 0.1,
            rootMargin: "100px",
            placeholder: {
              content: (
                <div style={{ padding: "16px", textAlign: "center" }}>
                  Loading {content.key || "content"}...
                </div>
              ),
              style: {
                minHeight: "100px",
                backgroundColor: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              },
            },
          }}
          formValues={formValues}
          allQuery={allQuery}
          allMutation={allMutation}
          setValue={setValue}
          contentId={content.key || pageId}
          fallback={
            <div style={{ padding: "16px", textAlign: "center" }}>
              Loading {content.key || "content"}...
            </div>
          }
        />
      </ErrorBoundary>
    );
  }
);
