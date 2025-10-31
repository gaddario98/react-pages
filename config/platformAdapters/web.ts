/**
 * Web Platform Adapter
 * Implements platform-specific features for React DOM / web browsers
 *
 * @module config/platformAdapters/web
 */

import React, { ReactNode } from 'react';
import type {
  PlatformAdapter,
  PlatformFeature,
  MetadataConfig,
  ViewSettings,
  MetaTag,
} from './base';
import { setMetadata } from '../metadata';

/**
 * Helper to update or create a meta tag
 */
function updateOrCreateMeta(
  attribute: 'name' | 'property',
  key: string,
  content: string | undefined
): void {
  if (!content) return;

  const selector = `meta[${attribute}="${key}"]`;
  let element = document.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

/**
 * Helper to inject JSON-LD structured data
 */
function injectStructuredData(id: string, data: Record<string, unknown>): void {
  let script = document.querySelector(`script[id="${id}"]`) as HTMLScriptElement;

  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}

/**
 * Web platform adapter implementation
 * Provides full web browser support with document head manipulation
 */
export const webAdapter: PlatformAdapter = {
  name: 'web',

  injectMetadata(metadata: MetadataConfig): void {
    // Skip if not in browser environment (SSR)
    if (typeof document === 'undefined') {
      return;
    }

    // Use existing metadata utility for basic fields
    setMetadata({
      title: typeof metadata.title === 'function' ? undefined : metadata.title,
      description: typeof metadata.description === 'function' ? undefined : metadata.description,
      lang: metadata.documentLang,
    });

    // Update document.title directly if provided
    if (typeof metadata.title === 'string') {
      document.title = metadata.title;
    }

    // Update document lang attribute
    if (metadata.documentLang) {
      document.documentElement.lang = metadata.documentLang;
    }

    // Inject basic meta tags
    if (typeof metadata.description === 'string') {
      updateOrCreateMeta('name', 'description', metadata.description);
    }

    if (metadata.keywords && Array.isArray(metadata.keywords)) {
      updateOrCreateMeta('name', 'keywords', metadata.keywords.join(', '));
    }

    // Inject Open Graph tags
    if (metadata.openGraph) {
      const og = metadata.openGraph;

      if (og.type) {
        updateOrCreateMeta('property', 'og:type', og.type);
      }

      if (typeof og.title === 'string') {
        updateOrCreateMeta('property', 'og:title', og.title);
      }

      if (typeof og.description === 'string') {
        updateOrCreateMeta('property', 'og:description', og.description);
      }

      if (typeof og.image === 'string') {
        updateOrCreateMeta('property', 'og:image', og.image);
      }

      if (typeof og.url === 'string') {
        updateOrCreateMeta('property', 'og:url', og.url);
      }

      if (og.siteName) {
        updateOrCreateMeta('property', 'og:site_name', og.siteName);
      }

      if (og.locale) {
        updateOrCreateMeta('property', 'og:locale', og.locale);
      }
    }

    // Inject structured data (JSON-LD)
    if (metadata.structuredData) {
      const schema =
        typeof metadata.structuredData.schema === 'function'
          ? undefined
          : metadata.structuredData.schema;

      if (schema) {
        injectStructuredData('structured-data-schema', {
          '@context': 'https://schema.org',
          '@type': metadata.structuredData.type,
          ...schema,
        });
      }
    }

    // Inject AI hints as custom meta tags
    if (metadata.aiHints) {
      const hints = metadata.aiHints;

      if (typeof hints.contentClassification === 'string') {
        updateOrCreateMeta('name', 'ai:content-classification', hints.contentClassification);
      }

      if (hints.modelHints && Array.isArray(hints.modelHints)) {
        updateOrCreateMeta('name', 'ai:model-hints', hints.modelHints.join(', '));
      }

      if (typeof hints.contextualInfo === 'string') {
        updateOrCreateMeta('name', 'ai:contextual-info', hints.contextualInfo);
      }
    }

    // Inject robots meta tags
    if (metadata.robots) {
      const robotsDirectives: string[] = [];

      if (metadata.robots.noindex) robotsDirectives.push('noindex');
      if (metadata.robots.nofollow) robotsDirectives.push('nofollow');
      if (metadata.robots.noarchive) robotsDirectives.push('noarchive');
      if (metadata.robots.nosnippet) robotsDirectives.push('nosnippet');

      if (metadata.robots.maxImagePreview) {
        robotsDirectives.push(`max-image-preview:${metadata.robots.maxImagePreview}`);
      }

      if (metadata.robots.maxSnippet !== undefined) {
        robotsDirectives.push(`max-snippet:${metadata.robots.maxSnippet}`);
      }

      if (robotsDirectives.length > 0) {
        updateOrCreateMeta('name', 'robots', robotsDirectives.join(', '));
      }
    }

    // Inject custom meta tags
    if (metadata.customMeta && Array.isArray(metadata.customMeta)) {
      metadata.customMeta.forEach((tag: MetaTag) => {
        if (tag.id?.startsWith('schema-')) {
          // Inject as JSON-LD script
          try {
            const data = JSON.parse(tag.content);
            injectStructuredData(tag.id, data);
          } catch (error) {
            console.error('[WebAdapter] Failed to parse structured data:', error);
          }
        } else if (tag.name) {
          updateOrCreateMeta('name', tag.name, tag.content);
        } else if (tag.property) {
          updateOrCreateMeta('property', tag.property, tag.content);
        }
      });
    }
  },

  renderContainer(children: ReactNode, settings: ViewSettings): ReactNode {
    // Use custom container if provided, otherwise use a simple div
    if (settings.customPageContainer) {
      const CustomContainer = settings.customPageContainer as React.ComponentType<any>;
      return React.createElement(CustomContainer, { withoutPadding: settings.withoutPadding } as any, children);
    }

    return React.createElement(
      'div',
      {
        style: {
          padding: settings.withoutPadding ? 0 : '1rem',
        },
      },
      children
    );
  },

  renderScrollView(children: ReactNode, settings: ViewSettings): ReactNode {
    return React.createElement(
      'div',
      {
        style: {
          overflowY: 'auto',
          height: '100%',
          padding: settings.withoutPadding ? 0 : '1rem',
        },
      },
      children
    );
  },

  supportsFeature(feature: PlatformFeature): boolean {
    switch (feature) {
      case 'metadata':
      case 'documentHead':
        return typeof document !== 'undefined';

      case 'lazyLoading':
      case 'suspense':
        return true;

      case 'intersectionObserver':
        return typeof IntersectionObserver !== 'undefined';

      default:
        return false;
    }
  },
};
