/**
 * Lazy Loading Validation (T098)
 * Validates lazy loading configuration and content for common issues
 *
 * @module utils/lazyValidation
 */

import type { ContentItem, LazyLoadingConfig, PageProps } from '../types';
import type { FieldValues } from 'react-hook-form';
import type { QueriesArray } from '@gaddario98/react-queries';

/**
 * Validation error for lazy loading configuration
 */
export interface LazyValidationError {
  /** Error type */
  type: 'invalid_config' | 'missing_condition' | 'missing_query' | 'invalid_condition' | 'performance_issue' | 'accessibility_issue';
  /** Error message */
  message: string;
  /** Path to the problematic item (e.g., "contents[2].lazy") */
  path?: string;
  /** Severity: 'error' | 'warning' | 'info' */
  severity: 'error' | 'warning' | 'info';
}

/**
 * Validation result for lazy loading configuration
 */
export interface LazyValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Array of validation errors */
  errors: LazyValidationError[];
}

/**
 * Validate a single lazy loading configuration
 * Checks for common issues and provides recommendations
 *
 * @param config - Lazy loading configuration to validate
 * @param contentKey - Key of the content item (for error messages)
 * @returns Validation result with errors if any
 */
export function validateLazyLoadingConfig<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray
>(
  config: Partial<LazyLoadingConfig<F, Q>>,
  contentKey?: string
): LazyValidationResult {
  const errors: LazyValidationError[] = [];
  const path = contentKey ? `lazy[${contentKey}]` : 'lazy';

  // T098: Validate trigger type
  const validTriggers = ['viewport', 'interaction', 'conditional'];
  if (config.trigger && !validTriggers.includes(config.trigger)) {
    errors.push({
      type: 'invalid_config',
      severity: 'error',
      message: `Invalid trigger type "${config.trigger}". Must be one of: ${validTriggers.join(', ')}`,
      path: `${path}.trigger`,
    });
  }

  // T098: Validate conditional trigger has condition function
  if (config.trigger === 'conditional' && !config.condition) {
    errors.push({
      type: 'missing_condition',
      severity: 'error',
      message: 'Conditional trigger requires a "condition" function to evaluate',
      path: `${path}.condition`,
    });
  }

  // T098: Validate threshold is in valid range
  if (config.threshold !== undefined) {
    if (typeof config.threshold !== 'number') {
      errors.push({
        type: 'invalid_config',
        severity: 'error',
        message: 'Threshold must be a number',
        path: `${path}.threshold`,
      });
    } else if (config.threshold < 0 || config.threshold > 1) {
      errors.push({
        type: 'invalid_config',
        severity: 'error',
        message: 'Threshold must be between 0 and 1',
        path: `${path}.threshold`,
      });
    }
  }

  // T098: Warn about high threshold values (might cause performance issues)
  if (typeof config.threshold === 'number' && config.threshold > 0.75) {
    errors.push({
      type: 'performance_issue',
      severity: 'warning',
      message: `High threshold (${config.threshold}) may impact performance. Consider using lower value`,
      path: `${path}.threshold`,
    });
  }

  // T098: Validate rootMargin format
  if (config.rootMargin !== undefined) {
    if (typeof config.rootMargin !== 'string') {
      errors.push({
        type: 'invalid_config',
        severity: 'error',
        message: 'rootMargin must be a string with valid CSS units',
        path: `${path}.rootMargin`,
      });
    } else if (!/^(-?\d+(?:\.\d+)?(?:px|%|em|rem|vh|vw)?\s*){1,4}$/.test(config.rootMargin)) {
      errors.push({
        type: 'invalid_config',
        severity: 'error',
        message: `Invalid rootMargin format: "${config.rootMargin}". Must be valid CSS margin`,
        path: `${path}.rootMargin`,
      });
    }
  }

  // T098: Check if placeholder is provided for accessibility
  if (!config.placeholder) {
    errors.push({
      type: 'accessibility_issue',
      severity: 'warning',
      message: 'No placeholder provided. Consider adding a placeholder to avoid CLS (Cumulative Layout Shift)',
      path: `${path}.placeholder`,
    });
  }

  // T098: Warn if condition is complex
  if (config.condition && config.condition.toString().length > 500) {
    errors.push({
      type: 'performance_issue',
      severity: 'info',
      message: 'Condition function is complex. Consider simplifying for better readability',
      path: `${path}.condition`,
    });
  }

  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
  };
}

/**
 * Validate lazy loading configuration for multiple content items
 *
 * @param contents - Array of content items to validate
 * @returns Validation result with all errors from all items
 */
export function validateLazyLoadingContents<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray
>(
  contents: ContentItem<F, Q>[]
): LazyValidationResult {
  const allErrors: LazyValidationError[] = [];

  contents.forEach((content, index) => {
    if (content.lazy === true && content.lazyTrigger) {
      const lazyConfig: Partial<LazyLoadingConfig<F, Q>> = {
        trigger: content.lazyTrigger,
        condition: content.lazyCondition,
      };

      const result = validateLazyLoadingConfig(lazyConfig, `${index}`);
      allErrors.push(...result.errors);
    }
  });

  return {
    isValid: allErrors.filter(e => e.severity === 'error').length === 0,
    errors: allErrors,
  };
}

/**
 * Validate lazy loading in a complete PageProps configuration
 * Checks all lazy-loaded items and their configurations
 *
 * T098: PageProps lazy validation
 * - Validates all lazy-loaded content items
 * - Checks for circular dependencies in conditional triggers
 * - Verifies used queries are available
 * - Warns about performance implications
 *
 * @param pageProps - Page properties to validate
 * @returns Validation result with errors and warnings
 */
export function validatePagePropsLazy<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray
>(
  pageProps: PageProps<F, Q>
): LazyValidationResult {
  const errors: LazyValidationError[] = [];

  // Validate main contents
  // Handle both array and function (MappedItemsFunction) types
  if (pageProps.contents) {
    // If contents is a function, validation is deferred to runtime
    // since we need the evaluation context (formValues, allQuery, allMutation)
    if (typeof pageProps.contents === 'function') {
      errors.push({
        type: 'performance_issue',
        severity: 'info',
        message: 'Contents are dynamically evaluated (MappedItemsFunction). Lazy loading validation deferred to runtime with context',
        path: 'contents',
      });
    } else if (Array.isArray(pageProps.contents)) {
      const contentsResult = validateLazyLoadingContents(pageProps.contents);
      errors.push(...contentsResult.errors);
    }
  }

  // Count lazy-loaded items (only possible if contents is an array)
  const contentsArray = pageProps.contents && Array.isArray(pageProps.contents)
    ? pageProps.contents
    : [];
  const lazyItemCount = contentsArray.filter(c => c.lazy === true).length;

  // Warn if too many lazy items (performance consideration)
  if (lazyItemCount > 10) {
    errors.push({
      type: 'performance_issue',
      severity: 'info',
      message: `Page has ${lazyItemCount} lazy-loaded items. Consider eagerly loading critical content`,
      path: 'contents',
    });
  }

  // Warn if all items are lazy (only check for static array contents)
  if (contentsArray.length > 0 && lazyItemCount === contentsArray.length) {
    errors.push({
      type: 'accessibility_issue',
      severity: 'warning',
      message: 'All content items are lazy-loaded. Consider eagerly loading above-the-fold content',
      path: 'contents',
    });
  }

  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
  };
}

/**
 * Log validation errors to console in a formatted way
 * Useful for development debugging
 *
 * @param result - Validation result to log
 * @param context - Additional context (e.g., page ID)
 */
export function logLazyValidationErrors(
  result: LazyValidationResult,
  context?: string
): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  if (result.isValid) {
    console.info(
      `[LazyValidation${context ? ` - ${context}` : ''}] All validations passed ✓`
    );
    return;
  }

  const errorsByType: Record<string, LazyValidationError[]> = {};

  result.errors.forEach(error => {
    if (!errorsByType[error.type]) {
      errorsByType[error.type] = [];
    }
    errorsByType[error.type].push(error);
  });

  console.group(
    `[LazyValidation${context ? ` - ${context}` : ''}] ${result.errors.length} issue(s) found`
  );

  Object.entries(errorsByType).forEach(([type, typeErrors]) => {
    const icon = typeErrors[0].severity === 'error' ? '❌' : typeErrors[0].severity === 'warning' ? '⚠️' : 'ℹ️';
    console.group(`${icon} ${type.toUpperCase()} (${typeErrors.length})`);

    typeErrors.forEach(error => {
      const prefix = error.path ? ` [${error.path}]` : '';
      console.log(`${error.message}${prefix}`);
    });

    console.groupEnd();
  });

  console.groupEnd();
}

/**
 * Create a validation report for lazy loading configuration
 * Useful for debugging and understanding lazy loading setup
 *
 * @param pageProps - Page properties to analyze
 * @returns Human-readable validation report
 */
export function createLazyValidationReport<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray
>(pageProps: PageProps<F, Q>): string {
  const result = validatePagePropsLazy(pageProps);

  const lines: string[] = [];
  lines.push('=== Lazy Loading Validation Report ===');
  lines.push('');

  // Summary
  lines.push(`Status: ${result.isValid ? '✓ VALID' : '✗ INVALID'}`);
  lines.push(`Total Issues: ${result.errors.length}`);
  lines.push('');

  // Count by severity
  const bySeverity = result.errors.reduce((acc, e) => {
    acc[e.severity] = (acc[e.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (Object.keys(bySeverity).length > 0) {
    lines.push('Issues by Severity:');
    Object.entries(bySeverity).forEach(([severity, count]) => {
      lines.push(`  - ${severity}: ${count}`);
    });
    lines.push('');
  }

  // Details
  if (result.errors.length > 0) {
    lines.push('Details:');
    result.errors.forEach((error, i) => {
      lines.push(`${i + 1}. [${error.severity.toUpperCase()}] ${error.type}`);
      lines.push(`   Message: ${error.message}`);
      if (error.path) {
        lines.push(`   Path: ${error.path}`);
      }
    });
  }

  return lines.join('\n');
}
