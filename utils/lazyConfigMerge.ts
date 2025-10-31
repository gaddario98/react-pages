/**
 * Global Lazy Loading Configuration Merging (T096)
 * Provides utilities for merging global, page-level, and item-level lazy loading configs
 * with proper precedence (item > page > global)
 *
 * @module utils/lazyConfigMerge
 */

import type { LazyLoadingConfig } from '../types';

/**
 * Global default lazy loading configuration
 * Can be set at app initialization
 */
let globalLazyConfig: Partial<LazyLoadingConfig> = {
  trigger: 'viewport',
  threshold: 0.1,
  rootMargin: '100px',
};

/**
 * Set global default lazy loading configuration
 * This is applied to all lazy-loaded content unless overridden
 *
 * @example
 * ```typescript
 * // App initialization
 * setGlobalLazyConfig({
 *   trigger: 'viewport',
 *   threshold: 0.2,
 *   rootMargin: '200px',
 *   placeholder: {
 *     content: <GlobalLoadingPlaceholder />,
 *     style: { minHeight: '150px' }
 *   }
 * });
 * ```
 */
export function setGlobalLazyConfig(config: Partial<LazyLoadingConfig>): void {
  globalLazyConfig = { ...globalLazyConfig, ...config };
}

/**
 * Get the current global lazy loading configuration
 */
export function getGlobalLazyConfig(): Readonly<Partial<LazyLoadingConfig>> {
  return Object.freeze({ ...globalLazyConfig });
}

/**
 * Reset global lazy loading configuration to defaults
 */
export function resetGlobalLazyConfig(): void {
  globalLazyConfig = {
    trigger: 'viewport',
    threshold: 0.1,
    rootMargin: '100px',
  };
}

/**
 * Merge lazy loading configurations with proper precedence
 * Precedence: item > page > global > defaults
 *
 * T096: Configuration merging for lazy loading hierarchy
 * - Global config: Set once at app initialization, applies to all lazy content
 * - Page config: Override global for specific pages
 * - Item config: Override page for specific items
 *
 * @param itemConfig - Item-level configuration (highest precedence)
 * @param pageConfig - Page-level configuration (medium precedence)
 * @param globalOverride - Optional global override (for testing or temporary changes)
 * @returns Merged lazy loading configuration
 *
 * @example
 * ```typescript
 * // Global default
 * setGlobalLazyConfig({ trigger: 'viewport', threshold: 0.1 });
 *
 * // Page-specific override
 * const pageConfig: LazyLoadingConfig = {
 *   trigger: 'interaction',
 *   threshold: 0.5
 * };
 *
 * // Item-specific override
 * const itemConfig: LazyLoadingConfig = {
 *   trigger: 'conditional',
 *   condition: ({ user }) => user.isPremium
 * };
 *
 * // Result will have item > page > global precedence
 * const merged = mergeLazyConfigs(itemConfig, pageConfig);
 * ```
 */
export function mergeLazyConfigs(
  itemConfig?: Partial<LazyLoadingConfig>,
  pageConfig?: Partial<LazyLoadingConfig>,
  globalOverride?: Partial<LazyLoadingConfig>
): LazyLoadingConfig {
  // Start with global config
  const baseConfig = globalOverride || globalLazyConfig;

  // Merge with page-level config
  const withPageConfig = {
    ...baseConfig,
    ...(pageConfig || {}),
  };

  // Merge with item-level config (highest priority)
  const finalConfig = {
    ...withPageConfig,
    ...(itemConfig || {}),
  };

  // Apply sensible defaults for any missing required fields
  return {
    trigger: finalConfig.trigger || 'viewport',
    threshold: finalConfig.threshold ?? 0.1,
    rootMargin: finalConfig.rootMargin || '100px',
    placeholder: finalConfig.placeholder,
    condition: finalConfig.condition,
  } as LazyLoadingConfig;
}

/**
 * Validate lazy loading configuration
 * Checks for invalid combinations or missing required fields
 *
 * @param config - Lazy loading configuration to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateLazyConfig(config: Partial<LazyLoadingConfig>): string[] {
  const errors: string[] = [];

  if (config.trigger === 'conditional' && !config.condition) {
    errors.push('Conditional trigger requires a condition function');
  }

  if (config.threshold !== undefined) {
    if (Array.isArray(config.threshold)) {
      for (const t of config.threshold) {
        if (t < 0 || t > 1) {
          errors.push('Threshold must be between 0 and 1');
          break;
        }
      }
    } else {
      if (config.threshold < 0 || config.threshold > 1) {
        errors.push('Threshold must be between 0 and 1');
      }
    }
  }

  if (config.rootMargin !== undefined) {
    // Basic validation - should be valid CSS margin value
    if (!/^(-?\d+(?:\.\d+)?(?:px|%|em|rem|vh|vw)?\s*){1,4}$/.test(config.rootMargin)) {
      errors.push('rootMargin must be a valid CSS margin value');
    }
  }

  return errors;
}

/**
 * Create a lazy config factory for pages with common settings
 * Useful for standardizing lazy loading behavior across a feature or module
 *
 * @example
 * ```typescript
 * // Dashboard module lazy config factory
 * const dashboardLazyConfig = createLazyConfigFactory({
 *   trigger: 'viewport',
 *   threshold: 0.2,
 *   placeholder: { content: <DashboardSkeleton /> }
 * });
 *
 * // Use in page
 * const pageLazyConfig = dashboardLazyConfig();
 *
 * // Override specific settings
 * const chartLazyConfig = dashboardLazyConfig({ trigger: 'interaction' });
 * ```
 */
export function createLazyConfigFactory(
  baseConfig: Partial<LazyLoadingConfig>
) {
  return (overrides?: Partial<LazyLoadingConfig>): LazyLoadingConfig => {
    return mergeLazyConfigs(overrides, baseConfig);
  };
}

/**
 * Check if lazy loading is enabled for a configuration
 * Considers both the config and any global disable flag
 */
export function isLazyLoadingEnabled(config?: Partial<LazyLoadingConfig>): boolean {
  // Check if explicitly disabled in item config
  if (config?.trigger === undefined && Object.keys(config || {}).length === 0) {
    return false;
  }

  // Check global disable (if someone manually set it)
  if ((globalLazyConfig?.trigger as string) === 'disabled') {
    return false;
  }

  return true;
}

/**
 * Get lazy config for a specific item in a collection
 * Useful for batch lazy loading with different configs
 *
 * @param itemIndex - Index of the item in collection
 * @param totalItems - Total number of items
 * @param baseConfig - Base lazy configuration
 * @returns Lazy configuration for this specific item
 */
export function getLazyConfigForItem(
  itemIndex: number,
  totalItems: number,
  baseConfig?: Partial<LazyLoadingConfig>
): LazyLoadingConfig {
  // For first few items, disable lazy loading (load eagerly)
  const eagerLoadCount = 3;
  if (itemIndex < eagerLoadCount) {
    return {
      trigger: 'viewport',
      threshold: 1, // Load immediately
      rootMargin: '0px',
    };
  }

  // For items near the end, increase threshold for earlier loading
  const threshold = itemIndex > totalItems - 5 ? 0.5 : 0.1;

  return mergeLazyConfigs(
    { threshold, ...baseConfig },
    undefined
  );
}
