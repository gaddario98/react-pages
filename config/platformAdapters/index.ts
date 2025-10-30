/**
 * Platform Adapters Module
 * Exports platform-specific adapters and detection utilities
 *
 * @module config/platformAdapters
 */

export * from './base';
export * from './web';
export * from './native';

import type { PlatformAdapter } from './base';
import { webAdapter } from './web';
import { nativeAdapter, isReactNative } from './native';

/**
 * Detect the current platform and return appropriate adapter
 *
 * Detection logic:
 * 1. Check for React Native via navigator.product
 * 2. Check for web browser environment (typeof document !== 'undefined')
 * 3. Default to web adapter for SSR and other environments
 *
 * @returns Platform-specific adapter
 */
export function detectPlatform(): PlatformAdapter {
  // React Native detection
  if (isReactNative()) {
    return nativeAdapter;
  }

  // Web/browser detection (including SSR which will have document undefined initially)
  return webAdapter;
}

/**
 * Get default platform adapter based on current environment
 * This is the main export that consumers should use
 */
export const defaultAdapter = detectPlatform();

/**
 * Platform adapter registry for custom adapters
 * Allows consumers to register their own platform-specific implementations
 */
class PlatformAdapterRegistry {
  private adapters = new Map<string, PlatformAdapter>();
  private currentAdapter: PlatformAdapter = defaultAdapter;

  /**
   * Register a custom platform adapter
   */
  register(name: string, adapter: PlatformAdapter): void {
    this.adapters.set(name, adapter);
  }

  /**
   * Get an adapter by name
   */
  get(name: string): PlatformAdapter | undefined {
    return this.adapters.get(name);
  }

  /**
   * Set the current active adapter
   */
  setActive(name: string): void {
    const adapter = this.adapters.get(name);
    if (adapter) {
      this.currentAdapter = adapter;
    } else {
      console.warn(`[PlatformAdapterRegistry] Adapter "${name}" not found`);
    }
  }

  /**
   * Get the current active adapter
   */
  getActive(): PlatformAdapter {
    return this.currentAdapter;
  }

  /**
   * Reset to default adapter
   */
  reset(): void {
    this.currentAdapter = defaultAdapter;
  }
}

/**
 * Global adapter registry instance
 */
export const adapterRegistry = new PlatformAdapterRegistry();

// Register built-in adapters
adapterRegistry.register('web', webAdapter);
adapterRegistry.register('native', nativeAdapter);
