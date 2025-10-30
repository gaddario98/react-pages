/**
 * Memoization Utilities
 * Helper functions for efficient memoization compatible with React Compiler
 *
 * @module utils/memoization
 */

import equal from 'fast-deep-equal';

/**
 * Simple memoization cache for single-argument functions
 */
class MemoCache<T, R> {
  private cache = new Map<string, { value: T; result: R }>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: string, value: T): R | undefined {
    const cached = this.cache.get(key);
    if (cached && equal(cached.value, value)) {
      return cached.result;
    }
    return undefined;
  }

  set(key: string, value: T, result: R): void {
    // Implement LRU by deleting oldest entries when max size reached
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, { value, result });
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Memoize a function with deep equality check on arguments
 * Compatible with React Compiler - doesn't interfere with automatic optimizations
 *
 * @example
 * ```typescript
 * const computeExpensiveValue = memoize((data: UserData) => {
 *   // Expensive computation
 *   return processUserData(data);
 * });
 *
 * // Same input = same cached result
 * const result1 = computeExpensiveValue(userData);
 * const result2 = computeExpensiveValue(userData); // Returns cached result
 * ```
 */
export function memoize<T, R>(
  fn: (arg: T) => R,
  options: { maxSize?: number; keyFn?: (arg: T) => string } = {}
): (arg: T) => R {
  const { maxSize = 100, keyFn = (arg) => JSON.stringify(arg) } = options;
  const cache = new MemoCache<T, R>(maxSize);

  return (arg: T): R => {
    const key = keyFn(arg);
    const cached = cache.get(key, arg);

    if (cached !== undefined) {
      return cached;
    }

    const result = fn(arg);
    cache.set(key, arg, result);
    return result;
  };
}

/**
 * Memoize a function with multiple arguments
 *
 * @example
 * ```typescript
 * const computeSum = memoizeMulti(
 *   (a: number, b: number, c: number) => a + b + c
 * );
 *
 * const result = computeSum(1, 2, 3); // Computes
 * const cached = computeSum(1, 2, 3); // Returns cached
 * ```
 */
export function memoizeMulti<Args extends any[], R>(
  fn: (...args: Args) => R,
  options: { maxSize?: number } = {}
): (...args: Args) => R {
  const { maxSize = 100 } = options;
  const cache = new MemoCache<Args, R>(maxSize);

  return (...args: Args): R => {
    const key = JSON.stringify(args);
    const cached = cache.get(key, args);

    if (cached !== undefined) {
      return cached;
    }

    const result = fn(...args);
    cache.set(key, args, result);
    return result;
  };
}

/**
 * Shallow equality check for objects
 * Faster than deep equality for simple objects
 */
export function shallowEqual<T extends Record<string, any>>(
  objA: T,
  objB: T
): boolean {
  if (Object.is(objA, objB)) {
    return true;
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, key) ||
      !Object.is(objA[key], objB[key])
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Deep equality check using fast-deep-equal
 * Re-exported for convenience
 */
export { equal as deepEqual };

/**
 * Create a stable object reference that only changes when contents change
 * Useful for dependency arrays
 *
 * @example
 * ```typescript
 * const stableConfig = useStableObject({ a: 1, b: 2 });
 * useEffect(() => {
 *   // Only runs when config actually changes, not on every render
 * }, [stableConfig]);
 * ```
 */
export function createStableObject<T extends Record<string, any>>(
  obj: T,
  prevStable?: T
): T {
  if (!prevStable) {
    return obj;
  }

  if (equal(obj, prevStable)) {
    return prevStable;
  }

  return obj;
}

/**
 * Debounce helper for expensive operations
 * Not a React hook - pure utility function
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   performSearch(query);
 * }, 300);
 *
 * debouncedSearch('react'); // Will execute after 300ms
 * debouncedSearch('react hooks'); // Cancels previous, executes after 300ms
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle helper for rate-limiting function calls
 *
 * @example
 * ```typescript
 * const throttledScroll = throttle((event: Event) => {
 *   handleScroll(event);
 * }, 100);
 *
 * window.addEventListener('scroll', throttledScroll);
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        fn(...args);
        timeoutId = null;
      }, delay - (now - lastCall));
    }
  };
}

/**
 * Memoize the last N results of a function
 * Useful for functions called with rotating sets of arguments
 */
export class LRUMemoize<Args extends any[], Result> {
  private cache: Array<{ args: Args; result: Result }> = [];
  private maxSize: number;

  constructor(maxSize: number = 10) {
    this.maxSize = maxSize;
  }

  get(args: Args): Result | undefined {
    const index = this.cache.findIndex(entry => equal(entry.args, args));

    if (index !== -1) {
      const entry = this.cache[index];
      // Move to front (most recently used)
      this.cache.splice(index, 1);
      this.cache.unshift(entry);
      return entry.result;
    }

    return undefined;
  }

  set(args: Args, result: Result): void {
    // Remove if exists
    const index = this.cache.findIndex(entry => equal(entry.args, args));
    if (index !== -1) {
      this.cache.splice(index, 1);
    }

    // Add to front
    this.cache.unshift({ args, result });

    // Trim to max size
    if (this.cache.length > this.maxSize) {
      this.cache.pop();
    }
  }

  clear(): void {
    this.cache = [];
  }
}

/**
 * Create a memoized selector function
 * Useful for deriving computed values from state
 */
export function createSelector<Input, Output>(
  selector: (input: Input) => Output
): (input: Input) => Output {
  let lastInput: Input | undefined;
  let lastOutput: Output | undefined;

  return (input: Input): Output => {
    if (lastInput !== undefined && equal(input, lastInput)) {
      return lastOutput as Output;
    }

    lastInput = input;
    lastOutput = selector(input);
    return lastOutput;
  };
}
