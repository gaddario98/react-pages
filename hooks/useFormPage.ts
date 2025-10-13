import { useState, useEffect, useMemo, useCallback } from "react";
import { DefaultValues, useForm, FieldValues, Path } from "react-hook-form";
import { useQueryClient, QueryObserver } from "@tanstack/react-query";
import { FormPageProps } from "../types";
import { QueriesArray } from "@gaddario98/react-queries";

export const useFormPage = <F extends FieldValues, Q extends QueriesArray>({
  form,
}: {
  form?: FormPageProps<F, Q>;
}) => {
  const queryClient = useQueryClient();
  const [defaultValueQuery, setDefaultValueQuery] = useState<
    DefaultValues<F> | undefined
  >(form?.defaultValues);

  useEffect(() => {
    if (!form?.defaultValueQueryKey) {
      setDefaultValueQuery(form?.defaultValues);
      return;
    }
    const initialData = queryClient.getQueryData<DefaultValues<F>>(
      form.defaultValueQueryKey
    );
    if (initialData) {
      setDefaultValueQuery(initialData);
    }
    const observer = new QueryObserver<DefaultValues<F>>(queryClient, {
      queryKey: form.defaultValueQueryKey,
      enabled: true,
      notifyOnChangeProps: ["data"],
      refetchOnWindowFocus: false,
    });
    const unsubscribe = observer.subscribe((result) => {
      if (result.data !== undefined) {
        setDefaultValueQuery(result.data);
      }
    });
    return () => unsubscribe();
  }, [form?.defaultValueQueryKey, form?.defaultValues, queryClient]);

  const defaultValues = useMemo(
    () =>
      ({
        ...(defaultValueQuery ?? {}),
        ...(form?.defaultValueQueryMap?.(defaultValueQuery) ?? {}),
      }) as DefaultValues<F>,
    [defaultValueQuery, form]
  );

  const formControl = useForm<F>({
    mode: "all",
    ...(form?.formSettings ?? {}),
    defaultValues,
    resetOptions: {
      keepDirtyValues: true,
      keepDefaultValues: false,
      ...(form?.formSettings?.resetOptions ?? {}),
    },
  });

  // Memoize formControl to avoid unnecessary re-renders
  const stableFormControl = useMemo(() => formControl, []);

  useEffect(() => {
    stableFormControl.reset(defaultValues, {
      keepDirtyValues: true,
      keepDefaultValues: false,
    });
  }, [defaultValues, stableFormControl]);

  const formValues = stableFormControl.watch();

  const setValueAndTrigger = useCallback(
    async (
      name: Path<F>,
      value: any,
      options?: Parameters<typeof stableFormControl.setValue>[2]
    ) => {
      stableFormControl.setValue(name, value, options);
      await stableFormControl.trigger(name);
    },
    [stableFormControl]
  );

  return {
    formValues,
    formControl: stableFormControl,
    setValue: setValueAndTrigger,
  };
};
