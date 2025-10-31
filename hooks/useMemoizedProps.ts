/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/**
 * useMemoizedProps Hook
 * Provides stable MappedProps memoization for preventing unnecessary re-renders
 *
 * @module hooks/useMemoizedProps
 */

import { useMemo } from 'react';
import { FieldValues, UseFormSetValue } from 'react-hook-form';
import type {
  AllMutation,
  QueriesArray,
  MultipleQueryResponse,
} from '@gaddario98/react-queries';
import equal from 'fast-deep-equal';

/**
 * Mapped props interface - passed to all mapping functions
 */
export interface MappedProps<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
> {
  formValues: F;
  setValue: UseFormSetValue<F>;
  allQuery: MultipleQueryResponse<Q>;
  allMutation: AllMutation<Q>;
}

/**
 * Options for controlling memoization behavior
 */
export interface UseMemoizedPropsOptions {
  /** Use deep equality check instead of shallow (default: true) */
  deepEqual?: boolean;

  /** Custom equality function */
  isEqual?: (prev: any, next: any) => boolean;
}

/**
 * Hook that provides stable MappedProps object across renders
 * Prevents unnecessary re-renders by memoizing the props object
 *
 * @example
 * ```typescript
 * function PageComponent({ queries, formValues, setValue }: PageProps) {
 *   const allQuery = useQueries(queries);
 *   const allMutation = useMutations(queries);
 *
 *   const mappedProps = useMemoizedProps({
 *     formValues,
 *     setValue,
 *     allQuery,
 *     allMutation,
 *   });
 *
 *   // mappedProps is stable - won't change unless dependencies actually change
 *   return <ContentRenderer mappedProps={mappedProps} />;
 * }
 * ```
 */
export function useMemoizedProps<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
>(
  props: MappedProps<F, Q>,
  options: UseMemoizedPropsOptions = {},
): MappedProps<F, Q> {
  const { deepEqual: useDeepEqual = true } = options;

  // Memoize formValues with deep equality
  const stableFormValues = useMemo(() => {
    return props.formValues;
  }, [useDeepEqual ? JSON.stringify(props.formValues) : props.formValues]);

  // Memoize allQuery with deep equality check on data
  const stableAllQuery = useMemo(() => {
    return props.allQuery;
  }, [
    useDeepEqual && props.allQuery
      ? Object.entries(props.allQuery).map(([key, value]: [string, any]) => ({
          key,
          data: value?.data,
          isLoading: value?.isLoading,
          error: value?.error,
        }))
      : props.allQuery,
  ]);

  // Memoize allMutation (usually stable already)
  const stableAllMutation = useMemo(() => {
    return props.allMutation;
  }, [props.allMutation]);

  // setValue is already stable from react-hook-form, but wrap for consistency
  const stableSetValue = useMemo(() => {
    return props.setValue;
  }, [props.setValue]);

  // Combine into final stable MappedProps object
  const mappedProps = useMemo<MappedProps<F, Q>>(
    () => ({
      formValues: stableFormValues,
      setValue: stableSetValue,
      allQuery: stableAllQuery,
      allMutation: stableAllMutation,
    }),
    [stableFormValues, stableSetValue, stableAllQuery, stableAllMutation],
  );

  return mappedProps;
}

/**
 * Hook for creating a stable callback that uses MappedProps
 * Useful for event handlers and callbacks that need access to latest mapped props
 *
 * @example
 * ```typescript
 * const handleClick = useMappedCallback(
 *   (mappedProps) => {
 *     console.log('Form values:', mappedProps.formValues);
 *     mappedProps.allMutation.updateUser.mutate({ ... });
 *   },
 *   [mappedProps]
 * );
 * ```
 */
export function useMappedCallback<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
  Args extends any[] = any[],
>(
  callback: (mappedProps: MappedProps<F, Q>, ...args: Args) => void,
  mappedProps: MappedProps<F, Q>,
): (...args: Args) => void {
  return useMemo(() => {
    return (...args: Args) => callback(mappedProps, ...args);
  }, [callback, mappedProps]);
}

/**
 * Hook for memoizing computed values derived from MappedProps
 * More efficient than computing in render
 *
 * @example
 * ```typescript
 * const userDisplayName = useMappedComputed(
 *   (props) => {
 *     const user = props.allQuery.getUser?.data;
 *     return user?.firstName + ' ' + user?.lastName;
 *   },
 *   mappedProps
 * );
 * ```
 */
export function useMappedComputed<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
  Result = any,
>(
  compute: (mappedProps: MappedProps<F, Q>) => Result,
  mappedProps: MappedProps<F, Q>,
  deps: any[] = [],
): Result {
  return useMemo(() => {
    return compute(mappedProps);
  }, [mappedProps, compute, ...deps]);
}

/**
 * Utility to check if MappedProps have changed
 * Useful for debugging re-render issues
 */
export function areMappedPropsEqual<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
>(prev: MappedProps<F, Q>, next: MappedProps<F, Q>): boolean {
  // Check formValues
  if (!equal(prev.formValues, next.formValues)) {
    return false;
  }

  // Check setValue (should always be stable)
  if (prev.setValue !== next.setValue) {
    return false;
  }

  // Check allQuery data (deep equality on data only, not loading states)
  const prevQueryData = Object.entries(prev.allQuery || {}).reduce(
    (acc, [key, value]: [string, any]) => {
      acc[key] = value?.data;
      return acc;
    },
    {} as Record<string, any>,
  );

  const nextQueryData = Object.entries(next.allQuery || {}).reduce(
    (acc, [key, value]: [string, any]) => {
      acc[key] = value?.data;
      return acc;
    },
    {} as Record<string, any>,
  );

  if (!equal(prevQueryData, nextQueryData)) {
    return false;
  }

  // Check allMutation (should always be stable)
  if (prev.allMutation !== next.allMutation) {
    return false;
  }

  return true;
}
