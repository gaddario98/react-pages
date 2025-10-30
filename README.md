# React Pages Plugin

A powerful, performance-optimized React plugin for creating dynamic web pages with integrated form management, query handling, and content rendering.

## 🚀 Features

- **Dynamic Page Generation**: Create complex pages with configurable content layouts
- **Form Integration**: Built-in form management with validation and submission handling
- **Query Management**: Seamless integration with React Query for data fetching and mutations
- **Performance Optimized**: Advanced memoization and caching strategies to minimize re-renders
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- **Flexible Content System**: Support for both static and dynamic content rendering
- **Internationalization**: Built-in i18n support with react-i18next integration
- **SEO Friendly**: Meta tag management with react-helmet-async

## 📦 Installation

```bash
npm install @gaddario98/react-pages
```

### Peer Dependencies

Make sure you have the required peer dependencies installed:

```bash
npm install react react-dom react-hook-form @tanstack/react-query react-i18next i18next react-helmet-async
```

## 🏗️ Basic Usage

### 1. Simple Page Setup

```tsx
import { PageGenerator } from '@gaddario98/react-pages';

const MyPage = () => {
  return (
    <PageGenerator
      id="my-page"
      meta={{
        title: "My Page Title",
        description: "Page description for SEO"
      }}
      contents={[
        {
          type: "custom",
          component: <div>Hello World!</div>,
          index: 0
        }
      ]}
    />
  );
};
```

### 2. Page with Form

```tsx
import { PageGenerator } from '@gaddario98/react-pages';

const FormPage = () => {
  return (
    <PageGenerator
      id="form-page"
      form={{
        data: [
          {
            name: "username",
            type: "text",
            placeholder: "Enter username",
            validation: { required: "Username is required" }
          },
          {
            name: "email",
            type: "email",
            placeholder: "Enter email",
            validation: { required: "Email is required" }
          }
        ],
        submit: [
          {
            onSuccess: (values) => console.log("Form submitted:", values),
            component: ({ onClick }) => (
              <button onClick={onClick}>Submit</button>
            )
          }
        ]
      }}
      contents={[
        {
          type: "custom",
          component: <h1>User Registration</h1>,
          index: 0
        }
      ]}
    />
  );
};
```

### 3. Page with Data Fetching

```tsx
import { PageGenerator } from '@gaddario98/react-pages';

const DataPage = () => {
  return (
    <PageGenerator
      id="data-page"
      queries={[
        {
          type: "query",
          key: "users",
          queryConfig: {
            queryKey: ["users"],
            queryFn: () => fetch("/api/users").then(res => res.json())
          }
        }
      ]}
      contents={({ allQuery }) => [
        {
          type: "custom",
          component: (
            <div>
              <h1>Users</h1>
              {allQuery.users?.data?.map(user => (
                <div key={user.id}>{user.name}</div>
              ))}
            </div>
          ),
          index: 0
        }
      ]}
    />
  );
};
```

## 📚 Advanced Usage

### Dynamic Content with Mutations

```tsx
import { PageGenerator } from '@gaddario98/react-pages';

const AdvancedPage = () => {
  return (
    <PageGenerator
      id="advanced-page"
      queries={[
        {
          type: "query",
          key: "posts",
          queryConfig: {
            queryKey: ["posts"],
            queryFn: () => fetch("/api/posts").then(res => res.json())
          }
        },
        {
          type: "mutation",
          key: "createPost",
          mutationConfig: {
            mutationFn: (data) => fetch("/api/posts", {
              method: "POST",
              body: JSON.stringify(data)
            })
          }
        }
      ]}
      form={{
        data: [
          {
            name: "title",
            type: "text",
            placeholder: "Post title"
          },
          {
            name: "content",
            type: "textarea",
            placeholder: "Post content"
          }
        ],
        submit: [
          {
            onSuccess: (values, { allMutation }) => {
              allMutation.createPost.mutate(values);
            }
          }
        ]
      }}
      contents={({ allQuery, allMutation }) => [
        {
          type: "custom",
          component: (
            <div>
              <h1>Blog Posts</h1>
              {allQuery.posts?.data?.map(post => (
                <article key={post.id}>
                  <h2>{post.title}</h2>
                  <p>{post.content}</p>
                </article>
              ))}
            </div>
          ),
          index: 1
        }
      ]}
    />
  );
};
```

### Container Components

```tsx
const ContainerPage = () => {
  return (
    <PageGenerator
      id="container-page"
      contents={[
        {
          type: "container",
          items: [
            {
              type: "custom",
              component: <div>Item 1</div>,
              index: 0
            },
            {
              type: "custom",
              component: <div>Item 2</div>,
              index: 1
            }
          ],
          index: 0
        }
      ]}
    />
  );
};
```

## 🎨 Configuration

### Page Configuration

The `pageConfig` object allows you to customize global settings:

```tsx
import { pageConfig } from '@gaddario98/react-pages';

// Customize global components
pageConfig.PageContainer = MyCustomPageContainer;
pageConfig.BodyContainer = MyCustomBodyContainer;
pageConfig.HeaderContainer = MyCustomHeaderContainer;
pageConfig.FooterContainer = MyCustomFooterContainer;
pageConfig.ItemsContainer = MyCustomItemsContainer;

// Configure authentication
pageConfig.isLogged = (user) => !!user?.token;
pageConfig.authPageProps = {
  id: "login",
  contents: [/* login page contents */]
};

// Set global metadata
pageConfig.meta = {
  title: "My App",
  description: "Default description"
};
```

### View Settings

Customize the page layout and behavior:

```tsx
<PageGenerator
  id="custom-layout"
  viewSettings={{
    withoutPadding: true,
    header: {
      withoutPadding: false
    },
    footer: {
      withoutPadding: true
    },
    disableRefreshing: false,
    customLayoutComponent: MyCustomLayout,
    customPageContainer: MyCustomPageContainer
  }}
  // ... other props
/>
```

## 🔧 API Reference

### PageGenerator Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Unique page identifier |
| `contents` | `ContentItemsType` | Page content configuration |
| `queries` | `QueryPageConfigArray` | Query and mutation definitions |
| `form` | `FormPageProps` | Form configuration |
| `viewSettings` | `ViewSettings` | Layout and behavior settings |
| `meta` | `PageMetadataProps` | SEO metadata |
| `ns` | `string` | i18n namespace |
| `enableAuthControl` | `boolean` | Enable authentication checks |
| `onValuesChange` | `function` | Form values change handler |

### Content Item Types

#### Custom Content
```tsx
{
  type: "custom",
  component: React.ComponentType | JSX.Element,
  index?: number,
  usedBoxes?: number,
  usedQueries?: string[],
  usedFormValues?: string[],
  renderInFooter?: boolean,
  renderInHeader?: boolean,
  isDraggable?: boolean,
  isInDraggableView?: boolean,
  key?: string,
  hidden?: boolean
}
```

#### Container Content
```tsx
{
  type: "container",
  component?: React.ComponentType,
  items: ContentItem[],
  // ... same optional props as custom content
}
```

### Form Configuration

```tsx
{
  data: FormManagerConfig[],
  submit: Submit[],
  defaultValueQueryKey?: string[],
  defaultValueQueryMap?: (data) => DefaultValues,
  usedQueries?: string[]
}
```

### Query Configuration

```tsx
// Query
{
  type: "query",
  key: string,
  queryConfig?: QueryProps | ((props) => QueryProps)
}

// Mutation
{
  type: "mutation",
  key: string,
  mutationConfig: MutationConfig | ((props) => MutationConfig)
}
```

## 🎯 Performance Tips

1. **Use Stable Keys**: Always provide stable `key` props for content items
2. **Optimize Dependencies**: Use the `usedQueries` and `usedFormValues` props to minimize re-renders
3. **Memoize Components**: Wrap custom components with React.memo when appropriate
4. **Batch Updates**: Use mutation callbacks for multiple operations

## 📊 Bundle Size & Tree-Shaking

React Pages is optimized for minimal bundle size with full tree-shaking support. Import only what you need:

### Entry Points

The library provides multiple entry points to support tree-shaking:

```tsx
// Main export - includes everything (~17.4 KB gzipped)
import { PageGenerator, pageConfig } from '@gaddario98/react-pages';

// Hooks only (~7.9 KB gzipped)
import { usePageConfig, useFormPage } from '@gaddario98/react-pages/hooks';

// Components only (~15.8 KB gzipped)
import { PageGenerator } from '@gaddario98/react-pages/components';

// Configuration (~1.9 KB gzipped)
import { pageConfig, setPageConfig } from '@gaddario98/react-pages/config';

// Utilities (~1.8 KB gzipped)
import { memoize, shallowEqual } from '@gaddario98/react-pages/utils';
```

### Bundle Size Targets

- **Main bundle**: < 50 KB gzipped
- **Per-module bundles**: < 20 KB gzipped
- **Current sizes**:
  - `@gaddario98/react-pages`: 17.4 KB (main, all exports)
  - `/hooks`: 7.9 KB (hooks only)
  - `/components`: 15.8 KB (components only)
  - `/config`: 1.9 KB (configuration singleton)
  - `/utils`: 1.8 KB (utility functions)

### Optimization Features

- **React Compiler Integration**: Automatic memoization and optimization via babel-plugin-react-compiler
- **Lazy Initialization**: Config singleton uses lazy initialization to reduce module-level side effects
- **Tree-Shakeable Exports**: All exports use pure re-exports for optimal bundler dead-code elimination
- **Selective Imports**: Import from specific entry points to reduce bundle footprint

### Consumer Bundle Optimization

To minimize your application's bundle size:

```tsx
// Good: Import only what you need
import { usePageConfig } from '@gaddario98/react-pages/hooks';
import { pageConfig } from '@gaddario98/react-pages/config';

// Avoid: Importing everything
import * from '@gaddario98/react-pages';
```

## 🚀 Lazy Loading & Code Splitting

React Pages provides utilities for lazy loading components and code splitting to reduce initial bundle size and improve time-to-interactive.

### Basic Lazy Loading

```tsx
import { lazyWithPreload } from '@gaddario98/react-pages/utils';

// Lazy load a component
const HeavyModal = lazyWithPreload(
  () => import('./Modal')
);

export function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Open Modal
      </button>
      {open && (
        <HeavyModal.Suspense fallback={<div>Loading...</div>}>
          <HeavyModal />
        </HeavyModal.Suspense>
      )}
    </>
  );
}
```

### Preloading on Hover

Improve perceived performance by preloading components when users hover over interactive elements:

```tsx
import { lazyWithPreload } from '@gaddario98/react-pages/utils';

const UserSettings = lazyWithPreload(
  () => import('./UserSettings'),
  { preloadOnHover: true }
);

export function Navbar() {
  return (
    <button
      onMouseEnter={() => UserSettings.preload?.()}
    >
      Settings
    </button>
  );
}
```

### Batch Lazy Loading

Load multiple related components with shared configuration:

```tsx
import { lazyBatch } from '@gaddario98/react-pages/utils';

const Pages = lazyBatch({
  UserList: () => import('./pages/UserList'),
  UserDetail: () => import('./pages/UserDetail'),
  UserForm: () => import('./pages/UserForm'),
}, {
  preloadOnHover: true,
  suspenseFallback: <PageLoader />
});

export function Router() {
  return (
    <Routes>
      <Route path="/users" element={<Pages.UserList />} />
      <Route path="/users/:id" element={<Pages.UserDetail />} />
      <Route path="/users/new" element={<Pages.UserForm />} />
    </Routes>
  );
}
```

### Global Lazy Loading Settings

Configure lazy loading behavior globally via `pageConfig`:

```tsx
import { pageConfig } from '@gaddario98/react-pages/config';

// Enable preloading on hover globally
pageConfig.lazyLoading = {
  enabled: true,
  preloadOnHover: true,
  timeout: 30000,
  logMetrics: process.env.NODE_ENV === 'development',
};
```

### Lazy Loading Configuration Options

- `enabled`: Enable/disable lazy loading (default: `true`)
- `preloadOnHover`: Preload components on hover (default: `false`)
- `preloadOnFocus`: Preload components on focus for keyboard nav (default: `false`)
- `preloadAfterRender`: Delay (ms) before preloading after render
- `suspenseFallback`: Fallback UI while loading
- `errorBoundary`: Custom error component for failures
- `timeout`: Max wait time before error (default: `30000ms`)
- `logMetrics`: Log performance metrics in dev mode

## 📋 Migration Guide: v1.0 → v1.1

### Metadata API Changes (react-helmet-async → Custom Implementation)

Version 1.1 replaces `react-helmet-async` with a custom, lightweight metadata provider to reduce bundle size by ~10 KB.

#### Before (v1.0)
```tsx
import { Helmet } from 'react-helmet-async';

function MyPage() {
  return (
    <>
      <Helmet>
        <title>My Page</title>
        <meta name="description" content="My page description" />
      </Helmet>
      <h1>Content</h1>
    </>
  );
}
```

#### After (v1.1)
```tsx
import { setMetadata } from '@gaddario98/react-pages';

function MyPage() {
  useEffect(() => {
    setMetadata({
      title: 'My Page',
      description: 'My page description'
    });
  }, []);

  return <h1>Content</h1>;
}
```

#### Breaking Changes
- `react-helmet-async` is no longer a peer dependency - it can be removed from `package.json`
- Metadata is now set imperatively via `setMetadata()` instead of declaratively in JSX
- Update all Helmet usages to use the custom metadata API

#### Migration Steps
1. Remove `react-helmet-async` from dependencies
2. Replace all `<Helmet>` usage with `setMetadata()` calls
3. Use `useEffect` to set metadata when component mounts
4. Update global metadata via `pageConfig.defaultMetadata`

#### Example: Setting Global Metadata
```tsx
import { pageConfig } from '@gaddario98/react-pages';

// Set default metadata for all pages
pageConfig.defaultMetadata = {
  title: 'My App',
  description: 'My awesome application',
  keywords: ['app', 'react', 'pages'],
  ogImage: 'https://example.com/og-image.png'
};
```

### New Exports (v1.1)
- `usePerformanceMetrics` - Track render performance in dev mode
- `lazyWithPreload`, `lazyBatch`, `preloadComponents` - Lazy loading utilities
- `pageConfig.lazyLoading` - Global lazy loading configuration
- `MetadataConfig`, `LazyLoadingConfig` - New configuration types

### Performance Improvements (v1.1)
- Bundle size reduced by ~15% for consumers using selective imports
- Lazy loading support for code-splitting heavy components
- React Compiler integration for automatic memoization
- Lazy singleton initialization for tree-shaking

## ⚡ React Compiler Integration

React Pages v1.1+ includes automatic optimization via [React Compiler](https://react.dev/learn/react-compiler) (babel-plugin-react-compiler). This performs automatic memoization and eliminates unnecessary re-renders at compile time.

### Setup

The React Compiler is configured in `.babelrc.json` by default:

```json
{
  "plugins": [
    ["babel-plugin-react-compiler", {
      "panicThreshold": "all_errors",
      "gritModules": [],
      "autoImportLodash": false
    }]
  ]
}
```

### How It Works

The compiler automatically:
1. Converts effective `useMemo` calls where dependencies align with value usage
2. Eliminates unnecessary object/array literals in dependency arrays
3. Memoizes expensive calculations without explicit `useMemo`
4. Optimizes hook dependencies based on actual usage patterns

### Consumer Benefits

As a consumer of React Pages, you benefit from:
- All hooks (`usePageConfig`, `useFormPage`, etc.) are pre-optimized by the compiler
- No need to manually wrap expensive computations in `useMemo` within your code
- Automatic stabilization of object/function references across renders
- Reduced bundle size through automatic dead-code elimination

### Build Output

The React Compiler processes all source files during the build. If compilation errors occur, the build will fail with detailed error messages. Enable `panicThreshold: "all_errors"` to catch issues early.

## 🧪 TypeScript Support

The plugin provides full TypeScript support with generic types:

```tsx
interface MyFormData {
  username: string;
  email: string;
}

type MyQueries = [
  QueryDefinition<'users', 'query', never, User[]>,
  QueryDefinition<'createUser', 'mutation', User, User>
];

<PageGenerator<MyFormData, MyQueries>
  id="typed-page"
  // Full type safety for form data and queries
/>
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support and questions, please open an issue on GitHub.
