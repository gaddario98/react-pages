import {
  AllMutation,
  MultipleQueryResponse,
  QueriesArray,
} from "@gaddario98/react-queries";
import { createExtractor, ExtractorCache } from "@gaddario98/utiles";
import { useRef, useCallback } from "react";
import { FieldValues } from "react-hook-form";

interface UseDataExtractorProps<
  F extends FieldValues,
  Q extends QueriesArray,
> {
  formValues: F;
  allQuery: MultipleQueryResponse<Q>;
  allMutation: AllMutation<Q>;
}

function createQueryExtractor<
  D extends QueriesArray,
  V extends MultipleQueryResponse<D>,
  K extends keyof V = keyof V,
>(allQuery: V, queryCacheRef: ExtractorCache<Partial<V>>, usedKeys?: K[]) {
  return createExtractor<V>(allQuery, queryCacheRef, usedKeys);
}

function createMutationExtractor<
  D extends QueriesArray,
  V extends AllMutation<D>,
  K extends keyof V = keyof V,
>(
  allMutation: V,
  mutationCacheRef: ExtractorCache<Partial<V>>,
  usedKeys?: K[]
) {
  return createExtractor<V>(allMutation, mutationCacheRef, usedKeys);
}

function createFormValuesExtractor<
  D extends FieldValues,
  V extends D,
  K extends keyof V = keyof V,
>(
  formValues: V,
  formValuesCacheRef: ExtractorCache<Partial<V>>,
  usedKeys?: K[]
) {
  return createExtractor<V>(formValues, formValuesCacheRef, usedKeys);
}

export function useDataExtractor<
  F extends FieldValues,
  Q extends QueriesArray,
>({ allQuery, allMutation, formValues }: UseDataExtractorProps<F, Q>) {
  // Initialize cache refs
  const queryCacheRef = useRef<
    ExtractorCache<Partial<MultipleQueryResponse<Q>>>
  >(new Map());
  const mutationCacheRef = useRef<ExtractorCache<Partial<AllMutation<Q>>>>(
    new Map()
  );
  const formValuesCacheRef = useRef<
    ExtractorCache<Partial<F>>
  >(new Map());

  // Create extractors with caching
  const extractQuery = useCallback(
    (usedKeys: Array<keyof MultipleQueryResponse<Q>>) =>
      createQueryExtractor<Q, MultipleQueryResponse<Q>>(
        allQuery,
        queryCacheRef.current,
        usedKeys
      ),
    [allQuery]
  );

  const extractMutations = useCallback(
    (usedKeys: Array<keyof AllMutation<Q>>) =>
      createMutationExtractor<Q, AllMutation<Q>>(
        allMutation,
        mutationCacheRef.current,
        usedKeys
      ),
    [allMutation]
  );

  const extractFormValues = useCallback(
    (usedKeys: Array<keyof F>) =>
      createFormValuesExtractor<F, F>(
        formValues,
        formValuesCacheRef.current,
        usedKeys
      ),
    [formValues]
  );

  // Clear cache utility
  const clearCache = useCallback(() => {
    queryCacheRef.current.clear();
    mutationCacheRef.current.clear();
    formValuesCacheRef.current.clear();
  }, []);

  return {
    extractQuery,
    extractMutations,
    extractFormValues,
    clearCache,
    cacheRefs: {
      queryCacheRef,
      mutationCacheRef,
      formValuesCacheRef,
    },
  };
}
