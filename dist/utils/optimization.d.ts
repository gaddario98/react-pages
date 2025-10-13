/**
 * Optimized shallow equality check for objects and functions
 * @param objA - First object to compare
 * @param objB - Second object to compare
 * @returns True if objects are shallow equal
 */
export declare function shallowEqual(objA: any, objB: any): boolean;
/**
 * Checks if a value is stable for React dependency arrays
 * @param value - Value to check for stability
 * @returns True if value is considered stable
 */
export declare function isStableValue(value: any): boolean;
/**
 * Creates an optimized dependency array by filtering unstable values
 * @param deps - Array of dependencies to optimize
 * @returns Filtered array of stable dependencies
 */
export declare function optimizeDeps(deps: any[]): any[];
