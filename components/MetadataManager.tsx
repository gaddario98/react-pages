/**
 * MetadataManager Component
 * Consumes PageProps.meta and manages metadata injection
 * Integrates with platform adapters for web/native differences
 *
 * @module components/MetadataManager
 */

import { useEffect, memo } from 'react';
import { FieldValues, UseFormSetValue } from 'react-hook-form';
import type { QueriesArray, AllMutation, MultipleQueryResponse } from '@gaddario98/react-queries';
import type { MetadataConfig, MappedItemsFunction } from '../types';
import { useMetadata } from '../hooks/useMetadata';
import { usePlatformAdapter } from '../hooks/usePlatformAdapter';
import { setMetadata } from '../config/metadata';

/**
 * Props for MetadataManager component
 */
export interface MetadataManagerProps<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray
> {
  /** Page metadata configuration (static or dynamic function) */
  meta?: MetadataConfig<F, Q> | MappedItemsFunction<F, Q, MetadataConfig>;

  /** Form values for dynamic evaluation */
  formValues: F;

  /** Query data for dynamic evaluation */
  allQuery: MultipleQueryResponse<Q>;

  /** Query mutations for dynamic evaluation */
  allMutation: AllMutation<Q>;

  /** Form setValue function */
  setValue: UseFormSetValue<F>;

  /** Namespace for i18n translations */
  ns?: string;

  /** Page ID for debugging */
  pageId?: string;
}

/**
 * MetadataManager component that manages metadata injection
 * Automatically applies metadata to document head when on web platform
 * Stores metadata for SSR when on server/React Native
 *
 * @example
 * ```typescript
 * function PageWithMetadata() {
 *   const { formValues, allQuery, allMutation, setValue } = usePageConfig();
 *
 *   return (
 *     <>
 *       <MetadataManager
 *         meta={{
 *           title: 'My Page',
 *           description: 'Page description',
 *           openGraph: { ... }
 *         }}
 *         formValues={formValues}
 *         allQuery={allQuery}
 *         allMutation={allMutation}
 *         setValue={setValue}
 *       />
 *       {/* Rest of page content */}
 *     </>
 *   );
 * }
 * ```
 */
const MetadataManagerImpl = <
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray
>({
  meta,
  formValues,
  allQuery,
  allMutation,
  setValue,
  ns = 'common',
  pageId,
}: MetadataManagerProps<F, Q>) => {
  // Get platform adapter for platform-aware rendering
  const platformAdapter = usePlatformAdapter();

  // Evaluate and translate metadata
  const resolvedMetadata = useMetadata({
    meta,
    formValues,
    allQuery,
    allMutation,
    setValue,
    ns,
  });

  // Apply metadata through platform adapter (T067: dynamic updates on data changes)
  useEffect(() => {
    if (platformAdapter.name === 'web') {
      // Web: inject into document head
      setMetadata(resolvedMetadata);
    } else {
      // React Native: store metadata (no-op rendering)
      // Can be used for SSR or analytics
      setMetadata(resolvedMetadata);
    }

    // Log in development mode
    if (process.env.NODE_ENV === 'development' && pageId) {
      console.log(`[MetadataManager] Updated metadata for page "${pageId}":`, resolvedMetadata);
    }
  }, [resolvedMetadata, platformAdapter, pageId]);

  // This component doesn't render anything (headless)
  return null;
};

/**
 * Export memoized component to prevent unnecessary re-renders
 * Re-renders only when metadata-related props actually change
 */
export const MetadataManager = memo(MetadataManagerImpl) as typeof MetadataManagerImpl;

MetadataManager.displayName = 'MetadataManager';
