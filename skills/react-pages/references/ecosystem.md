# Ecosistema react-base-core

`@gaddario98/react-pages` dipende direttamente da `@gaddario98/react-form`, `@gaddario98/react-queries` e `@gaddario98/react-state`. `@gaddario98/react-localization` è un package sibling utile per fornire `translateText` al page config, non una dipendenza diretta di pages.

## @gaddario98/react-queries

- Monta `QueriesProvider` con il `QueryClient` configurato prima delle pagine che usano `PageGenerator`.
- Configura endpoint, request function, auth, headers, `QueryClient`, persistenza e notifiche con `useApiConfigState`.
- Tutte le query e mutation della pagina devono essere mappate esclusivamente da `PageGenerator` nella tupla `queries` e passate ai content tramite la prop `get`: **non usare mai hook per le API** (`useApi`, `useQuery`, `useMutation`, ecc.) nei content o nei loro componenti discendenti.
- `PageGenerator` chiama `useApi(processedQueries, { scopeId: pageId, persistToAtoms: true })`; una query o mutation con lo stesso key in pagine diverse resta separata dal `pageId`.
- `useApiValues` e `get` sottoscrivono path granulari di query e mutation. Sfrutta al massimo la prop `get` mappando solo il campo foglia che serve (es. `get('mutation', 'sendDoctorAbsenceNotification.mutateAsync')` o `get('mutation', 'sendPatientDataReminder.isPending', false)`): non estrarre l'intero oggetto mutation `get('mutation', 'sendDoctorAbsenceNotification')`, altrimenti ogni transizione interna (idle, pending, success, timestamp) scatenerà il re-render dell'intero componente.
- Quando passi proprietà di query o mutation a componenti figli o presentazionali, passa solo le singole proprietà necessarie al componente (es. `isPending`, `mutateAsync`, `data`), mai l'intero oggetto query o mutation.
- Tutte le mutation devono invalidare le key delle query che utilizzano i dati che la mutation ha cambiato: definisci sempre `queryKeyToInvalidate` nella `mutationConfig`. `useMultipleMutation` invalida automaticamente le query indicate, mostra la notifica (`notification.success/error`) e poi propaga il risultato o l'errore di `mutateAsync`.
- Configura una query dipendente come `queryConfig: ({ get, set, refreshAllQueries }) => ({ enabled, queryKey, ... })`; non introdurre stato locale duplicato per calcolare la request. Le dipendenze esterne usate da `get("variables", ...)` devono essere già presenti nelle props di `PageGenerator` al primo render.
- Assegna a `PageGenerator` la proprietà del flusso dati configurato in `queries`. Non affiancare `useApi`, `fetch`, un query hook applicativo o un hook `get/set` per recuperare e riscrivere gli stessi dati. Per eseguire un refresh completo di tutte le query della pagina a seguito di un'azione o richiesta manuale, usa la funzione `refreshAllQueries()` fornita in `FunctionProps` o da `usePageValues`.
- Quando l'identità della route cambia mentre una request è in corso, collega la risposta alla chiave route che l'ha generata e impedisci a una risposta obsoleta di sovrascrivere la pagina più recente.
- Ricorda che `persistQueries` nel config API decide se l'atom delle query usa storage o memoria. Evita di usare dati persistiti per informazioni sensibili senza una decisione esplicita.

### Transizioni di query e paginazione

Quando un limite, cursore o filtro cambia la query key:

1. ispeziona l'adapter installato e verifica la forma effettiva delle opzioni inoltrate a TanStack Query;
2. riproduci la transizione con una promise differita, così puoi osservare separatamente stato precedente, pending e risposta successiva;
3. preferisci la conservazione nativa dei dati precedenti soltanto dopo averla verificata sullo specifico percorso `useQuery` o `useQueries`;
4. se l'adapter azzera inevitabilmente `data`, conserva in `Variables` uno snapshot esclusivamente visivo, partizionato almeno per il filtro che identifica il dataset e aggiornato da `onDataChanged` solo quando arrivano dati definiti;
5. fai leggere a contents/layout lo snapshot, ma lascia alla query la proprietà di `isFetching`, errori e `refetch`; proteggi inoltre `onEndReached` da richieste concorrenti e dal superamento del totale.

Lo snapshot non sostituisce la cache server e non va usato come seconda sorgente autorevole. Documentalo come workaround e rimuovilo quando l'adapter, una query infinita o una strategia di paginazione esplicita garantisce la continuità dei dati.

## @gaddario98/react-form

- `usePageFormManager` crea il form con `id` e `formId` uguali al `pageId` solo quando usi `PageGenerator.form`; mantieni questo percorso per form realmente integrate nella pagina, non come default.
- `form.data` può contenere config di field o factory che riceve `{ get, set, refreshAllQueries }`; `form.submit` può essere un array o una factory page-aware.
- Prediligi un `FormManager` in un content component per form autosufficienti. Usa `set('form')` per aprire, impostare o resettare campi solo quando il form è intenzionalmente integrato in `PageGenerator.form` e condiviso con altri content item.
- Mantieni `onValuesChange` per un effetto reale del form, non per trasferire il setter al componente pagina.
- Se i valori iniziali dipendono da sessione, route o altri hook esterni, calcola `form.defaultValues` nel componente pagina e passali direttamente a `PageGenerator`. Verifica sul runtime installato se gli aggiornamenti successivi vengono riconciliati; non simulare questa riconciliazione con un content invisibile.
- Configura container field/form e notifiche globali con `useFormConfigState` quando il consumer usa `FormManager` direttamente o attraverso `PageGenerator`.
- Ricorda che il submit rifila gli spazi delle stringhe, eccetto le chiavi `password` e `pPassword`, e che `values` può limitare la validazione/payload a un sottoinsieme di campi.

## @gaddario98/react-state

- `atomStateGenerator` crea una atom Jotai e i hook `useValue`, `useState`, `useReset`.
- Le config globali di pages, form, queries e localization usano questo pattern.
- Usa il suo storage solo quando la persistenza è una scelta esplicita: lo storage predefinito comprime valori grandi e ritarda le scritture.

## @gaddario98/react-localization

- Fornisci al page config `locale` e `translateText` usando il traduttore dell'app. Il package localization sibling offre `useTranslation`, `useTranslatedText` e `createServerTranslator`.
- Passa `ns` al `PageGenerator` per il namespace della pagina; evita di spargere stringhe di namespace in componenti estratti quando il config può centralizzarlo.
- I metadata risolti dal runtime pages sono tradotti con namespace `meta` e ricevono `locale` come fallback per `lang`; verifica che le chiavi metadata esistano in quel namespace.
