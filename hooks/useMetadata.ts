/**
 * useMetadata Hook
 * Evaluates dynamic metadata with query data and form values
 * Integrates i18n for metadata translation
 *
 * @module hooks/useMetadata
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldValues, UseFormSetValue } from 'react-hook-form';
import type { QueriesArray, AllMutation, MultipleQueryResponse } from '@gaddario98/react-queries';
import type { MetadataConfig, MappedItemsFunction } from '../types';
import { setMetadata } from '../config/metadata';

/**
 * Props for useMetadata hook
 */
export interface UseMetadataProps<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray
> {
  /** Base metadata configuration (static or dynamic function) */
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

  /** Whether to automatically apply metadata (default: true) */
  autoApply?: boolean;
}

/**
 * Hook for evaluating and managing dynamic metadata
 * @param props - Configuration props
 * @returns Resolved metadata configuration
 */
export function useMetadata<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray
>({
  meta,
  formValues,
  allQuery,
  allMutation,
  setValue,
  ns,
  autoApply = true,
}: UseMetadataProps<F, Q>): MetadataConfig {
  const { t, i18n } = useTranslation(ns);

  // Evaluate metadata (T068: mapping function evaluation)
  const resolvedMeta = useMemo(() => {
    if (!meta) return {};

    // If meta is a function, evaluate it with query/form data
    if (typeof meta === 'function') {
      return meta({
        formValues,
        allQuery,
        allMutation,
        setValue,
      });
    }

    // Otherwise, return as-is
    return meta;
  }, [meta, formValues, allQuery, allMutation, setValue]);

  // Translate metadata strings (T069: i18n integration)
  const translatedMeta = useMemo(() => {
    if (!resolvedMeta) return {};

    const result: MetadataConfig = { ...resolvedMeta };

    // Translate title
    if (result.title && typeof result.title === 'string') {
      result.title = t(result.title, { ns: 'meta', defaultValue: result.title });
    }

    // Translate description
    if (result.description && typeof result.description === 'string') {
      result.description = t(result.description, { ns: 'meta', defaultValue: result.description });
    }

    // Translate keywords
    if (result.keywords && Array.isArray(result.keywords)) {
      result.keywords = result.keywords.map((keyword) =>
        typeof keyword === 'string'
          ? t(keyword, { ns: 'meta', defaultValue: keyword })
          : keyword
      );
    }

    // Translate author
    if (result.author && typeof result.author === 'string') {
      result.author = t(result.author, { ns: 'meta', defaultValue: result.author });
    }

    // Translate Open Graph fields
    if (result.openGraph) {
      const og = result.openGraph;

      if (og.title && typeof og.title === 'string') {
        og.title = t(og.title, { ns: 'meta', defaultValue: og.title });
      }

      if (og.description && typeof og.description === 'string') {
        og.description = t(og.description, { ns: 'meta', defaultValue: og.description });
      }

      if (og.siteName && typeof og.siteName === 'string') {
        og.siteName = t(og.siteName, { ns: 'meta', defaultValue: og.siteName });
      }
    }

    // Add language to result
    result.lang = i18n.language;

    return result;
  }, [resolvedMeta, t, i18n.language]);

  // Automatically apply metadata to document (if on web platform)
  useMemo(() => {
    if (autoApply && typeof document !== 'undefined') {
      setMetadata(translatedMeta);
    }
  }, [translatedMeta, autoApply]);

  return translatedMeta;
}

/**
 * Hook to manually apply metadata (when autoApply is false)
 * @returns Function to apply metadata
 */
export function useApplyMetadata() {
  return (meta: MetadataConfig) => {
    if (typeof document !== 'undefined') {
      setMetadata(meta);
    }
  };
}
