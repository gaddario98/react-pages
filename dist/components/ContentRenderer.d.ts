import { QueriesArray } from "@gaddario98/react-queries";
import { FieldValues } from "react-hook-form";
import { Props } from "./types";
export declare const ContentRenderer: <F extends FieldValues, Q extends QueriesArray>({ content, ns, formValues, pageId, allMutation, allQuery, setValue, }: Props<F, Q>) => import("react/jsx-runtime").JSX.Element | null;
