# Metadata e integrazioni

## Pipeline metadata

`PageGenerator` invoca internamente `useMetadata`, che orchestra il ciclo di vita dei tag nel `<head>`:

1. **Risoluzione della configurazione**: valuta `meta` (può essere un oggetto statico o una funzione `({ get, set }) => MetadataConfig`).
2. **Fallback globale**: se la configurazione della pagina omette specifici campi, questi vengono fusi a partire da `defaultMetadata` registrato globalmente in `usePageConfigState`.
3. **Traduzione e localizzazione**: traduce i campi supportati tramite `translateText` e il namespace `ns`, completando `lang` dal `locale` globale.
4. **Controllo di attivazione (`isActive`)**: verifica il flag booleano `isActive` (default `true`). Se `isActive === false`, i metadati della pagina non vengono applicati al DOM e i tag precedentemente associati a quella pagina vengono rimossi.
5. **Applicazione e pulizia differenziale nel DOM**:
   - Ogni elemento iniettato nel `<head>` (`<title>`, `<meta>`, `<link>`, `<script type="application/ld+json">`) viene marcato con l'attributo `data-react-pages="meta"` e con `data-page-id`.
   - All'applicazione della nuova pagina, i tag della pagina precedente che non sono più definiti nella nuova configurazione (es. Open Graph, Twitter Cards, description, keywords, canonical, robots) vengono **automaticamente rimossi**, prevenendo residui e tag obsoleti nel DOM.
6. **Cleanup allo smontaggio**: quando il componente si smonta o viene disattivato (`isActive: false`), i relativi metadati vengono eliminati dal DOM.

## Campi e Funzionalità Chiave

### Proprietà `isActive`

Nelle applicazioni moderne (es. navigazione a schede/tab, viste Ionic con cache, componenti router con keep-alive), più istanze di `PageGenerator` possono rimanere contemporaneamente montate in memoria.
Se non gestito, l'ultimo componente montato sovrascrive i metadati e il ritorno a una pagina già montata non triggera un nuovo mount.

Passando `isActive: activeTab === pageId`, `useMetadata` reagisce al cambio di visibilità:
- Quando `isActive` diventa `true`: applica i metadati correnti e rimuove eventuali tag orfani della pagina precedente.
- Quando `isActive` diventa `false`: pulisce i metadati associati a quella pagina.

```tsx
<PageGenerator
  id="orders-page"
  isActive={activeTab === "orders"}
  meta={{
    title: "Ordini Ricevuti",
    description: "Gestione e monitoraggio ordini",
  }}
  contents={...}
/>
```

### Rimozione Tag Obsoleti & `cleanupMetadata`

Il package garantisce che `document.head` rimanga atomico e privo di leaky tags tra transizioni di pagina:

- **Pulizia automatica**: `applyMetadataToDom` ripulisce automaticamente description, keywords, author, canonical, themeColor, og:*, twitter:*, structuredData e robots che non siano esplicitamente dichiarati nella nuova pagina.
- **Funzione imperativa `cleanupMetadata(pageId?: string)`**:
  Esportata da `@gaddario98/react-pages` (e dal subpath `@gaddario98/react-pages/config`), consente di rimuovere manualmente dal DOM tutti i tag gestiti da `react-pages`, opzionalmente limitandosi a un singolo `pageId`.

```tsx
import { cleanupMetadata } from "@gaddario98/react-pages";

// Rimuove tutti i metadati iniettati da react-pages
cleanupMetadata();

// Rimuove solo i metadati associati a uno specifico pageId
cleanupMetadata("orders-page");
```

### Configurazione Globale `defaultMetadata`

In `usePageConfigState`, puoi definire metadati base di fallback per l'intera applicazione:

```tsx
setPageConfig((prev) => ({
  ...prev,
  defaultMetadata: {
    title: "Mio Gestionale",
    description: "Piattaforma aziendale integrata",
    themeColor: "#0284c7",
    robots: { noindex: false },
  },
}));
```

Ogni pagina erediterà questi valori se non esplicitamente sovrascritti nel suo prop `meta`.

## Best Practice e Vincoli

- `MetadataConfig` supporta base SEO, Open Graph, Twitter, canonical/alternates, icons/manifest, JSON-LD, robots, custom meta e hint AI. Usa valori dinamici tramite la funzione `meta({ get, set })` solo quando dipendono da query, form o page state.
- Fornisci URL assoluti agli Open Graph image URL. Non usare gli hint `ai-*` come sostituto di contenuto accessibile.
- In ambienti SSR o React Native, le funzioni di manipolazione del DOM (`applyMetadataToDom`, `cleanupMetadata`) sono no-op sicuri (`typeof document === 'undefined'`).

