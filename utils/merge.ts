import { shallowEqual } from './optimization';

type WithKey<T> = T & { key: string | number };

/**
 * Optimized merge function for arrays of objects with keys
 * Maintains object references if they haven't changed
 * @param prev - Previous array of objects with keys
 * @param next - Next array of objects with keys
 * @returns Merged array with preserved references where possible
 */
export function mergeByKey<T extends Record<string, any>>(
  prev: WithKey<T>[],
  next: WithKey<T>[]
): WithKey<T>[] {
  if (!prev.length) return next;
  if (!next.length) return [];
  
  const prevMap = new Map<string | number, WithKey<T>>();
  prev.forEach((item) => prevMap.set(item.key, item));
  
  return next.map((item) => {
    const prevItem = prevMap.get(item.key);
    
    if (prevItem && shallowEqual(prevItem, item)) {
      return prevItem;
    }
    
    return item;
  });
}

/**
 * Checks if two arrays with keys have the same elements
 * @param arrA - First array to compare
 * @param arrB - Second array to compare
 * @returns True if arrays are equal
 */
export function arraysWithKeyEqual<T extends Record<string, any>>(
  arrA: WithKey<T>[],
  arrB: WithKey<T>[]
): boolean {
  if (arrA.length !== arrB.length) return false;
  
  for (let i = 0; i < arrA.length; i++) {
    if (!shallowEqual(arrA[i], arrB[i])) return false;
  }
  
  return true;
}

/**
 * Stable cache implementation for objects with keys
 * Provides intelligent caching with shallow equality checks
 */
export class StableCache<T extends Record<string, any>> {
  private cache = new Map<string, WithKey<T>>();
  
  get(key: string | number): WithKey<T> | undefined {
    return this.cache.get(String(key));
  }
  
  set(key: string | number, value: WithKey<T>): void {
    this.cache.set(String(key), value);
  }
  
  getOrSet(key: string | number, value: WithKey<T>): WithKey<T> {
    const existing = this.get(key);
    if (existing && shallowEqual(existing, value)) {
      return existing;
    }
    this.set(key, value);
    return value;
  }
  
  clear(): void {
    this.cache.clear();
  }
}