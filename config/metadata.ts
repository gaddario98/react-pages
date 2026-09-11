import type {
  IconConfig,
  MetadataConfig,
  OpenGraphImage,
} from "../types";

// ─── Platform detection ──────────────────────────────────────

const isWeb = typeof document !== "undefined";
const initialDocumentTitle = isWeb ? document.title : "";
let currentAppliedPageId: string | null = null;

// ─── DOM helpers ─────────────────────────────────────────────

function updateOrCreateMeta(
  selector: string,
  content: string,
  attributes: Record<string, string> = {},
): void {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("data-react-pages", "meta");
    Object.entries(attributes).forEach(([key, value]) => {
      element?.setAttribute(key, value);
    });
    document.head.appendChild(element);
  } else {
    element.setAttribute("data-react-pages", "meta");
  }
  element.setAttribute("content", content);
}

function updateOrCreateLink(
  selector: string,
  attributes: Record<string, string>,
): void {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("data-react-pages", "meta");
    document.head.appendChild(element);
  } else {
    element.setAttribute("data-react-pages", "meta");
  }
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function removeManagedElement(selector: string): void {
  const element = document.querySelector(selector);
  if (element) {
    element.remove();
  }
}

// ─── applyMetadataToDom ─────────────────────────────────────

/**
 * Apply resolved metadata to the document `<head>`.
 * Client-only: this function does nothing if `document` is not available.
 */
export function applyMetadataToDom(
  resolved: MetadataConfig,
  pageId?: string,
): void {
  if (!isWeb) return;

  if (pageId) {
    currentAppliedPageId = pageId;
  }

  // ── Title ───────────────────────────────────────────────────
  if (resolved.title) {
    document.title = resolved.title;
  } else if (initialDocumentTitle) {
    document.title = initialDocumentTitle;
  }

  // ── Standard meta tags ──────────────────────────────────────
  if (resolved.description) {
    updateOrCreateMeta('meta[name="description"]', resolved.description, {
      name: "description",
    });
  } else {
    removeManagedElement('meta[name="description"][data-react-pages="meta"]');
  }

  if (resolved.keywords?.length) {
    updateOrCreateMeta('meta[name="keywords"]', resolved.keywords.join(", "), {
      name: "keywords",
    });
  } else {
    removeManagedElement('meta[name="keywords"][data-react-pages="meta"]');
  }

  if (resolved.author) {
    updateOrCreateMeta('meta[name="author"]', resolved.author, {
      name: "author",
    });
  } else {
    removeManagedElement('meta[name="author"][data-react-pages="meta"]');
  }

  if (resolved.viewport) {
    updateOrCreateMeta('meta[name="viewport"]', resolved.viewport, {
      name: "viewport",
    });
  }

  if (resolved.themeColor) {
    updateOrCreateMeta('meta[name="theme-color"]', resolved.themeColor, {
      name: "theme-color",
    });
  } else {
    removeManagedElement('meta[name="theme-color"][data-react-pages="meta"]');
  }

  // ── Canonical ───────────────────────────────────────────────
  if (resolved.canonical) {
    updateOrCreateLink('link[rel="canonical"]', {
      rel: "canonical",
      href: resolved.canonical,
    });
  } else {
    removeManagedElement('link[rel="canonical"][data-react-pages="meta"]');
  }

  // ── Language ────────────────────────────────────────────────
  if (resolved.lang) {
    document.documentElement.lang = resolved.lang;
  }

  // ── Open Graph ──────────────────────────────────────────────
  // Remove existing managed OG tags to prevent stale tags from previous pages
  document
    .querySelectorAll(
      'meta[property^="og:"][data-react-pages="meta"], meta[property^="article:"][data-react-pages="meta"]',
    )
    .forEach((el) => el.remove());

  if (resolved.openGraph) {
    const og = resolved.openGraph;

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
    if (og.type) {
      updateOrCreateMeta('meta[property="og:type"]', og.type, {
        property: "og:type",
      });
    }
    if (og.url) {
      updateOrCreateMeta('meta[property="og:url"]', og.url, {
        property: "og:url",
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

    // OG images (advanced: multiple + alt/width/height)
    if (og.images?.length) {
      applyOgImages(og.images);
    } else if (og.image) {
      const img: OpenGraphImage =
        typeof og.image === "string" ? { url: og.image } : og.image;
      applyOgImages([img]);
    }

    // OG article metadata
    if (og.article) {
      const art = og.article;
      if (art.publishedTime) {
        updateOrCreateMeta(
          'meta[property="article:published_time"]',
          art.publishedTime,
          { property: "article:published_time" },
        );
      }
      if (art.modifiedTime) {
        updateOrCreateMeta(
          'meta[property="article:modified_time"]',
          art.modifiedTime,
          { property: "article:modified_time" },
        );
      }
      if (art.expirationTime) {
        updateOrCreateMeta(
          'meta[property="article:expiration_time"]',
          art.expirationTime,
          { property: "article:expiration_time" },
        );
      }
      if (art.section) {
        updateOrCreateMeta('meta[property="article:section"]', art.section, {
          property: "article:section",
        });
      }
      const authors = Array.isArray(art.author)
        ? art.author
        : art.author
          ? [art.author]
          : [];
      authors.forEach((author, i) => {
        updateOrCreateMeta(
          `meta[property="article:author"][data-index="${i}"]`,
          author,
          { property: "article:author", "data-index": String(i) },
        );
      });
      art.tags?.forEach((tag, i) => {
        updateOrCreateMeta(
          `meta[property="article:tag"][data-index="${i}"]`,
          tag,
          { property: "article:tag", "data-index": String(i) },
        );
      });
    }
  }

  // ── Twitter Card ────────────────────────────────────────────
  // Remove existing managed Twitter tags to prevent stale tags from previous pages
  document
    .querySelectorAll('meta[name^="twitter:"][data-react-pages="meta"]')
    .forEach((el) => el.remove());

  if (resolved.twitter) {
    const tw = resolved.twitter;
    if (tw.card) {
      updateOrCreateMeta('meta[name="twitter:card"]', tw.card, {
        name: "twitter:card",
      });
    }
    if (tw.site) {
      updateOrCreateMeta('meta[name="twitter:site"]', tw.site, {
        name: "twitter:site",
      });
    }
    if (tw.creator) {
      updateOrCreateMeta('meta[name="twitter:creator"]', tw.creator, {
        name: "twitter:creator",
      });
    }
    if (tw.title) {
      updateOrCreateMeta('meta[name="twitter:title"]', tw.title, {
        name: "twitter:title",
      });
    }
    if (tw.description) {
      updateOrCreateMeta('meta[name="twitter:description"]', tw.description, {
        name: "twitter:description",
      });
    }
    if (tw.image) {
      updateOrCreateMeta('meta[name="twitter:image"]', tw.image, {
        name: "twitter:image",
      });
    }
    if (tw.imageAlt) {
      updateOrCreateMeta('meta[name="twitter:image:alt"]', tw.imageAlt, {
        name: "twitter:image:alt",
      });
    }
  }

  // ── Alternates / hreflang ───────────────────────────────────
  if (resolved.alternates) {
    const alt = resolved.alternates;

    if (alt.canonical) {
      updateOrCreateLink('link[rel="canonical"]', {
        rel: "canonical",
        href: alt.canonical,
      });
    }

    if (alt.languages) {
      // Remove old hreflang links first
      document
        .querySelectorAll('link[rel="alternate"][hreflang]')
        .forEach((el) => el.remove());

      Object.entries(alt.languages).forEach(([locale, url]) => {
        const link = document.createElement("link");
        link.rel = "alternate";
        link.hreflang = locale;
        link.href = url;
        link.setAttribute("data-react-pages", "meta");
        document.head.appendChild(link);
      });
    }

    if (alt.media) {
      Object.entries(alt.media).forEach(([mediaQuery, url]) => {
        updateOrCreateLink(`link[rel="alternate"][media="${mediaQuery}"]`, {
          rel: "alternate",
          media: mediaQuery,
          href: url,
        });
      });
    }

    if (alt.types) {
      Object.entries(alt.types).forEach(([mimeType, items]) => {
        items.forEach((item, i) => {
          const selector = `link[rel="alternate"][type="${mimeType}"][data-index="${i}"]`;
          const attrs: Record<string, string> = {
            rel: "alternate",
            type: mimeType,
            href: item.url,
            "data-index": String(i),
          };
          if (item.title) attrs.title = item.title;
          updateOrCreateLink(selector, attrs);
        });
      });
    }
  } else {
    document
      .querySelectorAll('link[rel="alternate"][data-react-pages="meta"]')
      .forEach((el) => el.remove());
  }

  // ── Icons ───────────────────────────────────────────────────
  if (resolved.icons) {
    applyIcons(resolved.icons.icon, "icon");
    applyIcons(resolved.icons.apple, "apple-touch-icon");
    if (resolved.icons.shortcut) {
      updateOrCreateLink('link[rel="shortcut icon"]', {
        rel: "shortcut icon",
        href: resolved.icons.shortcut,
      });
    }
  }

  // ── Manifest ────────────────────────────────────────────────
  if (resolved.manifest) {
    updateOrCreateLink('link[rel="manifest"]', {
      rel: "manifest",
      href: resolved.manifest,
    });
  } else {
    removeManagedElement('link[rel="manifest"][data-react-pages="meta"]');
  }

  // ── Structured data JSON-LD ─────────────────────────────────
  const schemaScriptId = "react-pages-schema-org";
  if (resolved.structuredData) {
    let scriptElement = document.querySelector(
      `script[id="${schemaScriptId}"]`,
    ) as HTMLScriptElement;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!scriptElement) {
      scriptElement = document.createElement("script");
      scriptElement.type = "application/ld+json";
      scriptElement.id = schemaScriptId;
      scriptElement.setAttribute("data-react-pages", "meta");
      document.head.appendChild(scriptElement);
    } else {
      scriptElement.setAttribute("data-react-pages", "meta");
    }

    scriptElement.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": resolved.structuredData.type,
      ...resolved.structuredData.schema,
    });
  } else {
    removeManagedElement(`script[id="${schemaScriptId}"]`);
  }

  // ── AI crawler hints ────────────────────────────────────────
  document
    .querySelectorAll('meta[name^="ai-"][data-react-pages="meta"]')
    .forEach((el) => el.remove());

  if (resolved.aiHints) {
    const hints = resolved.aiHints;
    if (hints.contentClassification) {
      updateOrCreateMeta(
        'meta[name="ai-content-classification"]',
        hints.contentClassification,
        { name: "ai-content-classification" },
      );
    }
    if (hints.modelHints?.length) {
      updateOrCreateMeta(
        'meta[name="ai-model-hints"]',
        hints.modelHints.join(", "),
        { name: "ai-model-hints" },
      );
    }
    if (hints.contextualInfo) {
      updateOrCreateMeta('meta[name="ai-context"]', hints.contextualInfo, {
        name: "ai-context",
      });
    }
    if (hints.excludeFromIndexing) {
      updateOrCreateMeta('meta[name="ai-exclude-from-indexing"]', "true", {
        name: "ai-exclude-from-indexing",
      });
    }
  }

  // ── Robots ──────────────────────────────────────────────────
  if (resolved.robots || resolved.disableIndexing) {
    const robots = resolved.robots ?? {};
    const noindex = resolved.disableIndexing || robots.noindex;
    const nofollow = resolved.disableIndexing || robots.nofollow;

    const robotsValue = [
      noindex ? "noindex" : "index",
      nofollow ? "nofollow" : "follow",
      robots.noarchive && "noarchive",
      robots.nosnippet && "nosnippet",
      robots.maxImagePreview && `max-image-preview:${robots.maxImagePreview}`,
      robots.maxSnippet != null && `max-snippet:${robots.maxSnippet}`,
    ]
      .filter(Boolean)
      .join(", ");

    updateOrCreateMeta('meta[name="robots"]', robotsValue, {
      name: "robots",
    });
  } else {
    removeManagedElement('meta[name="robots"][data-react-pages="meta"]');
  }
}

/** Apply OG images to the DOM (supports multiple images with alt/width/height) */
function applyOgImages(images: Array<OpenGraphImage>): void {
  // Remove existing OG image tags to avoid stale data
  document
    .querySelectorAll(
      'meta[property="og:image"], meta[property="og:image:alt"], meta[property="og:image:width"], meta[property="og:image:height"], meta[property="og:image:type"]',
    )
    .forEach((el) => el.remove());

  images.forEach((img) => {
    const ogImg = document.createElement("meta");
    ogImg.setAttribute("property", "og:image");
    ogImg.setAttribute("content", img.url);
    ogImg.setAttribute("data-react-pages", "meta");
    document.head.appendChild(ogImg);

    if (img.alt) {
      const altMeta = document.createElement("meta");
      altMeta.setAttribute("property", "og:image:alt");
      altMeta.setAttribute("content", img.alt);
      altMeta.setAttribute("data-react-pages", "meta");
      document.head.appendChild(altMeta);
    }
    if (img.width) {
      const wMeta = document.createElement("meta");
      wMeta.setAttribute("property", "og:image:width");
      wMeta.setAttribute("content", String(img.width));
      wMeta.setAttribute("data-react-pages", "meta");
      document.head.appendChild(wMeta);
    }
    if (img.height) {
      const hMeta = document.createElement("meta");
      hMeta.setAttribute("property", "og:image:height");
      hMeta.setAttribute("content", String(img.height));
      hMeta.setAttribute("data-react-pages", "meta");
      document.head.appendChild(hMeta);
    }
    if (img.type) {
      const tMeta = document.createElement("meta");
      tMeta.setAttribute("property", "og:image:type");
      tMeta.setAttribute("content", img.type);
      tMeta.setAttribute("data-react-pages", "meta");
      document.head.appendChild(tMeta);
    }
  });
}

/** Apply icon link tags to the DOM */
function applyIcons(
  icons: string | IconConfig | Array<IconConfig> | undefined,
  rel: string,
): void {
  if (!icons) return;

  const iconList: Array<IconConfig> =
    typeof icons === "string"
      ? [{ url: icons }]
      : Array.isArray(icons)
        ? icons
        : [icons];

  // Remove old icons of this rel
  document.querySelectorAll(`link[rel="${rel}"]`).forEach((el) => el.remove());

  iconList.forEach((icon) => {
    const link = document.createElement("link");
    link.rel = rel;
    link.href = icon.url;
    link.setAttribute("data-react-pages", "meta");
    if (icon.type) link.type = icon.type;
    if (icon.sizes) link.setAttribute("sizes", icon.sizes);
    if (icon.color) link.setAttribute("color", icon.color);
    document.head.appendChild(link);
  });
}

/** Clean up all metadata managed by react-pages and restore initial document title */
export function cleanupMetadata(pageId?: string): void {
  if (!isWeb) return;
  if (pageId && currentAppliedPageId && currentAppliedPageId !== pageId) {
    return;
  }
  if (initialDocumentTitle) {
    document.title = initialDocumentTitle;
  }
  document
    .querySelectorAll('[data-react-pages="meta"]')
    .forEach((el) => el.remove());
  currentAppliedPageId = null;
}

