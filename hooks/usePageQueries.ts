import { useMemo } from 'react';
import { FieldValues } from 'react-hook-form';
import {
  QueriesArray,
  QueryConfigArray as OriginalQueryConfigArray,
  useApi,
} from '@gaddario98/react-queries';
import { QueryPageConfigArray } from '../types';
import { useMemoizedProps } from './useMemoizedProps';

/**
 * Specialized hook for managing queries and mutations
 * Handles query processing, loading states, and key mapping
 * Enhanced in 2.0: Uses useMemoizedProps for stable query/mutation references
 * @param queries - Array of query configurations
 * @param formValues - Current form values
 * @param setValue - Form setValue function
 * @returns Query management state and utilities with stable references
 */
export function usePageQueries<F extends FieldValues, Q extends QueriesArray>({
  queries = [] as QueryPageConfigArray<F, Q>,
  formValues,
  setValue,
}: {
  queries: QueryPageConfigArray<F, Q>;
  formValues: F;
  setValue: any;
}) {
  const processedQueries = useMemo(() => {
    return queries.map((q) => {
      if (q.type === 'mutation') {
        const mutationConfig =
          typeof q.mutationConfig === 'function'
            ? q.mutationConfig({ formValues, setValue })
            : q.mutationConfig;
        return {
          ...q,
          mutationConfig,
        };
      }
      if (q.type === 'query') {
        const queryConfig =
          typeof q.queryConfig === 'function'
            ? q.queryConfig({ formValues, setValue })
            : q.queryConfig;
        return {
          ...q,
          queryConfig,
        };
      }
      return q;
    });
  }, [queries, formValues, setValue]);

  const { allMutation, allQuery } = useApi(
    processedQueries as OriginalQueryConfigArray<Q>,
  );

  // NEW IN 2.0: Use useMemoizedProps to ensure stable query/mutation references
  // This prevents unnecessary re-renders in components that depend on these values
  const stableMappedProps = useMemoizedProps({
    allQuery,
    allMutation,
    formValues,
    setValue,
  });

  // Use stable references from useMemoizedProps
  const stableAllQuery = useMemo(
    () => stableMappedProps.allQuery,
    [stableMappedProps.allQuery],
  );
  const stableAllMutation = useMemo(
    () => stableMappedProps.allMutation,
    [stableMappedProps.allMutation],
  );

  const queriesKeys = useMemo(
    () =>
      Object.keys(stableAllQuery ?? {}).concat(
        Object.keys(stableAllMutation ?? {}),
      ),
    [stableAllMutation, stableAllQuery],
  );

  const isAllQueryMapped = useMemo(() => {
    if (!queries.length) return true;
    return queries.map((el) => el.key).every((el) => queriesKeys.includes(el));
  }, [queries, queriesKeys]);

  const isLoading = useMemo(
    () =>
      Object.values(stableAllQuery ?? {}).some(
        (el: any) =>
          typeof el !== 'boolean' && el?.isLoadingMapped === true && !el.data,
      ),
    [stableAllQuery],
  );

  const queryKeys = useMemo(
    () =>
      processedQueries
        .filter((el) => el?.type === 'query')
        .map((el) => {
          const queryConfig = (el as Extract<typeof el, { type: 'query' }>)
            .queryConfig;
          return queryConfig?.queryKey;
        })
        .filter(Boolean),
    [processedQueries],
  );

  const hasQueries = useMemo(() => {
    return queries.some((q) => q.type === 'query');
  }, [queries]);

  // Return stable references to prevent re-render cascades
  return {
    allMutation: stableAllMutation,
    allQuery: stableAllQuery,
    isAllQueryMapped,
    isLoading,
    queryKeys,
    hasQueries,
    queriesKeys,
  };
}
