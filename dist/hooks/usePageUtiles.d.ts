import { QueriesArray } from "@gaddario98/react-queries";
import { FieldValues } from "react-hook-form";
import { ContentItem } from "../types";
export declare const usePageUtiles: () => {
    getContentProps: <F extends FieldValues = FieldValues, Q extends QueriesArray = QueriesArray>(props: ContentItem<F, Q>) => ContentItem<F, Q>;
    getContentItems: <F extends FieldValues = FieldValues, Q extends QueriesArray = QueriesArray>(props: ContentItem<F, Q>[]) => ContentItem<F, Q>[];
};
