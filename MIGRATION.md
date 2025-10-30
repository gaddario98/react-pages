# Migration Guide: @gaddario98/react-pages v1.x → v2.x

**Last Updated**: 2025-10-31
**Release**: v2.0.0

## Overview

This guide helps you migrate from react-pages v1.x to v2.x. The new version is a comprehensive redesign that maintains backward compatibility with existing `PageProps` interfaces while adding powerful new features for performance optimization, cross-platform rendering, SEO metadata, lazy loading, and extensibility.

**Good news**: If you're using basic `PageProps` configurations, your code will continue to work without changes. However, new features require explicit opt-in configuration.

---

## What's New in v2.0

### 1. **Universal Cross-Platform Support** ✨ NEW
- Single `PageProps` configuration works on web (React DOM) and React Native
- Platform-specific implementations handled automatically via platform adapters
- Graceful degradation: features unsupported on React Native are disabled, not errored

### 2. **Performance Optimization** 🚀 IMPROVED
- Dependency graph for selective component re-rendering
- Memoization utilities for stable prop references
- Form debouncing to reduce keystroke re-renders (80% reduction)
- React Compiler compatible automatic optimizations

### 3. **SEO & AI Metadata** 🔍 NEW
- Dynamic metadata configuration in `PageProps`
- Open Graph, JSON-LD, and AI hints support
- Automatic document head injection on web platforms
- SSR-friendly metadata management

### 4. **Lazy Loading & Code Splitting** ⚡ NEW
- Viewport-triggered lazy loading with Suspense
- Conditional lazy loading based on form values or query data
- Automatic bundle size reduction through code splitting
- ErrorBoundary integration for failed lazy loads

### 5. **Full Extensibility** 🔧 NEW
- Custom component injection via `PageProps`
- Lifecycle callback hooks (`onMountComplete`, `onQuerySuccess`, `onQueryError`)
- Configuration deep merging with precedence rules
- Custom platform adapter support

---

## Breaking Changes

### 1. **Dependencies Updated**
- **React**: v18+ required (previously v16+)
- **TypeScript**: v5+ required (stricter type checking)
- **React Hook Form**: v7.64+ (peer dependency updated)
- **TanStack React Query**: v5.90+ (peer dependency updated)

**Action Required**: Update your `package.json`:
```bash
npm install react@^19.2.0 react-hook-form@^7.64.0 @tanstack/react-query@^5.90.2
```

### 2. **Platform Adapter Integration** (web only, no action needed)
- Metadata injection now uses automatic platform detection
- `react-helmet-async` is no longer imported at library level (optional for your app)
- Custom metadata manager handles web/native gracefully

**Before (v1.x)**:
```typescript
// You had to install and configure react-helmet-async yourself
import { HelmetProvider } from 'react-helmet-async';

export default function App() {
  return (
    <HelmetProvider>
      <PageGenerator {...pageProps} />
    </HelmetProvider>
  );
}
```

**After (v2.x)** - No wrapper needed:
```typescript
// Platform detection is automatic, metadata handled by library
export default function App() {
  return <PageGenerator {...pageProps} />;
}
```

### 3. **Type Refinements** (minimal impact)
- `ContentItem` now includes optional `lazy`, `lazyTrigger`, and `lazyCondition` fields
- `PageProps` now includes optional `meta`, `lazyLoading`, and `platformOverrides` fields
- All new fields are **optional and default-compatible** with v1.x configurations

**Example**: Your existing v1.x code:
```typescript
const pageProps: PageProps = {
  id: "my-page",
  contents: [{ type: "custom", component: <MyComponent /> }],
  queries: [...],
  form: {...}
};
```

Still works in v2.x without any changes. The new fields are purely additive.

---

## Migration Paths

### Path 1: No Changes Required ✅ (Recommended for MVP)
If you're using basic `PageProps` configurations with:
- Form and query definitions
- Static or simple mapped content
- No special metadata needs

**Action**: Just update the library version, test your pages, and deploy.

```bash
npm install @gaddario98/react-pages@^2.0.0
# Test your app
npm run test
npm run build
```

### Path 2: Adopt Performance Features 🚀 (Recommended for large pages)
For pages with 10+ content sections, complex forms, or rapid interactions:

**Step 1**: Add dependency tracking to content items:
```typescript
const pageProps: PageProps = {
  id: "my-page",
  contents: [
    {
      type: "custom",
      component: <UserProfile />,
      usedQueries: ["user"],        // ← NEW: specify query dependencies
      usedFormValues: ["userId"]     // ← NEW: specify form dependencies
    },
    {
      type: "custom",
      component: <UserHistory />,
      usedQueries: ["history"]
    }
  ],
  queries: [...]
};
```

**Step 2**: Enable form debouncing:
```typescript
const pageProps: PageProps = {
  id: "my-page",
  form: {
    // ... existing form config
    debounceDelay: 300  // ← NEW: debounce form changes by 300ms
  },
  // ... rest of config
};
```

**Step 3**: Leverage automatic memoization:
```typescript
// v2.x hooks now use React Compiler-compatible memoization
// Your components automatically re-render less frequently
```

### Path 3: Add SEO & Metadata 🔍 (Optional for SEO-critical pages)
For pages that need metadata management:

```typescript
const pageProps: PageProps<MyFormFields, MyQueries> = {
  id: "blog-post",
  // ... existing config

  // ← NEW: Add metadata configuration
  meta: {
    title: "Blog Post Title",
    description: "Blog post summary",
    keywords: ["react", "optimization"],

    openGraph: {
      type: "article",
      title: "Blog Post Title",
      description: "Blog post summary",
      image: "https://example.com/image.jpg",
      url: "https://example.com/blog/post"
    },

    structuredData: {
      type: "Article",
      schema: {
        headline: "Blog Post Title",
        datePublished: "2025-10-31"
      }
    }
  }
};
```

Or use dynamic metadata based on query data:
```typescript
const pageProps: PageProps<MyFormFields, MyQueries> = {
  id: "blog-post",
  meta: {
    // Dynamic metadata function - receives query/form data
    title: ({ allQuery }) => `${allQuery.post.data?.title || "Loading..."}`,
    description: ({ allQuery }) => allQuery.post.data?.excerpt || "",
  }
};
```

### Path 4: Implement Lazy Loading ⚡ (Optional for large apps)
For pages with conditional content or large bundles:

```typescript
const pageProps: PageProps = {
  id: "dashboard",
  contents: [
    // Always loaded
    { type: "custom", component: <Dashboard /> },

    // ← NEW: Lazy load on viewport intersection
    {
      type: "custom",
      component: <Analytics />,
      lazy: true,
      lazyTrigger: "viewport"  // Load when visible
    },

    // ← NEW: Lazy load conditionally
    {
      type: "custom",
      component: <AdminPanel />,
      lazy: true,
      lazyCondition: ({ formValues }) => formValues.isAdmin  // Load if admin
    }
  ],
  form: { ... },
  queries: [...]
};
```

### Path 5: Extend System with Custom Components 🔧 (Optional)
For maximum customization:

```typescript
const pageProps: PageProps = {
  id: "my-page",
  // ... existing config

  // ← NEW: Custom component injection
  viewSettings: {
    // Custom page container component
    customPageContainer: MyCustomPageContainer,

    // Custom form wrapper
    customFormComponent: MyCustomFormWrapper
  }
};
```

---

## Deprecation Warnings

The following APIs continue to work but are marked deprecated. They will be removed in v3.0:

### Deprecated: Direct `react-helmet-async` import
```typescript
// ❌ DON'T DO THIS in v2.x (still works, but triggers deprecation warning)
import { HelmetProvider } from 'react-helmet-async';
<HelmetProvider>
  <PageGenerator {...pageProps} />
</HelmetProvider>

// ✅ DO THIS instead
<PageGenerator {...pageProps} />  // Metadata handled automatically
```

### Deprecated: Inline metadata via `viewSettings`
```typescript
// ❌ This pattern is deprecated (still works)
const pageProps = {
  id: "page",
  viewSettings: {
    metaTitle: "...",
    metaDescription: "..."
  }
};

// ✅ Use new meta field instead
const pageProps = {
  id: "page",
  meta: {
    title: "...",
    description: "..."
  }
};
```

---

## Code Example Comparisons

### Example 1: Basic Page Configuration

**v1.x**:
```typescript
import { PageGenerator } from '@gaddario98/react-pages';

export function MyPage() {
  const pageProps = {
    id: "my-page",
    contents: [
      { type: "custom", component: <MyForm /> }
    ],
    form: {
      fields: [/* form config */],
      onSubmit: handleSubmit
    },
    queries: [/* query config */]
  };

  return <PageGenerator {...pageProps} />;
}
```

**v2.x** (backward compatible - no changes needed):
```typescript
import { PageGenerator } from '@gaddario98/react-pages';

export function MyPage() {
  const pageProps = {
    id: "my-page",
    contents: [
      { type: "custom", component: <MyForm /> }
    ],
    form: {
      fields: [/* form config */],
      onSubmit: handleSubmit
    },
    queries: [/* query config */]
  };

  return <PageGenerator {...pageProps} />;
}
```

### Example 2: Performance-Optimized Page

**v1.x** (no optimization):
```typescript
const pageProps = {
  id: "dashboard",
  contents: [
    { type: "custom", component: <Stats /> },
    { type: "custom", component: <Chart /> },
    { type: "custom", component: <Table /> }
  ],
  queries: [
    { key: "stats", ... },
    { key: "chart", ... },
    { key: "table", ... }
  ]
};
```

**v2.x** (with performance optimization):
```typescript
const pageProps = {
  id: "dashboard",
  contents: [
    {
      type: "custom",
      component: <Stats />,
      usedQueries: ["stats"]  // ← Only re-renders when stats query changes
    },
    {
      type: "custom",
      component: <Chart />,
      usedQueries: ["chart"]   // ← Only re-renders when chart query changes
    },
    {
      type: "custom",
      component: <Table />,
      usedQueries: ["table"]   // ← Only re-renders when table query changes
    }
  ],
  queries: [
    { key: "stats", ... },
    { key: "chart", ... },
    { key: "table", ... }
  ]
};
```

### Example 3: SEO-Optimized Page

**v1.x** (manual metadata):
```typescript
import { HelmetProvider, Helmet } from 'react-helmet-async';

export function BlogPost() {
  const pageProps = {
    id: "blog-post",
    // ... page config
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>Blog Post Title</title>
        <meta name="description" content="Blog post summary" />
        <meta property="og:title" content="Blog Post Title" />
        <meta property="og:image" content="..." />
      </Helmet>
      <PageGenerator {...pageProps} />
    </HelmetProvider>
  );
}
```

**v2.x** (declarative metadata in PageProps):
```typescript
export function BlogPost() {
  const pageProps = {
    id: "blog-post",
    meta: {
      title: "Blog Post Title",
      description: "Blog post summary",
      openGraph: {
        type: "article",
        title: "Blog Post Title",
        image: "..."
      }
    },
    // ... page config
  };

  return <PageGenerator {...pageProps} />;
}
```

### Example 4: Lazy-Loaded Content

**v1.x** (manual React.lazy):
```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

export function MyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

**v2.x** (declarative lazy loading):
```typescript
export function MyPage() {
  const pageProps = {
    id: "my-page",
    contents: [
      {
        type: "custom",
        component: <HeavyComponent />,
        lazy: true,
        lazyTrigger: "viewport"  // Load when visible
      }
    ]
  };

  return <PageGenerator {...pageProps} />;
}
```

---

## Testing Your Migration

### 1. Update Dependencies
```bash
npm install @gaddario98/react-pages@^2.0.0
npm install react@^19 react-hook-form@^7.64 @tanstack/react-query@^5.90
```

### 2. Run Type Check
```bash
npm run type-check  # or: npx tsc --noEmit
```

### 3. Run Your Tests
```bash
npm run test
```

### 4. Verify Production Build
```bash
npm run build
npm run build:size  # If available
```

### 5. Test in Development
```bash
npm run dev
# Or your development command
# Navigate to pages and verify they render correctly
```

### 6. Check for Deprecation Warnings
Look in the browser console for v1.x deprecation warnings during development:
```
⚠️ [react-pages v2] react-helmet-async wrapper is deprecated. Remove <HelmetProvider> - metadata is handled automatically.
```

---

## Getting Help

### Resources
- **Quickstart Guide**: See `/specs/002-page-system-redesign/quickstart.md`
- **API Documentation**: Check inline JSDoc comments in source code
- **Examples**: View `/contracts/examples/` for working examples
- **Issues**: https://github.com/gaddario98/react-pages/issues

### Common Issues

**Q: My page doesn't render metadata anymore**
A: Ensure you're not wrapping `<PageGenerator>` in `<HelmetProvider>`. Metadata injection is now automatic.

**Q: Form debouncing not working**
A: Add `debounceDelay` to your form config, or ensure form data binding is correct.

**Q: Lazy loading not triggering**
A: For viewport-based lazy loading, ensure `lazyTrigger: "viewport"` is set and the parent component has scroll context.

**Q: Bundle size increased**
A: New dependencies (use-debounce, fast-deep-equal) add ~2 KB gzipped. Lazy loading should offset this for large apps.

---

## Summary of Actions by Use Case

| Use Case | Required Changes | Optional Enhancements | Effort |
|----------|------------------|----------------------|--------|
| **MVP (Basic Pages)** | Update deps, run tests | None | ~30 min |
| **Performance-Critical Pages** | Update deps + add dependency tracking | Debounce form input | ~2 hours |
| **SEO-Critical Pages** | Update deps + add meta config | Dynamic metadata | ~3 hours |
| **Large SPAs with Lazy Load** | Update deps + lazy config | Error boundaries + analytics | ~4 hours |
| **Highly Customized Pages** | All above + custom components | Platform adapters | ~8 hours |

---

## Version Compatibility Matrix

| Feature | v1.x | v2.x | Notes |
|---------|------|------|-------|
| Basic PageProps | ✅ | ✅ | 100% backward compatible |
| Form Integration | ✅ | ✅ | Enhanced with debouncing |
| Query Integration | ✅ | ✅ | Enhanced with selective re-rendering |
| Metadata | ⚠️ (manual) | ✅ (declarative) | New meta field in PageProps |
| React Native | ❌ | ✅ | New cross-platform support |
| Lazy Loading | ⚠️ (manual) | ✅ (declarative) | New lazy field in ContentItem |
| Dependency Tracking | ❌ | ✅ | New usedQueries/usedFormValues |
| Performance Optimization | ⚠️ (limited) | ✅ | React Compiler compatible |
| Custom Components | ❌ | ✅ | Via viewSettings customization |

---

## What's Coming in v2.1+

Future versions will include:
- Internationalization (i18n) helpers for metadata
- Advanced analytics hooks
- Web Font optimization helpers
- Image optimization with next/image-like API
- Server-side rendering (SSR) helpers

These will be additive features with no breaking changes to v2.0 APIs.

---

**Need Help?** Open an issue or check the quickstart guide. Happy upgrading! 🚀
