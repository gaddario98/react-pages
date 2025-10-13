import { QueriesArray } from "@gaddario98/react-queries";
import { FieldValues } from "react-hook-form";
import { ItemContainerProps } from "./types";
export declare const Container: <F extends FieldValues, Q extends QueriesArray>({ content, ns, pageId, allMutation, allQuery, formValues, setValue, }: ItemContainerProps<F, Q>) => import("react/jsx-runtime").JSX.Element;
