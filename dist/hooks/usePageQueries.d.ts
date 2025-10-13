import { FieldValues } from 'react-hook-form';
import { QueriesArray } from '@gaddario98/react-queries';
import { QueryPageConfigArray } from '../types';
/**
 * Specialized hook for managing queries and mutations
 * Handles query processing, loading states, and key mapping
 * @param queries - Array of query configurations
 * @param formValues - Current form values
 * @param setValue - Form setValue function
 * @returns Query management state and utilities
 */
export declare function usePageQueries<F extends FieldValues, Q extends QueriesArray>({ queries, formValues, setValue, }: {
    queries: QueryPageConfigArray<F, Q>;
    formValues: F;
    setValue: any;
}): {
    allMutation: import("@gaddario98/react-queries").AllMutation<Q>;
    allQuery: import("@gaddario98/react-queries").MultipleQueryResponse<Q>;
    isAllQueryMapped: boolean;
    isLoading: boolean;
    queryKeys: (string[] | undefined)[];
    hasQueries: boolean;
    queriesKeys: string[];
};
