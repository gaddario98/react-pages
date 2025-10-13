import { useMemo, useEffect, useCallback } from "react";
import { useFormPage } from "./useFormPage";
import type {
  FormPageProps,
  MappedItemsFunction,
  QueryPageConfigArray,
  ViewSettings,
} from "../types";
import { useFormManager } from "@gaddario98/react-form";
import { FieldValues } from "react-hook-form";
import { QueriesArray } from "@gaddario98/react-queries";
import { useDataExtractor } from "./useDataExtractor";
import { useInvalidateQueries } from "@gaddario98/react-providers";
import { usePageQueries } from "./usePageQueries";
import { useViewSettings } from "./useViewSettings";
import { useFormData } from "./useFormData";

const EMPTY_ARRAY: [] = [];

export const usePageConfig = <F extends FieldValues, Q extends QueriesArray>({
  queries = EMPTY_ARRAY as QueryPageConfigArray<F,Q>,
  form,
  ns,
  onValuesChange,
  viewSettings = {},
}: {
  queries: QueryPageConfigArray<F,Q>;
  form?: FormPageProps<F, Q>;
  ns: string;
  onValuesChange?: MappedItemsFunction<F, Q, void>;
  viewSettings?: MappedItemsFunction<F, Q, ViewSettings> | ViewSettings;
}) => {
  const { formControl, formValues, setValue } = useFormPage<F, Q>({ form });
  
  const {
    allMutation,
    allQuery,
    isAllQueryMapped,
    isLoading,
    queryKeys,
    hasQueries,
  } = usePageQueries({
    queries,
    formValues,
    setValue,
  });

  const { invalidateQueries } = useInvalidateQueries();

  const { extractMutations, extractQuery } = useDataExtractor({
    allMutation,
    allQuery,
    formValues,
  });

  const mappedViewSettings = useViewSettings({
    viewSettings,
    allQuery,
    allMutation,
    formValues,
    setValue,
  });

  const extractQueryHandle = useMemo(() => {
    if (!form?.usedQueries?.length) return allQuery;
    return extractQuery(form?.usedQueries as string[]);
  }, [allQuery, extractQuery, form?.usedQueries]);

  const extractMutationsHandle = useMemo(() => {
    if (!form?.usedQueries?.length) return allMutation;
    return extractMutations(form.usedQueries as string[]);
  }, [allMutation, extractMutations, form?.usedQueries]);

  const { mappedFormData, formSubmit } = useFormData({
    form,
    isAllQueryMapped,
    formValues,
    extractMutationsHandle,
    extractQueryHandle,
    setValue,
  });

  const handleRefresh = useCallback(async () => {
    if (!queryKeys?.length) return;
    await invalidateQueries(queryKeys);
  }, [invalidateQueries, queryKeys]);

  useEffect(() => {
    if (isAllQueryMapped && onValuesChange) {
      onValuesChange({
        allMutation,
        allQuery: allQuery ?? {},
        formValues,
        setValue,
      });
    }
  }, [
    isAllQueryMapped,
    onValuesChange,
    allMutation,
    allQuery,
    formValues,
    setValue,
  ]);

  const formData = useFormManager({
    ...form,
    data: mappedFormData as any[],
    ns,
    formControl,
    submit: formSubmit as any[],
  });

  return {
    formData,
    isAllQueryMapped,
    formValues,
    formControl,
    hasQueries,
    handleRefresh,
    allMutation,
    allQuery,
    setValue,
    form,
    mappedViewSettings,
    isLoading,
  };
};
