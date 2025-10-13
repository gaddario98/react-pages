import { QueriesArray } from "@gaddario98/react-queries";
import { FieldValues } from "react-hook-form";
import { ContentProps } from "./types";
export declare const RenderComponent: <F extends FieldValues, Q extends QueriesArray>({ content, formValues, allMutation, allQuery, setValue, }: ContentProps<F, Q>) => import("react").JSX.Element;
