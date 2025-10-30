import { useMemo, useEffect, useCallback } from "react";
import { useFormPage } from "./useFormPage";
import type {
  FormPageProps,
  MappedItemsFunction,
  QueryPageConfigArray,
  ViewSettings,
  MetadataConfig,
  LazyLoadingConfig,
  PlatformOverrides,
} from "../types";
import { useFormManager } from "@gaddario98/react-form";
import { FieldValues } from "react-hook-form";
import { QueriesArray } from "@gaddario98/react-queries";
import { useDataExtractor } from "./useDataExtractor";
import { useInvalidateQueries } from "@gaddario98/react-providers";
import { usePageQueries } from "./usePageQueries";
import { useViewSettings } from "./useViewSettings";
import { useFormData } from "./useFormData";
import { usePlatformAdapter } from "./usePlatformAdapter";

const EMPTY_ARRAY: [] = [];

export const usePageConfig = <F extends FieldValues, Q extends QueriesArray>({
  queries = EMPTY_ARRAY as QueryPageConfigArray<F,Q>,
  form,
  ns,
  onValuesChange,
  viewSettings = {},
  meta,
  lazyLoading,
  platformOverrides,
}: {
  queries: QueryPageConfigArray<F,Q>;
  form?: FormPageProps<F, Q>;
  ns: string;
  onValuesChange?: MappedItemsFunction<F, Q, void>;
  viewSettings?: MappedItemsFunction<F, Q, ViewSettings> | ViewSettings;
  // NEW IN 2.0: Metadata, lazy loading, and platform overrides
  meta?: MetadataConfig<F, Q>;
  lazyLoading?: LazyLoadingConfig;
  platformOverrides?: PlatformOverrides<F, Q>;
}) => {
  // All hooks must be called first in consistent order
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

  // NEW IN 2.0: Get platform adapter for platform-specific configuration
  const platformAdapter = usePlatformAdapter();

  // NEW IN 2.0: Apply platform overrides based on current platform
  const resolvedMeta = useMemo(() => {
    if (!meta) return undefined;

    // Apply platform-specific overrides
    const platformSpecificMeta = platformAdapter.name === 'web'
      ? platformOverrides?.web?.meta
      : platformOverrides?.native?.meta;

    return platformSpecificMeta || meta;
  }, [meta, platformOverrides, platformAdapter.name]);

  const resolvedLazyLoading = useMemo(() => {
    if (!lazyLoading) return undefined;

    // Apply platform-specific overrides
    const platformSpecificLazyLoading = platformAdapter.name === 'web'
      ? platformOverrides?.web?.lazyLoading
      : platformOverrides?.native?.lazyLoading;

    return platformSpecificLazyLoading || lazyLoading;
  }, [lazyLoading, platformOverrides, platformAdapter.name]);

  const resolvedViewSettings = useMemo(() => {
    // Apply platform-specific view settings overrides
    const platformSpecificViewSettings = platformAdapter.name === 'web'
      ? platformOverrides?.web?.viewSettings
      : platformOverrides?.native?.viewSettings;

    if (platformSpecificViewSettings) {
      // Merge with base view settings
      return typeof platformSpecificViewSettings === 'function'
        ? platformSpecificViewSettings({ allQuery, allMutation, formValues, setValue })
        : { ...mappedViewSettings, ...platformSpecificViewSettings };
    }

    return mappedViewSettings;
  }, [mappedViewSettings, platformOverrides, platformAdapter.name, allQuery, allMutation, formValues, setValue]);

  // Prepare stable references for query extraction
  // Optimized: Only depend on form?.usedQueries, not the entire form object
  const extractQueryHandle = useMemo(() => {
    if (!form?.usedQueries?.length) return allQuery;
    return extractQuery(form.usedQueries as string[]);
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

  // Call useFormManager hook at top level (maintains hook order)
  const formData = useFormManager({
    ...form,
    data: mappedFormData as any[],
    ns,
    formControl,
    submit: formSubmit as any[],
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
    mappedViewSettings: resolvedViewSettings, // Use resolved view settings with platform overrides
    isLoading,
    // NEW IN 2.0: Return resolved metadata and lazy loading configuration
    meta: resolvedMeta,
    lazyLoading: resolvedLazyLoading,
    platformAdapter, // Expose platform adapter for components to use
  };
};
