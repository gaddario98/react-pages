import { memo } from 'react'
import { deepEqual } from '../utils/optimization'
import { usePageValues } from '../hooks/usePageValues'
import type { FieldValues } from '@gaddario98/react-form'
import type { QueriesArray } from '@gaddario98/react-queries'
import type { FunctionProps } from '../types'
import type { ContentProps } from './types'

const ComponentFunctionMap = <
  F extends FieldValues,
  Q extends QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
>({
  Component,
  pageId,
  initialValues,
}: {
  Component: (props: FunctionProps<F, Q, V>) => React.JSX.Element
  pageId: string
  initialValues?: V
}) => {
  const { get, set, refreshAllQueries } = usePageValues<F, Q, V>({ pageId, initialValues })

  return <Component get={get} set={set} refreshAllQueries={refreshAllQueries} />
}

// Internal component implementation
const RenderComponentImpl = <
  F extends FieldValues,
  Q extends QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
>({
  content,
  pageId,
  initialValues,
}: ContentProps<F, Q, V>) => {
  const { component: Component } = content
  if (typeof Component === 'function') {
    return (
      <ComponentFunctionMap<F, Q, V>
        Component={Component}
        pageId={pageId}
        initialValues={initialValues}
      />
    )
  } else {
    return Component
  }
}

// Export with React.memo and fast-deep-equal comparator for optimal performance
export const RenderComponent = memo(
  RenderComponentImpl,
  (prevProps, nextProps) => {
    // Return true if props are equal (component should NOT re-render)
    return deepEqual(prevProps, nextProps)
  },
) as typeof RenderComponentImpl
