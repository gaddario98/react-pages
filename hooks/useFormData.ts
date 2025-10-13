import { useMemo, useRef } from 'react';
import { FieldValues } from 'react-hook-form';
import { QueriesArray, AllMutation, MultipleQueryResponse } from '@gaddario98/react-queries';
import { FormPageProps } from '../types';
import { FormManagerConfig, Submit } from '@gaddario98/react-form';
import { StableCache } from '../utils/merge';

/**
 * Specialized hook for managing form data processing
 * Uses optimized caches to prevent unnecessary re-renders
 * @param form - Form configuration
 * @param isAllQueryMapped - Whether all queries are mapped
 * @param formValues - Current form values
 * @param extractMutationsHandle - Extracted mutations
 * @param extractQueryHandle - Extracted queries
 * @param setValue - Form setValue function
 * @returns Processed form data and submit handlers
 */
export function useFormData<F extends FieldValues, Q extends QueriesArray>({
  form,
  isAllQueryMapped,
  formValues,
  extractMutationsHandle,
  extractQueryHandle,
  setValue,
}: {
  form?: FormPageProps<F, Q>;
  isAllQueryMapped: boolean;
  formValues: F;
  extractMutationsHandle: AllMutation<Q>;
  extractQueryHandle: MultipleQueryResponse<Q>;
  setValue: any;
}) {
  const formDataCache = useRef(new StableCache<FormManagerConfig<F>>());
  const formSubmitCache = useRef(new StableCache<Submit<F>>());

  const mappedFormData = useMemo(() => {
    if (!form?.data || !isAllQueryMapped) return [];

    const processedData = form.data
      ?.map((el) => {
        if (typeof el === 'function') {
          return el({
            formValues,
            allMutation: extractMutationsHandle,
            allQuery: extractQueryHandle,
            setValue,
          });
        }
        return el;
      })
      ?.map((el, i) => ({ ...el, key: el.key ?? i })) ?? [];

    return processedData.map(item => {
      const keyStr = String(item.key);
      return formDataCache.current.getOrSet(keyStr, { ...item, key: keyStr });
    });
  }, [
    form?.data,
    isAllQueryMapped,
    formValues,
    extractMutationsHandle,
    extractQueryHandle,
    setValue,
  ]);

  const formSubmit = useMemo(() => {
    if (!isAllQueryMapped || !form?.submit) return [];

    const submitFn = form.submit;
    const processedSubmit = (typeof submitFn === 'function'
      ? submitFn({
          formValues,
          allMutation: extractMutationsHandle,
          allQuery: extractQueryHandle,
          setValue,
        })
      : submitFn
    )?.map((el, i) => ({ ...el, key: el.key ?? i })) ?? [];

    return processedSubmit.map(item => {
      const keyStr = String(item.key);
      return formSubmitCache.current.getOrSet(keyStr, { ...item, key: keyStr });
    });
  }, [
    isAllQueryMapped,
    form?.submit,
    formValues,
    extractMutationsHandle,
    extractQueryHandle,
    setValue,
  ]);

  return {
    mappedFormData,
    formSubmit,
  };
}