import {
  AllMutation,
  MultipleQueryResponse,
  QueriesArray,
} from "@gaddario98/react-queries";
import { FieldValues, UseFormSetValue } from "react-hook-form";
import { ContainerItem, ContentItem, Items, PageProps } from "../types";

export interface Props<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
> {
  content: ContentItem<F, Q>;
  ns: string;
  formValues: F;
  pageId: string;
  allQuery: MultipleQueryResponse<Q>;
  allMutation: AllMutation<Q>;
  setValue: UseFormSetValue<F>;
}

export interface ContentProps<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
> extends Omit<Props<F, Q>, "content"> {
  content: Items<F, Q>;
}

export interface ItemContainerProps<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
> extends Omit<Props<F, Q>, "content"> {
  content: ContainerItem<F, Q>;
}

export interface ContentListProps<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
> {
  contents: Required<PageProps<F, Q>>["contents"];
  ns?: PageProps<F, Q>["ns"];
  queries: Required<PageProps<F, Q>>["queries"];
  prefix?: string;
  form?: PageProps<F, Q>["form"];
  pageId: string;
}
