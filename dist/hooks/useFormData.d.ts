import { FieldValues } from 'react-hook-form';
import { QueriesArray, AllMutation, MultipleQueryResponse } from '@gaddario98/react-queries';
import { FormPageProps } from '../types';
import { FormManagerConfig, Submit } from '@gaddario98/react-form';
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
export declare function useFormData<F extends FieldValues, Q extends QueriesArray>({ form, isAllQueryMapped, formValues, extractMutationsHandle, extractQueryHandle, setValue, }: {
    form?: FormPageProps<F, Q>;
    isAllQueryMapped: boolean;
    formValues: F;
    extractMutationsHandle: AllMutation<Q>;
    extractQueryHandle: MultipleQueryResponse<Q>;
    setValue: any;
}): {
    mappedFormData: (FormManagerConfig<F> & {
        key: string | number;
    })[];
    formSubmit: (Submit<F, undefined> & {
        key: string | number;
    })[];
};
