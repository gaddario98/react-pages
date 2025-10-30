/**
 * Lifecycle Callbacks Hook (T074)
 * Provides lifecycle event definitions and management for pages
 * Enables developers to respond to key lifecycle events
 *
 * @module hooks/useLifecycleCallbacks
 */

import { FieldValues, UseFormSetValue } from 'react-hook-form';
import type { QueriesArray, AllMutation, MultipleQueryResponse } from '@gaddario98/react-queries';
import type { MappedItemsFunction } from '../types';

/**
 * Context passed to lifecycle callbacks
 * Contains all data and methods available during the lifecycle event
 */
export interface LifecycleContext<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray
> {
  /** Form values at time of event */
  formValues: F;

  /** Form setValue function */
  setValue: UseFormSetValue<F>;

  /** All query data */
  allQuery: MultipleQueryResponse<Q>;

  /** All mutations */
  allMutation: AllMutation<Q>;

  /** Page ID */
  pageId?: string;

  /** Namespace for i18n */
  ns?: string;
}

/**
 * Lifecycle callback fired when page mount is complete and all required queries have resolved
 * Useful for initializing third-party libraries, analytics, or dependent data fetches
 */
export type OnMountCompleteCallback<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray
> = (context: LifecycleContext<F, Q>) => void | Promise<void>;

/**
 * Lifecycle callback fired when an individual query succeeds
 * Useful for updating local state, triggering dependent operations
 */
export type OnQuerySuccessCallback<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray
> = (context: LifecycleContext<F, Q>, queryKey: string, data: any) => void | Promise<void>;

/**
 * Lifecycle callback fired when a query fails
 * Useful for error handling, retry logic, fallback data loading
 */
export type OnQueryErrorCallback<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray
> = (context: LifecycleContext<F, Q>, queryKey: string, error: Error) => void | Promise<void>;

/**
 * Lifecycle callback fired after form submission
 * Useful for post-submit validation, success messages, redirects
 */
export type OnFormSubmitCallback<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray
> = (context: LifecycleContext<F, Q>, result: any) => void | Promise<void>;

/**
 * Lifecycle callback fired when form values change
 * Useful for dependent calculations, validation, auto-save
 * Note: Can be debounced via useFormPage configuration
 */
export type OnValuesChangeCallback<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray
> = MappedItemsFunction<F, Q, void>;

/**
 * Complete lifecycle callback configuration for a page
 */
export interface LifecycleCallbacks<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray
> {
  /** Fired when page mount is complete and all required queries resolve */
  onMountComplete?: OnMountCompleteCallback<F, Q>;

  /** Fired on individual query success (receives queryKey and data) */
  onQuerySuccess?: OnQuerySuccessCallback<F, Q>;

  /** Fired on query failure (receives queryKey and error) */
  onQueryError?: OnQueryErrorCallback<F, Q>;

  /** Fired after form submission */
  onFormSubmit?: OnFormSubmitCallback<F, Q>;

  /** Fired when form values change (can be debounced) */
  onValuesChange?: OnValuesChangeCallback<F, Q>;
}

/**
 * Hook to manage lifecycle callbacks
 * Used internally by PageGenerator and hooks to fire lifecycle events
 *
 * @example
 * ```typescript
 * function MyPage() {
 *   const pageProps: PageProps = {
 *     id: 'my-page',
 *     lifecycleCallbacks: {
 *       onMountComplete: async ({ pageId, allQuery }) => {
 *         console.log(`Page "${pageId}" loaded with data:`, allQuery);
 *         // Initialize third-party libraries
 *         analytics.pageView(pageId);
 *       },
 *       onQuerySuccess: ({ pageId }, queryKey, data) => {
 *         console.log(`Query "${queryKey}" succeeded:`, data);
 *       },
 *       onQueryError: ({ pageId }, queryKey, error) => {
 *         console.error(`Query "${queryKey}" failed:`, error);
 *         // Show error notification
 *       },
 *       onFormSubmit: ({ formValues }, result) => {
 *         console.log('Form submitted:', result);
 *         // Redirect to success page
 *       },
 *     }
 *   };
 *
 *   return <PageGenerator {...pageProps} />;
 * }
 * ```
 */
export function useLifecycleCallbacks<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray
>(
  callbacks?: LifecycleCallbacks<F, Q>
): LifecycleCallbacks<F, Q> {
  // Simply return the callbacks object
  // The actual firing of callbacks is handled by parent components/hooks
  // This hook provides type definitions and a consistent interface
  return callbacks || {};
}

/**
 * Helper to create lifecycle callbacks with proper typing
 * Useful as a convenience for building callbacks with TypeScript inference
 *
 * @example
 * ```typescript
 * const callbacks = createLifecycleCallbacks<FormValues, QueriesConfig>({
 *   onMountComplete: async (ctx) => {
 *     console.log(ctx.formValues); // TypeScript knows the type
 *   }
 * });
 * ```
 */
export function createLifecycleCallbacks<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray
>(callbacks: Partial<LifecycleCallbacks<F, Q>>): LifecycleCallbacks<F, Q> {
  return callbacks as LifecycleCallbacks<F, Q>;
}
