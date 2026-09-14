import { useCallback, useEffect, useRef, useState } from "react";
import equal from "fast-deep-equal";
import { getValueAtPath, usePageVariablesSettings, useSetVariablesState, useVariablesValue } from "../utils";

export interface UsePageVariablesProps<V extends Record<string, unknown> = Record<string, unknown>> {
    scopeId?: string;
    variables: V
}

export const usePageVariables = <V extends Record<string, unknown> = Record<string, unknown>>({
    scopeId = '', variables
}: UsePageVariablesProps<V>) => {
    const currentValues = useVariablesValue<V>(scopeId);
    const setVariableState = useSetVariablesState<V>(scopeId);
    const [{ initialized }, setSettings] = usePageVariablesSettings(scopeId)

    const subscriptions = useRef(new Map<string, unknown>());
    const [trigger, setTrigger] = useState(0);


    const prevInitialValues = useRef(variables);

    useEffect(() => {
        if (!initialized && variables) {
            setVariableState(variables);
            setSettings({ initialized: true })
            prevInitialValues.current = variables;
        } else if (initialized && variables) {
            const changes: Record<string, unknown> = {};
            let hasChanges = false;
            const prev = prevInitialValues.current ?? {};

            Object.keys(variables).forEach((key) => {
                if (!equal(variables[key], prev[key])) {
                    changes[key] = variables[key];
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                setVariableState(changes as V);
            }
            prevInitialValues.current = variables;
        }
    }, [variables, setVariableState]);
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
            setVariableState({ [field]: value } as Partial<V>);
        },
        [setVariableState],
    );

    return { get, set };
};
