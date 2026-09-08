# PageGenerator: API e runtime

Questa nota descrive i sorgenti di `@gaddario98/react-pages` v3.0.3. Verifica comunque il checkout o la versione installata quando il consumer usa un fork o importa `PageGenerator` attraverso un package aggregatore.

## Contratto pubblico

`PageGenerator<F, Q, V>` accetta `PageProps<F, Q, V>`:

- `id`: obbligatorio, scope di query, form e page variables; il layout lo usa anche come key.
- `contents`: array di `ContentItem` oppure funzione `({ get, set }) => ContentItem[]`.
- `queries`: tupla tipizzata di query e mutation compatibili con `@gaddario98/react-queries`.
- `form`: configurazione di `@gaddario98/react-form`.
- `variables`: stato page-scoped `V`.
- `viewSettings`, `meta`, `ns`, `enableAuthControl`.

Ogni `ContentItem` è `custom` oppure `container`. Un custom riceve un elemento JSX o una funzione `(FunctionProps) => JSX.Element`. Può avere `key`, `index`, `hidden`, `renderInHeader` e `renderInFooter`. Un container ricorre su `items` e può sostituire l'`ItemsContainer` per il gruppo.

Il package esporta dal root componenti, hook, config, utility, tipi e integrazioni. `package.json` non dichiara un subpath `./integrations`: importa gli helper di integrazione dal root, non da `@gaddario98/react-pages/integrations`.

I tipi pubblici non garantiscono da soli che un'opzione raggiunga TanStack Query. Quando usi `placeholderData`, `select`, `staleTime` o opzioni analoghe, segui nel codice installato il percorso `queryConfig -> useApi/useMultipleQuery -> useQuery/useQueries` e verifica se l'adapter appiattisce, annida o scarta la proprietà.

## Flusso di esecuzione

```text
PageGenerator
  -> usePageConfig(pageId, variables, form, queries, viewSettings)
     -> usePageFormManager / useFormManager (formId = pageId)
     -> usePageValues(initialValues = variables)
     -> useApi(processedQueries, { scopeId: pageId, persistToAtoms: true })
  -> useGenerateContent
     -> useGenerateContentRender
        -> PageContentItem
           -> RenderComponents
              -> RenderComponent
                 -> ComponentFunctionMap
                    -> <Component get={get} set={set} />
```

`PageGenerator` distribuisce gli elementi nei container header, body e footer. Il `PageContainerComponent` e il layout ricevono `key={id}`. Cambiare `id` quindi rimonta il loro sottoalbero oltre a cambiare gli scope.

La configurazione di variables, form e query avviene prima del mount dei
content. Un content che prova a inizializzare auth o route in `useEffect` non
può rendere corretta la prima configurazione della query: può soltanto causare
un secondo passaggio dopo il mount.

## usePageValues

`usePageValues({ pageId, initialValues? })` unisce tre sorgenti:

- `query` e `mutation`: `useApiValues({ scopeId: pageId })`;
- `form`: `useFormValues({ formId: pageId })`;
- `state`: una atom Jotai per `pageId`.

Ogni chiamata `get` registra la path letta e il hook forza un update solo quando cambia una delle path sottoscritte. `get` supporta path con punti e indici (`rows[0].name`). I tipi pubblici offrono path tipizzate per query/mutation/form e chiavi top-level per `Variables`.

`set('form')` restituisce il setter del form. `set('state')` restituisce un setter top-level che fa `{ ...prev, [key]: value }`.

Nel runtime v3.0.2 descritto qui, `usePageValues` scrive `initialValues` soltanto
alla prima inizializzazione: modificare `variables` dopo il mount non resetta
automaticamente lo state. Wrapper e versioni successive possono riconciliare
dinamicamente `variables`, `queries` o `defaultValues`; verifica sempre i
sorgenti realmente importati. In ogni caso passa al primo render i valori
esterni corretti. Se il consumer richiede aggiornamenti dinamici non supportati
dal runtime installato, correggi o aggiorna il runtime anziché aggiungere un
content sincronizzatore invisibile.

Preferisci i `get` e `set` che `RenderComponent` passa direttamente a un `component` funzione. `usePageValues` duplica quell'accesso e va usato soltanto da un componente JSX estratto che non può ricevere `FunctionProps` senza prop drilling o accoppiamento sproporzionato.

## Query, form e configurazioni dinamiche

Prima di chiamare `useApi`, `usePageConfig` valuta `queryConfig` e `mutationConfig` funzione con `{ get, set }`. `usePageFormManager` valuta `form.data`, `form.submit` e `form.hidden` con lo stesso contratto e registra il form con `id/formId = pageId`.

Auth, parametri route, locale, timezone, breakpoint ed entitlement sono input
del componente che monta PageGenerator. Derivali lì e passali direttamente in
`variables`, nella tupla `queries` o in una copia memoizzata di
`form.defaultValues`. Non recuperarli in un content `Session`/`Route`/`Sync`
marcato `renderInHeader`: le query sono già state configurate quando quel
content viene montato.

Una query dinamica può esporre temporaneamente `data === undefined` quando cambia la key. Non assumere che `useQuery` e `useQueries` conservino allo stesso modo i dati precedenti, né che una proprietà annidata come `options.placeholderData` venga inoltrata. Conferma il comportamento con il runtime installato e un test con promise differita.

Per una query dettaglio soggetta a navigazioni rapide, cattura la route identity
usata per endpoint e key. Prima di copiare la risposta in `Variables`, verifica
che l'identità corrente coincida: una risposta obsoleta non deve sovrascrivere
la pagina aperta successivamente.

Gli elementi del form e i content item sono poi uniti e ordinati per `index`, con ordinamento lessicografico della key in caso di parità. Non assumere che l'ordine dell'array sia identità.

## Configurazione globale

`usePageConfigState` configura container, autenticazione, metadata di default e `translateText`. I default restituiscono semplicemente i figli. L'autenticazione è abilitata per default: se `isLogged(authValues)` è falso, la configurazione contenuto/form/query selezionata è `authPageProps`.

`viewSettings` può essere un oggetto o una funzione di `{ get, set }` e può sostituire i container page/body, ricevendo `allContents`, `handleRefresh`, `viewSettings` e `pageId`.
