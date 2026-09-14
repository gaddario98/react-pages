import { useCallback, useEffect, useRef, useState } from "react";
import equal from "fast-deep-equal";
import { getNestedChanges, getValueAtPath, usePageVariablesSettings, useSetVariablesState, useVariablesValue } from "../utils";

export interface UsePageVariablesProps<V extends Record<string, unknown> = Record<string, unknown>> {
    scopeId?: string;
    variables: V
}

export const usePageVariables = <V extends Record<string, unknown> = Record<string, unknown>>({
    scopeId = '', variables = {} as V
}: UsePageVariablesProps<V>) => {
    const currentValues = useVariablesValue<V>(scopeId);
    const setVariableState = useSetVariablesState<V>(scopeId);
    const setVariablesRef = useRef(setVariableState)
    const [{ initialized, prevInitialValues }, setSettings] = usePageVariablesSettings(scopeId)

    const subscriptions = useRef(new Map<string, unknown>());
    const [trigger, setTrigger] = useState(0);

    useEffect(() => {
        if (!initialized && !!Object.values(variables)?.length) {
            setVariablesRef.current(variables);
            setSettings({ initialized: true, prevInitialValues: variables });
        } else if (initialized && !!Object.values(variables)?.length) {
            const { changes, hasChanges } = getNestedChanges(
                variables as Record<string, unknown>,
                prevInitialValues,
            );
            if (hasChanges) {
                setVariablesRef.current(changes as V);
                setSettings({ prevInitialValues: variables });
            }
        }
    }, [variables]);
    // Ref to hold the latest values without causing re-renders itself
    const valuesRef = useRef<V>(currentValues);

    useEffect(() => {
        let shouldTrigger = false;
        const valuesToCompare = !initialized
            ? variables
            : currentValues;

        subscriptions.current.forEach((_, path) => {
            const newValue = getValueAtPath(valuesToCompare, path);
            const oldValue = getValueAtPath(valuesRef.current, path);
            if (!equal(newValue, oldValue)) {
                shouldTrigger = true;
            }
        });

        valuesRef.current = valuesToCompare;
        if (shouldTrigger) {
            setTrigger((c) => c + 1);
        }
        setSettings({ initialized: true })
    }, [currentValues, variables]);

    const get = useCallback(
        (key: keyof V, defaultValue?: V[keyof V]) => {
            const val =
                getValueAtPath(valuesRef.current, key as string) ?? defaultValue;
            subscriptions.current.set(key as string, val);
            return subscriptions.current.get(key as string);
        },

        [trigger],
    );

    const set = useCallback(
        (
            field: keyof V,
            value: V[keyof V],
        ) => {
            setVariablesRef.current({ [field]: value } as Partial<V>);
        },
        [],
    );

    return { get, set };
};
