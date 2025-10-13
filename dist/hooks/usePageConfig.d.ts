import type { FormPageProps, MappedItemsFunction, QueryPageConfigArray, ViewSettings } from "../types";
import { FieldValues } from "react-hook-form";
import { QueriesArray } from "@gaddario98/react-queries";
export declare const usePageConfig: <F extends FieldValues, Q extends QueriesArray>({ queries, form, ns, onValuesChange, viewSettings, }: {
    queries: QueryPageConfigArray<F, Q>;
    form?: FormPageProps<F, Q>;
    ns: string;
    onValuesChange?: MappedItemsFunction<F, Q, void>;
    viewSettings?: MappedItemsFunction<F, Q, ViewSettings> | ViewSettings;
}) => {
    formData: {
        elements: import("@gaddario98/react-form").FormElements[];
        formContents: any[];
        errors: import("react-hook-form").FieldErrors<F>;
    };
    isAllQueryMapped: boolean;
    formValues: F;
    formControl: import("react-hook-form").UseFormReturn<F, any, F>;
    hasQueries: boolean;
    handleRefresh: () => Promise<void>;
    allMutation: import("@gaddario98/react-queries").AllMutation<Q>;
    allQuery: import("@gaddario98/react-queries").MultipleQueryResponse<Q>;
    setValue: (name: import("react-hook-form").Path<F>, value: any, options?: Partial<{
        shouldValidate: boolean;
        shouldDirty: boolean;
        shouldTouch: boolean;
    }> | undefined) => Promise<void>;
    form: FormPageProps<F, Q> | undefined;
    mappedViewSettings: ViewSettings;
    isLoading: boolean;
};
