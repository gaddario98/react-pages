import { useCallback, useMemo } from "react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { selectAtom } from "jotai/utils";
import { deepMerge } from "./optimization";

export interface PageVariablesOptions {
  pageId: string;
}

export interface PreviousPageState {
  pageId: string;
  variables: Record<string, unknown>;
}
export const variablesAtom = atom<Record<string, Record<string, unknown>>>({})

export const createValuesSelector = <V extends Record<string, unknown> = Record<string, unknown>>(
  pageId: string,
) =>
  selectAtom(
    variablesAtom,
    (values) => {
      const entry = values[pageId] as V
      return entry ?? {}
    },
    (a, b) =>
      a === b || (Object.entries(a) === Object.entries(b)),
  )

export const useVariablesValue = <V extends Record<string, unknown> = Record<string, unknown>>(pageId: string) => {
  const selectorAtom = useMemo(() => createValuesSelector<V>(pageId), [pageId])
  return useAtomValue(selectorAtom)
}


export const useVariablesState = <V extends Record<string, unknown> = Record<string, unknown>>() => {
  return useAtom(variablesAtom) as unknown as [
    Record<string, V>,
    (value: Record<string, V>) => void,
  ]
}

export const useSetVariablesState = <V extends Record<string, unknown> = Record<string, unknown>>(pageId: string) => {
  const setValues = useSetAtom(variablesAtom)

  return useCallback(
    (val: Partial<V>) => {
      setValues((prev) => {
        const prevEntry =
          (prev[pageId] as V | undefined) ??
          {}
        return {
          ...prev,
          [pageId]: deepMerge(
            prevEntry as Record<string, unknown>,
            val as Record<string, unknown>,
          ) as V,
        }
      })
    },
    [pageId, setValues],
  )
}

type PageVariablesSettings<V extends Record<string, unknown> = Record<string, unknown>> = { prevInitialValues: V, initialized: boolean }

export const pageVariablesSettingsAtom = atom<Record<string, PageVariablesSettings>>({})
const pageVariablesSettingsDefaultValues = {
  initialized: false,
  prevInitialValues: {} as PageVariablesSettings
}
export const createPageVariablesSettingsSelector = (
  pageId: string,
) =>
  selectAtom(
    pageVariablesSettingsAtom,
    (values) => {
      const entry = values[pageId]
      return entry ?? pageVariablesSettingsDefaultValues
    },
    (a, b) =>
      a === b || (Object.entries(a) === Object.entries(b)),
  )

export const usePageVariablesSettings = <V extends Record<string, unknown> = Record<string, unknown>>(pageId: string) => {
  const [values, set] = useAtom<Record<string, PageVariablesSettings>>(pageVariablesSettingsAtom)

  const setPageValues = useCallback((val: PageVariablesSettings<V>) => set((prev) => {
    const prevEntry =
      (prev[pageId]) ??
      pageVariablesSettingsDefaultValues
    return {
      ...prev,
      [pageId]: {
        ...prevEntry,
        ...val,
      },
    }
  }), [set])

  const pageValues = useMemo(() => values[pageId] ??
    pageVariablesSettingsDefaultValues, [values])

  return [pageValues, setPageValues] as [PageVariablesSettings<V>, (val: Partial<PageVariablesSettings<V>>) => void]
}