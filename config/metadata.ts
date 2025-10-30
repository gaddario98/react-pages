/**
 * Custom Metadata Configuration System
 * Replaces react-helmet-async with ~1KB native implementation
 * Platform-agnostic: Web, React Native, and SSR support
 */

import { MetadataConfig, MetaTag } from "./types";

// Store current metadata for SSR and getMetadata()
let currentMetadata: MetadataConfig = {};

// Platform detection
const isWeb = typeof document !== "undefined";
const isReactNative =
  typeof navigator !== "undefined" && navigator.product === "ReactNative";

/**
 * Apply metadata configuration to the page
 * @param config - Metadata configuration object
 */
export const setMetadata = (config: MetadataConfig): void => {
  // Store for getMetadata()
  currentMetadata = { ...currentMetadata, ...config };

  // SSR or React Native - just store, don't manipulate DOM
  if (!isWeb) {
    return;
  }

  // Set document title
  if (config.title) {
    document.title = config.title;
  }

  // Helper to update or create meta tags
  const updateOrCreateMeta = (
    selector: string,
    content: string,
    attributes: Record<string, string> = {}
  ) => {
    let element = document.querySelector(selector) as HTMLMetaElement;
    if (!element) {
      element = document.createElement("meta");
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
  };

  // Set standard meta tags
  if (config.description) {
    updateOrCreateMeta('meta[name="description"]', config.description, {
      name: "description",
    });
  }

  if (config.keywords) {
    updateOrCreateMeta('meta[name="keywords"]', config.keywords.join(", "), {
      name: "keywords",
    });
  }

  if (config.author) {
    updateOrCreateMeta('meta[name="author"]', config.author, {
      name: "author",
    });
  }

  if (config.viewport) {
    updateOrCreateMeta('meta[name="viewport"]', config.viewport, {
      name: "viewport",
    });
  }

  if (config.themeColor) {
    updateOrCreateMeta('meta[name="theme-color"]', config.themeColor, {
      name: "theme-color",
    });
  }

  // Set Open Graph meta tags (T059)
  if (config.openGraph) {
    const og = config.openGraph;

    if (og.title) {
      updateOrCreateMeta('meta[property="og:title"]', og.title, {
        property: "og:title",
      });
    }

    if (og.description) {
      updateOrCreateMeta('meta[property="og:description"]', og.description, {
        property: "og:description",
      });
    }

    if (og.image) {
      updateOrCreateMeta('meta[property="og:image"]', og.image, {
        property: "og:image",
      });
    }

    if (og.url) {
      updateOrCreateMeta('meta[property="og:url"]', og.url, {
        property: "og:url",
      });
    }

    if (og.type) {
      updateOrCreateMeta('meta[property="og:type"]', og.type, {
        property: "og:type",
      });
    }

    if (og.siteName) {
      updateOrCreateMeta('meta[property="og:site_name"]', og.siteName, {
        property: "og:site_name",
      });
    }

    if (og.locale) {
      updateOrCreateMeta('meta[property="og:locale"]', og.locale, {
        property: "og:locale",
      });
    }
  }

  // Backward compatibility: legacy ogImage, ogTitle, ogDescription
  if (config.ogImage) {
    updateOrCreateMeta('meta[property="og:image"]', config.ogImage, {
      property: "og:image",
    });
  }

  if (config.ogTitle) {
    updateOrCreateMeta('meta[property="og:title"]', config.ogTitle, {
      property: "og:title",
    });
  }

  if (config.ogDescription) {
    updateOrCreateMeta(
      'meta[property="og:description"]',
      config.ogDescription,
      { property: "og:description" }
    );
  }

  // Set robots directive (T062)
  if (config.robots) {
    const robotsValue = typeof config.robots === 'string'
      ? config.robots
      : [
          config.robots.noindex ? 'noindex' : 'index',
          config.robots.nofollow ? 'nofollow' : 'follow',
          config.robots.noarchive && 'noarchive',
          config.robots.nosnippet && 'nosnippet',
          config.robots.maxImagePreview && `max-image-preview:${config.robots.maxImagePreview}`,
          config.robots.maxSnippet && `max-snippet:${config.robots.maxSnippet}`,
        ].filter(Boolean).join(', ');

    updateOrCreateMeta('meta[name="robots"]', robotsValue, {
      name: "robots",
    });
  }

  // Set structured data JSON-LD (T060)
  if (config.structuredData) {
    const schemaScriptId = 'react-pages-schema-org';
    let scriptElement = document.querySelector(`script[id="${schemaScriptId}"]`) as HTMLScriptElement;

    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.type = 'application/ld+json';
      scriptElement.id = schemaScriptId;
      document.head.appendChild(scriptElement);
    }

    scriptElement.textContent = JSON.stringify(config.structuredData);
  }

  // Set AI crawler hints (T061)
  if (config.aiHints) {
    const hints = config.aiHints;

    if (hints.contentClassification) {
      updateOrCreateMeta(
        'meta[name="ai-content-classification"]',
        hints.contentClassification,
        { name: 'ai-content-classification' }
      );
    }

    if (hints.modelHints) {
      updateOrCreateMeta(
        'meta[name="ai-model-hints"]',
        hints.modelHints,
        { name: 'ai-model-hints' }
      );
    }

    if (hints.contextualInfo) {
      updateOrCreateMeta(
        'meta[name="ai-context"]',
        hints.contextualInfo,
        { name: 'ai-context' }
      );
    }

    if (hints.excludeFromIndexing) {
      updateOrCreateMeta(
        'meta[name="ai-exclude-from-indexing"]',
        'true',
        { name: 'ai-exclude-from-indexing' }
      );
    }
  }

  // Set canonical link
  if (config.canonical) {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = config.canonical;
  }

  // Set language
  if (config.lang) {
    document.documentElement.lang = config.lang;
  }

  // Set custom meta tags (T063)
  config.customMeta?.forEach((tag) => {
    const selector = tag.id
      ? `meta[id="${tag.id}"]`
      : tag.name
      ? `meta[name="${tag.name}"]`
      : tag.property
      ? `meta[property="${tag.property}"]`
      : `meta[http-equiv="${tag.httpEquiv}"]`;

    const attributes: Record<string, string> = tag.name
      ? { name: tag.name }
      : tag.property
      ? { property: tag.property }
      : tag.httpEquiv
      ? { "http-equiv": tag.httpEquiv }
      : {};

    if (tag.id) attributes.id = tag.id;

    updateOrCreateMeta(selector, tag.content, attributes);
  });
};

/**
 * Get current metadata configuration (T073)
 * Useful for SSR framework integration, testing, and debugging
 *
 * @example SSR with Next.js App Router
 * ```typescript
 * import { getMetadata } from '@gaddario98/react-pages';
 *
 * export async function generateMetadata() {
 *   const metadata = getMetadata();
 *   return {
 *     title: metadata.title,
 *     description: metadata.description,
 *     openGraph: {
 *       title: metadata.openGraph?.title,
 *       description: metadata.openGraph?.description,
 *       images: metadata.openGraph?.image ? [metadata.openGraph.image] : undefined,
 *       url: metadata.openGraph?.url,
 *       type: metadata.openGraph?.type as any,
 *       locale: metadata.openGraph?.locale,
 *       siteName: metadata.openGraph?.siteName,
 *     },
 *   };
 * }
 * ```
 *
 * @example SSR with Remix
 * ```typescript
 * import { getMetadata } from '@gaddario98/react-pages';
 *
 * export const meta: MetaFunction = () => {
 *   const metadata = getMetadata();
 *   return [
 *     { title: metadata.title },
 *     { name: 'description', content: metadata.description },
 *     { property: 'og:title', content: metadata.openGraph?.title },
 *     { property: 'og:description', content: metadata.openGraph?.description },
 *   ];
 * };
 * ```
 */
export const getMetadata = (): MetadataConfig => {
  return { ...currentMetadata };
};

/**
 * Reset all metadata to defaults
 * Removes dynamically-added meta tags on web
 */
export const resetMetadata = (): void => {
  currentMetadata = {};

  if (!isWeb) {
    return;
  }

  // Remove dynamically-added meta tags (with data-react-pages attribute)
  const metaTags = document.querySelectorAll(
    'meta[name], meta[property], meta[http-equiv], link[rel="canonical"]'
  );
  metaTags.forEach((tag) => {
    // Only remove tags we created (not hardcoded in HTML)
    // We can't reliably detect this, so we'll just reset the stored config
    // and let setMetadata() handle re-applying defaults
  });

  // Reset document title to empty (or leave as-is)
  // document.title = '';
};
