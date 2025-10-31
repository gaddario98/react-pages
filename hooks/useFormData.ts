import { useMemo } from "react";
import { FieldValues, UseFormSetValue } from "react-hook-form";
import {
  QueriesArray,
  AllMutation,
  MultipleQueryResponse,
} from "@gaddario98/react-queries";
import { FormPageProps } from "../types";
import { FormManagerConfig, Submit } from "@gaddario98/react-form";

/**
 * Specialized hook for managing form data processing
 * Uses useMemo to prevent unnecessary re-computation
 * @param form - Form configuration
 * @param isAllQueryMapped - Whether all queries are mapped
 * @param formValues - Current form values
 * @param extractMutationsHandle - Extracted mutations
 * @param extractQueryHandle - Extracted queries
 * @param setValue - Form setValue function
 * @returns Processed form data and submit handlers
 */
export function useFormData<F extends FieldValues, Q extends QueriesArray>({
  form,
  isAllQueryMapped,
  formValues,
  extractMutationsHandle,
  extractQueryHandle,
  setValue,
}: {
  form?: FormPageProps<F, Q>;
  isAllQueryMapped: boolean;
  formValues: F;
  extractMutationsHandle: AllMutation<Q>;
  extractQueryHandle: MultipleQueryResponse<Q>;
  setValue: UseFormSetValue<F>;
}) {
  const mappedFormData = useMemo((): Array<FormManagerConfig<F>> => {
    if (!form?.data || !isAllQueryMapped) return [];

    return (
      form.data
        ?.map((el) => {
          if (typeof el === "function") {
            return el({
              formValues,
              allMutation: extractMutationsHandle,
              allQuery: extractQueryHandle,
              setValue,
            });
          }
          return el;
        })
        ?.map((el, i) => ({ ...el, key: el.key ?? i })) ?? []
    );
  }, [
    form?.data,
    isAllQueryMapped,
    formValues,
    extractMutationsHandle,
    extractQueryHandle,
    setValue,
  ]);

  const formSubmit = useMemo((): Array<Submit<F>> => {
    if (!isAllQueryMapped || !form?.submit) return [];

    const submitFn = form.submit;
    return (
      (typeof submitFn === "function"
        ? submitFn({
            formValues,
            allMutation: extractMutationsHandle,
            allQuery: extractQueryHandle,
            setValue,
          })
        : submitFn
      )?.map((el, i) => ({ ...el, key: el.key ?? i })) ?? []
    );
  }, [
    isAllQueryMapped,
    form?.submit,
    formValues,
    extractMutationsHandle,
    extractQueryHandle,
    setValue,
  ]);

  return {
    mappedFormData,
    formSubmit,
  };
}
