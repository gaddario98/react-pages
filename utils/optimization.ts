/* eslint-disable @typescript-eslint/no-explicit-any */
import equal from 'fast-deep-equal';



/**
 * Deep equality check for complex objects
 * Use sparingly - prefer shallow equality for performance
 * Uses fast-deep-equal library for optimized deep comparison with circular reference protection
 * @param objA - First object
 * @param objB - Second object
 * @returns True if objects are deeply equal
 */
export function deepEqual(objA: any, objB: any): boolean {
  return equal(objA, objB);
}

export const getValueAtPath = (obj: unknown, path: string): unknown => {
  if (!path) return undefined;
  const normalized = path.replace(/\[(\d+)\]/g, ".$1");
  const parts = normalized.split(".").filter(Boolean);
  let current: unknown = obj;

  for (const part of parts) {
    if (current == null) return undefined;
    if (typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
};

export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
};

/**
 * Deeply merges source object into target object.
 * Plain objects are merged recursively, while arrays and primitives are replaced.
 */
export const deepMerge = <T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>
): T => {
  const output = { ...target } as Record<string, unknown>;
  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = output[key];
    if (isPlainObject(sourceVal)) {
      if (isPlainObject(targetVal)) {
        output[key] = deepMerge(
          targetVal as Record<string, unknown>,
          sourceVal as Record<string, unknown>
        );
      } else {
        output[key] = deepMerge({}, sourceVal as Record<string, unknown>);
      }
    } else {
      output[key] = sourceVal;
    }
  }
  return output as T;
};

/**
 * Recursively compares current and prev objects to extract only modified properties.
 * Plain nested objects are inspected recursively; only changed nested fields are included.
 * If a key was present in prev but absent in current, it is marked as undefined.
 */
export const getNestedChanges = (
  current: Record<string, unknown>,
  prev: Record<string, unknown>
): { changes: Record<string, unknown>; hasChanges: boolean } => {
  const changes: Record<string, unknown> = {};
  let hasChanges = false;

  const currentKeys = Object.keys(current);
  for (const key of currentKeys) {
    const currentVal = current[key];
    const prevVal = prev ? prev[key] : undefined;

    if (isPlainObject(currentVal) && isPlainObject(prevVal)) {
      const nested = getNestedChanges(currentVal, prevVal);
      if (nested.hasChanges) {
        changes[key] = nested.changes;
        hasChanges = true;
      }
    } else if (!equal(currentVal, prevVal)) {
      changes[key] = currentVal;
      hasChanges = true;
    }
  }

  if (prev) {
    const prevKeys = Object.keys(prev);
    for (const key of prevKeys) {
      if (!(key in current)) {
        changes[key] = undefined;
        hasChanges = true;
      }
    }
  }

  return { changes, hasChanges };
};

