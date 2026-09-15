import { useEffect, useMemo, useState } from "react";
import { useFormManager } from "@gaddario98/react-form";
import { useFormData } from "./useFormData";
import type {
  FieldValues,
  FormManagerConfig,
  Submit,
} from "@gaddario98/react-form";
import type { FormPageProps } from "../types";
import { type QueriesArray, QueryObserver, useApiConfigValue } from "@gaddario98/react-queries";

export interface UsePageFormManagerProps<
  F extends FieldValues,
  Q extends QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> {
  form?: FormPageProps<F, Q, V>;
  pageId: string;
  ns?: string;
  initialValues?: V;
}

export const usePageFormManager = <
  F extends FieldValues,
  Q extends QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
>({
  form,
  pageId,
  ns,
  initialValues,
}: UsePageFormManagerProps<F, Q, V>) => {
  const { queryClient } = useApiConfigValue();
  const [defaultValueMapped, setDefaultValueMapped] = useState<F | undefined>(
    () => {
      if (form?.defaultValueQueryKey) {
        const initialData = queryClient.getQueryData<F>(
          form.defaultValueQueryKey,
        );
        if (initialData !== undefined) {
          return (
            form?.defaultValueQueryMap?.(initialData) ?? initialData
          );
        }
      }
      return form?.defaultValues;
    },
  );

  useEffect(() => {
    if (!form?.defaultValueQueryKey) {
      if (form?.defaultValues !== undefined) {
        setDefaultValueMapped(form.defaultValues);
      }
      return () => { };
    }
    const initialData = queryClient.getQueryData<F>(form.defaultValueQueryKey);
    if (initialData !== undefined) {
      setDefaultValueMapped(
        form?.defaultValueQueryMap?.(initialData) ?? initialData,
      );
    }
    const observer = new QueryObserver<F>(queryClient, {
      queryKey: form.defaultValueQueryKey,
      enabled: true,
      notifyOnChangeProps: ["data"],
      refetchOnWindowFocus: false,
      staleTime: 0,
    });
    const unsubscribe = observer.subscribe((result) => {
      if (result.data !== undefined) {
        setDefaultValueMapped(
          form?.defaultValueQueryMap?.(result.data) ?? (result.data as F),
        );
      }
    });
    return () => unsubscribe();
  }, [
    form?.defaultValueQueryKey,
    form?.defaultValues,
    queryClient,
    form?.defaultValueQueryMap,
  ]);

  const formId = form?.id ?? pageId;

  const { mappedFormData, formSubmit } = useFormData<F, Q, V>({
    form,
    pageId,
    initialValues,
    formId,
  });

  // Call useFormManager hook at top level (maintains hook order)
  const rawFormData = useFormManager({
    ...form,
    id: formId,
    data: mappedFormData,
    ns,
    submit: formSubmit,
    formOptions: {
      defaultValues: defaultValueMapped ?? form?.defaultValues,
      ...(form?.formSettings ?? {}),
      formId,
    },
  });

  const formData = useMemo(
    () => ({
      ...rawFormData,
      formContents: rawFormData.formContents as Array<
        FormManagerConfig<F> | Submit<F>
      >,
    }),
    [rawFormData],
  );

  return {
    formData,
  };
};
