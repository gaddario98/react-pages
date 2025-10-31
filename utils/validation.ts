/**
 * Validation utilities for PageProps and related configurations
 * Provides warnings for common configuration issues
 *
 * @module utils/validation
 */

import type { PageProps, ContentItem } from '../types';
import type { FieldValues } from 'react-hook-form';
import type { QueriesArray } from '@gaddario98/react-queries';

/**
 * Validation result for a specific rule
 */
interface ValidationIssue {
  level: 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
}

/**
 * Validates PageProps configuration and returns warnings/errors
 * @param props - PageProps to validate
 * @returns Array of validation issues (empty if valid)
 */
export function validatePageProps<F extends FieldValues, Q extends QueriesArray>(
  props: PageProps<F, Q>
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Rule 1: Page ID should not be empty
  if (!props.id || props.id.trim() === '') {
    issues.push({
      level: 'warn',
      message: '[PageProps] Page ID is empty or missing. This may cause issues with React keys and analytics tracking.',
      context: { id: props.id },
    });
  }

  // Rule 2: Page should have at least one content source
  const hasContent = !!props.contents && (
    Array.isArray(props.contents) ? props.contents.length > 0 : true
  );
  const hasForm = !!props.form;
  const hasQueries = !!props.queries && props.queries.length > 0;

  if (!hasContent && !hasForm && !hasQueries) {
    issues.push({
      level: 'warn',
      message: '[PageProps] Page has no contents, form, or queries. This results in an empty page.',
      context: {
        contents: !!props.contents,
        form: !!props.form,
        queries: !!props.queries,
      },
    });
  }

  // Rule 3: Check for circular dependencies in content items
  if (props.contents && Array.isArray(props.contents)) {
    const circularDeps = detectCircularDependencies(props.contents, props.queries as Q);
    if (circularDeps.length > 0) {
      issues.push({
        level: 'warn',
        message: '[PageProps] Circular dependencies detected in content items. This may cause performance issues.',
        context: { circularDependencies: circularDeps },
      });
    }
  }

  // Rule 4: Validate query key references in content items
  if (props.contents && Array.isArray(props.contents) && props.queries) {
    const invalidRefs = validateQueryReferences(props.contents, props.queries as Q);
    if (invalidRefs.length > 0) {
      issues.push({
        level: 'warn',
        message: '[PageProps] Content items reference non-existent query keys.',
        context: { invalidReferences: invalidRefs },
      });
    }
  }

  return issues;
}

/**
 * Logs validation issues to console
 * @param issues - Array of validation issues to log
 */
export function logValidationIssues(issues: ValidationIssue[]): void {
  if (typeof console === 'undefined') return;

  issues.forEach((issue) => {
    const logFn = issue.level === 'error' ? console.error : console.warn;
    logFn(issue.message);

    if (issue.context && process.env.NODE_ENV === 'development') {
      console.log('Context:', issue.context);
    }
  });
}

/**
 * Validates PageProps and logs issues (convenience function)
 * @param props - PageProps to validate
 */
export function validateAndLogPageProps<F extends FieldValues, Q extends QueriesArray>(
  props: PageProps<F, Q>
): void {
  const issues = validatePageProps(props);
  if (issues.length > 0) {
    logValidationIssues(issues);
  }
}

/**
 * Detects circular dependencies in content items
 * Basic implementation - checks if items reference each other circularly
 * @param contents - Array of content items
 * @param queries - Array of query configurations
 * @returns Array of circular dependency paths
 */
function detectCircularDependencies<F extends FieldValues, Q extends QueriesArray>(
  contents: ContentItem<F, Q>[],
  queries?: Q
): string[][] {
  const cycles: string[][] = [];

  // Build a dependency graph from content items
  const graph = new Map<string, Set<string>>();

  contents.forEach((item, index) => {
    const itemId = item.key || `content-${index}`;
    const deps = new Set<string>();

    // Add query dependencies
    if (item.usedQueries) {
      item.usedQueries.forEach((queryKey) => {
        deps.add(`query:${String(queryKey)}`);
      });
    }

    // Add form value dependencies
    if (item.usedFormValues) {
      item.usedFormValues.forEach((formKey) => {
        deps.add(`form:${String(formKey)}`);
      });
    }

    graph.set(itemId, deps);
  });

  // Simple cycle detection (DFS)
  const visited = new Set<string>();
  const recStack = new Set<string>();

  function dfs(node: string, path: string[]): void {
    if (recStack.has(node)) {
      // Cycle detected
      const cycleStart = path.indexOf(node);
      if (cycleStart !== -1) {
        cycles.push(path.slice(cycleStart).concat(node));
      }
      return;
    }

    if (visited.has(node)) return;

    visited.add(node);
    recStack.add(node);
    path.push(node);

    const neighbors = graph.get(node) || new Set();
    neighbors.forEach((neighbor) => {
      dfs(neighbor, [...path]);
    });

    recStack.delete(node);
  }

  // Run DFS from each node
  graph.forEach((_, node) => {
    if (!visited.has(node)) {
      dfs(node, []);
    }
  });

  return cycles;
}

/**
 * Validates that all query keys referenced in content items exist in queries array
 * @param contents - Array of content items
 * @param queries - Array of query configurations
 * @returns Array of invalid query references
 */
function validateQueryReferences<F extends FieldValues, Q extends QueriesArray>(
  contents: ContentItem<F, Q>[],
  queries: Q
): Array<{ itemKey: string; invalidQueryKey: string }> {
  const invalidRefs: Array<{ itemKey: string; invalidQueryKey: string }> = [];

  const validQueryKeys = new Set(queries.map((q) => q.key));

  contents.forEach((item, index) => {
    const itemKey = item.key || `content-${index}`;

    if (item.usedQueries) {
      item.usedQueries.forEach((queryKey) => {
        if (!validQueryKeys.has(queryKey as any)) {
          invalidRefs.push({
            itemKey,
            invalidQueryKey: String(queryKey),
          });
        }
      });
    }

    // Recursively check container items
    if (item.type === 'container' && item.items) {
      const containerItems = Array.isArray(item.items) ? item.items : [];
      const nestedInvalidRefs = validateQueryReferences(containerItems, queries);
      invalidRefs.push(...nestedInvalidRefs);
    }
  });

  return invalidRefs;
}
