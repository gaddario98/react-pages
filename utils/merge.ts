/**
 * Configuration Merge Utility (T084)
 * Provides deep merging of configuration objects with proper precedence
 * Handles arrays, objects, and primitives correctly
 *
 * @module utils/merge
 */

/**
 * Options for controlling merge behavior
 */
export interface MergeOptions {
  /** If true, arrays are concatenated instead of replaced (default: false) */
  concatArrays?: boolean;

  /** If true, null/undefined values overwrite existing values (default: false) */
  overwriteWithEmpty?: boolean;

  /** Maximum depth for recursion to prevent infinite loops (default: 10) */
  maxDepth?: number;

  /** Keys to skip during merge */
  skipKeys?: Set<string>;
}

/**
 * Deep merge of multiple objects with precedence from left to right
 * Later objects override earlier ones, with special handling for nested objects
 *
 * @param objects - Objects to merge (left to right precedence)
 * @param options - Merge options
 * @returns Merged object
 *
 * @example
 * ```typescript
 * const defaults = { theme: 'light', nested: { color: 'black' } };
 * const overrides = { theme: 'dark', nested: { fontSize: 14 } };
 * const result = deepMerge(defaults, overrides);
 * // Result: { theme: 'dark', nested: { color: 'black', fontSize: 14 } }
 * ```
 */
export function deepMerge<T extends Record<string, any>>(
  ...objects: (T | undefined | null)[]
): T {
  return deepMergeWithOptions({}, objects.filter((obj) => obj != null), {
    maxDepth: 10,
  }) as T;
}

/**
 * Deep merge with custom options
 * @param target - Target object to merge into
 * @param sources - Source objects to merge
 * @param options - Merge options
 * @returns Merged object
 */
export function deepMergeWithOptions<T extends Record<string, any>>(
  target: T,
  sources: T[],
  options: MergeOptions = {}
): T {
  const { concatArrays = false, overwriteWithEmpty = false, maxDepth = 10, skipKeys = new Set() } = options;

  function merge(target: any, source: any, depth: number = 0): any {
    // Prevent infinite recursion
    if (depth > maxDepth) {
      console.warn('[deepMerge] Maximum recursion depth exceeded');
      return source;
    }

    // Handle null/undefined
    if (source == null) {
      return overwriteWithEmpty ? source : target;
    }

    if (target == null) {
      return source;
    }

    // Handle primitives and functions
    if (typeof source !== 'object' || typeof target !== 'object') {
      return source;
    }

    // Handle arrays
    if (Array.isArray(source)) {
      if (!Array.isArray(target)) {
        return source;
      }

      if (concatArrays) {
        return [...target, ...source];
      }

      return source;
    }

    // Handle non-array objects
    if (Array.isArray(target)) {
      return source; // Source object replaces target array
    }

    // Deep merge objects
    const result = { ...target };

    for (const key in source) {
      if (!source.hasOwnProperty(key) || skipKeys.has(key)) {
        continue;
      }

      const sourceValue = source[key];
      const targetValue = result[key];

      if (sourceValue == null) {
        if (overwriteWithEmpty) {
          result[key] = sourceValue;
        }
        continue;
      }

      // Recursively merge nested objects
      if (
        typeof sourceValue === 'object' &&
        typeof targetValue === 'object' &&
        !Array.isArray(sourceValue) &&
        !Array.isArray(targetValue)
      ) {
        result[key] = merge(targetValue, sourceValue, depth + 1);
      } else {
        result[key] = sourceValue;
      }
    }

    return result;
  }

  return sources.reduce((acc, source) => merge(acc, source), target);
}

/**
 * Shallow merge of objects (only top-level keys)
 * @param objects - Objects to merge
 * @returns Merged object
 */
export function shallowMerge<T extends Record<string, any>>(
  ...objects: (T | undefined | null)[]
): T {
  const filtered = objects.filter((obj) => obj != null);
  return Object.assign({}, ...filtered) as T;
}

/**
 * Merge arrays of objects by a key (useful for config arrays)
 * @param baseArray - Base array
 * @param overrideArray - Array to merge in
 * @param keyName - Key to match on
 * @returns Merged array
 *
 * @example
 * ```typescript
 * const base = [{ id: 'a', name: 'Alice' }, { id: 'b', name: 'Bob' }];
 * const override = [{ id: 'a', name: 'Alicia' }, { id: 'c', name: 'Charlie' }];
 * const result = mergeArraysByKey(base, override, 'id');
 * // Result: [{ id: 'a', name: 'Alicia' }, { id: 'b', name: 'Bob' }, { id: 'c', name: 'Charlie' }]
 * ```
 */
export function mergeArraysByKey<T extends Record<string, any>>(
  baseArray: T[],
  overrideArray: T[],
  keyName: string
): T[] {
  const baseMap = new Map<any, T>();
  const result: T[] = [];

  // Add base array items to map
  baseArray.forEach((item) => {
    const key = item[keyName];
    baseMap.set(key, item);
  });

  // Track which keys we've seen
  const seenKeys = new Set<any>();

  // Merge overrides
  overrideArray.forEach((item) => {
    const key = item[keyName];
    seenKeys.add(key);

    if (baseMap.has(key)) {
      // Deep merge if key exists
      const merged = deepMerge(baseMap.get(key)!, item);
      baseMap.set(key, merged);
    } else {
      // Add new item
      baseMap.set(key, item);
    }
  });

  // Build result maintaining base order, then add new items
  baseArray.forEach((item) => {
    const key = item[keyName];
    result.push(baseMap.get(key)!);
  });

  // Add new items from override
  overrideArray.forEach((item) => {
    const key = item[keyName];
    if (!baseArray.some((baseItem) => baseItem[keyName] === key)) {
      result.push(item);
    }
  });

  return result;
}

/**
 * Check if two objects are deeply equal
 * Useful for detecting if a merge actually changed anything
 * Note: Use the fast-deep-equal version from optimization.ts instead
 * @deprecated - Use deepEqual from utils/optimization.ts instead
 * @param obj1 - First object
 * @param obj2 - Second object
 * @returns True if objects are deeply equal
 */
export function deepEqualFallback(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (obj1 == null || obj2 == null) {
    return obj1 === obj2;
  }

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }

    if (!deepEqualFallback(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Stable Cache for memoizing objects across renders
 * Prevents unnecessary object creation in hooks
 *
 * @example
 * ```typescript
 * const cache = useRef(new StableCache<FormConfig>());
 * const formConfig = cache.current.getOrSet('key', () => createConfig());
 * ```
 */
export class StableCache<T> {
  private cache: Map<string, T> = new Map();

  /**
   * Get value from cache, or set it if not present
   * @param key - Cache key
   * @param factory - Function to create value if not cached
   * @returns Cached or newly created value
   */
  getOrSet(key: string, factory: () => T): T {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    const value = factory();
    this.cache.set(key, value);
    return value;
  }

  /**
   * Get value from cache
   * @param key - Cache key
   * @returns Cached value or undefined
   */
  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  /**
   * Set value in cache
   * @param key - Cache key
   * @param value - Value to cache
   */
  set(key: string, value: T): void {
    this.cache.set(key, value);
  }

  /**
   * Check if key exists in cache
   * @param key - Cache key
   * @returns True if key exists
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Clear all cached values
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   * @returns Number of cached items
   */
  size(): number {
    return this.cache.size;
  }
}
