import {
    QueriesArray,
  } from "@gaddario98/react-queries";
  import { useMemo } from "react";
  import { FieldValues } from "react-hook-form";
  import { withMemo } from "@gaddario98/utiles";
  import { ContentProps } from "./types";
  
  // Rimuovo l'uso di useRef: i dati dinamici devono propagarsi
  export const RenderComponent = withMemo(
    <F extends FieldValues, Q extends QueriesArray>({
      content,
      formValues,
      allMutation,
      allQuery,
      setValue,
    }: ContentProps<F, Q>) => {
      const { component } = content;
      // Memo solo su oggetti che non cambiano spesso, ma i dati dinamici devono propagarsi
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
    }
  );