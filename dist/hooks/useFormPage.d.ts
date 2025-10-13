import { FieldValues, Path } from "react-hook-form";
import { FormPageProps } from "../types";
import { QueriesArray } from "@gaddario98/react-queries";
export declare const useFormPage: <F extends FieldValues, Q extends QueriesArray>({ form, }: {
    form?: FormPageProps<F, Q>;
}) => {
    formValues: F;
    formControl: import("react-hook-form").UseFormReturn<F, any, F>;
    setValue: (name: Path<F>, value: any, options?: Parameters<import("react-hook-form").UseFormSetValue<F>>[2]) => Promise<void>;
};
