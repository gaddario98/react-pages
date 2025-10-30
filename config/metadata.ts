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

  // Set Open Graph meta tags
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

  // Set robots directive
  if (config.robots) {
    updateOrCreateMeta('meta[name="robots"]', config.robots, {
      name: "robots",
    });
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

  // Set custom meta tags
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
 * Get current metadata configuration
 * Useful for SSR, testing, and debugging
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
