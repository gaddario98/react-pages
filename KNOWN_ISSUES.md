# Known Issues - react-pages v2.0.0

**Last Updated**: 2025-10-31
**Status**: Pre-release - Type system partially complete

## Overview

This document tracks known issues in the v2.0.0 codebase that need to be resolved before release. All core functionality (Phases 1-7) has been implemented, but there are TypeScript compilation errors and missing implementations that prevent the build from completing.

---

## Critical Issues (Build Blockers)

### 1. Missing `StableCache` Class

**File**: `hooks/useFormData.ts:6`
**Error**: `"StableCache" is not exported by "utils/merge.ts"`

**Description**:
`useFormData.ts` imports `StableCache` from `utils/merge.ts` but the class is not defined or exported.

**Solution**:
Create `StableCache` class in `utils/merge.ts` or use an alternative caching mechanism:

```typescript
// In utils/merge.ts
export class StableCache<T> {
  private cache = new Map<string, T>();

  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: T): void {
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }
}
```

**Alternative**: Remove `StableCache` usage and use plain `Map` or `WeakMap` for caching.

**Priority**: HIGH - Blocks build

---

### 2. Unresolved External Dependencies

**File**: Build output
**Errors**:
- `shallowequal` (imported by react-helmet-async)
- `react-fast-compare` (imported by react-helmet-async)
- `invariant` (imported by react-helmet-async)

**Description**:
Rollup cannot resolve dependencies used by `react-helmet-async`. These are indirect dependencies that should be included in the bundle or marked as external.

**Solution**:
Add to `package.json` dependencies or update rollup config to mark as external:

```json
{
  "dependencies": {
    "shallowequal": "^1.1.0",
    "react-fast-compare": "^3.2.2",
    "invariant": "^2.2.4"
  }
}
```

Or update `rollup.config.js`:

```javascript
external: [
  ...peerDependencies,
  'shallowequal',
  'react-fast-compare',
  'invariant'
]
```

**Priority**: HIGH - Blocks build

---

### 3. Vitest Configuration Type Errors

**File**: `vitest.config.ts:29`, `vitest.config.native.ts:22`
**Error**: `Object literal may only specify known properties, and 'lines' does not exist in type`

**Description**:
Coverage configuration uses old Vitest API. The `lines`, `functions`, `branches`, `statements` fields are not valid in the current vitest coverage config.

**Solution**:
Update coverage configuration to match Vitest 3.0 API:

```typescript
// vitest.config.ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
  include: [
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'utils/**/*.ts',
    'config/**/*.ts',
  ],
  exclude: [
    'node_modules/',
    'tests/',
    'dist/',
    '**/*.d.ts',
    '**/*.config.*',
    '**/index.ts',
  ],
}
```

**Priority**: MEDIUM - Blocks coverage, not build

---

## TypeScript Type Errors

### 4. LazyContent Component Type Mismatches

**File**: `components/LazyContent.tsx`
**Errors**:
- Line 186: `Property 'style' does not exist on type 'ReactNode'`
- Line 188: `Property 'content' does not exist on type 'ReactNode'`
- Line 260/273: `LazyExoticComponent` not assignable to `ComponentType<P>`

**Description**:
The `LazyContent` component has incorrect typing for the placeholder prop and the wrapped lazy component.

**Solution**:
1. Fix placeholder type checking:
```typescript
// Check if placeholder is a React element before accessing props
if (placeholder && React.isValidElement(placeholder)) {
  // Now TypeScript knows it's a ReactElement
  const style = (placeholder.props as any).style;
}
```

2. Fix lazy component return type:
```typescript
// Instead of ComponentType<P>, use React.LazyExoticComponent
const LazyComponent: React.LazyExoticComponent<React.ComponentType<P>> = React.lazy(...)
```

**Priority**: MEDIUM - Affects lazy loading feature

---

### 5. MetadataManager displayName Error

**File**: `components/MetadataManager.tsx:127`
**Error**: `Property 'displayName' does not exist on type ...`

**Description**:
Setting `displayName` on a memoized generic component fails TypeScript checking.

**Solution**:
Cast to `any` before setting displayName or use a different pattern:

```typescript
// Option 1: Cast
(MetadataManager as any).displayName = 'MetadataManager';

// Option 2: Define as const before memo
const MetadataManagerComponent = <F, Q>(...) => { ... };
MetadataManagerComponent.displayName = 'MetadataManager';
export const MetadataManager = memo(MetadataManagerComponent);
```

**Priority**: LOW - Cosmetic, doesn't affect functionality

---

### 6. PageGenerator Component Type Issues

**File**: `components/PageGenerator.tsx`
**Errors**:
- Line 36/40: Dynamic metadata functions not assignable to string types
- Line 47: MetaTag array not assignable to ReactNode
- Line 213/251: Layout/PageContainer undefined not assignable to ElementType

**Description**:
The PageGenerator component handles dynamic metadata (string | function) but TypeScript expects static strings. Also, conditional rendering of custom components fails when they're optional.

**Solution**:
1. Evaluate functions before passing to JSX:
```typescript
const resolvedTitle = typeof meta.title === 'function'
  ? meta.title(mappedProps)
  : meta.title;

<Helmet>
  <title>{resolvedTitle}</title>
</Helmet>
```

2. Check component existence before rendering:
```typescript
{Layout && <Layout {...props} />}
{!Layout && <DefaultLayout {...props} />}
```

**Priority**: HIGH - Affects core functionality

---

### 7. Platform Adapter Type Mismatches

**Files**: `config/platformAdapters/web.ts`, `config/platformAdapters/native.ts`
**Errors**:
- Lines 86-92 (native), 249-254 (web): PlatformFeature type mismatches
- Line 102/263: `getLazyLoadingConfig` not in PlatformAdapter interface

**Description**:
Platform adapters use feature strings that aren't defined in the `PlatformFeature` type, and include methods not in the interface.

**Solution**:
1. Update `PlatformFeature` type in `config/platformAdapters/base.ts`:
```typescript
export type PlatformFeature =
  | "metadata"
  | "lazyLoading"
  | "suspense"
  | "documentHead"
  | "viewportLazyLoading"      // NEW
  | "interactionLazyLoading"   // NEW
  | "conditionalLazyLoading"   // NEW
  | "componentPreloading";     // NEW
```

2. Add `getLazyLoadingConfig` to PlatformAdapter interface or remove from implementations

**Priority**: MEDIUM - Affects platform-specific features

---

### 8. Metadata Config Property Mismatches

**File**: `config/metadata.ts`
**Errors**:
- Line 143/146: `ogDescription` does not exist (should be `description`)
- Line 212: `excludeFromIndexing` does not exist in `AIHintsConfig`
- Lines 32, 54, 60, 88, etc.: Functions not assignable to strings

**Description**:
Legacy property names and missing fields in metadata types.

**Solution**:
1. Fix property names:
```typescript
// Change ogDescription → description or openGraph.description
const description = config.description || config.openGraph?.description;
```

2. Add missing AI hints field:
```typescript
export interface AIHintsConfig {
  contentClassification?: string | ((props: any) => string);
  modelHints?: string[] | ((props: any) => string[]);
  contextualInfo?: string | ((props: any) => string);
  excludeFromIndexing?: boolean; // NEW
}
```

3. Evaluate functions before use (same as #6)

**Priority**: MEDIUM - Affects metadata feature

---

### 9. ContentRenderer Generic Type Mismatch

**File**: `components/ContentRenderer.tsx:81`
**Error**: `Expected 0 type arguments, but got 2`

**Description**:
A component is being called with generic type arguments when it doesn't accept them.

**Solution**:
Remove type arguments from component instantiation or update component signature:

```typescript
// Find line 81 and check if it's:
<SomeComponent<F, Q> />

// Change to:
<SomeComponent />

// Or update component to accept generics:
function SomeComponent<F, Q>(...) { ... }
```

**Priority**: MEDIUM

---

## Missing Implementations

### 10. Missing Vitest React Plugin

**File**: `vitest.config.ts:2`
**Error**: `Cannot find module '@vitejs/plugin-react'`

**Description**:
Vitest config imports `@vitejs/plugin-react` but it's not installed.

**Solution**:
```bash
yarn add -D @vitejs/plugin-react
```

**Priority**: MEDIUM - Blocks testing

---

## Partial Implementations

### 11. Deferred Phase 8 Tasks

The following Phase 8 tasks remain incomplete:

- **T107**: Deprecation warnings for 1.x APIs
- **T108**: TypeScript declaration file updates
- **T109**: Bundle size verification
- **T110**: Bundle analyzer execution
- **T112**: JSDoc additions to remaining components
- **T113**: Contract examples updates
- **T114**: Quickstart example validation
- **T115**: Error message improvements
- **T116**: Development mode performance warnings
- **T117**: Full TypeScript type checking (blocked by errors above)
- **T118**: Linting (blocked by build errors)
- **T119**: Build verification (blocked by errors above)
- **T120**: Tree-shaking verification
- **T121**: Backward compatibility tests

**Solution**: Resolve critical issues above, then execute remaining tasks sequentially.

**Priority**: LOW - Polish tasks

---

## Resolution Priority

1. **Immediate** (required for build):
   - Fix #1: Create `StableCache` class
   - Fix #2: Resolve external dependencies
   - Fix #6: PageGenerator type issues
   - Fix #10: Install @vitejs/plugin-react

2. **High Priority** (required for v2.0 release):
   - Fix #4: LazyContent type errors
   - Fix #7: Platform adapter types
   - Fix #8: Metadata property mismatches
   - Fix #9: ContentRenderer generics

3. **Medium Priority** (improves developer experience):
   - Fix #3: Vitest configuration
   - Fix #5: MetadataManager displayName

4. **Low Priority** (polish):
   - Complete deferred Phase 8 tasks (#11)

---

## Estimated Resolution Time

- **Critical fixes** (#1, #2, #6, #10): 2-4 hours
- **High priority** (#4, #7, #8, #9): 4-6 hours
- **Medium priority** (#3, #5): 1-2 hours
- **Low priority** (#11): 8-12 hours

**Total**: 15-24 hours to complete v2.0.0 and resolve all known issues

---

## Testing Checklist (Post-Fix)

Once critical issues are resolved, verify:

- [ ] `yarn type-check` completes without errors
- [ ] `yarn build` generates all entry points (main, components, hooks, config, utils)
- [ ] `yarn test` runs test suite successfully
- [ ] `yarn lint` passes without errors
- [ ] Bundle sizes meet targets (< 60 KB main, < 25 KB modules)
- [ ] Tree-shaking works (selective imports don't pull in entire library)
- [ ] All 5 user stories work end-to-end on web and React Native
- [ ] Migration guide examples compile and run
- [ ] Quickstart examples work without modification

---

## Contributing

If you're fixing any of these issues, please:

1. Reference the issue number in your commit message (e.g., "fix: resolve #1 - add StableCache class")
2. Update this file to mark issues as resolved
3. Add tests to prevent regressions
4. Update CHANGELOG.md with your changes

---

**Status Summary**:
- ✅ Implementation complete (Phases 1-7): 103/103 tasks
- 🟨 Type system partially complete: 4/9 critical issues fixed
- ❌ Build currently broken: 2 blockers remaining
- 📋 Phase 8 polish: 7/20 tasks complete

Next step: Resolve issues #1, #2, #6, #10 to unblock build, then continue with high-priority fixes.
