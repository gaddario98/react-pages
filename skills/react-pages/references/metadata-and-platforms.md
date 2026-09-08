# Metadata, SSR e integrazioni

## Pipeline metadata

`MetadataManager` invoca `useMetadata`, che:

1. valuta un `meta` oggetto o funzione con `{ get, set }`;
2. trasforma le funzioni dinamiche in `ResolvedMetadata` con `resolveMetadata`;
3. traduce i campi supportati e completa `lang` dal `locale` globale;
4. sul client aggiorna il DOM in un effect; in SSR scrive nel `MetadataStore` durante il render se è presente un provider.

`MetadataConfig` supporta base SEO, Open Graph, Twitter, canonical/alternates, icons/manifest, JSON-LD, robots, custom meta e hint AI. Usa valori dinamici solo quando dipendono da query, form o page state.

## SSR

Non usare lo store globale per metadata server. Per ogni request crea e passa un nuovo store:

```tsx
const store = createMetadataStore()
const html = renderToString(
  <MetadataStoreProvider store={store}>
    <App />
  </MetadataStoreProvider>,
)
const head = collectMetadataToHtml(store.getMetadata())
```

`collectMetadataToHtml` restituisce tag HTML escapati da inserire nell'head dell'host. `applyMetadataToDom` è client-only. `setMetadata/getMetadata/resetMetadata` esistono per compatibilità ma usano un singleton; non sceglierli per nuovo SSR.

## Next.js

`PageGenerator` usa hook e deve stare in un Client Component. Mantieni fetch server, hydration TanStack Query e metadata del framework nel ramo server quando usi App Router.

```ts
const resolved = resolveMetadata(meta, context)
return toNextMetadata(resolved)
```

`toNextMetadata` converte verso un sottoinsieme della Metadata API di Next. `toNextHeadTags` restituisce descrittori `{ key, tag, attributes, content? }` per Pages Router: trasformali in JSX `next/head` invece di supporre che siano elementi React.

## Helper pubblici

Importa dal root del package:

- `buildOrganizationJsonLd`, `buildWebSiteJsonLd`, `buildBreadcrumbListJsonLd`, `buildArticleJsonLd`, `buildFAQPageJsonLd`, `buildProductJsonLd`;
- `generateSitemapXml`, `generateSitemapEntries`, `generateRobotsTxt`;
- `generateLlmsTxt`, `generateLlmsFullTxt`, `pageToMarkdown`.

Fornisci URL assoluti alle sitemap e agli Open Graph image URL. Non usare gli hint `ai-*` come sostituto di contenuto accessibile, JSON-LD, sitemap, robots o `llms.txt` curato.
