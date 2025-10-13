import { c } from 'react/compiler-runtime';
import { createExtractor, withMemo } from '@gaddario98/utiles';
import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient, QueryObserver } from '@tanstack/react-query';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useFormManager } from '@gaddario98/react-form';
import { useInvalidateQueries } from '@gaddario98/react-providers';
import { useApi } from '@gaddario98/react-queries';
import { useTranslation } from 'react-i18next';
import { useAuthValue } from '@gaddario98/react-auth';
import { Helmet } from 'react-helmet-async';

function createQueryExtractor(allQuery, queryCacheRef, usedKeys) {
  return createExtractor(allQuery, queryCacheRef, usedKeys);
}
function createMutationExtractor(allMutation, mutationCacheRef, usedKeys) {
  return createExtractor(allMutation, mutationCacheRef, usedKeys);
}
function createFormValuesExtractor(formValues, formValuesCacheRef, usedKeys) {
  return createExtractor(formValues, formValuesCacheRef, usedKeys);
}
function useDataExtractor(t0) {
  const $ = c(15);
  const {
    allQuery,
    allMutation,
    formValues
  } = t0;
  let t1;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = new Map();
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const queryCacheRef = useRef(t1);
  let t2;
  if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = new Map();
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const mutationCacheRef = useRef(t2);
  let t3;
  if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
    t3 = new Map();
    $[2] = t3;
  } else {
    t3 = $[2];
  }
  const formValuesCacheRef = useRef(t3);
  let t4;
  if ($[3] !== allQuery) {
    t4 = usedKeys => createQueryExtractor(allQuery, queryCacheRef.current, usedKeys);
    $[3] = allQuery;
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  const extractQuery = t4;
  let t5;
  if ($[5] !== allMutation) {
    t5 = usedKeys_0 => createMutationExtractor(allMutation, mutationCacheRef.current, usedKeys_0);
    $[5] = allMutation;
    $[6] = t5;
  } else {
    t5 = $[6];
  }
  const extractMutations = t5;
  let t6;
  if ($[7] !== formValues) {
    t6 = usedKeys_1 => createFormValuesExtractor(formValues, formValuesCacheRef.current, usedKeys_1);
    $[7] = formValues;
    $[8] = t6;
  } else {
    t6 = $[8];
  }
  const extractFormValues = t6;
  let t7;
  if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
    t7 = () => {
      queryCacheRef.current.clear();
      mutationCacheRef.current.clear();
      formValuesCacheRef.current.clear();
    };
    $[9] = t7;
  } else {
    t7 = $[9];
  }
  const clearCache = t7;
  let t8;
  if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
    t8 = {
      queryCacheRef,
      mutationCacheRef,
      formValuesCacheRef
    };
    $[10] = t8;
  } else {
    t8 = $[10];
  }
  let t9;
  if ($[11] !== extractFormValues || $[12] !== extractMutations || $[13] !== extractQuery) {
    t9 = {
      extractQuery,
      extractMutations,
      extractFormValues,
      clearCache,
      cacheRefs: t8
    };
    $[11] = extractFormValues;
    $[12] = extractMutations;
    $[13] = extractQuery;
    $[14] = t9;
  } else {
    t9 = $[14];
  }
  return t9;
}

const useFormPage = ({
  form
}) => {
  var _a_0, _b_0, _c;
  const queryClient = useQueryClient();
  const [defaultValueQuery, setDefaultValueQuery] = useState(form === null || form === void 0 ? void 0 : form.defaultValues);
  useEffect(() => {
    if (!(form === null || form === void 0 ? void 0 : form.defaultValueQueryKey)) {
      setDefaultValueQuery(form === null || form === void 0 ? void 0 : form.defaultValues);
      return;
    }
    const initialData = queryClient.getQueryData(form.defaultValueQueryKey);
    if (initialData) {
      setDefaultValueQuery(initialData);
    }
    const observer = new QueryObserver(queryClient, {
      queryKey: form.defaultValueQueryKey,
      enabled: true,
      notifyOnChangeProps: ["data"],
      refetchOnWindowFocus: false
    });
    const unsubscribe = observer.subscribe(result => {
      if (result.data !== undefined) {
        setDefaultValueQuery(result.data);
      }
    });
    return () => unsubscribe();
  }, [form === null || form === void 0 ? void 0 : form.defaultValueQueryKey, form === null || form === void 0 ? void 0 : form.defaultValues, queryClient]);
  const defaultValues = useMemo(() => {
    var _a, _b;
    return Object.assign(Object.assign({}, defaultValueQuery !== null && defaultValueQuery !== void 0 ? defaultValueQuery : {}), (_b = (_a = form === null || form === void 0 ? void 0 : form.defaultValueQueryMap) === null || _a === void 0 ? void 0 : _a.call(form, defaultValueQuery)) !== null && _b !== void 0 ? _b : {});
  }, [defaultValueQuery, form]);
  const formControl = useForm(Object.assign(Object.assign({
    mode: "all"
  }, (_a_0 = form === null || form === void 0 ? void 0 : form.formSettings) !== null && _a_0 !== void 0 ? _a_0 : {}), {
    defaultValues,
    resetOptions: Object.assign({
      keepDirtyValues: true,
      keepDefaultValues: false
    }, (_c = (_b_0 = form === null || form === void 0 ? void 0 : form.formSettings) === null || _b_0 === void 0 ? void 0 : _b_0.resetOptions) !== null && _c !== void 0 ? _c : {})
  }));
  // Memoize formControl to avoid unnecessary re-renders
  const stableFormControl = useMemo(() => formControl, []);
  useEffect(() => {
    stableFormControl.reset(defaultValues, {
      keepDirtyValues: true,
      keepDefaultValues: false
    });
  }, [defaultValues, stableFormControl]);
  const formValues = stableFormControl.watch();
  const setValueAndTrigger = useCallback(async (name, value, options) => {
    stableFormControl.setValue(name, value, options);
    await stableFormControl.trigger(name);
  }, [stableFormControl]);
  return {
    formValues,
    formControl: stableFormControl,
    setValue: setValueAndTrigger
  };
};

const useGenerateContentRender = ({
  pageId,
  ns = "",
  contents = [],
  allMutation,
  allQuery,
  formValues,
  isAllQueryMapped,
  formData,
  setValue,
  renderComponent
}) => {
  var _a_2;
  const memorizedContentsRef = useRef([]);
  const contentsWithQueriesDeps = useMemo(() => {
    if (typeof contents === "function" && isAllQueryMapped) {
      return contents({
        formValues,
        allMutation,
        allQuery,
        setValue
      });
    }
    return Array.isArray(contents) ? contents : [];
  }, [contents, isAllQueryMapped, formValues, allMutation, allQuery, setValue]);
  const filteredContents = useMemo(() => {
    if (typeof contents === "function") {
      return contentsWithQueriesDeps.filter(el => !(el === null || el === void 0 ? void 0 : el.hidden));
    } else {
      return contents.filter(el_0 => !(el_0 === null || el_0 === void 0 ? void 0 : el_0.hidden));
    }
  }, [contents, contentsWithQueriesDeps]);
  const {
    extractFormValues,
    extractMutations,
    extractQuery
  } = useDataExtractor({
    allMutation,
    allQuery,
    formValues
  });
  const memorizedContents = useMemo(() => {
    if (!isAllQueryMapped) return [];
    const getStableKey = (content, index) => {
      var _a;
      return (_a = content.key) !== null && _a !== void 0 ? _a : `content-${index}`;
    };
    const dynamicElements = filteredContents.map((content_0, index_0) => {
      var _a_0, _b, _c, _d;
      const stableKey = getStableKey(content_0, index_0);
      return {
        element: renderComponent({
          content: content_0,
          ns,
          formValues: extractFormValues((_a_0 = content_0.usedFormValues) !== null && _a_0 !== void 0 ? _a_0 : []),
          pageId,
          allMutation: extractMutations((_b = content_0.usedQueries) !== null && _b !== void 0 ? _b : []),
          allQuery: extractQuery((_c = content_0.usedQueries) !== null && _c !== void 0 ? _c : []),
          setValue,
          key: stableKey
        }),
        index: (_d = content_0.index) !== null && _d !== void 0 ? _d : index_0,
        renderInFooter: !!content_0.renderInFooter,
        renderInHeader: !!content_0.renderInHeader,
        key: stableKey
      };
    });
    let formElementsWithKey = [];
    if (formData && Array.isArray(formData.elements)) {
      formElementsWithKey = formData.elements.map((el_1, idx) => {
        var _a_1, _b_0;
        return Object.assign(Object.assign({}, el_1), {
          key: (_a_1 = el_1.key) !== null && _a_1 !== void 0 ? _a_1 : `form-element-${(_b_0 = el_1.index) !== null && _b_0 !== void 0 ? _b_0 : idx}`
        });
      });
    }
    const next = [...dynamicElements, ...formElementsWithKey].sort((a, b) => a.index - b.index || String(a.key).localeCompare(String(b.key)));
    const prev = memorizedContentsRef.current;
    const merged = next.map(el_2 => {
      const found = prev.find(e => e.key === el_2.key);
      if (found) {
        return Object.assign(Object.assign(Object.assign({}, found), el_2), {
          element: el_2.element
        });
      }
      return el_2;
    });
    memorizedContentsRef.current = merged;
    return next;
  }, [isAllQueryMapped, filteredContents, ns, pageId, setValue, extractFormValues, extractMutations, extractQuery, formData]);
  return {
    components: memorizedContents,
    allContents: [...filteredContents, ...(!formData ? [] : (_a_2 = formData === null || formData === void 0 ? void 0 : formData.formContents) !== null && _a_2 !== void 0 ? _a_2 : [])]
  };
};

const DefaultContainer = ({
  children
}) => {
  return children;
};
let pageConfig = {
  HeaderContainer: DefaultContainer,
  FooterContainer: DefaultContainer,
  BodyContainer: DefaultContainer,
  authPageImage: "",
  authPageProps: {
    id: "auth-page"
  },
  isLogged: val => !!(val === null || val === void 0 ? void 0 : val.id) && !!(val === null || val === void 0 ? void 0 : val.isLogged),
  ItemsContainer: ({
    children
  }) => children,
  PageContainer: ({
    children
  }) => children,
  meta: {
    title: "",
    description: ""
  }
};
const setPageConfig = config => {
  pageConfig = Object.assign(Object.assign({}, pageConfig), config);
};

// Rimuovo l'uso di useRef: i dati dinamici devono propagarsi
const RenderComponent = withMemo(({
  content,
  formValues,
  allMutation,
  allQuery,
  setValue
}) => {
  const {
    component
  } = content;
  // Memo solo su oggetti che non cambiano spesso, ma i dati dinamici devono propagarsi
  return useMemo(() => {
    if (typeof component === "function") {
      return component({
        allQuery,
        allMutation,
        formValues,
        setValue
      });
    }
    return component;
  }, [allMutation, allQuery, component, formValues, setValue]);
});

const Container = withMemo(({
  content,
  ns,
  pageId,
  allMutation,
  allQuery,
  formValues,
  setValue
}) => {
  const {
    components
  } = useGenerateContentRender({
    allMutation,
    allQuery,
    formValues,
    pageId,
    isAllQueryMapped: true,
    formData: false,
    contents: content.items,
    ns,
    setValue,
    renderComponent: props => {
      if (props.content.type === "container") {
        return jsx(Container, {
          content: props.content,
          ns: props.ns,
          pageId: props.pageId,
          allMutation: props.allMutation,
          allQuery: props.allQuery,
          formValues: props.formValues,
          setValue: props.setValue
        }, props.key);
      }
      return jsx(RenderComponent, {
        content: props.content,
        ns: props.ns,
        formValues: props.formValues,
        pageId: props.pageId,
        allMutation: props.allMutation,
        allQuery: props.allQuery,
        setValue: props.setValue
      }, props.key);
    }
  });
  const Layout = useMemo(() => {
    var _a;
    return (_a = content === null || content === void 0 ? void 0 : content.component) !== null && _a !== void 0 ? _a : pageConfig.ItemsContainer;
  }, [content === null || content === void 0 ? void 0 : content.component]);
  return jsx(Layout, {
    children: components === null || components === void 0 ? void 0 : components.map(el => el.element)
  });
});

const useGenerateContent = t0 => {
  const $ = c(23);
  const {
    pageId,
    ns: t1,
    contents: t2,
    pageConfig
  } = t0;
  const ns = t1 === undefined ? "" : t1;
  let t3;
  if ($[0] !== t2) {
    t3 = t2 === undefined ? [] : t2;
    $[0] = t2;
    $[1] = t3;
  } else {
    t3 = $[1];
  }
  const contents = t3;
  const {
    allMutation,
    allQuery,
    formData,
    formValues,
    isAllQueryMapped,
    setValue
  } = pageConfig;
  let t4;
  if ($[2] !== allMutation || $[3] !== allQuery || $[4] !== contents || $[5] !== formData || $[6] !== formValues || $[7] !== isAllQueryMapped || $[8] !== ns || $[9] !== pageId || $[10] !== setValue) {
    t4 = {
      allMutation,
      allQuery,
      formData,
      formValues,
      pageId,
      contents,
      isAllQueryMapped,
      setValue,
      ns,
      renderComponent: _temp$2
    };
    $[2] = allMutation;
    $[3] = allQuery;
    $[4] = contents;
    $[5] = formData;
    $[6] = formValues;
    $[7] = isAllQueryMapped;
    $[8] = ns;
    $[9] = pageId;
    $[10] = setValue;
    $[11] = t4;
  } else {
    t4 = $[11];
  }
  const {
    allContents,
    components
  } = useGenerateContentRender(t4);
  let t5;
  if ($[12] !== components) {
    t5 = components.filter(_temp2$2).map(_temp3$1);
    $[12] = components;
    $[13] = t5;
  } else {
    t5 = $[13];
  }
  const body = t5;
  let t6;
  if ($[14] !== components) {
    t6 = components.filter(_temp4$1).map(_temp5$1);
    $[14] = components;
    $[15] = t6;
  } else {
    t6 = $[15];
  }
  const header = t6;
  let t7;
  if ($[16] !== components) {
    t7 = components.filter(_temp6).map(_temp7);
    $[16] = components;
    $[17] = t7;
  } else {
    t7 = $[17];
  }
  const footer = t7;
  let t8;
  if ($[18] !== allContents || $[19] !== body || $[20] !== footer || $[21] !== header) {
    t8 = {
      header,
      body,
      footer,
      allContents
    };
    $[18] = allContents;
    $[19] = body;
    $[20] = footer;
    $[21] = header;
    $[22] = t8;
  } else {
    t8 = $[22];
  }
  return t8;
};
function _temp$2(props) {
  if (props.content.type === "container") {
    return jsx(Container, {
      content: props.content,
      ns: props.ns,
      pageId: props.pageId,
      allMutation: props.allMutation,
      allQuery: props.allQuery,
      formValues: props.formValues,
      setValue: props.setValue
    }, props.key);
  }
  return jsx(RenderComponent, {
    content: props.content,
    ns: props.ns,
    formValues: props.formValues,
    pageId: props.pageId,
    allMutation: props.allMutation,
    allQuery: props.allQuery,
    setValue: props.setValue
  }, props.key);
}
function _temp2$2(el) {
  return !el.renderInFooter && !el.renderInHeader;
}
function _temp3$1(item) {
  return item.element;
}
function _temp4$1(el_0) {
  return el_0.renderInHeader;
}
function _temp5$1(item_0) {
  return item_0.element;
}
function _temp6(el_1) {
  return el_1.renderInFooter;
}
function _temp7(item_1) {
  return item_1.element;
}

/**
 * Specialized hook for managing queries and mutations
 * Handles query processing, loading states, and key mapping
 * @param queries - Array of query configurations
 * @param formValues - Current form values
 * @param setValue - Form setValue function
 * @returns Query management state and utilities
 */
function usePageQueries(t0) {
  const $ = c(33);
  const {
    queries: t1,
    formValues,
    setValue
  } = t0;
  let t2;
  if ($[0] !== t1) {
    t2 = t1 === undefined ? [] : t1;
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const queries = t2;
  let t3;
  if ($[2] !== formValues || $[3] !== queries || $[4] !== setValue) {
    let t4;
    if ($[6] !== formValues || $[7] !== setValue) {
      t4 = q => {
        if (q.type === "mutation") {
          const mutationConfig = typeof q.mutationConfig === "function" ? q.mutationConfig({
            formValues,
            setValue
          }) : q.mutationConfig;
          return Object.assign(Object.assign({}, q), {
            mutationConfig
          });
        }
        if (q.type === "query") {
          const queryConfig = typeof q.queryConfig === "function" ? q.queryConfig({
            formValues,
            setValue
          }) : q.queryConfig;
          return Object.assign(Object.assign({}, q), {
            queryConfig
          });
        }
        return q;
      };
      $[6] = formValues;
      $[7] = setValue;
      $[8] = t4;
    } else {
      t4 = $[8];
    }
    t3 = queries.map(t4);
    $[2] = formValues;
    $[3] = queries;
    $[4] = setValue;
    $[5] = t3;
  } else {
    t3 = $[5];
  }
  const processedQueries = t3;
  const {
    allMutation,
    allQuery
  } = useApi(processedQueries);
  let t4;
  if ($[9] !== allQuery) {
    t4 = Object.keys(allQuery !== null && allQuery !== void 0 ? allQuery : {});
    $[9] = allQuery;
    $[10] = t4;
  } else {
    t4 = $[10];
  }
  let t5;
  if ($[11] !== allMutation || $[12] !== t4) {
    let t6;
    if ($[14] !== allMutation) {
      t6 = Object.keys(allMutation !== null && allMutation !== void 0 ? allMutation : {});
      $[14] = allMutation;
      $[15] = t6;
    } else {
      t6 = $[15];
    }
    t5 = t4.concat(t6);
    $[11] = allMutation;
    $[12] = t4;
    $[13] = t5;
  } else {
    t5 = $[13];
  }
  const queriesKeys = t5;
  let t6;
  bb0: {
    if (!queries.length) {
      t6 = true;
      break bb0;
    }
    let t7;
    if ($[16] !== queries || $[17] !== queriesKeys) {
      let t8;
      if ($[19] !== queriesKeys) {
        t8 = el_0 => queriesKeys.includes(el_0);
        $[19] = queriesKeys;
        $[20] = t8;
      } else {
        t8 = $[20];
      }
      t7 = queries.map(_temp$1).every(t8);
      $[16] = queries;
      $[17] = queriesKeys;
      $[18] = t7;
    } else {
      t7 = $[18];
    }
    t6 = t7;
  }
  const isAllQueryMapped = t6;
  const isLoading = Object.values(allQuery !== null && allQuery !== void 0 ? allQuery : {}).some(_temp2$1);
  let t7;
  if ($[21] !== processedQueries) {
    t7 = processedQueries.filter(_temp3).map(_temp4).filter(Boolean);
    $[21] = processedQueries;
    $[22] = t7;
  } else {
    t7 = $[22];
  }
  const queryKeys = t7;
  let t8;
  if ($[23] !== queries) {
    t8 = queries.some(_temp5);
    $[23] = queries;
    $[24] = t8;
  } else {
    t8 = $[24];
  }
  const hasQueries = t8;
  let t9;
  if ($[25] !== allMutation || $[26] !== allQuery || $[27] !== hasQueries || $[28] !== isAllQueryMapped || $[29] !== isLoading || $[30] !== queriesKeys || $[31] !== queryKeys) {
    t9 = {
      allMutation,
      allQuery,
      isAllQueryMapped,
      isLoading,
      queryKeys,
      hasQueries,
      queriesKeys
    };
    $[25] = allMutation;
    $[26] = allQuery;
    $[27] = hasQueries;
    $[28] = isAllQueryMapped;
    $[29] = isLoading;
    $[30] = queriesKeys;
    $[31] = queryKeys;
    $[32] = t9;
  } else {
    t9 = $[32];
  }
  return t9;
}
function _temp5(q_0) {
  return q_0.type === "query";
}
function _temp4(el_3) {
  const queryConfig_0 = el_3.queryConfig;
  return queryConfig_0 === null || queryConfig_0 === void 0 ? void 0 : queryConfig_0.queryKey;
}
function _temp3(el_2) {
  return (el_2 === null || el_2 === void 0 ? void 0 : el_2.type) === "query";
}
function _temp2$1(el_1) {
  return typeof el_1 !== "boolean" && (el_1 === null || el_1 === void 0 ? void 0 : el_1.isLoadingMapped) === true && !el_1.data;
}
function _temp$1(el) {
  return el.key;
}

/**
 * Optimized shallow equality check for objects and functions
 * @param objA - First object to compare
 * @param objB - Second object to compare
 * @returns True if objects are shallow equal
 */
function shallowEqual(objA, objB) {
  if (objA === objB) return true;
  if (!objA || !objB) return false;
  if (typeof objA !== 'object' || typeof objB !== 'object') {
    return objA === objB;
  }
  if (typeof objA === 'function' && typeof objB === 'function') {
    return objA.name === objB.name && objA.toString() === objB.toString();
  }
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    const valA = objA[key];
    const valB = objB[key];
    if (typeof valA === 'function' && typeof valB === 'function') {
      if (valA.name !== valB.name || valA.toString() !== valB.toString()) {
        return false;
      }
      continue;
    }
    if (valA !== valB) return false;
  }
  return true;
}
/**
 * Checks if a value is stable for React dependency arrays
 * @param value - Value to check for stability
 * @returns True if value is considered stable
 */
function isStableValue(value) {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'object' && typeof value !== 'function') return true;
  if (typeof value === 'function') return value.toString().length < 1000;
  return false;
}
/**
 * Creates an optimized dependency array by filtering unstable values
 * @param deps - Array of dependencies to optimize
 * @returns Filtered array of stable dependencies
 */
function optimizeDeps(deps) {
  return deps.filter(dep => isStableValue(dep) || typeof dep === 'object');
}

/**
 * Specialized hook for managing view settings
 * Optimized to prevent unnecessary re-renders
 * @param viewSettings - View settings configuration (static or function)
 * @param allQuery - All query results
 * @param allMutation - All mutation handlers
 * @param formValues - Current form values
 * @param setValue - Form setValue function
 * @returns Processed view settings
 */
function useViewSettings({
  viewSettings = {},
  allQuery,
  allMutation,
  formValues,
  setValue
}) {
  const prevViewSettingsRef = useRef(undefined);
  const mappedViewSettings = useMemo(() => {
    let next;
    if (typeof viewSettings === 'function') {
      next = viewSettings({
        allQuery,
        allMutation,
        formValues,
        setValue
      });
    } else {
      next = viewSettings;
    }
    if (prevViewSettingsRef.current && shallowEqual(prevViewSettingsRef.current, next)) {
      return prevViewSettingsRef.current;
    }
    prevViewSettingsRef.current = next;
    return next;
  }, [viewSettings, allQuery, allMutation, formValues, setValue]);
  return mappedViewSettings;
}

/**
 * Optimized merge function for arrays of objects with keys
 * Maintains object references if they haven't changed
 * @param prev - Previous array of objects with keys
 * @param next - Next array of objects with keys
 * @returns Merged array with preserved references where possible
 */
function mergeByKey(prev, next) {
  if (!prev.length) return next;
  if (!next.length) return [];
  const prevMap = new Map();
  prev.forEach(item => prevMap.set(item.key, item));
  return next.map(item => {
    const prevItem = prevMap.get(item.key);
    if (prevItem && shallowEqual(prevItem, item)) {
      return prevItem;
    }
    return item;
  });
}
/**
 * Checks if two arrays with keys have the same elements
 * @param arrA - First array to compare
 * @param arrB - Second array to compare
 * @returns True if arrays are equal
 */
function arraysWithKeyEqual(arrA, arrB) {
  if (arrA.length !== arrB.length) return false;
  for (let i = 0; i < arrA.length; i++) {
    if (!shallowEqual(arrA[i], arrB[i])) return false;
  }
  return true;
}
/**
 * Stable cache implementation for objects with keys
 * Provides intelligent caching with shallow equality checks
 */
class StableCache {
  constructor() {
    this.cache = new Map();
  }
  get(key) {
    return this.cache.get(String(key));
  }
  set(key, value) {
    this.cache.set(String(key), value);
  }
  getOrSet(key, value) {
    const existing = this.get(key);
    if (existing && shallowEqual(existing, value)) {
      return existing;
    }
    this.set(key, value);
    return value;
  }
  clear() {
    this.cache.clear();
  }
}

/**
 * Specialized hook for managing form data processing
 * Uses optimized caches to prevent unnecessary re-renders
 * @param form - Form configuration
 * @param isAllQueryMapped - Whether all queries are mapped
 * @param formValues - Current form values
 * @param extractMutationsHandle - Extracted mutations
 * @param extractQueryHandle - Extracted queries
 * @param setValue - Form setValue function
 * @returns Processed form data and submit handlers
 */
function useFormData({
  form,
  isAllQueryMapped,
  formValues,
  extractMutationsHandle,
  extractQueryHandle,
  setValue
}) {
  const formDataCache = useRef(new StableCache());
  const formSubmitCache = useRef(new StableCache());
  const mappedFormData = useMemo(() => {
    var _a_0, _b, _c;
    if (!(form === null || form === void 0 ? void 0 : form.data) || !isAllQueryMapped) return [];
    const processedData = (_c = (_b = (_a_0 = form.data) === null || _a_0 === void 0 ? void 0 : _a_0.map(el_0 => {
      if (typeof el_0 === 'function') {
        return el_0({
          formValues,
          allMutation: extractMutationsHandle,
          allQuery: extractQueryHandle,
          setValue
        });
      }
      return el_0;
    })) === null || _b === void 0 ? void 0 : _b.map((el, i) => {
      var _a;
      return Object.assign(Object.assign({}, el), {
        key: (_a = el.key) !== null && _a !== void 0 ? _a : i
      });
    })) !== null && _c !== void 0 ? _c : [];
    return processedData.map(item => {
      const keyStr = String(item.key);
      return formDataCache.current.getOrSet(keyStr, Object.assign(Object.assign({}, item), {
        key: keyStr
      }));
    });
  }, [form === null || form === void 0 ? void 0 : form.data, isAllQueryMapped, formValues, extractMutationsHandle, extractQueryHandle, setValue]);
  const formSubmit = useMemo(() => {
    var _a_1, _b_0;
    if (!isAllQueryMapped || !(form === null || form === void 0 ? void 0 : form.submit)) return [];
    const submitFn = form.submit;
    const processedSubmit = (_b_0 = (_a_1 = typeof submitFn === 'function' ? submitFn({
      formValues,
      allMutation: extractMutationsHandle,
      allQuery: extractQueryHandle,
      setValue
    }) : submitFn) === null || _a_1 === void 0 ? void 0 : _a_1.map((el_1, i_0) => {
      var _a_2;
      return Object.assign(Object.assign({}, el_1), {
        key: (_a_2 = el_1.key) !== null && _a_2 !== void 0 ? _a_2 : i_0
      });
    })) !== null && _b_0 !== void 0 ? _b_0 : [];
    return processedSubmit.map(item_0 => {
      const keyStr_0 = String(item_0.key);
      return formSubmitCache.current.getOrSet(keyStr_0, Object.assign(Object.assign({}, item_0), {
        key: keyStr_0
      }));
    });
  }, [isAllQueryMapped, form === null || form === void 0 ? void 0 : form.submit, formValues, extractMutationsHandle, extractQueryHandle, setValue]);
  return {
    mappedFormData,
    formSubmit
  };
}

const EMPTY_ARRAY = [];
const usePageConfig = ({
  queries = EMPTY_ARRAY,
  form,
  ns,
  onValuesChange,
  viewSettings = {}
}) => {
  const {
    formControl,
    formValues,
    setValue
  } = useFormPage({
    form
  });
  const {
    allMutation,
    allQuery,
    isAllQueryMapped,
    isLoading,
    queryKeys,
    hasQueries
  } = usePageQueries({
    queries,
    formValues,
    setValue
  });
  const {
    invalidateQueries
  } = useInvalidateQueries();
  const {
    extractMutations,
    extractQuery
  } = useDataExtractor({
    allMutation,
    allQuery,
    formValues
  });
  const mappedViewSettings = useViewSettings({
    viewSettings,
    allQuery,
    allMutation,
    formValues,
    setValue
  });
  const extractQueryHandle = useMemo(() => {
    var _a;
    if (!((_a = form === null || form === void 0 ? void 0 : form.usedQueries) === null || _a === void 0 ? void 0 : _a.length)) return allQuery;
    return extractQuery(form === null || form === void 0 ? void 0 : form.usedQueries);
  }, [allQuery, extractQuery, form === null || form === void 0 ? void 0 : form.usedQueries]);
  const extractMutationsHandle = useMemo(() => {
    var _a_0;
    if (!((_a_0 = form === null || form === void 0 ? void 0 : form.usedQueries) === null || _a_0 === void 0 ? void 0 : _a_0.length)) return allMutation;
    return extractMutations(form.usedQueries);
  }, [allMutation, extractMutations, form === null || form === void 0 ? void 0 : form.usedQueries]);
  const {
    mappedFormData,
    formSubmit
  } = useFormData({
    form,
    isAllQueryMapped,
    formValues,
    extractMutationsHandle,
    extractQueryHandle,
    setValue
  });
  const handleRefresh = useCallback(async () => {
    if (!(queryKeys === null || queryKeys === void 0 ? void 0 : queryKeys.length)) return;
    await invalidateQueries(queryKeys);
  }, [invalidateQueries, queryKeys]);
  useEffect(() => {
    if (isAllQueryMapped && onValuesChange) {
      onValuesChange({
        allMutation,
        allQuery: allQuery !== null && allQuery !== void 0 ? allQuery : {},
        formValues,
        setValue
      });
    }
  }, [isAllQueryMapped, onValuesChange, allMutation, allQuery, formValues, setValue]);
  const formData = useFormManager(Object.assign(Object.assign({}, form), {
    data: mappedFormData,
    ns,
    formControl,
    submit: formSubmit
  }));
  return {
    formData,
    isAllQueryMapped,
    formValues,
    formControl,
    hasQueries,
    handleRefresh,
    allMutation,
    allQuery,
    setValue,
    form,
    mappedViewSettings,
    isLoading
  };
};

const usePageUtiles = () => {
  const $ = c(1);
  const getContentProps = _temp;
  const getContentItems = _temp2;
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = {
      getContentProps,
      getContentItems
    };
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
};
function _temp(props) {
  return props;
}
function _temp2(props_0) {
  return props_0;
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */

function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
}
typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * Renders page metadata using react-helmet-async
 * @param title - Page title
 * @param description - Page description
 * @param documentLang - Document language
 * @param otherMetaTags - Additional meta tags
 * @param disableIndexing - Whether to disable search engine indexing
 */
const PageMetadata = ({
  title = "Addario Giosuè App",
  description,
  documentLang = "it",
  otherMetaTags,
  disableIndexing
}) => {
  var _a, _b;
  return jsxs(Helmet, {
    children: [jsx("html", {
      lang: documentLang
    }), jsx("title", {
      children: title || ((_a = pageConfig.meta) === null || _a === void 0 ? void 0 : _a.title) || ""
    }), jsx("meta", {
      name: "description",
      content: description || ((_b = pageConfig.meta) === null || _b === void 0 ? void 0 : _b.description) || ""
    }), jsx("meta", {
      name: "robots",
      content: disableIndexing ? "noindex, nofollow" : "index, follow"
    }), otherMetaTags]
  });
};
/**
 * Main page generator component that orchestrates page rendering
 * Handles authentication, content generation, and layout management
 * @param enableAuthControl - Whether to enable authentication control
 * @param meta - Page metadata configuration
 * @param props - Additional page properties
 */
const PageGenerator = withMemo(_a => {
  var {
      enableAuthControl = true,
      meta
    } = _a,
    props = __rest(_a, ["enableAuthControl", "meta"]);
  const user = useAuthValue();
  const authControl = useMemo(() => enableAuthControl && !pageConfig.isLogged(user), [enableAuthControl, user, pageConfig.isLogged]);
  const [usedProps, setUsedProps] = useState(enableAuthControl && authControl ? "auth" : "page");
  useEffect(() => {
    const newUsedProps = authControl ? "auth" : "page";
    if (newUsedProps !== usedProps) setUsedProps(newUsedProps);
  }, [authControl, usedProps]);
  const selectedProps = useMemo(() => usedProps === "auth" ? pageConfig.authPageProps : props, [props, usedProps]);
  const {
    ns,
    contents = [],
    queries = [],
    form,
    id,
    onValuesChange,
    viewSettings
  } = selectedProps;
  const {
    t,
    i18n
  } = useTranslation(ns);
  const pageMetadata = useMemo(() => Object.assign(Object.assign({}, meta), {
    title: (meta === null || meta === void 0 ? void 0 : meta.title) ? t(meta === null || meta === void 0 ? void 0 : meta.title, {
      ns: "meta"
    }) : "",
    description: (meta === null || meta === void 0 ? void 0 : meta.description) ? t(meta === null || meta === void 0 ? void 0 : meta.description, {
      ns: "meta"
    }) : "",
    documentLang: i18n.language
  }), [t, i18n.language, meta]);
  const config = usePageConfig({
    queries,
    form,
    onValuesChange,
    ns: ns !== null && ns !== void 0 ? ns : "",
    viewSettings
  });
  const {
    handleRefresh,
    hasQueries,
    isLoading,
    mappedViewSettings
  } = config;
  const {
    allContents,
    body,
    footer,
    header
  } = useGenerateContent({
    contents,
    pageId: id,
    ns,
    pageConfig: config
  });
  const layoutComponentRef = useRef();
  const pageContainerRef = useRef();
  const Layout = useMemo(() => {
    var _a;
    const newComponent = (_a = mappedViewSettings === null || mappedViewSettings === void 0 ? void 0 : mappedViewSettings.customLayoutComponent) !== null && _a !== void 0 ? _a : pageConfig.BodyContainer;
    if (layoutComponentRef.current !== newComponent) {
      layoutComponentRef.current = newComponent;
    }
    return layoutComponentRef.current;
  }, [mappedViewSettings === null || mappedViewSettings === void 0 ? void 0 : mappedViewSettings.customLayoutComponent]);
  const PageContainer = useMemo(() => {
    var _a;
    const newComponent = (_a = mappedViewSettings === null || mappedViewSettings === void 0 ? void 0 : mappedViewSettings.customPageContainer) !== null && _a !== void 0 ? _a : pageConfig.PageContainer;
    if (pageContainerRef.current !== newComponent) {
      pageContainerRef.current = newComponent;
    }
    return pageContainerRef.current;
  }, [mappedViewSettings === null || mappedViewSettings === void 0 ? void 0 : mappedViewSettings.customPageContainer]);
  const pageContent = useMemo(() => jsxs(Fragment, {
    children: [jsx(PageMetadata, Object.assign({}, pageMetadata)), jsx(pageConfig.HeaderContainer, Object.assign({
      allContents: allContents,
      handleRefresh: handleRefresh,
      hasQueries: hasQueries
    }, mappedViewSettings === null || mappedViewSettings === void 0 ? void 0 : mappedViewSettings.header, {
      pageId: id,
      children: header
    })), !!isLoading && !!pageConfig.LoaderComponent && pageConfig.LoaderComponent({
      loading: isLoading
    })]
  }), [pageMetadata, allContents, handleRefresh, hasQueries, mappedViewSettings === null || mappedViewSettings === void 0 ? void 0 : mappedViewSettings.header, id, header, isLoading]);
  const layoutBody = useMemo(() => body, [body]);
  const layoutContent = useMemo(() => jsx(Layout, {
    allContents: allContents,
    handleRefresh: handleRefresh,
    hasQueries: hasQueries,
    viewSettings: mappedViewSettings,
    pageId: id,
    children: layoutBody
  }, id), [layoutBody]);
  const footerContent = useMemo(() => jsx(pageConfig.FooterContainer, Object.assign({
    allContents: allContents,
    handleRefresh: handleRefresh,
    hasQueries: hasQueries
  }, mappedViewSettings === null || mappedViewSettings === void 0 ? void 0 : mappedViewSettings.footer, {
    pageId: id,
    children: footer
  })), [allContents, handleRefresh, hasQueries, mappedViewSettings === null || mappedViewSettings === void 0 ? void 0 : mappedViewSettings.footer, id, footer]);
  return jsxs(PageContainer, {
    id: id !== null && id !== void 0 ? id : "",
    children: [pageContent, layoutContent, footerContent]
  }, id);
});

export { PageGenerator, StableCache, arraysWithKeyEqual, isStableValue, mergeByKey, optimizeDeps, pageConfig, setPageConfig, shallowEqual, useDataExtractor, useFormData, useFormPage, useGenerateContent, useGenerateContentRender, usePageConfig, usePageQueries, usePageUtiles, useViewSettings };
//# sourceMappingURL=index.mjs.map
