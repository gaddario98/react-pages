# Metadata e integrazioni

## Pipeline metadata

`MetadataManager` invoca `useMetadata`, che:

1. valuta un `meta` oggetto oppure una funzione chiamandola con `{ get, set }`;
2. traduce i campi supportati e completa `lang` dal `locale` globale;
3. aggiorna il DOM in un effect.

`MetadataConfig` supporta base SEO, Open Graph, Twitter, canonical/alternates, icons/manifest, JSON-LD, robots, custom meta e hint AI. Usa valori dinamici tramite la funzione `meta({ get, set })` solo quando dipendono da query, form o page state.

Fornisci URL assoluti agli Open Graph image URL. Non usare gli hint `ai-*` come sostituto di contenuto accessibile.
