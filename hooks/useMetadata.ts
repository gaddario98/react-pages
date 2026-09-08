import { useEffect, useMemo } from "react";
import { applyMetadataToDom } from "../config/metadata";
import { usePageConfigValue } from "../config";
import { usePageValues } from "./usePageValues";
import type { FieldValues } from "@gaddario98/react-form";
import type { QueriesArray } from "@gaddario98/react-queries";
import type { MappedItemsFunction, MetadataConfig } from "../types";

export interface UseMetadataProps<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
> {
  meta?:
  | MetadataConfig<F, Q, V>
  | MappedItemsFunction<F, Q, MetadataConfig<F, Q, V>, V>;
  ns?: string;
  autoApply?: boolean;
  pageId: string;
}

export function useMetadata<
  F extends FieldValues = FieldValues,
  Q extends QueriesArray = QueriesArray,
  V extends Record<string, unknown> = Record<string, unknown>,
>({
  meta,
  autoApply = true,
  pageId,
}: UseMetadataProps<F, Q, V>) {
  const { translateText, locale } = usePageConfigValue();
  const t = useMemo(
    () => translateText ?? ((key: string) => key),
    [translateText],
  );
  const { get, set } = usePageValues<F, Q, V>({ pageId });

  // Evaluate metadata (if function)
  const evaluatedMeta = useMemo<MetadataConfig<F, Q, V>>(() => {
    if (!meta) return {};
    if (typeof meta === "function") {
      return meta({ get, set });
    }
    return meta;
  }, [meta, get, set]);

  // Translate metadata strings (i18n)
  const translated = useMemo<MetadataConfig<F, Q, V>>(() => {
    const result: MetadataConfig<F, Q, V> = { ...evaluatedMeta };

    // Translate basic fields
    if (result.title) {
      result.title = t(result.title, {
        ns: "meta",
        defaultValue: result.title,
      });
    }
    if (result.description) {
      result.description = t(result.description, {
        ns: "meta",
        defaultValue: result.description,
      });
    }
    if (result.keywords) {
      result.keywords = result.keywords.map((kw) =>
        t(kw, { ns: "meta", defaultValue: kw }),
      );
    }
    if (result.author) {
      result.author = t(result.author, {
        ns: "meta",
        defaultValue: result.author,
      });
    }

    // Translate Open Graph
    if (result.openGraph) {
      result.openGraph = { ...result.openGraph };
      if (result.openGraph.title) {
        result.openGraph.title = t(result.openGraph.title, {
          ns: "meta",
          defaultValue: result.openGraph.title,
        });
      }
      if (result.openGraph.description) {
        result.openGraph.description = t(result.openGraph.description, {
          ns: "meta",
          defaultValue: result.openGraph.description,
        });
      }
      if (result.openGraph.siteName) {
        result.openGraph.siteName = t(result.openGraph.siteName, {
          ns: "meta",
          defaultValue: result.openGraph.siteName,
        });
      }
    }

    // Translate Twitter Card
    if (result.twitter) {
      result.twitter = { ...result.twitter };
      if (result.twitter.title) {
        result.twitter.title = t(result.twitter.title, {
          ns: "meta",
          defaultValue: result.twitter.title,
        });
      }
      if (result.twitter.description) {
        result.twitter.description = t(result.twitter.description, {
          ns: "meta",
          defaultValue: result.twitter.description,
        });
      }
    }

    // Set language from locale
    result.lang = result.lang ?? locale;

    return result;
  }, [evaluatedMeta, t, locale]);

  // Apply metadata to DOM
  useEffect(() => {
    if (!autoApply || typeof document === "undefined") return;
    applyMetadataToDom(translated as MetadataConfig);
  }, [translated, autoApply]);
}

export function useApplyMetadata() {
  return (meta: MetadataConfig) => {
    if (typeof document !== "undefined") {
      applyMetadataToDom(meta);
    }
  };
}
