import { useMemo, useRef } from 'react';
import { FieldValues, UseFormSetValue } from 'react-hook-form';
import {
  AllMutation,
  MultipleQueryResponse,
  QueriesArray,
} from '@gaddario98/react-queries';
import {
  FormElements,
  FormManagerConfig,
  Submit,
} from '@gaddario98/react-form';
import { ContentItem, ContentItemsType } from '../types';
import { useDataExtractor } from './useDataExtractor';
import { useAutoRegisterDependencies } from './useDependencyGraph';

export interface GenerateContentRenderProps<
  F extends FieldValues,
  Q extends QueriesArray,
> {
  contents?: ContentItemsType<F, Q>;
  ns?: string;
  pageId: string;
  formValues: F;
  allQuery: MultipleQueryResponse<Q>;
  allMutation: AllMutation<Q>;
  isAllQueryMapped?: boolean;
  formData:
    | false
    | {
        elements: FormElements[];
        formContents: (FormManagerConfig<F> | Submit<F>)[];
      };
  setValue: UseFormSetValue<F>;
  renderComponent: (props: {
    content: ContentItem<F, Q>;
    ns: string;
    formValues: F;
    pageId: string;
    allMutation: AllMutation<Q>;
    allQuery: MultipleQueryResponse<Q>;
    setValue: UseFormSetValue<F>;
    key: string;
  }) => JSX.Element;
}
export interface Elements {
  index: number;
  element: JSX.Element;
  renderInFooter: boolean;
  renderInHeader: boolean;
  key: string;
}
export const useGenerateContentRender = <
  F extends FieldValues,
  Q extends QueriesArray,
>({
  pageId,
  ns = '',
  contents = [],
  allMutation,
  allQuery,
  formValues,
  isAllQueryMapped,
  formData,
  setValue,
  renderComponent,
}: GenerateContentRenderProps<F, Q>) => {
  const memorizedContentsRef = useRef<Elements[]>([]);

  const contentsWithQueriesDeps = useMemo(() => {
    if (typeof contents === 'function' && isAllQueryMapped) {
      return contents({
        formValues,
        allMutation,
        allQuery,
        setValue,
      });
    }
    return Array.isArray(contents) ? contents : [];
  }, [contents, isAllQueryMapped, formValues, allMutation, allQuery, setValue]);

  const filteredContents = useMemo(() => {
    if (typeof contents === 'function') {
      return contentsWithQueriesDeps.filter((el) => !el?.hidden);
    } else {
      return contents.filter((el) => !el?.hidden);
    }
  }, [contents, contentsWithQueriesDeps]);

  // Register content items with dependency graph for selective re-rendering
  const { getAffectedComponents } = useAutoRegisterDependencies(
    filteredContents,
    `${pageId}-content`,
  );

  const { extractFormValues, extractMutations, extractQuery } =
    useDataExtractor<F, Q>({
      allMutation,
      allQuery,
      formValues,
    });

  const memorizedContents = useMemo(() => {
    if (!isAllQueryMapped) return [];
    const getStableKey = (content: ContentItem<F, Q>, index: number) =>
      content.key ?? `content-${index}`;
    const dynamicElements = filteredContents.map((content, index: number) => {
      const stableKey = getStableKey(content, index);
      return {
        element: renderComponent({
          content,
          ns,
          formValues: extractFormValues(content.usedFormValues ?? []),
          pageId,
          allMutation: extractMutations(content.usedQueries ?? []),
          allQuery: extractQuery(
            (content.usedQueries ?? []) as Array<
              keyof MultipleQueryResponse<Q>
            >,
          ),
          setValue,
          key: stableKey,
        }),
        index: content.index ?? index,
        renderInFooter: !!content.renderInFooter,
        renderInHeader: !!content.renderInHeader,
        key: stableKey,
      };
    });
    let formElementsWithKey: (FormElements & { key: string })[] = [];
    if (formData && Array.isArray(formData.elements)) {
      formElementsWithKey = (formData.elements as FormElements[]).map(
        (el: FormElements, idx: number) => ({
          ...el,
          key: (el as any).key ?? `form-element-${el.index ?? idx}`,
        }),
      );
    }
    const next = [...dynamicElements, ...formElementsWithKey].sort(
      (a, b) => a.index - b.index || String(a.key).localeCompare(String(b.key)),
    );
    const prev = memorizedContentsRef.current;

    const merged = next.map((el) => {
      const found = prev.find((e) => e.key === el.key);
      if (found) {
        return { ...found, ...el, element: el.element };
      }
      return el;
    });

    memorizedContentsRef.current = merged;
    return next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAllQueryMapped,
    filteredContents,
    ns,
    pageId,
    setValue,
    extractFormValues,
    extractMutations,
    extractQuery,
    formData,
  ]);

  return {
    components: memorizedContents,
    allContents: [
      ...filteredContents,
      ...(!formData ? [] : (formData?.formContents ?? [])),
    ],
    // Expose dependency graph utilities for selective re-rendering
    getAffectedComponents,
  };
};
