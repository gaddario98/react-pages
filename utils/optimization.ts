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
