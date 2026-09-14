import { useCallback, useMemo } from "react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { selectAtom } from "jotai/utils";

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
          [pageId]: {
            ...(prevEntry as unknown as V),
            ...(val as unknown as Partial<V>),
          } as unknown as V,
        }
      })
    },
    [pageId, setValues],
  )
}

export const pageVariablesSettingsAtom = atom<Record<string, { initialized: boolean }>>({})
export const createPageVariablesSettingsSelector = (
  pageId: string,
) =>
  selectAtom(
    pageVariablesSettingsAtom,
    (values) => {
      const entry = values[pageId]
      return entry ?? { initialized: false }
    },
    (a, b) =>
      a === b || (Object.entries(a) === Object.entries(b)),
  )
export const usePageVariablesSettings = (pageId: string) => {
  const [values, set] = useAtom<Record<string, { initialized: boolean }>>(pageVariablesSettingsAtom)

  const setPageValues = useCallback((val: { initialized: boolean }) => set((prev) => {
    const prevEntry =
      (prev[pageId]) ??
      { initialized: false }
    return {
      ...prev,
      [pageId]: {
        ...prevEntry,
        ...val,
      },
    }
  }), [set])

  const pageValues = useMemo(() => values[pageId] ??
    { initialized: false }, [values])

  return [pageValues, setPageValues] as [{ initialized: boolean }, (val: {
    initialized: boolean;
  }) => void]
}