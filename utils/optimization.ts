/**
 * Optimized shallow equality check for objects and functions
 * @param objA - First object to compare
 * @param objB - Second object to compare
 * @returns True if objects are shallow equal
 */
export function shallowEqual(objA: any, objB: any): boolean {
  if (objA === objB) return true;
  
  if (!objA || !objB) return false;
  
  if (typeof objA !== 'object' || typeof objB !== 'object') {
    return objA === objB;
  }
  
  if (typeof objA === 'function' && typeof objB === 'function') {
    return objA.name === objB.name && objA.toString() === objB.toString();
  }
  
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    
    const valA = objA[key];
    const valB = objB[key];
    
    if (typeof valA === 'function' && typeof valB === 'function') {
      if (valA.name !== valB.name || valA.toString() !== valB.toString()) {
        return false;
      }
      continue;
    }
    
    if (valA !== valB) return false;
  }
  
  return true;
}

/**
 * Checks if a value is stable for React dependency arrays
 * @param value - Value to check for stability
 * @returns True if value is considered stable
 */
export function isStableValue(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'object' && typeof value !== 'function') return true;
  if (typeof value === 'function') return value.toString().length < 1000;
  return false;
}

/**
 * Creates an optimized dependency array by filtering unstable values
 * @param deps - Array of dependencies to optimize
 * @returns Filtered array of stable dependencies
 */
export function optimizeDeps(deps: any[]): any[] {
  return deps.filter(dep => isStableValue(dep) || typeof dep === 'object');
}