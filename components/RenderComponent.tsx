import {
    QueriesArray,
  } from "@gaddario98/react-queries";
  import { useMemo, memo } from "react";
  import { FieldValues } from "react-hook-form";
  import { ContentProps } from "./types";
  import { deepEqual } from "../utils/optimization";

  // Internal component implementation
  const RenderComponentImpl = <F extends FieldValues, Q extends QueriesArray>({
    content,
    formValues,
    allMutation,
    allQuery,
    setValue,
  }: ContentProps<F, Q>) => {
    const { component } = content;
    // Memo only on objects that don't change often, but dynamic data must propagate
    return useMemo(() => {
      if (typeof component === "function") {
        return component({
          allQuery,
          allMutation,
          formValues,
          setValue,
        });
      }
      return component;
    }, [allMutation, allQuery, component, formValues, setValue]);
  };

  // Export with React.memo and fast-deep-equal comparator for optimal performance
  export const RenderComponent = memo(
    RenderComponentImpl,
    (prevProps, nextProps) => {
      // Return true if props are equal (component should NOT re-render)
      return deepEqual(prevProps, nextProps);
    }
  ) as typeof RenderComponentImpl;