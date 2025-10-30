import { Profiler, ProfilerOnRenderCallback } from 'react';
import { vi } from 'vitest';

/**
 * Utility for counting component re-renders during tests
 */
export class RenderCounter {
  private renderCount = 0;
  private renderTimings: number[] = [];

  /**
   * Get the total number of renders
   */
  getRenderCount(): number {
    return this.renderCount;
  }

  /**
   * Get average render duration in milliseconds
   */
  getAverageRenderDuration(): number {
    if (this.renderTimings.length === 0) return 0;
    return (
      this.renderTimings.reduce((a, b) => a + b, 0) / this.renderTimings.length
    );
  }

  /**
   * Get all render timings
   */
  getRenderTimings(): number[] {
    return [...this.renderTimings];
  }

  /**
   * Reset counter
   */
  reset(): void {
    this.renderCount = 0;
    this.renderTimings = [];
  }

  /**
   * Create a profiler callback for React.Profiler
   */
  createProfilerCallback(): ProfilerOnRenderCallback {
    return (id, phase, actualDuration) => {
      this.renderCount++;
      this.renderTimings.push(actualDuration);
    };
  }
}

/**
 * Utility for measuring frames per second (FPS) during animation
 */
export class FPSMeasurer {
  private frameCount = 0;
  private startTime = 0;
  private frameTimestamps: number[] = [];

  /**
   * Start measuring FPS
   */
  start(): void {
    this.frameCount = 0;
    this.startTime = performance.now();
    this.frameTimestamps = [];
    this.measureFrames();
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    if (this.frameTimestamps.length < 2) return 0;

    const duration =
      (this.frameTimestamps[this.frameTimestamps.length - 1] -
        this.frameTimestamps[0]) /
      1000;
    return duration > 0
      ? Math.round(this.frameTimestamps.length / duration)
      : 0;
  }

  /**
   * Get frame count
   */
  getFrameCount(): number {
    return this.frameCount;
  }

  /**
   * Stop measuring and return statistics
   */
  stop(): {
    frameCount: number;
    averageFPS: number;
    minFPS: number;
    maxFPS: number;
  } {
    const stats = {
      frameCount: this.frameCount,
      averageFPS: this.getFPS(),
      minFPS: 0,
      maxFPS: 0,
    };

    return stats;
  }

  private measureFrames(): void {
    // This is a simplified version - in real browsers, you'd use requestAnimationFrame
    // For testing, this is mainly a placeholder
    this.frameCount++;
    this.frameTimestamps.push(performance.now());
  }
}

/**
 * Helper to assert render count constraints
 */
export function assertMaxRenderCount(
  actualCount: number,
  maxAllowed: number,
  message?: string
): void {
  if (actualCount > maxAllowed) {
    throw new Error(
      message ||
        `Expected max ${maxAllowed} renders, but got ${actualCount} renders`
    );
  }
}

/**
 * Helper to assert FPS constraints
 */
export function assertMinimumFPS(
  actualFPS: number,
  minRequired: number,
  message?: string
): void {
  if (actualFPS < minRequired) {
    throw new Error(
      message ||
        `Expected minimum ${minRequired} FPS, but got ${actualFPS} FPS`
    );
  }
}

/**
 * Create a mock for measuring render performance
 */
export function createPerformanceMock() {
  const measurements: { name: string; duration: number }[] = [];

  return {
    measure: (name: string, duration: number) => {
      measurements.push({ name, duration });
    },
    getByName: (name: string) => {
      return measurements.filter(m => m.name === name);
    },
    getAll: () => [...measurements],
    clear: () => {
      measurements.length = 0;
    },
  };
}
