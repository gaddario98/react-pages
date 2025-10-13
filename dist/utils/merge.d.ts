type WithKey<T> = T & {
    key: string | number;
};
/**
 * Optimized merge function for arrays of objects with keys
 * Maintains object references if they haven't changed
 * @param prev - Previous array of objects with keys
 * @param next - Next array of objects with keys
 * @returns Merged array with preserved references where possible
 */
export declare function mergeByKey<T extends Record<string, any>>(prev: WithKey<T>[], next: WithKey<T>[]): WithKey<T>[];
/**
 * Checks if two arrays with keys have the same elements
 * @param arrA - First array to compare
 * @param arrB - Second array to compare
 * @returns True if arrays are equal
 */
export declare function arraysWithKeyEqual<T extends Record<string, any>>(arrA: WithKey<T>[], arrB: WithKey<T>[]): boolean;
/**
 * Stable cache implementation for objects with keys
 * Provides intelligent caching with shallow equality checks
 */
export declare class StableCache<T extends Record<string, any>> {
    private cache;
    get(key: string | number): WithKey<T> | undefined;
    set(key: string | number, value: WithKey<T>): void;
    getOrSet(key: string | number, value: WithKey<T>): WithKey<T>;
    clear(): void;
}
export {};
