/**
 * useDependencyGraph Hook
 * Manages component dependency tracking for selective re-rendering
 *
 * @module hooks/useDependencyGraph
 */

import { useRef, useCallback, useMemo } from "react";
import { DependencyGraph, DependencyNode } from "../utils/dependencyGraph";
import { ContentItem } from "../types";
import { FieldValues } from "react-hook-form";
import { QueriesArray } from "@gaddario98/react-queries";

/**
 * Hook for managing a dependency graph within a page
 * Provides methods to register components and find affected components
 *
 * @example
 * ```typescript
 * function PageRenderer() {
 *   const {
 *     graph,
 *     registerComponent,
 *     getAffectedComponents,
 *     detectCircularDependencies
 *   } = useDependencyGraph();
 *
 *   // Register content items
 *   useEffect(() => {
 *     contentItems.forEach((item, index) => {
 *       registerComponent({
 *         componentId: `item-${index}`,
 *         usedQueries: item.usedQueries || [],
 *         usedFormValues: item.usedFormValues || [],
 *         usedMutations: [],
 *         parentComponent: null,
 *         childComponents: [],
 *       });
 *     });
 *
 *     // Check for circular dependencies
 *     const cycles = detectCircularDependencies();
 *     if (cycles.length > 0) {
 *       console.warn('[DependencyGraph] Circular dependencies:', cycles);
 *     }
 *   }, [contentItems]);
 *
 *   // When query updates
 *   const handleQueryUpdate = useCallback((queryKey: string) => {
 *     const affected = getAffectedComponents([queryKey]);
 *     // Re-render only affected components
 *   }, [getAffectedComponents]);
 * }
 * ```
 */
export function useDependencyGraph() {
  const graphRef = useRef<DependencyGraph>(new DependencyGraph());

  /**
   * Register a component and its dependencies
   */
  const registerComponent = useCallback((node: DependencyNode) => {
    graphRef.current.addNode(node);
  }, []);

  /**
   * Get a specific node from the graph
   */
  const getNode = useCallback((componentId: string) => {
    return graphRef.current.getNode(componentId);
  }, []);

  /**
   * Find all components affected by changed keys
   */
  const getAffectedComponents = useCallback((changedKeys: string[]) => {
    return graphRef.current.getAffectedComponents(changedKeys);
  }, []);

  /**
   * Detect circular dependencies
   */
  const detectCircularDependencies = useCallback(() => {
    return graphRef.current.detectCircularDependencies();
  }, []);

  /**
   * Clear all nodes from the graph
   */
  const clear = useCallback(() => {
    graphRef.current.clear();
  }, []);

  /**
   * Remove a specific component from the graph
   */
  const removeComponent = useCallback((componentId: string) => {
    graphRef.current.removeNode(componentId);
  }, []);

  /**
   * Check if a component is registered
   */
  const hasComponent = useCallback((componentId: string) => {
    return graphRef.current.hasNode(componentId);
  }, []);

  /**
   * Get graph statistics
   */
  const getStats = useCallback(() => {
    return {
      totalNodes: graphRef.current.size(),
      rootNodes: graphRef.current.getRootNodes().length,
      leafNodes: graphRef.current.getLeafNodes().length,
    };
  }, []);

  // eslint-disable-next-line react-hooks/refs
  return useMemo(
    () => ({
      // eslint-disable-next-line react-hooks/refs
      graph: graphRef.current,
      registerComponent,
      getNode,
      getAffectedComponents,
      detectCircularDependencies,
      clear,
      removeComponent,
      hasComponent,
      getStats,
    }),
    [
      registerComponent,
      getNode,
      getAffectedComponents,
      detectCircularDependencies,
      clear,
      removeComponent,
      hasComponent,
      getStats,
    ]
  );
}

/**
 * Hook variant that automatically registers components from a list
 * Simplifies common use case of registering content items
 */
export function useAutoRegisterDependencies<
  F extends FieldValues,
  Q extends QueriesArray,
>(items: ContentItem<F, Q>[], idPrefix: string = "item") {
  const {
    graph,
    registerComponent,
    getAffectedComponents,
    detectCircularDependencies,
    clear,
  } = useDependencyGraph();

  // Register all items
  useMemo(() => {
    // Clear previous registrations
    clear();

    items.forEach((item, index) => {
      const componentId = item.key || `${idPrefix}-${index}`;
      registerComponent({
        componentId,
        usedQueries: item.usedQueries || [],
        usedFormValues: (item.usedFormValues as string[]) || [],
        usedMutations: [],
        parentComponent: null,
        childComponents: [],
      });
    });

    // Detect and warn about circular dependencies
    const cycles = detectCircularDependencies();
    if (cycles.length > 0 && typeof console !== "undefined") {
      console.warn(
        "[useDependencyGraph] Circular dependencies detected:",
        cycles
      );
    }
  }, [items, idPrefix, registerComponent, detectCircularDependencies, clear]);

  return {
    graph,
    getAffectedComponents,
  };
}
