# Metadata e integrazioni

## Pipeline metadata

`MetadataManager` invoca `useMetadata`, che:

1. valuta un `meta` oggetto oppure una funzione chiamandola con `{ get, set }`;
2. traduce i campi supportati e completa `lang` dal `locale` globale;
3. aggiorna il DOM in un effect.

`MetadataConfig` supporta base SEO, Open Graph, Twitter, canonical/alternates, icons/manifest, JSON-LD, robots, custom meta e hint AI. Usa valori dinamici tramite la funzione `meta({ get, set })` solo quando dipendono da query, form o page state.

## SSR e Next.js

Il `MetadataStoreProvider` e gli state globali persistenti per la gestione dei metadata lato server sono stati eliminati per minimizzare la complessità.

`PageGenerator` usa hook e deve stare in un Client Component. Mantieni fetch server, hydration TanStack Query e metadata del framework nel ramo server quando usi App Router.

Assicurati di estrarre e servire i metadati necessari attraverso le API native del framework (es. la funzione `generateMetadata` in Next.js) prima di idratare il ramo client in cui verrà renderizzato il `PageGenerator`.

## Helper pubblici

Importa dal root del package se supportati:

- `buildOrganizationJsonLd`, `buildWebSiteJsonLd`, `buildBreadcrumbListJsonLd`, `buildArticleJsonLd`, `buildFAQPageJsonLd`, `buildProductJsonLd`;
- `generateSitemapXml`, `generateSitemapEntries`, `generateRobotsTxt`;
- `generateLlmsTxt`, `generateLlmsFullTxt`, `pageToMarkdown`.

Fornisci URL assoluti alle sitemap e agli Open Graph image URL. Non usare gli hint `ai-*` come sostituto di contenuto accessibile, JSON-LD, sitemap, robots o `llms.txt` curato.
