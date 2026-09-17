import { useCallback, useRef } from "react";
import { useFormValues } from "@gaddario98/react-form";
import { useApiValues } from "@gaddario98/react-queries";
import type { FieldValues } from "@gaddario98/react-form";
import type { QueriesArray } from "@gaddario98/react-queries";
import type { GetFunction, SetFunction } from "../types";
import type { DeepKeys } from "@tanstack/react-form";
import { usePageVariables } from "./usePageVariables";

export interface UsePageValuesProps<
  V extends Record<string, unknown> = Record<string, unknown>,
> {
  pageId: string;
  formId?: string;
  initialValues?: V;
}

export const usePageValues = <
  F extends FieldValues,
  Q extends QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
>({
  pageId,
  formId,
  initialValues = {} as V,
}: UsePageValuesProps<V>) => {
  const effectiveFormId = formId ?? pageId;
  const { get: getApiValues, refreshAll } = useApiValues<Q>({ scopeId: pageId });
  const { get: getFormValues, set: setFormValues } = useFormValues<F>({
    formId: effectiveFormId,
  });
  const { get: getPageVariables, set: setPageVariables } = usePageVariables<V>({
    scopeId: pageId,
    variables: initialValues
  });
  const subscriptions = useRef(new Map<string, unknown>());
  // get che legge dallo store e registra le dipendenze
  const get = useCallback(
    <Ty extends "mutation" | "query" | "form" | "state">(
      type: Ty,
      key: Parameters<GetFunction<F, Q, V>>[1],
      defaultValue: Parameters<GetFunction<F, Q, V>>[2],
    ) => {
      const keyMap = `${type}:${key}`;

      switch (type) {
        case "mutation": {
          const value = getApiValues(type, key, defaultValue);
          subscriptions.current.set(keyMap, value);
          break;
        }
        case "query": {
          const value = getApiValues(type, key, defaultValue);
          subscriptions.current.set(keyMap, value);
          break;
        }
        case "form": {
          const value = getFormValues<DeepKeys<F>>(key, defaultValue);
          subscriptions.current.set(keyMap, value);
          break;
        }
        case "state": {
          const value =
            getPageVariables(key, defaultValue as V[keyof V])
          subscriptions.current.set(keyMap, value);
          break;
        }
      }

      return subscriptions.current.get(keyMap);
    },
    [pageId, getApiValues, getFormValues, getPageVariables],
  ) as GetFunction<F, Q, V>;

  // set stabile
  const set = useCallback(
    (type: "form" | "state") => {
      if (type === "form") {
        return setFormValues;
      }
      return setPageVariables

    },
    [setPageVariables, setFormValues],
  ) as SetFunction<F, V>;

  return { get, set, refreshAllQueries: refreshAll };
};
