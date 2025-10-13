import { AllMutation, MultipleQueryResponse, QueriesArray } from "@gaddario98/react-queries";
import { ExtractorCache } from "@gaddario98/utiles";
import { FieldValues } from "react-hook-form";
interface UseDataExtractorProps<F extends FieldValues, Q extends QueriesArray> {
    formValues: F;
    allQuery: MultipleQueryResponse<Q>;
    allMutation: AllMutation<Q>;
}
export declare function useDataExtractor<F extends FieldValues, Q extends QueriesArray>({ allQuery, allMutation, formValues }: UseDataExtractorProps<F, Q>): {
    extractQuery: (usedKeys: Array<keyof MultipleQueryResponse<Q>>) => MultipleQueryResponse<Q>;
    extractMutations: (usedKeys: Array<keyof AllMutation<Q>>) => AllMutation<Q>;
    extractFormValues: (usedKeys: Array<keyof F>) => F;
    clearCache: () => void;
    cacheRefs: {
        queryCacheRef: import("react").MutableRefObject<ExtractorCache<Partial<MultipleQueryResponse<Q>>>>;
        mutationCacheRef: import("react").MutableRefObject<ExtractorCache<Partial<AllMutation<Q>>>>;
        formValuesCacheRef: import("react").MutableRefObject<ExtractorCache<Partial<F>>>;
    };
};
export {};
