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
