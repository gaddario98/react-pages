import { QueriesArray } from "@gaddario98/react-queries";
import { FieldValues } from "react-hook-form";
import { ContentItemsType } from "../types";
import { usePageConfig } from "./usePageConfig";
export interface GenerateContentProps<F extends FieldValues, Q extends QueriesArray> {
    pageId: string;
    ns?: string;
    contents: ContentItemsType<F, Q>;
    pageConfig: ReturnType<typeof usePageConfig<F, Q>>;
}
export declare const useGenerateContent: <F extends FieldValues, Q extends QueriesArray>({ pageId, ns, contents, pageConfig, }: GenerateContentProps<F, Q>) => {
    header: JSX.Element[];
    body: JSX.Element[];
    footer: JSX.Element[];
    allContents: (import("../types").ContentItem<F, Q> | import("@gaddario98/react-form").FormManagerConfig<F> | import("@gaddario98/react-form").Submit<F, undefined>)[];
};
