# React Pages v3 - Universal Page System

A powerful, performance-optimized React component library for creating dynamic pages that work seamlessly across web (React DOM) and React Native with integrated form management, query handling, SEO metadata, lazy loading, and content rendering.

**Latest Release**: v3.0.2 | **Upgrade from v1.x?** See [MIGRATION.md](./MIGRATION.md)

## 📋 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Core Components](#-core-components)
- [Features & Functionality](#-features--functionality)
- [API Reference](#-api-reference)
- [Advanced Usage](#-advanced-usage)
- [TypeScript Support](#-typescript-support)
- [Performance](#-performance)
- [Troubleshooting](#-troubleshooting)
- [React Native Integration Strategy](#-react-native-integration-strategy)

## 🚀 Features

### Core Capabilities

- **🌐 Universal Cross-Platform**: Single `PageProps` configuration works on web (React DOM) and React Native
- **⚡ Performance Optimized**: Dependency graph for selective re-rendering, debounced form inputs, 90% fewer re-renders
- **🔍 SEO & AI Metadata**: Dynamic metadata with Open Graph, JSON-LD, and AI hints for search engines
- **📦 Lazy Loading & Code Splitting**: Viewport-triggered lazy loading and conditional content loading
- **🔧 Fully Extensible**: Custom components, lifecycle callbacks, and platform adapters
- **📱 React Native Support**: Official cross-platform support alongside web
- **🚨 Deprecation Warnings**: v1.x API migration guidance with built-in deprecation notices

### Developer Experience

- **TypeScript First**: Full generic type support with strict mode enabled
- **Form Integration**: Built-in form management with validation via `@gaddario98/react-form`
- **Query Management**: Seamless query and mutation handling via `@gaddario98/react-queries`
- **Internationalization**: Namespace-based i18n via `ns` prop and pluggable `translateText` in global config
- **Tree-Shakeable**: 5 optimized entry points for minimal bundle footprint
- **React Compiler**: Automatic memoization and optimization via babel-plugin-react-compiler

## 📦 Installation

```bash
npm install @gaddario98/react-pages
```

### Peer Dependencies

Ensure you have the required peer dependencies installed:

```bash
npm install react@^19.2.0 react-dom@^19.2.0
```

> **Note**: Form management (`@gaddario98/react-form`) and query/mutation handling (`@gaddario98/react-queries`) are **internal dependencies** — you do not need to install them separately. `@tanstack/react-query` is a direct dependency bundled transitively.

## ⚡ Quick Start

Get started in 5 minutes:

```tsx
import { useMemo } from "react";
import {
  PageGenerator,
  type PageProps,
  type QueryDefinition,
} from "@gaddario98/react-pages";

interface MyForm {
  name: string;
}
type MyQueries = [QueryDefinition<"hello", "query", never, string>];

export function MyPage() {
  const props: PageProps<MyForm, MyQueries> = useMemo(
    () => ({
      id: "my-page",
      meta: {
        title: "My Page",
        description: "My awesome page",
      },
      contents: [
        {
          type: "custom",
          // Components can be inline functions accessing form/query state via `get` and `set`
          component: ({ get }) => {
            return <h1>Welcome to {get("form", "name", "Guest")}!</h1>;
          },
        },
      ],
    }),
    [],
  );

  return <PageGenerator<MyForm, MyQueries> {...props} />;
}
```

## 🏗️ Core Components

### PageGenerator

The main orchestrator component that manages page lifecycle, rendering, and data flow.

**What it does:**

- Orchestrates entire page lifecycle and state management
- Integrates form management via `@gaddario98/react-form`
- Manages queries and mutations via `@gaddario98/react-queries`
- Handles metadata injection (SEO, Open Graph, JSON-LD, AI hints)
- Supports lazy loading and code splitting
- Supports pluggable internationalization via `pageConfig.translateText`
- Handles authentication and access control
- Applies lifecycle callbacks (mount, query success/error, form submit)
- Manages dependency graphs for selective re-rendering

**When to use:**

- Creating any dynamic page with forms, queries, or dynamic content
- Pages requiring SEO metadata
- Pages with complex data dependencies
- Multi-step forms or workflows

### RenderComponents

Routes and renders individual content items based on their type (`"custom"` or `"container"`).

**What it does:**

- Dispatches rendering to `RenderComponent` (for `type: "custom"`) or `Container` (for `type: "container"`)
- Handles lazy loading via the `lazy` prop on each content item
- Applies visibility logic (`hidden`) and positioning (`renderInHeader`, `renderInFooter`)
- Supports custom component injection via the `component` prop

**When to use:**

- When you need to render a `ContentItem` outside of a `PageGenerator` (e.g. in a custom shell)
- Building custom page orchestrators that reuse the library's rendering pipeline

### Container

Layout container that organizes content hierarchically.

**What it does:**

- Provides flexible layout for organizing content items
- Manages header/footer sections
- Handles responsive layout on web and React Native
- Applies padding/spacing configuration
- Supports custom layout components
- Manages platform-specific rendering

**When to use:**

- Creating multi-section layouts (header, body, footer)
- Organizing complex page structures
- Building responsive designs

### MetadataManager

Manages all metadata injection and SEO optimization.

**What it does:**

- Injects metadata into document head (web platforms)
- Supports dynamic metadata evaluation based on page state
- Handles Open Graph tags for social sharing
- Injects JSON-LD structured data for search engines
- Supports AI hints and crawler-specific metadata
- Applies robots meta tags (noindex, nofollow, etc.)
- Supports custom meta tags
- Platform-aware injection (web: document head, native: no-op)

**When to use:**

- Pages requiring search engine optimization
- Social media sharing (Open Graph)
- Structured data for rich snippets
- Controlling indexing behavior

## 🎯 Features & Functionality

### 1. Universal Cross-Platform Support

**What it does:**

- Single PageProps configuration generates web and React Native pages
- Platform adapters abstract platform-specific implementations
- Feature detection with graceful degradation
- Platform-specific component overrides

**Example:**

```tsx
<PageGenerator
  id="universal-page"
  platformOverrides={{
    web: {
      viewSettings: { withHeader: true }
    },
    native: {
      viewSettings: { withHeader: false }
    }
  }}
  // Single content configuration for both platforms
  contents={[...]}
/>
```

### 2. Performance Optimization (80-90% fewer re-renders)

**What it does:**

- **Dependency Graph**: Tracks which content items depend on which queries/form values
- **Selective Re-rendering**: Only updates components whose dependencies changed
- **Memoization**: React.memo + fast-deep-equal for stable props
- **Form Debouncing**: Reduces keystroke re-renders by 80% with configurable debounce delays
- **React Compiler Integration**: Automatic optimization at compile time
- **Stable References**: useMemoizedProps hook for stable object/function references

**Example:**

```tsx
<PageGenerator
  id="optimized-page"
  form={{
    data: [{ name: "search", debounceDelay: 300 }],
  }}
  contents={[
    {
      type: "custom",
      // Access state via get() — the library tracks which keys are read
      // and automatically re-renders this item when those values change.
      component: ({ get }) => {
        const search = get("form", "search", "");
        const results = get("query", "results.data", []);
        return <SearchResults search={search} results={results} />;
      },
    },
  ]}
/>
```

**Performance Metrics:**

- Without optimization: Full page re-render on any query/form change
- With optimization: Only affected sections re-render
- Result: 80-90% reduction in re-renders for complex pages

### 3. SEO & Metadata Management

**What it does:**

- **Page Title**: Dynamic or static page titles
- **Meta Description**: SEO description tags
- **Keywords**: Searchable keywords for SEO
- **Open Graph Tags**: Social media sharing (title, description, image, URL, type)
- **JSON-LD Structured Data**: Rich snippets for search engines
- **AI Hints**: Custom metadata for AI crawlers and models
- **Robots Meta Tags**: Control indexing (noindex, nofollow, noarchive, etc.)
- **Custom Meta Tags**: Arbitrary meta tag support
- **i18n Support**: Automatic translation of metadata
- **Dynamic Evaluation**: Metadata based on page state

**Example:**

```tsx
<PageGenerator
  id="seo-page"
  meta={{
    title: "Product Details",
    description: "High-quality product with amazing features",
    keywords: ["product", "quality"],
    openGraph: {
      title: "Check out this product!",
      description: "Amazing features included",
      image: "https://example.com/og-image.png",
      url: "https://example.com/product",
      type: "product"
    },
    structuredData: {
      type: "Product",
      schema: {
        name: "Product Name",
        price: "99.99"
      }
    },
    aiHints: {
      contentClassification: "product-page",
      contextualInfo: "Product information page",
      excludeFromIndexing: false
    },
    robots: {
      noindex: false,
      nofollow: false,
      noarchive: false
    }
  }}
  contents={[...]}
/>
```

### 4. Form Management & Validation

**What it does:**

- **Field Configuration**: Text, email, password, textarea, select, checkbox, radio, date, etc.
- **Built-in Validation**: Required, pattern, min/max length, email format, custom validators
- **`@gaddario98/react-form` Integration**: Full form state management
- **Default Values**: From queries or manual configuration
- **Form State**: Tracks form values, errors, touched fields, submission state
- **Submission Handling**: Success/error callbacks with access to mutations
- **Debouncing**: Configurable keystroke debouncing (80% reduction in re-renders)
- **Custom Submit**: Full control over submission logic

**Example:**

```tsx
<PageGenerator
  id="form-page"
  form={{
    defaultValues: { email: "", message: "" },
    data: [
      {
        name: "email",
        type: "email",
        placeholder: "your@email.com",
        rules: {
          onChange: ({ value }) => !value ? 'Email is required' : undefined
        }
      },
      {
        name: "message",
        type: "textarea",
        placeholder: "Your message"
      }
    ],
    // The submit array can be a function accessing queries and mutations
    submit: ({ get }) => {
      const sendEmail = get('mutation', 'sendEmail.mutateAsync');
      const isPending = get('mutation', 'sendEmail.isPending', false);

      return [
        {
          values: ['email', 'message'],
          component: ({ onClick }) => (
            <button onClick={onClick} disabled={isPending}>
              {isPending ? "Sending..." : "Send"}
            </button>
          ),
          onSuccess: sendEmail
        }
      ];
    }
  }}
  contents={[...]}
/>
```

### 5. Query & Mutation Management

**What it does:**

- **`@gaddario98/react-queries` Integration**: Seamless query and mutation handling
- **Query Definitions**: Type-safe query configurations
- **Mutation Support**: Data mutation with success/error handling
- **Automatic Caching**: Built-in caching via `@gaddario98/react-queries`
- **Refetching**: Manual and automatic refetch triggers
- **Dependent Queries**: Queries that depend on other query results
- **Query Status**: Loading, error, success state tracking
- **Invalidation**: Automatic query invalidation on mutations
- **Polling**: Automatic periodic refetch support

**Example:**

```tsx
<PageGenerator
  id="data-page"
  queries={[
    {
      type: "query",
      key: "products",
      queryConfig: {
        queryKey: ["products"],
        queryFn: () => fetch("/api/products").then((r) => r.json()),
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    },
    {
      type: "mutation",
      key: "addProduct",
      mutationConfig: {
        mutationFn: (newProduct) =>
          fetch("/api/products", {
            method: "POST",
            body: JSON.stringify(newProduct),
          }),
      },
    },
  ]}
  contents={[
    {
      type: "custom",
      component: ({ get }) => {
        const isLoading = get("query", "products.isLoading", false);
        const products = get("query", "products.data", []);

        return (
          <div>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <ul>
                {products.map((p) => (
                  <li key={p.id}>{p.name}</li>
                ))}
              </ul>
            )}
          </div>
        );
      },
      // Note: usedQueries is deprecated. React-pages tracks usage via the `get` method automatically.
    },
  ]}
/>
```

### 6. Lazy Loading & Code Splitting

**What it does:**

- **Viewport Detection**: Uses Intersection Observer to detect when content enters viewport
- **On-Demand Loading**: Load components only when needed
- **Suspense Integration**: Native React 18+ Suspense support with fallbacks
- **Error Boundaries**: Handles failed lazy loads gracefully
- **Configurable Triggers**: Viewport, interaction, or conditional triggers
- **Custom Placeholders**: Custom UI while loading
- **Performance Tracking**: Metrics for lazy load timing
- **Preloading**: Optional preload hints for optimization

**Example:**

```tsx
<PageGenerator
  id="lazy-page"
  // Global page-level configuration for lazy loading
  lazyLoading={{
    threshold: 0.1,
    rootMargin: "100px",
    placeholder: <div className="animate-pulse h-64 bg-gray-200 rounded-md" />,
  }}
  contents={[
    {
      type: "custom",
      component: <HeavyChart />,
      // Content-item level lazy loading activation
      lazy: true,
      lazyTrigger: "conditional",
      lazyCondition: ({ get }) => get("form", "showChart", false) === true,
    },
    {
      type: "custom",
      component: <AnotherHeavyComponent />,
      lazy: true,
      lazyTrigger: "viewport",
    },
  ]}
/>
```

### 7. Extensibility & Customization

**What it does:**

- **Custom Components**: Override default containers and layouts
- **Lifecycle Callbacks**: Hooks into component lifecycle
  - `onMountComplete`: After component mounts and queries load
  - `onQuerySuccess`: When a query succeeds
  - `onQueryError`: When a query fails
  - `onFormSubmit`: When form is submitted
  - `onValuesChange`: When form/state values change (receives `{ get, set }` context)
- **Platform Adapters**: Custom implementations per platform
- **Configuration Deep Merge**: Extend global pageConfig without overwrites
- **View Settings Overrides**: Control layout per page
- **Custom Metadata Evaluation**: Dynamic metadata from page state

**Example:**

```tsx
<PageGenerator
  id="extensible-page"
  lifecycleCallbacks={{
    onMountComplete: async ({ get }) => {
      // Access current state via 'get'
      const queryData = get('query', 'myQuery');
      console.log("Page mounted with queries:", queryData);
      // Track analytics, initialize third-party services, etc.
    },
    onQuerySuccess: async (context, queryKey, data) => {
      console.log(`Query ${queryKey} succeeded:`, data);
    },
    onQueryError: async (context, queryKey, error) => {
      console.error(`Query ${queryKey} failed:`, error);
    },
    onFormSubmit: async (context, result) => {
      console.log("Form submitted successfully:", result);
    }
  }}
  viewSettings={{
    layoutComponent: MyCustomLayout,
    pageContainerComponent: MyCustomPageContainer,
  }}
  contents={[...]}
/>
```

### 8. Authentication & Access Control

**What it does:**

- **Global Authentication State**: Track if user is logged in
- **Protected Pages**: Redirect to login if not authenticated
- **Role-Based Access**: Custom access control logic
- **Conditional Content**: Show/hide content based on auth state
- **Login Page Configuration**: Custom login page fallback
- **User Context**: Access to user data throughout page

**Example:**

```tsx
// Configure globally
pageConfig.isLogged = (user) => !!user?.token;
pageConfig.authPageProps = {
  id: "login",
  contents: [{ type: "custom", component: <LoginForm /> }]
};

// Use in page
<PageGenerator
  id="protected-page"
  enableAuthControl={true}
  contents={[...]}
/>
```

### 9. Internationalization (i18n)

**What it does:**

- **Namespace Support**: The `ns` prop scopes translations per page
- **Pluggable Translation**: Wire any i18n library (e.g. i18next, react-intl) via `pageConfig.translateText`
- **Locale Config**: Set the active locale via `pageConfig.locale`
- **Metadata Translation**: Pass pre-translated strings to the `meta` prop

> **Note**: This library does **not** depend on `react-i18next` or any i18n library directly. You supply a `translateText` function in the global config, and the library will call it when needed.

**Example:**

```tsx
// In your global provider, wire up your i18n solution:
setPageConfig((prev) => ({
  ...prev,
  locale: "it",
  translateText: (key, options) => i18next.t(key, options),
}));

// Then in your page, simply pass the namespace:
<PageGenerator
  id="i18n-page"
  ns="myPage"
  meta={{
    title: i18next.t("myPage:meta.title"),
    description: i18next.t("myPage:meta.description"),
  }}
  contents={[...]}
/>
```

### 10. Container & Layout Management

**What it does:**

- **Hierarchical Layout**: Organize content in nested containers
- **Header/Footer Support**: Dedicated header and footer sections
- **Responsive Design**: Different layouts for mobile/tablet/desktop
- **Padding Control**: Fine-grained control over spacing
- **Custom Containers**: Use custom layout components
- **Platform-Specific Layouts**: Different layouts for web vs. React Native
- **Refresh Control**: Manual refresh buttons for content

**Example:**

```tsx
<PageGenerator
  id="layout-page"
  viewSettings={{
    withoutPadding: false,
    disableRefreshing: false,
  }}
  contents={[
    // Use renderInHeader/renderInFooter to place items in the header/footer slots
    { type: "custom", component: <Header />, renderInHeader: true },
    { type: "custom", component: <Footer />, renderInFooter: true },
    {
      type: "container",
      items: [
        { type: "custom", component: <Section1 />, index: 0 },
        { type: "custom", component: <Section2 />, index: 1 },
      ],
    },
  ]}
/>
```

## 🔧 API Reference

### PageGenerator Props (Complete)

| Prop                 | Type                              | Description                                                   |
| -------------------- | --------------------------------- | ------------------------------------------------------------- |
| `id`                 | `string`                          | Unique page identifier (required)                             |
| `contents`           | `ContentItemsType<F, Q, V>`       | Page content configuration                                    |
| `queries`            | `QueryPageConfigArray<F, Q, V>`   | Query and mutation definitions                                |
| `form`               | `FormPageProps<F, Q, V>`          | Form configuration and fields                                 |
| `variables`          | `V`                               | Custom page-level state variables accessible via `get('state', ...)` |
| `viewSettings`       | `ViewSettings \| MappedItemsFunction` | Layout, styling, and behavior settings                   |
| `meta`               | `MetadataConfig<F, Q>`            | SEO and metadata configuration                                |
| `ns`                 | `string`                          | i18n namespace for translations                               |
| `enableAuthControl`  | `boolean`                         | Enable authentication checks (default: `true`)                |
| `lazyLoading`        | `LazyLoadingConfig`               | Global lazy-loading configuration for the page                |
| `lifecycleCallbacks` | `LifecycleCallbacks<F, Q, V>`     | Mount, query, and form callbacks                              |
| `platformOverrides`  | `PlatformOverrides<F, Q, V>`      | Platform-specific prop overrides                              |

### Content Item Types

#### Custom Content

```tsx
{
  type: "custom",
  component: React.JSX.Element | ((props: FunctionProps) => React.JSX.Element),
  index?: number,
  /** @deprecated — use get() inside component to track dependencies automatically */
  usedQueries?: string[],
  renderInHeader?: boolean,
  renderInFooter?: boolean,
  hidden?: boolean | ((props: FunctionProps) => boolean),
  key?: string,
  isDraggable?: boolean,
  isInDraggableView?: boolean,
  lazy?: boolean,                    // Enable lazy loading
  lazyTrigger?: "viewport" | "interaction" | "conditional",
  lazyCondition?: (props: FunctionProps) => boolean
}
```

#### Container Content

```tsx
{
  type: "container",
  items: ContentItem[],
  component?: React.ComponentType,
  // ... same optional props as custom
}
```

### Metadata Configuration (Complete)

```tsx
{
  title?: string | ((context: FunctionProps) => string),
  description?: string | ((context: FunctionProps) => string),
  keywords?: string[] | ((context: FunctionProps) => string[]),
  canonical?: string | ((context: FunctionProps) => string),
  lang?: string,
  author?: string,
  viewport?: string,
  themeColor?: string,
  robots?: {
    noindex?: boolean,
    nofollow?: boolean,
    noarchive?: boolean,
    nosnippet?: boolean,
    maxImagePreview?: "none" | "standard" | "large",
    maxSnippet?: number
  },
  disableIndexing?: boolean,  // shorthand for noindex + nofollow
  openGraph?: {
    type?: "website" | "article" | "product" | "profile",
    title?: string | ((context: FunctionProps) => string),
    description?: string | ((context: FunctionProps) => string),
    image?: string | OpenGraphImage | ((context: FunctionProps) => string | OpenGraphImage),
    images?: OpenGraphImage[] | ((context: FunctionProps) => OpenGraphImage[]),
    url?: string | ((context: FunctionProps) => string),
    siteName?: string,
    locale?: string,
    article?: OpenGraphArticle  // when type='article'
  },
  twitter?: {
    card?: "summary" | "summary_large_image" | "app" | "player",
    site?: string,
    creator?: string,
    title?: string | ((context: FunctionProps) => string),
    description?: string | ((context: FunctionProps) => string),
    image?: string | ((context: FunctionProps) => string),
    imageAlt?: string | ((context: FunctionProps) => string)
  },
  alternates?: {
    canonical?: string,
    languages?: Record<string, string>,  // locale → URL for hreflang
    media?: Record<string, string>,
    types?: Record<string, Array<{ url: string; title?: string }>>
  },
  icons?: {
    icon?: string | IconConfig | IconConfig[],
    apple?: string | IconConfig | IconConfig[],
    shortcut?: string
  },
  manifest?: string,
  structuredData?: {
    type: "Article" | "Product" | "WebPage" | "FAQPage" | "Organization" | "Person" | "WebSite" | "BreadcrumbList",
    schema: Record<string, unknown> | ((context: FunctionProps) => Record<string, unknown>)
  },
  aiHints?: {
    contentClassification?: string | ((context: FunctionProps) => string),
    modelHints?: string[] | ((context: FunctionProps) => string[]),
    contextualInfo?: string | ((context: FunctionProps) => string),
    excludeFromIndexing?: boolean
  },
  customMeta?: Array<MetaTag> | ((context: FunctionProps) => Array<MetaTag>)
}
```

### Form Configuration (Complete)

```tsx
{
  data: FormManagerConfig[],
  submit: Submit[],
  debounceDelay?: number,            // Debounce keystroke changes
  defaultValueQueryKey?: string[],
  defaultValueQueryMap?: (data) => DefaultValues,
  usedQueries?: string[],
  validation?: {
    mode?: "onChange" | "onBlur" | "onSubmit",
    reValidateMode?: "onChange" | "onBlur" | "onSubmit"
  }
}
```

### Query Configuration (Complete)

```tsx
// Query
{
  type: "query",
  key: string,
  // The callback receives { get, set } (FunctionProps), not the full PageProps.
  queryConfig?: QueryProps | ((props: FunctionProps<F, Q>) => QueryProps)
}

// Mutation
{
  type: "mutation",
  key: string,
  mutationConfig?: MutationConfig | ((props: FunctionProps<F, Q>) => MutationConfig)
}
```

## 📚 Advanced Usage

### Dynamic Content Based on Query State

```tsx
<PageGenerator
  id="dynamic-page"
  queries={[...]}
  contents={({ get }) => [
    {
      type: "custom",
      component: (
        <div>
          {get("query", "data.isLoading", false) && <Spinner />}
          {get("query", "data.error") && <Error message={get("query", "data.error.message", "")} />}
          {get("query", "data.data") && <DataDisplay data={get("query", "data.data")} />}
        </div>
      ),
      index: 0
    }
  ]}
/>
```

### Form with Dynamic Content

```tsx
<PageGenerator
  id="form-with-dynamic-content"
  form={{
    data: [
      { name: "type", type: "select", options: ["A", "B", "C"] },
      { name: "details", type: "textarea" },
    ],
  }}
  contents={({ get }) => [
    {
      type: "custom",
      component: <TypeSpecificContent type={get("form", "type")} />,
      index: 0,
    },
  ]}
/>
```

### Multiple Dependent Queries

```tsx
<PageGenerator
  id="dependent-queries"
  queries={[
    {
      type: "query",
      key: "user",
      queryConfig: { ... }
    },
    {
      type: "query",
      key: "posts",
      queryConfig: ({ get }) => ({
        queryKey: ["posts", get("query", "user.data.id")],
        queryFn: () => fetch(`/api/users/${get("query", "user.data.id")}/posts`).then(r => r.json()),
        enabled: !!get("query", "user.data.id")  // Only run when user is loaded
      })
    }
  ]}
  contents={({ get }) => [...]}
/>
```

## 🧪 TypeScript Support

Full generic type support for form data and queries:

```tsx
interface UserFormData {
  username: string;
  email: string;
  age: number;
}

type PageQueries = [
  QueryDefinition<"users", "query", never, User[]>,
  QueryDefinition<"createUser", "mutation", UserFormData, User>,
];

// Full type safety
<PageGenerator<UserFormData, PageQueries>
  id="typed-page"
  form={{
    data: [
      // Fully typed - autocomplete for field names
      { name: "username", type: "text" },
      { name: "email", type: "email" },
    ],
  }}
  contents={({ get }) => [
    {
      type: "custom",
      component: (() => {
        // Fully typed: get('mutation', 'createUser.mutate') returns the mutate fn
        const mutate = get("mutation", "createUser.mutate");
        const formValues = {
          username: get("form", "username", ""),
          email: get("form", "email", ""),
        };
        return (
          <button onClick={() => mutate(formValues)}>
            Create User
          </button>
        );
      })(),
    },
  ]}
/>;
```

## ⚡ Performance

### Bundle Size (All Tree-Shakeable)

| Entry Point | Size   | Gzipped |
| ----------- | ------ | ------- |
| Main        | 145 KB | ~35 KB  |
| /components | 132 KB | ~31 KB  |
| /hooks      | 76 KB  | ~18 KB  |
| /config     | 12 KB  | ~2 KB   |
| /utils      | 24 KB  | ~5 KB   |

### Performance Improvements

- **80% Keystroke Reduction**: Form debouncing eliminates unnecessary re-renders
- **90% Query-Based Re-render Reduction**: Dependency tracking only updates affected sections
- **React Compiler**: Automatic memoization at compile time
- **Lazy Loading**: Code splitting reduces initial bundle by deferring heavy components

### Optimization Tips

1. **Use `get()` inside components**: The library tracks which keys are read and re-renders only affected items — no need to manually declare dependencies
2. **Use Lazy Loading**: For components below the fold, enable `lazy: true` on content items
3. **Selective Imports**: Import from `/hooks`, `/config`, `/utils` to reduce bundle
4. **Debounce Forms**: Use `debounceDelay` for search fields to reduce keystroke re-renders
5. **Memoize Custom Components**: Wrap stable components with `React.memo`

## 🏗️ Global Configuration

```tsx
import { usePageConfigState } from "@gaddario98/react-pages";
import { useEffect } from "react";

export function GlobalProvider({ children }) {
  const [, setPageConfig] = usePageConfigState();

  useEffect(() => {
    setPageConfig((prev) => ({
      ...prev,
      // Set default metadata
      defaultMetadata: {
        title: "My App",
        description: "Default description",
      },
      // Set custom components
      PageContainer: MyPageContainer,
      BodyContainer: MyBodyContainer,
      // Configure authentication
      isLogged: (user) => !!user?.token,
      authPageProps: { id: "login-page" },
      // Configure lazy loading globally
      lazyLoading: {
        enabled: true,
        preloadOnHover: true,
        timeout: 30000,
      },
    }));
  }, [setPageConfig]);

  return <>{children}</>;
}
```

## 🐛 Troubleshooting

### Form Not Submitting

- Check `submit` array is configured
- Verify form validation passes
- Check `onSuccess` callback doesn't throw

### Queries Not Loading

- Verify `queryFn` is correct
- Check `enabled` flag (defaults to true)
- Verify network requests in DevTools

### Metadata Not Appearing

- Ensure `meta` is provided in PageGenerator
- Check MetadataManager component is rendered
- Verify browser head element exists (web only)

### Re-renders Too Frequent

- Use `get()` inside the `component` function instead of receiving data as props — the library will track dependencies automatically
- Use `debounceDelay` on form fields
- Wrap stable custom components with `React.memo`

### TypeScript Errors

- Ensure generic types match form/query definitions
- Use `as const` for query key arrays
- Verify peer dependencies are installed

## 📱 React Native Integration Strategy

`@gaddario98/react-pages` is **platform-agnostic by design**: it imports no React DOM or React Native specific APIs. All rendering logic (forms, queries, metadata, lazy loading, dependency tracking) is decoupled from layout components, which are injected externally via the global configuration (`pageConfig`).

### Architecture

`PageGenerator` composes the page layout through five abstract, fully configurable slots:

| Global slot | Role | Default |
|---|---|---|
| `PageContainer` | Outermost page wrapper (navigation integration) | `({ children }) => children` |
| `BodyContainer` | Scrollable body container | `({ children }) => children` |
| `HeaderContainer` | Header slot (receives `renderInHeader` items) | `({ children }) => children` |
| `FooterContainer` | Footer slot (receives `renderInFooter` items) | `({ children }) => children` |
| `ItemsContainer` | Children wrapper for `type: "container"` items | `({ children }) => children` |

On **web**, these are replaced with `div` elements, CSS layouts, etc. On **React Native**, they are replaced with the equivalent native components.

> `MetadataManager` is a **no-op on React Native**: it only writes to `document.head` when `typeof document !== 'undefined'`. No crashes, no extra configuration required.

### Setup for React Native

```tsx
// rnPages/setup.tsx
import { View, ScrollView } from "react-native";
import { usePageConfigState } from "@gaddario98/react-pages";
import { useEffect } from "react";

export function ReactNativePageProvider({ children }: { children: React.ReactNode }) {
  const [, setPageConfig] = usePageConfigState();

  useEffect(() => {
    setPageConfig((prev) => ({
      ...prev,
      // Native navigation wrapper (e.g. React Navigation Screen, Expo Router)
      PageContainer: ({ children, id }) => (
        <View style={{ flex: 1 }} accessibilityLabel={id}>
          {children}
        </View>
      ),
      // Scrollable body
      BodyContainer: ({ children }) => (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {children}
        </ScrollView>
      ),
      // Native header slot
      HeaderContainer: ({ children }) => (
        <View>{children}</View>
      ),
      // Native footer slot
      FooterContainer: ({ children }) => (
        <View>{children}</View>
      ),
      // Wrapper for grouped items (type: "container")
      ItemsContainer: ({ children }) => (
        <View>{children}</View>
      ),
    }));
  }, [setPageConfig]);

  return <>{children}</>;
}
```

Mount `ReactNativePageProvider` once near the root of your app:

```tsx
// App.tsx
export default function App() {
  return (
    <ReactNativePageProvider>
      <NavigationContainer>
        {/* your screens */}
      </NavigationContainer>
    </ReactNativePageProvider>
  );
}
```

### Using PageGenerator in a screen

Once the containers are configured, `PageGenerator` works identically on React Native:

```tsx
import { PageGenerator } from "@gaddario98/react-pages";
import { Text } from "react-native";

export function ProfileScreen() {
  return (
    <PageGenerator
      id="profile-screen"
      enableAuthControl={true}
      queries={[
        {
          type: "query",
          key: "profile",
          queryConfig: {
            queryKey: ["profile"],
            queryFn: () => fetchProfile(),
          },
        },
      ]}
      contents={({ get }) => [
        {
          type: "custom",
          component: (
            <Text>{get("query", "profile.data.name", "Loading...")}</Text>
          ),
        },
      ]}
    />
  );
}
```

### Per-page overrides with `platformOverrides`

The `platformOverrides` prop lets you differentiate a single page's configuration between web and React Native without duplicating the component:

```tsx
<PageGenerator
  id="dashboard"
  platformOverrides={{
    web: {
      viewSettings: { withoutPadding: false },
    },
    native: {
      viewSettings: { withoutPadding: true, disableRefreshing: false },
    },
  }}
  contents={[...]}
/>
```

### What requires no override

| Feature | Behavior on React Native |
|---|---|
| Form management | Works — field components are provided by the consumer |
| Query / Mutation | Works — no DOM dependency |
| `get` / `set` API | Works — pure React logic |
| `lifecycleCallbacks` | Works — no DOM dependency |
| `MetadataManager` | Silent no-op |
| Lazy loading | `lazyTrigger: "viewport"` unavailable (no `IntersectionObserver`); use `"conditional"` or `"interaction"` instead |

## 🏗️ Workspace Integration

Within the monorepo, `@gaddario98/react-pages` is extended by `@gaddario98/react-ionic-pages` to build the app's foundational framework for Ionic mobile environments.

### Ionic Integration Strategy

The `react-ionic-pages` package abstracts `react-pages` global configuration to provide an Ionic-compatible rendering context via the native `<IonPage>` component.

```tsx
// react-ionic-pages/components/page/index.tsx
import React from "react";
import { IonPage } from "@ionic/react";
import { withMemo } from "@gaddario98/utiles";
import { pageConfig } from "@gaddario98/react-pages";

export const IonicPageContainer = withMemo(
  ({ children, id }: React.ComponentProps<typeof pageConfig.PageContainer>) => {
    return (
      <IonPage id={id} key={id}>
        {children}
      </IonPage>
    );
  },
);
```

By substituting the core `PageContainer` with `IonicPageContainer` globally within `react-ionic-pages`, Ionic Native can handle native animations and routing transitions, while delegating the complex logical configuration (forms, queries, metadata, code-splitting) to `react-pages`.

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support and questions:

- Check [MIGRATION.md](./MIGRATION.md) for v1.x upgrade help
- Review [examples](./specs/002-page-system-redesign/contracts/examples/)
- Open an issue on GitHub
