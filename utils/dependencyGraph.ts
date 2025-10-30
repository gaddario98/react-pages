/**
 * Dependency Graph Module
 * Tracks component dependencies for selective re-rendering optimization
 *
 * @module utils/dependencyGraph
 */

/**
 * Represents a node in the dependency graph
 * Tracks which queries, form values, and mutations a component depends on
 */
export interface DependencyNode {
  /** Unique identifier for this component */
  componentId: string;

  /** Query keys this component depends on */
  usedQueries: string[];

  /** Form field keys this component depends on */
  usedFormValues: string[];

  /** Mutation keys this component uses */
  usedMutations: string[];

  /** Parent component ID (null for root) */
  parentComponent: string | null;

  /** Child component IDs */
  childComponents: string[];
}

/**
 * Manages component dependencies for efficient selective re-rendering
 *
 * @example
 * ```typescript
 * const graph = new DependencyGraph();
 *
 * // Register a component and its dependencies
 * graph.addNode({
 *   componentId: 'item-1',
 *   usedQueries: ['getUser', 'getPosts'],
 *   usedFormValues: ['username'],
 *   usedMutations: ['updateProfile'],
 *   parentComponent: null,
 *   childComponents: [],
 * });
 *
 * // Find affected components when query updates
 * const affected = graph.getAffectedComponents(['getUser']);
 * // Returns: ['item-1']
 * ```
 */
export class DependencyGraph {
  private nodes: Map<string, DependencyNode> = new Map();

  /**
   * Register a component and its dependencies in the graph
   * @param node The dependency node to add
   */
  addNode(node: DependencyNode): void {
    this.nodes.set(node.componentId, node);

    // Update parent's children list if parent exists
    if (node.parentComponent) {
      const parent = this.nodes.get(node.parentComponent);
      if (
        parent &&
        !parent.childComponents.includes(node.componentId)
      ) {
        parent.childComponents.push(node.componentId);
      }
    }
  }

  /**
   * Retrieve a dependency node by component ID
   * @param componentId The component ID to look up
   * @returns The dependency node or undefined if not found
   */
  getNode(componentId: string): DependencyNode | undefined {
    return this.nodes.get(componentId);
  }

  /**
   * Find all components affected by changed data keys
   * Used to determine which components need re-rendering
   *
   * @param changedKeys Array of changed query keys or form field keys
   * @returns Array of component IDs that need re-rendering
   */
  getAffectedComponents(changedKeys: string[]): string[] {
    const affected: string[] = [];

    for (const [componentId, node] of this.nodes.entries()) {
      // Check if any changed key matches this component's dependencies
      const hasAffectedQuery = node.usedQueries.some(q =>
        changedKeys.includes(q)
      );
      const hasAffectedFormValue = node.usedFormValues.some(f =>
        changedKeys.includes(f)
      );
      const hasAffectedMutation = node.usedMutations.some(m =>
        changedKeys.includes(m)
      );

      if (hasAffectedQuery || hasAffectedFormValue || hasAffectedMutation) {
        affected.push(componentId);
      }
    }

    return affected;
  }

  /**
   * Detect circular dependencies in the graph
   * Helps identify configuration errors that could cause infinite loops
   *
   * @returns Array of circular dependency paths for debugging
   */
  detectCircularDependencies(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const stack = new Set<string>();

    const dfs = (nodeId: string, path: string[]): void => {
      if (stack.has(nodeId)) {
        // Found a cycle
        const cycleStart = path.indexOf(nodeId);
        if (cycleStart >= 0) {
          cycles.push(path.slice(cycleStart).concat(nodeId));
        }
        return;
      }

      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      stack.add(nodeId);
      path.push(nodeId);

      const node = this.nodes.get(nodeId);
      if (node) {
        for (const childId of node.childComponents) {
          dfs(childId, [...path]);
        }
      }

      stack.delete(nodeId);
    };

    // Check for cycles starting from each unvisited node
    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        dfs(nodeId, []);
      }
    }

    return cycles;
  }

  /**
   * Get all nodes in the graph
   * @returns Map of all dependency nodes
   */
  getAllNodes(): Map<string, DependencyNode> {
    return new Map(this.nodes);
  }

  /**
   * Clear all nodes from the graph
   */
  clear(): void {
    this.nodes.clear();
  }

  /**
   * Get the size of the graph (number of nodes)
   */
  size(): number {
    return this.nodes.size;
  }

  /**
   * Check if a node exists in the graph
   */
  hasNode(componentId: string): boolean {
    return this.nodes.has(componentId);
  }

  /**
   * Remove a node from the graph
   * @param componentId The component ID to remove
   */
  removeNode(componentId: string): void {
    const node = this.nodes.get(componentId);
    if (!node) return;

    // Update parent's children list
    if (node.parentComponent) {
      const parent = this.nodes.get(node.parentComponent);
      if (parent) {
        parent.childComponents = parent.childComponents.filter(
          id => id !== componentId
        );
      }
    }

    // Update children's parent reference
    for (const childId of node.childComponents) {
      const child = this.nodes.get(childId);
      if (child) {
        child.parentComponent = null;
      }
    }

    this.nodes.delete(componentId);
  }

  /**
   * Get the depth of a component in the dependency tree
   * @param componentId The component ID
   * @returns The depth (0 for root)
   */
  getDepth(componentId: string): number {
    const node = this.nodes.get(componentId);
    if (!node || !node.parentComponent) return 0;

    let depth = 1;
    let parent = this.nodes.get(node.parentComponent);
    while (parent && parent.parentComponent) {
      depth++;
      parent = this.nodes.get(parent.parentComponent);
    }
    return depth;
  }

  /**
   * Get all leaf nodes (components with no children)
   */
  getLeafNodes(): DependencyNode[] {
    return Array.from(this.nodes.values()).filter(
      node => node.childComponents.length === 0
    );
  }

  /**
   * Get all root nodes (components with no parent)
   */
  getRootNodes(): DependencyNode[] {
    return Array.from(this.nodes.values()).filter(
      node => node.parentComponent === null
    );
  }
}
