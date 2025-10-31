/* eslint-disable react-hooks/refs */
import { useMemo, useRef } from 'react';
import { FieldValues } from 'react-hook-form';
import { QueriesArray, AllMutation, MultipleQueryResponse } from '@gaddario98/react-queries';
import { ViewSettings, MappedItemsFunction } from '../types';
import { shallowEqual } from '../utils/optimization';

/**
 * Specialized hook for managing view settings
 * Optimized to prevent unnecessary re-renders
 * @param viewSettings - View settings configuration (static or function)
 * @param allQuery - All query results
 * @param allMutation - All mutation handlers
 * @param formValues - Current form values
 * @param setValue - Form setValue function
 * @returns Processed view settings
 */
export function useViewSettings<F extends FieldValues, Q extends QueriesArray>({
  viewSettings = {},
  allQuery,
  allMutation,
  formValues,
  setValue,
}: {
  viewSettings?: MappedItemsFunction<F, Q, ViewSettings> | ViewSettings;
  allQuery: MultipleQueryResponse<Q>;
  allMutation: AllMutation<Q>;
  formValues: F;
  setValue: any;
}) {
  const prevViewSettingsRef = useRef<ViewSettings | undefined>(undefined);

  const mappedViewSettings = useMemo((): ViewSettings => {
    let next: ViewSettings;
    
    if (typeof viewSettings === 'function') {
      next = viewSettings({
        allQuery,
        allMutation,
        formValues,
        setValue,
      });
    } else {
      next = viewSettings;
    }

    if (
      prevViewSettingsRef.current &&
      shallowEqual(prevViewSettingsRef.current, next)
    ) {
      return prevViewSettingsRef.current;
    }

    prevViewSettingsRef.current = next;
    return next;
  }, [viewSettings, allQuery, allMutation, formValues, setValue]);

  return mappedViewSettings;
}