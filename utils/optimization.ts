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
