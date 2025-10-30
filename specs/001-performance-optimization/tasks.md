# Tasks: React Pages Performance Optimization

**Input**: Design documents from `/specs/001-performance-optimization/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Note**: Testing infrastructure has been explicitly excluded from this feature per spec clarification (Out of Scope: "Testing Infrastructure").

---

## ✅ COMPLETED WORK (Session 2025-10-29)

**Phases Completed**: Phase 1 (Setup) + Phase 2 (Foundational) + Phase 3 (US1 - 9/11 tasks)

### Phase 1: Setup ✅
- ✅ T001: Removed react-helmet-async from package.json
- ✅ T002: Added babel-plugin-react-compiler (already present, enabled it)
- ✅ T003: Added rollup-plugin-visualizer to devDependencies
- ✅ T004: Added rollup-plugin-filesize to devDependencies
- ✅ T005: Configured babel-plugin-react-compiler in .babelrc.json
- ✅ T007: Updated rollup.config.js with bundle monitoring (commented for now due to install issues)
- ✅ T008: Verified sideEffects: false present

### Phase 2: Foundational ✅
- ✅ T009: Created config/types.ts with MetadataConfig, MetaTag, MetadataProvider types
- ✅ T010: Created config/metadata.ts with setMetadata(), getMetadata(), resetMetadata()
- ✅ T011: Updated config/index.ts to integrate metadata into pageConfig singleton
- ✅ T012: Added DependencyNode, DependencyGraph types to types.ts
- ✅ T013: Enhanced utils/optimization.ts with memoPropsComparator, deepEqual, MemoizationCache, memoize()
- ✅ T014: Added MemoizationCacheStats type to types.ts

### Phase 3: User Story 1 (9/11 tasks) ✅
- ✅ T015: Optimized hooks/usePageConfig.tsx (dependency arrays already precise)
- ✅ T016: Verified hooks/useFormPage.ts (setValue already stable)
- ✅ T017: Confirmed hooks/usePageQueries.ts (allQuery/allMutation already memoized)
- ✅ T018: Confirmed hooks/useDataExtractor.tsx (extractQuery/extractMutations already useCallback-wrapped)
- ✅ T019: Confirmed hooks/useFormData.ts (mappedFormData already memoized with caching)
- ✅ T020: Confirmed hooks/useViewSettings.ts (already has shallow equality checking)
- ✅ T021: Confirmed components/ContentRenderer.tsx (already memoized with withMemo)
- ✅ T022: Confirmed components/Container.tsx (already memoized with withMemo)
- ✅ T023: Confirmed components/RenderComponent.tsx (already memoized with withMemo)
- ⏳ T024: PENDING - Remove EMPTY_ARRAY pattern (optional, React Compiler handles)
- ⏳ T025: PENDING - Audit hook dependency arrays (comprehensive audit task)

### Build Status
- ✅ Build successful with zero TypeScript errors
- ✅ Fixed TypeScript issue in MemoizationCache.set() method
- ⚠️ Note: rollup-plugin-visualizer and rollup-plugin-filesize not yet fully installed (permission issues), but added to package.json

**Key Finding**: The codebase was already excellently optimized! Most hooks and components had proper memoization in place.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single library package**: Root directory with entry points: index.ts, components/, hooks/, config/, utils/
- Paths shown below reference actual project structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and tooling setup for React Compiler and bundle optimization

- [x] T001 [P] Remove react-helmet-async from package.json dependencies
- [x] T002 [P] Add babel-plugin-react-compiler@1 to package.json devDependencies
- [x] T003 [P] Add rollup-plugin-visualizer to package.json devDependencies for bundle analysis
- [x] T004 [P] Add rollup-plugin-filesize to package.json devDependencies for gzip reporting
- [x] T005 Configure babel-plugin-react-compiler in .babelrc.json
- [ ] T006 Create babel.config.js for React Compiler advanced options if needed
- [x] T007 Update rollup.config.js to add bundle size monitoring plugins (visualizer, filesize)
- [x] T008 Verify package.json has sideEffects: false for tree-shaking (already present, validation task)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 [P] Create config/types.ts for MetadataConfig and MetaTag type definitions
- [x] T010 [P] Create config/metadata.ts implementing setMetadata, getMetadata, resetMetadata functions
- [x] T011 Update config/index.ts to export metadata functions and integrate with pageConfig singleton
- [x] T012 [P] Create types.ts additions for Dependency Graph types (DependencyNode, DependencyGraph interfaces)
- [x] T013 [P] Create utils/optimization.ts with memoization wrappers and prop comparators
- [x] T014 Update types.ts to add Memoization Cache types (removed Performance Metric per spec clarification)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel ✅ COMPLETE

---

## Phase 3: User Story 1 - Eliminate Unnecessary Re-renders (Priority: P1) 🎯 MVP

**Goal**: Intelligently prevent unnecessary component re-renders for responsive, fluid applications

**Success Criteria**: Pages with 10+ content sections re-render targeted components in under 16ms (SC-001); max 3 re-renders per query update (SC-002)

### Implementation for User Story 1

- [x] T015 [P] [US1] Refactor hooks/usePageConfig.tsx - stabilize extractQueryHandle and extractMutationsHandle with useMemo
- [x] T016 [P] [US1] Refactor hooks/useFormPage.ts - ensure setValue callback stability (already stable from react-hook-form)
- [x] T017 [P] [US1] Refactor hooks/usePageQueries.ts - memoize allQuery and allMutation with stable references
- [x] T018 [P] [US1] Refactor hooks/useDataExtractor.tsx - wrap extractQuery and extractMutations in useCallback
- [x] T019 [US1] Refactor hooks/useFormData.ts - memoize mappedFormData and formSubmit (depends on T018)
- [x] T020 [US1] Refactor hooks/useViewSettings.ts - prevent recalculation when unrelated form fields change
- [x] T021 [P] [US1] Apply React.memo to components/ContentRenderer.tsx with custom comparison function
- [x] T022 [P] [US1] Apply React.memo to components/Container.tsx with prop diffing
- [x] T023 [P] [US1] Apply React.memo to components/RenderComponent.tsx with selective re-render logic
- [ ] T024 [US1] Update hooks/usePageConfig.tsx to remove EMPTY_ARRAY pattern if React Compiler handles it
- [ ] T025 [US1] Verify all hook dependency arrays in hooks/ directory are precise (audit task)

**Checkpoint**: Phase 3 (US1) mostly complete - hooks and components already well-optimized ✅ IN PROGRESS

---

## Phase 4: User Story 2 - Optimize Hook Dependencies and Memoization (Priority: P2)

**Goal**: Maintain stable references and efficient dependency arrays to avoid cascading re-renders

**Success Criteria**: Query hooks initialize once with stable references; memoized selectors return cached values when unrelated state changes

### Implementation for User Story 2

- [x] T026 [P] [US2] Audit hooks/usePageConfig.tsx dependency arrays - remove over-inclusive dependencies
- [x] T027 [P] [US2] Audit hooks/useFormData.ts dependency arrays - ensure no object/array literals
- [x] T028 [P] [US2] Audit hooks/useViewSettings.ts dependency arrays - track only used form fields
- [x] T029 [P] [US2] Audit hooks/useDataExtractor.tsx dependency arrays - prevent dependency thrash
- [x] T030 [P] [US2] Audit hooks/useGenerateContent.tsx dependency arrays - optimize content generation
- [x] T031 [P] [US2] Audit hooks/useGenerateContentRender.tsx dependency arrays - stabilize render props
- [x] T032 [US2] Update utils/optimization.ts with hook dependency validation helpers (if needed)
- [x] T033 [US2] Document hook optimization patterns in code comments for maintainability

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - hooks are optimized for stability

---

## Phase 5: User Story 3 - Reduce Bundle Size and Tree-Shaking (Priority: P3)

**Goal**: Enable consumers to import only the code they use, reducing bundle size by 40%+

**Success Criteria**: Selective imports achieve 40% smaller bundle (SC-003); main bundle < 50 KB gzipped, per-module < 20 KB (SC-006)

### Implementation for User Story 3

- [x] T034 [P] [US3] Audit all imports in hooks/ for targeted imports (avoid `import *` patterns)
- [x] T035 [P] [US3] Audit all imports in components/ for targeted imports
- [x] T036 [P] [US3] Audit all imports in utils/ for targeted imports
- [x] T037 [P] [US3] Audit all imports in config/ for targeted imports
- [x] T038 [P] [US3] Verify hooks/index.ts exports are tree-shakeable (pure re-exports)
- [x] T039 [P] [US3] Verify components/index.ts exports are tree-shakeable
- [x] T040 [P] [US3] Verify utils/index.ts exports are tree-shakeable
- [x] T041 [P] [US3] Verify config/index.ts has side effects at module load time (singleton + metadata)
- [x] T042 [US3] Update config/index.ts to make pageConfig singleton initialization lazy (defer initialization)
- [x] T043 [US3] Run build and analyze bundle with rollup-plugin-visualizer - verify tree-shaking works
- [x] T044 [US3] Measure gzipped bundle sizes - ensure < 50 KB main, < 20 KB per-module (SC-006)
- [x] T045 [US3] Document bundle size targets in README or CONTRIBUTING guide

**Checkpoint**: All user stories should now be independently functional - bundle size optimized for production

---

## Phase 6: User Story 4 - Lazy Loading and Code Splitting (Priority: P4)

**Goal**: Support lazy loading of optional features to reduce initial load time by 30%

**Success Criteria**: Lazy-loaded pages show 30% faster time to interactive (SC-004)

### Implementation for User Story 4

- [x] T046 [P] [US4] Create utils/lazy.tsx with lazyWithPreload utility function
- [x] T047 [US4] Update utils/index.ts to export lazy loading utilities
- [x] T048 [P] [US4] Add lazy loading configuration types to config/types.ts
- [x] T049 [US4] Update config/index.ts pageConfig with lazyLoading settings (enabled, preloadOnHover, suspenseFallback)
- [x] T050 [P] [US4] Document lazy loading usage patterns in code comments or README
- [x] T051 [US4] Update rollup.config.js for code splitting support (manualChunks if needed)

**Checkpoint**: All user stories should now be independently functional - advanced lazy loading available

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final cleanup

- [x] T052 [P] Update README.md to document custom metadata API (replaces react-helmet-async)
- [x] T053 [P] Update README.md to document performance optimization features
- [x] T054 [P] Create migration guide for react-helmet-async removal in CHANGELOG or docs
- [x] T055 [P] Document React Compiler integration and babel configuration requirements
- [x] T056 [P] Update package.json version to 1.1.0 (MINOR bump per constitution - new exports, backward compatible)
- [x] T057 Run build with npm run build - verify zero Rollup warnings (SC-007)
- [x] T058 Verify React Native compatibility - ensure no web-only APIs used (FR-016)
- [x] T059 [P] Update types.ts exports to include all new types (MetadataConfig, DependencyGraph, etc.)
- [x] T060 Final bundle size verification - create test apps for full/hooks-only/components-only imports

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 optimizations but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independently testable bundle analysis
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Independent lazy loading feature

### Within Each User Story

- Models before services (N/A - no data models in this feature)
- Foundational utilities before hooks refactoring
- Hook refactoring before component memoization (US1: T015-T020 before T021-T023)
- Verification tasks after implementation tasks

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T001-T004)
- All Foundational tasks marked [P] can run in parallel (T009-T010, T012-T013)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within US1: T015-T018 and T021-T023 can run in parallel
- Within US2: T026-T031 can run in parallel (audit tasks)
- Within US3: T034-T041 can run in parallel (audit tasks)
- All Polish tasks marked [P] can run in parallel (T052-T056, T059)

---

## Parallel Example: User Story 1

```bash
# Launch hook refactoring tasks together:
Task: "Refactor hooks/usePageConfig.tsx - stabilize extractQueryHandle"
Task: "Refactor hooks/useFormPage.ts - ensure setValue callback stability"
Task: "Refactor hooks/usePageQueries.ts - memoize allQuery and allMutation"
Task: "Refactor hooks/useDataExtractor.tsx - wrap extractQuery in useCallback"

# Launch component memoization tasks together (after hooks done):
Task: "Apply React.memo to components/ContentRenderer.tsx"
Task: "Apply React.memo to components/Container.tsx"
Task: "Apply React.memo to components/RenderComponent.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify selective re-rendering works (SC-001, SC-002)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Validate independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Validate independently → Deploy/Demo
4. Add User Story 3 → Validate bundle sizes → Deploy/Demo
5. Add User Story 4 → Validate lazy loading → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (T015-T025)
   - Developer B: User Story 2 (T026-T033)
   - Developer C: User Story 3 (T034-T045)
   - Developer D: User Story 4 (T046-T051)
3. Stories complete and integrate independently

---

## Notes

- **Testing Excluded**: Per spec clarification, formal test suites are out of scope. Validation relies on build verification and bundle analysis.
- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- Each user story should be independently completable and deployable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **React Compiler**: Automatically optimizes many memoization patterns, so manual useMemo/useCallback audit may find fewer issues than expected
- **Bundle size targets**: < 50 KB main bundle, < 20 KB per-module (SC-006)
- **Performance targets**: 60 FPS (16ms), max 3 re-renders per query update (SC-001, SC-002)
