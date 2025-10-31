/**
 * Deprecation warnings for v1.x → v2.0 migration
 * This file manages deprecation notices and warnings for removed/changed v1.x APIs
 *
 * @module utils/deprecations
 */

/**
 * Set of deprecated features that have been warned about
 * Prevents duplicate warnings in development mode
 */
const warnedFeatures = new Set<string>();

/**
 * Log a deprecation warning (only in development, only once per feature)
 * @param featureName - Name of the deprecated feature
 * @param message - Deprecation message with migration guidance
 * @param replacement - Recommended replacement code/feature
 */
export function deprecationWarning(
  featureName: string,
  message: string,
  replacement?: string
): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  if (warnedFeatures.has(featureName)) {
    return; // Already warned about this feature
  }

  warnedFeatures.add(featureName);

  const fullMessage = [
    `⚠️ [react-pages v2] Deprecation Warning`,
    `Feature: ${featureName}`,
    `${message}`,
    replacement ? `Recommended replacement:\n${replacement}` : '',
    'See https://github.com/gaddario98/react-pages#migration for details',
  ]
    .filter(Boolean)
    .join('\n');

  console.warn(fullMessage);
}

/**
 * Warnings for specific v1.x API patterns
 */
export const V1_DEPRECATIONS = {
  HELMET_PROVIDER: {
    name: 'react-helmet-async wrapper',
    message:
      'The <HelmetProvider> wrapper is no longer needed. Metadata injection is now automatic in PageGenerator.',
    replacement: `Remove <HelmetProvider> from your app:
// Before (v1.x):
<HelmetProvider>
  <PageGenerator {...pageProps} />
</HelmetProvider>

// After (v2.x):
<PageGenerator {...pageProps} />`,
  },

  INLINE_METADATA: {
    name: 'Inline metadata via viewSettings',
    message:
      'Setting metadata directly in viewSettings (metaTitle, metaDescription) is deprecated. Use the new PageProps.meta field instead.',
    replacement: `Update your PageProps:
// Before (v1.x):
{
  id: "page",
  viewSettings: {
    metaTitle: "...",
    metaDescription: "..."
  }
}

// After (v2.x):
{
  id: "page",
  meta: {
    title: "...",
    description: "..."
  }
}`,
  },

  MANUAL_LAZY_LOADING: {
    name: 'Manual React.lazy() for content',
    message:
      'Wrapping content in React.lazy() and Suspense manually is no longer needed. Use the ContentItem.lazy configuration instead.',
    replacement: `// Before (v1.x):
const Component = lazy(() => import('./Heavy'));
<Suspense fallback={<div>Loading...</div>}>
  <Component />
</Suspense>

// After (v2.x):
{
  type: "custom",
  component: <HeavyComponent />,
  lazy: true,
  lazyTrigger: "viewport"
}`,
  },

  CUSTOM_FORM_DEBOUNCE: {
    name: 'Custom form debouncing',
    message:
      'Custom debouncing logic in form handlers is now built-in. Use the form.debounceDelay property instead.',
    replacement: `// Before (v1.x): You had to implement debouncing manually
// After (v2.x):
{
  form: {
    fields: [...],
    debounceDelay: 300  // Built-in debouncing
  }
}`,
  },

  QUERY_DEPENDENCY_TRACKING: {
    name: 'Implicit query dependency tracking',
    message:
      'Components that depend on specific queries should declare those dependencies explicitly using ContentItem.usedQueries for better performance.',
    replacement: `// Before (v1.x): All content items re-rendered on any query change
// After (v2.x): Declare specific dependencies
{
  type: "custom",
  component: <MyComponent />,
  usedQueries: ["user", "posts"]  // Only re-render when these change
}`,
  },

  HELMET_IMPORT: {
    name: 'Direct react-helmet-async import',
    message:
      'Importing react-helmet-async directly is no longer recommended. The library handles metadata automatically.',
    replacement: `// Before (v1.x):
import { Helmet } from 'react-helmet-async';
<Helmet>
  <title>Page Title</title>
</Helmet>

// After (v2.x):
const pageProps = {
  meta: {
    title: "Page Title"
  }
}`,
  },
} as const;

/**
 * Check if the app is using a deprecated pattern and warn
 * @param pattern - The deprecated pattern to check
 */
export function warnIfUsingDeprecatedPattern(
  pattern: keyof typeof V1_DEPRECATIONS
): void {
  const deprecation = V1_DEPRECATIONS[pattern];
  deprecationWarning(deprecation.name, deprecation.message, deprecation.replacement);
}

/**
 * Reset deprecation warnings (useful for testing)
 */
export function resetDeprecationWarnings(): void {
  warnedFeatures.clear();
}
