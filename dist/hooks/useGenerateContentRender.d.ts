import { FieldValues, UseFormSetValue } from "react-hook-form";
import { AllMutation, MultipleQueryResponse, QueriesArray } from "@gaddario98/react-queries";
import { FormElements, FormManagerConfig, Submit } from "@gaddario98/react-form";
import { ContentItem, ContentItemsType } from "../types";
export interface GenerateContentRenderProps<F extends FieldValues, Q extends QueriesArray> {
    contents?: ContentItemsType<F, Q>;
    ns?: string;
    pageId: string;
    formValues: F;
    allQuery: MultipleQueryResponse<Q>;
    allMutation: AllMutation<Q>;
    isAllQueryMapped?: boolean;
    formData: false | {
        elements: FormElements[];
        formContents: (FormManagerConfig<F> | Submit<F>)[];
    };
    setValue: UseFormSetValue<F>;
    renderComponent: (props: {
        content: ContentItem<F, Q>;
        ns: string;
        formValues: F;
        pageId: string;
        allMutation: AllMutation<Q>;
        allQuery: MultipleQueryResponse<Q>;
        setValue: UseFormSetValue<F>;
        key: string;
    }) => JSX.Element;
}
export interface Elements {
    index: number;
    element: JSX.Element;
    renderInFooter: boolean;
    renderInHeader: boolean;
    key: string;
}
export declare const useGenerateContentRender: <F extends FieldValues, Q extends QueriesArray>({ pageId, ns, contents, allMutation, allQuery, formValues, isAllQueryMapped, formData, setValue, renderComponent, }: GenerateContentRenderProps<F, Q>) => {
    components: {
        element: JSX.Element;
        index: number;
        renderInFooter: boolean;
        renderInHeader: boolean;
        key: string;
    }[];
    allContents: (ContentItem<F, Q> | FormManagerConfig<F> | Submit<F, undefined>)[];
};
