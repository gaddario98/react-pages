import { FieldValues } from 'react-hook-form';
import { QueriesArray, AllMutation, MultipleQueryResponse } from '@gaddario98/react-queries';
import { ViewSettings, MappedItemsFunction } from '../types';
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
export declare function useViewSettings<F extends FieldValues, Q extends QueriesArray>({ viewSettings, allQuery, allMutation, formValues, setValue, }: {
    viewSettings?: MappedItemsFunction<F, Q, ViewSettings> | ViewSettings;
    allQuery: MultipleQueryResponse<Q>;
    allMutation: AllMutation<Q>;
    formValues: F;
    setValue: any;
}): ViewSettings;
