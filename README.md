# @gaddario98/react-pages

A performance-optimized React component library for building dynamic pages that work across web (React DOM) and React Native. It integrates form management, query handling, SEO metadata, and content rendering behind a single unified `PageProps` interface.

**Version**: v3.0.2

---

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Global Configuration](#global-configuration)
- [Architecture](#architecture)
  - [PageGenerator](#pagegenerator)
  - [Content Items & Layout](#content-items--layout)
  - [MetadataManager](#metadatamanager)
  - [Cross-Platform Containers](#cross-platform-containers)
  - [RenderComponents](#rendercomponents)
- [Features](#features)
  - [SEO & Metadata](#seo--metadata)
  - [Form Management](#form-management)
  - [Query & Mutation Management](#query--mutation-management)
  - [Authentication & Access Control](#authentication--access-control)
  - [Internationalization](#internationalization)
  - [Performance Optimization](#performance-optimization)
- [API Reference](#api-reference)
  - [PageGenerator Props](#pagegenerator-props)
  - [Content Item Types](#content-item-types)
  - [`get` / `set` Interface](#get--set-interface)
  - [Metadata Configuration](#metadata-configuration)
  - [Form Configuration](#form-configuration)
  - [Query Configuration](#query-configuration)
- [Advanced Patterns](#advanced-patterns)
- [TypeScript Support](#typescript-support)
- [React Native & Ionic Integration](#react-native--ionic-integration)
- [Troubleshooting](#troubleshooting)

---

## Overview

**Core capabilities:**

- **Universal Cross-Platform**: Single `PageProps` configuration works on web (React DOM) and React Native
- **Performance Optimized**: Automatic dependency tracking for selective re-rendering, debounced form inputs, 90% fewer re-renders
- **SEO & AI Metadata**: Dynamic metadata with Open Graph, Twitter Card, JSON-LD, and AI crawler hints
- **Fully Extensible**: Custom layout containers and platform adapters

**Developer experience:**

- **TypeScript First**: Full generic type support with strict mode
- **Form Integration**: Built-in form management via `@gaddario98/react-form`
- **Query Management**: Query and mutation handling via `@gaddario98/react-queries`
- **Internationalization**: Namespace-based i18n via `ns` prop and pluggable `translateText`
- **Tree-Shakeable**: 5 optimized entry points for minimal bundle footprint
- **React Compiler**: Automatic memoization via `babel-plugin-react-compiler`

---

## Installation

```bash
npm install @gaddario98/react-pages
```

### Peer Dependencies

```bash
npm install react@^19.2.0 react-dom@^19.2.0
```

> **Note**: Form management (`@gaddario98/react-form`) and query/mutation handling (`@gaddario98/react-queries`) are internal dependencies — you do not need to install them separately. `@tanstack/react-query` is bundled transitively.

---

## Quick Start

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
          // Component functions receive { get, set } for type-safe state access
          component: ({ get }) => (
            <h1>Welcome, {get("form", "name", "Guest")}!</h1>
          ),
        },
      ],
    }),
    [],
  );

  return <PageGenerator<MyForm, MyQueries> {...props} />;
}
```

---

## Global Configuration

Before rendering any `PageGenerator`, configure the global defaults once near the root of your app using `usePageConfigState`:

```tsx
import { usePageConfigState } from "@gaddario98/react-pages";
import { useEffect } from "react";

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [, setPageConfig] = usePageConfigState();

  useEffect(() => {
    setPageConfig((prev) => ({
      ...prev,
      // Default SEO metadata applied to all pages
      defaultMetadata: {
        title: "My App",
        description: "Default description",
      },
      // Custom layout containers (web or React Native)
      PageContainer: MyPageContainer,
      BodyContainer: MyBodyContainer,
      // Authentication
      isLogged: (user) => !!user?.token,
      authPageProps: { id: "login-page" },
    }));
  }, [setPageConfig]);

  return <>{children}</>;
}
```

**Key configurable slots in `PageConfigProps`:**

| Key               | Type                                       | Purpose                               |
| ----------------- | ------------------------------------------ | ------------------------------------- |
| `PageContainer`   | `ComponentType`                            | Outermost page wrapper                |
| `BodyContainer`   | `ComponentType`                            | Scrollable body area                  |
| `HeaderContainer` | `ComponentType`                            | Header slot renderer                  |
| `FooterContainer` | `ComponentType`                            | Footer slot renderer                  |
| `ItemsContainer`  | `ComponentType`                            | Wrapper for `type: "container"` items |
| `LoaderComponent` | `ComponentType`                            | Custom loader component               |
| `isLogged`        | `(user) => boolean`                        | Auth check function                   |
| `authValues`      | `PageAuthState \| null`                    | Current authentication state values   |
| `authPageProps`   | `PageProps`                                | Fallback page when not authenticated  |
| `authPageImage`   | `string`                                   | Image URL for the fallback auth page  |
| `defaultMetadata` | `MetadataConfig`                           | Default SEO metadata                  |
| `setMetadata`     | `(config: MetadataConfig) => void`         | Updates current SEO metadata          |
| `getMetadata`     | `() => MetadataConfig`                     | Retrieves current SEO metadata        |
| `resetMetadata`   | `() => void`                               | Resets metadata to defaults           |
| `meta`            | `{ title?: string; description?: string }` | Basic fallback metadata               |
| `translateText`   | `(key, options) => string`                 | Pluggable i18n function               |
| `locale`          | `string`                                   | Active locale                         |

---

## Architecture

### PageGenerator

The main orchestrator component. It wires together forms, queries, metadata, layout, and authentication into a single declarative configuration.

- Orchestrates the full page lifecycle and state management
- Integrates form management via `@gaddario98/react-form`
- Manages queries and mutations via `@gaddario98/react-queries`
- Handles metadata injection (SEO, Open Graph, JSON-LD, AI hints)
- Delegates internationalization to `pageConfig.translateText`
- Handles authentication and access control via `pageConfig.isLogged`
- Tracks data dependencies for selective re-rendering

**When to use:** any page with forms, queries, dynamic content, SEO requirements, or complex data dependencies.

### Content Items & Layout

Content items are distributed across three layout slots: **header**, **body**, and **footer**. Use `renderInHeader` and `renderInFooter` to route items to the corresponding slot. Nest items in a `type: "container"` to group them inside the `ItemsContainer`.

```tsx
<PageGenerator
  id="layout-page"
  viewSettings={{
    withoutPadding: false,
    disableRefreshing: false,
  }}
  contents={[
    { type: "custom", component: <PageHeader />, renderInHeader: true },
    { type: "custom", component: <PageFooter />, renderInFooter: true },
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

### MetadataManager

An internal component (used automatically by `PageGenerator`) that applies resolved metadata to the page.

- Writes to `document.head` on web (title, meta, link, JSON-LD script tags)
- Is a **silent no-op on React Native** (`typeof document === 'undefined'`)
- Supports dynamic metadata evaluation via functions that receive `{ get, set }`

### Cross-Platform Containers

`@gaddario98/react-pages` is **platform-agnostic by design** — it imports no React DOM or React Native–specific APIs. All rendering logic (forms, queries, metadata, dependency tracking) is decoupled from layout, which is injected externally via five configurable container slots in `pageConfig`:

| Slot              | Role                                            | Default                      |
| ----------------- | ----------------------------------------------- | ---------------------------- |
| `PageContainer`   | Outermost page wrapper (navigation integration) | `({ children }) => children` |
| `BodyContainer`   | Scrollable body container                       | `({ children }) => children` |
| `HeaderContainer` | Header slot (receives `renderInHeader` items)   | `({ children }) => children` |
| `FooterContainer` | Footer slot (receives `renderInFooter` items)   | `({ children }) => children` |
| `ItemsContainer`  | Children wrapper for `type: "container"` items  | `({ children }) => children` |

On **web**, replace these with `div` elements and CSS layouts. On **React Native**, replace them with `View`, `ScrollView`, etc. The `PageGenerator` component itself does not change — only the container implementations differ. See [React Native & Ionic Integration](#react-native--ionic-integration) for complete setup examples.

### RenderComponents

An exported component that routes a `ContentItem` to the correct renderer based on its `type` (`"custom"` → `RenderComponent`, `"container"` → `Container`).

**When to use:** rendering a `ContentItem` outside of `PageGenerator` (e.g. in a custom page shell) or building custom orchestrators that reuse the library's rendering pipeline.

---

## Features

### SEO & Metadata

The `meta` prop accepts a rich `MetadataConfig` object. All values can be static strings or evaluator functions that receive `{ get, set }` for dynamic metadata based on page state.

**Supported metadata:**

- Page title and description
- Open Graph (title, description, image, URL, type, article fields)
- Twitter Card
- Canonical URL and `hreflang` alternates
- JSON-LD structured data (schema.org)
- AI crawler hints (`contentClassification`, `modelHints`, `contextualInfo`)
- Robots meta tags (`noindex`, `nofollow`, `noarchive`, `nosnippet`, `maxSnippet`, `maxImagePreview`)
- Icons and PWA manifest
- Custom meta tags

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
      type: "product",
    },
    structuredData: {
      type: "Product",
      schema: {
        name: "Product Name",
        price: "99.99",
      },
    },
    aiHints: {
      contentClassification: "product-page",
      contextualInfo: "Product information page",
      excludeFromIndexing: false,
    },
    robots: {
      noindex: false,
      nofollow: false,
      noarchive: false,
    },
  }}
  contents={[...]}
/>
```

---

### Form Management

Form configuration is passed via the `form` prop. Under the hood it uses `@gaddario98/react-form`.

**Capabilities:**

- Field types: text, email, password, textarea, select, checkbox, radio, date, and more
- Built-in validation: required, pattern, min/max length, custom validators
- Default values sourced from a query result via `defaultValueQueryKey` + `defaultValueQueryMap`
- Form state tracking: values, errors, touched fields, submission state
- Submit buttons configured declaratively, with access to mutations via `get()`
- Per-field `debounceDelay` to reduce re-renders on fast typing

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
          onChange: ({ value }) => !value ? "Email is required" : undefined,
        },
      },
      {
        name: "message",
        type: "textarea",
        placeholder: "Your message",
      },
    ],
    submit: ({ get }) => {
      const sendEmail = get("mutation", "sendEmail.mutateAsync");
      const isPending = get("mutation", "sendEmail.isPending", false);

      return [
        {
          values: ["email", "message"],
          component: ({ onClick }) => (
            <button onClick={onClick} disabled={isPending}>
              {isPending ? "Sending..." : "Send"}
            </button>
          ),
          onSuccess: sendEmail,
        },
      ];
    },
  }}
  contents={[...]}
/>
```

---

### Query & Mutation Management

Queries and mutations are configured via the `queries` prop and managed by `@gaddario98/react-queries` (built on TanStack Query). Query results are scoped to the page and accessible via `get("query", ...)` and `get("mutation", ...)`.

**Capabilities:**

- Type-safe query definitions with `QueryDefinition`
- Queries can be static configs or functions receiving `{ get, set }` for dependent queries
- Full TanStack Query options (`staleTime`, `enabled`, `refetchInterval`, etc.)
- Query results automatically invalidated on mutation success

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

        return isLoading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {products.map((p) => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
        );
      },
    },
  ]}
/>
```

---

### Authentication & Access Control

When `enableAuthControl` is `true` (default), the page checks `pageConfig.isLogged(authValues)` before rendering. If the check fails, it renders `pageConfig.authPageProps` instead.

```tsx
// Configure globally
setPageConfig((prev) => ({
  ...prev,
  isLogged: (user) => !!user?.token,
  authValues: currentUser,
  authPageProps: {
    id: "login",
    contents: [{ type: "custom", component: <LoginForm /> }],
  },
}));

// Protect a page
<PageGenerator
  id="protected-page"
  enableAuthControl={true}
  contents={[...]}
/>
```

---

### Internationalization

The library does not depend on any i18n library. You wire your own translation function via `pageConfig.translateText` and scope it per page with the `ns` prop.

```tsx
// Global setup — wire your i18n solution once
setPageConfig((prev) => ({
  ...prev,
  locale: "it",
  translateText: (key, options) => i18next.t(key, options),
}));

// Per-page usage
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

---

### Performance Optimization

The library tracks which data keys each component reads via the `get()` function and re-renders only the affected items when those values change. No manual dependency declarations needed.

| Technique                             | Impact                                      |
| ------------------------------------- | ------------------------------------------- |
| Automatic `get()` dependency tracking | 90% reduction in query-driven re-renders    |
| Form `debounceDelay`                  | Up to 80% reduction in keystroke re-renders |
| `React.memo` + `fast-deep-equal`      | Stable component identity across renders    |
| React Compiler                        | Automatic memoization at compile time       |

```tsx
<PageGenerator
  id="optimized-page"
  form={{
    data: [{ name: "search", debounceDelay: 300 }],
  }}
  contents={[
    {
      type: "custom",
      component: ({ get }) => {
        // Reading these keys registers dependencies automatically
        const search = get("form", "search", "");
        const results = get("query", "results.data", []);
        return <SearchResults search={search} results={results} />;
      },
    },
  ]}
/>
```

**Tips:**

1. **Use `get()` inside component functions** — the library registers dependencies automatically
2. **Apply `debounceDelay`** on search and filter fields
3. **Import selectively** — use `/hooks`, `/config`, `/utils` sub-paths instead of the main entry
4. **Wrap stable components with `React.memo`** if they receive no dynamic props

### Bundle Size (All Tree-Shakeable)

| Entry Point                      | Size   | Gzipped |
| -------------------------------- | ------ | ------- |
| Main (`@gaddario98/react-pages`) | ~90 KB | ~11 KB  |
| `/components`                    | ~90 KB | ~11 KB  |
| `/hooks`                         | ~76 KB | ~10 KB  |
| `/config`                        | ~12 KB | ~2 KB   |
| `/utils`                         | ~8 KB  | ~2 KB   |

---

## API Reference

### PageGenerator Props

| Prop                | Type                                  | Default | Description                                                     |
| ------------------- | ------------------------------------- | ------- | --------------------------------------------------------------- |
| `id`                | `string`                              | —       | Unique page identifier **(required)**                           |
| `contents`          | `ContentItemsType<F, Q, V>`           | `[]`    | Page content items or a function returning them                 |
| `queries`           | `QueryPageConfigArray<F, Q, V>`       | `[]`    | Query and mutation definitions                                  |
| `form`              | `FormPageProps<F, Q, V>`              | —       | Form configuration and fields                                   |
| `variables`         | `V`                                   | —       | Page-scoped state variables, accessible via `get("state", ...)` |
| `viewSettings`      | `ViewSettings \| MappedItemsFunction` | `{}`    | Layout and behavior settings                                    |
| `meta`              | `MetadataConfig<F, Q, V>`             | —       | SEO and metadata configuration                                  |
| `ns`                | `string`                              | —       | i18n namespace                                                  |
| `enableAuthControl` | `boolean`                             | `true`  | Whether to check authentication before rendering                |

### Content Item Types

#### `type: "custom"`

```tsx
{
  type: "custom",
  component: React.JSX.Element | ((props: FunctionProps) => React.JSX.Element),
  index?: number,
  renderInHeader?: boolean,
  renderInFooter?: boolean,
  hidden?: boolean | ((props: FunctionProps) => boolean),
  key?: string,
  isDraggable?: boolean,
  isInDraggableView?: boolean,
  /** @deprecated — use get() inside component to track dependencies automatically */
  usedQueries?: string[],
}
```

#### `type: "container"`

```tsx
{
  type: "container",
  items: ContentItem[],
  component?: React.ComponentType,  // custom ItemsContainer for this group
  // all optional props from "custom" apply here too
}
```

### `get` / `set` Interface

`FunctionProps<F, Q, V>` provides the `get` and `set` accessors passed to component functions, query/mutation configs, submit handlers, and metadata evaluators:

| Signature                                  | Returns                                          |
| ------------------------------------------ | ------------------------------------------------ |
| `get("query", "myQuery.data")`             | Typed query data                                 |
| `get("query", "myQuery.isLoading", false)` | `boolean` (with default)                         |
| `get("mutation", "myMutation.mutate")`     | Typed mutate function                            |
| `get("form", "fieldName", "")`             | Typed field value                                |
| `get("state", "myVar")`                    | Value from `variables` prop                      |
| `set("form")`                              | Returns `setValue` from `@gaddario98/react-form` |
| `set("state")`                             | Returns a setter for `variables`                 |

### Metadata Configuration

```tsx
{
  // Basic
  title?: string | ((context: FunctionProps) => string),
  description?: string | ((context: FunctionProps) => string),
  keywords?: string[] | ((context: FunctionProps) => string[]),
  canonical?: string | ((context: FunctionProps) => string),
  lang?: string,
  author?: string,
  viewport?: string,
  themeColor?: string,

  // Indexing
  robots?: {
    noindex?: boolean,
    nofollow?: boolean,
    noarchive?: boolean,
    nosnippet?: boolean,
    maxImagePreview?: "none" | "standard" | "large",
    maxSnippet?: number,
  },
  disableIndexing?: boolean,  // shorthand: sets noindex + nofollow

  // Open Graph
  openGraph?: {
    type?: "website" | "article" | "product" | "profile",
    title?: string | ((context: FunctionProps) => string),
    description?: string | ((context: FunctionProps) => string),
    image?: string | OpenGraphImage | ((context: FunctionProps) => string | OpenGraphImage),
    images?: OpenGraphImage[] | ((context: FunctionProps) => OpenGraphImage[]),
    url?: string | ((context: FunctionProps) => string),
    siteName?: string,
    locale?: string,
    article?: OpenGraphArticle,  // used when type="article"
  },

  // Twitter Card
  twitter?: {
    card?: "summary" | "summary_large_image" | "app" | "player",
    site?: string,
    creator?: string,
    title?: string | ((context: FunctionProps) => string),
    description?: string | ((context: FunctionProps) => string),
    image?: string | ((context: FunctionProps) => string),
    imageAlt?: string | ((context: FunctionProps) => string),
  },

  // Alternates / hreflang
  alternates?: {
    canonical?: string,
    languages?: Record<string, string>,  // locale → URL
    media?: Record<string, string>,
    types?: Record<string, Array<{ url: string; title?: string }>>,
  },

  // Icons & PWA
  icons?: {
    icon?: string | IconConfig | IconConfig[],
    apple?: string | IconConfig | IconConfig[],
    shortcut?: string,
  },
  manifest?: string,

  // Structured Data (schema.org JSON-LD)
  structuredData?: {
    type: "Article" | "Product" | "WebPage" | "FAQPage" | "Organization"
        | "Person" | "WebSite" | "BreadcrumbList",
    schema: Record<string, unknown> | ((context: FunctionProps) => Record<string, unknown>),
  },

  // AI Crawler Hints
  aiHints?: {
    contentClassification?: string | ((context: FunctionProps) => string),
    modelHints?: string[] | ((context: FunctionProps) => string[]),
    contextualInfo?: string | ((context: FunctionProps) => string),
    excludeFromIndexing?: boolean,
  },

  // Custom tags
  customMeta?: Array<MetaTag> | ((context: FunctionProps) => Array<MetaTag>),
}
```

### Form Configuration

```tsx
{
  data?: Array<FormManagerConfig | ((props: FunctionProps) => FormManagerConfig)>,
  submit?: Array<Submit> | ((props: FunctionProps) => Array<Submit>),
  defaultValues?: Partial<F>,
  defaultValueQueryKey?: string[],
  defaultValueQueryMap?: (data: QueryResult) => Partial<F>,
  debounceDelay?: number,  // global debounce for all fields (ms)
}
```

### Query Configuration

```tsx
// Query
{
  type: "query",
  key: string,
  queryConfig?: QueryProps | ((props: FunctionProps<F, Q>) => QueryProps),
}

// Mutation
{
  type: "mutation",
  key: string,
  mutationConfig?: MutationConfig | ((props: FunctionProps<F, Q>) => MutationConfig),
}
```

---

## Advanced Patterns

### Dependent Queries

Pass `queryConfig` as a function to access resolved query data when defining a subsequent query:

```tsx
<PageGenerator
  id="dependent-queries"
  queries={[
    {
      type: "query",
      key: "user",
      queryConfig: { queryKey: ["user"], queryFn: fetchUser },
    },
    {
      type: "query",
      key: "posts",
      queryConfig: ({ get }) => ({
        queryKey: ["posts", get("query", "user.data.id")],
        queryFn: () =>
          fetch(`/api/users/${get("query", "user.data.id")}/posts`).then((r) => r.json()),
        enabled: !!get("query", "user.data.id"),
      }),
    },
  ]}
  contents={({ get }) => [...]}
/>
```

### Dynamic Content Driven by Query State

Use `contents` as a function to conditionally build the content array based on query state:

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
          {get("query", "data.error") && (
            <Error message={get("query", "data.error.message", "")} />
          )}
          {get("query", "data.data") && (
            <DataDisplay data={get("query", "data.data")} />
          )}
        </div>
      ),
    },
  ]}
/>
```

### Form-Driven Dynamic Content

Show different content sections based on current form values:

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
    },
  ]}
/>
```

---

## TypeScript Support

`PageGenerator` is fully generic over form data (`F`), query definitions (`Q`), and page-scoped variables (`V`), providing end-to-end type safety including autocomplete for field names and type-safe query key paths.

```tsx
interface UserFormData {
  username: string;
  email: string;
}

type PageQueries = [
  QueryDefinition<"users", "query", never, User[]>,
  QueryDefinition<"createUser", "mutation", UserFormData, User>,
];

<PageGenerator<UserFormData, PageQueries>
  id="typed-page"
  form={{
    data: [
      { name: "username", type: "text" }, // autocompleted: only valid field names
      { name: "email", type: "email" },
    ],
  }}
  contents={({ get }) => [
    {
      type: "custom",
      component: (() => {
        const mutate = get("mutation", "createUser.mutate");
        const formValues = {
          username: get("form", "username", ""),
          email: get("form", "email", ""),
        };
        return <button onClick={() => mutate(formValues)}>Create User</button>;
      })(),
    },
  ]}
/>;
```

---

## React Native & Ionic Integration

### React Native Setup

Mount a provider once near the root to replace the container slots with native components:

```tsx
// rnPages/setup.tsx
import { View, ScrollView } from "react-native";
import { usePageConfigState } from "@gaddario98/react-pages";
import { useEffect } from "react";

export function ReactNativePageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [, setPageConfig] = usePageConfigState();

  useEffect(() => {
    setPageConfig((prev) => ({
      ...prev,
      PageContainer: ({ children, id }) => (
        <View style={{ flex: 1 }} accessibilityLabel={id}>
          {children}
        </View>
      ),
      BodyContainer: ({ children }) => (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {children}
        </ScrollView>
      ),
      HeaderContainer: ({ children }) => <View>{children}</View>,
      FooterContainer: ({ children }) => <View>{children}</View>,
      ItemsContainer: ({ children }) => <View>{children}</View>,
    }));
  }, [setPageConfig]);

  return <>{children}</>;
}
```

```tsx
// App.tsx
export default function App() {
  return (
    <ReactNativePageProvider>
      <NavigationContainer>{/* your screens */}</NavigationContainer>
    </ReactNativePageProvider>
  );
}
```

Once configured, `PageGenerator` works identically on React Native:

```tsx
import { PageGenerator } from "@gaddario98/react-pages";
import { Text } from "react-native";

export function ProfileScreen() {
  return (
    <PageGenerator
      id="profile-screen"
      queries={[
        {
          type: "query",
          key: "profile",
          queryConfig: {
            queryKey: ["profile"],
            queryFn: fetchProfile,
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

### Ionic Integration

Within the monorepo, `@gaddario98/react-pages` is extended by `@gaddario98/react-ionic-pages` which overrides `PageContainer` with Ionic's `<IonPage>` component:

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

### Compatibility Summary

| Feature           | Behavior on React Native                              |
| ----------------- | ----------------------------------------------------- |
| Form management   | Works — field components are provided by the consumer |
| Query / Mutation  | Works — no DOM dependency                             |
| `MetadataManager` | Silent no-op                                          |

---

## Troubleshooting

### Form Not Submitting

- Ensure `submit` is configured in the `form` prop
- Check that form validation passes before submission
- Verify the `onSuccess` callback (or mutation) does not throw

### Queries Not Loading

- Check that `queryFn` is correctly defined
- Verify `enabled` is not set to `false`
- Inspect network requests in DevTools

### Metadata Not Appearing

- Ensure `meta` is passed to `PageGenerator`
- Confirm you are on a web platform (`document.head` must be available)
- For SSR: use `collectMetadataToHtml()` from `/config` to inject tags server-side

### Re-renders Too Frequent

- Use `component: ({ get }) => ...` instead of passing pre-computed values as JSX props
- Add `debounceDelay` to text and search fields
- Wrap stable external components with `React.memo`

### TypeScript Errors

- Ensure the generic types `<F, Q, V>` match your form interface, query tuple, and variables type
- Use `as const` assertions on query key arrays
- Verify that all required peer dependencies are installed

---

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

- [Open an issue on GitHub](https://github.com/gaddario98/react-pages/issues)
