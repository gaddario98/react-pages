import { QueriesArray } from "@gaddario98/react-queries";
import { useCallback } from "react";
import { FieldValues } from "react-hook-form";
import {  ContentItem } from "../types";

export const usePageUtiles = () => {
  const getContentProps = useCallback(
    <
      F extends FieldValues = FieldValues,
      Q extends QueriesArray = QueriesArray,
    >(
      props: ContentItem<F, Q>
    ) => props,
    []
  );
  const getContentItems = useCallback(
    <
      F extends FieldValues = FieldValues,
      Q extends QueriesArray = QueriesArray,
    >(
      props: ContentItem<F, Q>[]
    ) => props,
    []
  );

  return { getContentProps, getContentItems };
};
