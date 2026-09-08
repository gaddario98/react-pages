---
name: react-pages
description: Progetta, implementa, refattorizza, diagnostica e revisiona pagine React basate su @gaddario98/react-pages, PageGenerator e wrapper come PageGeneratorWithHeader. Usa questa skill per ContentItemsType, PageProps, form/query/mutation, configurazioni dipendenti da auth o route, lifecycle dei content e migrazioni da strutture legacy, soprattutto per evitare query che partono tardi, schermate vuote e remount di widget stateful.
---

# React Pages

Implementa pagine tipizzate e stabili con `@gaddario98/react-pages`. La correttezza del lifecycle ha priorità sulle ottimizzazioni del React Compiler: un aggiornamento deve cambiare le props, non il tipo React o la key del sottoalbero stateful.

Considera i sorgenti del package la fonte dell'API effettiva. Tratta esempi più vecchi del README come non vincolanti se contrastano con il rendering reale, in particolare gli esempi che usano callback `component` inline.

## Procedura

1. Individua l'import usato dal consumer e verifica la versione installata, gli export disponibili e l'eventuale fork locale prima di modificare codice. Per opzioni avanzate di query, controlla anche come l'adapter installato inoltra davvero la configurazione: una proprietà presente nei tipi può essere annidata, ignorata o gestita diversamente dal runtime. Leggi [riferimento API e runtime](references/page-generator.md) quando devi modellare la pagina o verificare un comportamento.
2. Modella la feature o subfeature per responsabilità di dominio. Se espone una pagina, separa almeno `page`, `queries`, `variables` e l'eventuale `form`; usa `content` soltanto quando contiene UI o comportamento reale. Leggi [struttura feature](references/feature-structure.md) e passa i tre contratti come generici di `PageGenerator`.
3. Deriva auth, parametri route, lingua, breakpoint e altri input esterni nel componente padre che renderizza `PageGenerator` o il wrapper applicativo equivalente, per esempio `PageGeneratorWithHeader`. Passali direttamente in `variables`, `queries` o `form.defaultValues`, stabilizzando gli oggetti non primitivi. Devono essere corretti già al primo render, prima della configurazione delle query. Non creare content `Session`, `Route` o `Sync` che copiano questi valori con `useEffect`, e non nasconderli in header/footer. Leggi [configurazioni esterne e refactor](references/refactoring-and-ownership.md).
4. Metti lo stato condiviso e page-scoped in `PageGenerator.variables`; leggilo e aggiornalo con i `get` e `set` ricevuti nelle props del content component. Usa `usePageValues({ pageId: PAGE_ID })` solo quando non puoi passare tali props senza prop drilling o accoppiamenti non ragionevoli. Conserva nel widget lo stato che non serve al resto della pagina, come sorting, focus e paginazione della tabella. Non duplicare i dati query salvo un fallback documentato di continuità visiva quando l'adapter svuota i dati durante un cambio di query key.
5. Costruisci ogni content item stateful come componente nominato a livello modulo che riceve `FunctionProps`; assegnagli una key semantica e permanente direttamente nel content item. Mantieni nell'array statico hero, azioni, informazioni e altri contenuti che devono reagire all'arrivo dei dati: il componente può gestire `undefined`, ma la struttura non deve dipendere dal fatto che la query abbia già risposto. Usa un elemento JSX solo quando richiede props extra. Nei layout virtualizzati verifica se un item invisibile occupa una riga. Leggi [lifecycle e rendering](references/rendering-lifecycle.md).
6. Importa la costante `queries` dal modulo feature; non dichiarare endpoint, keys o request inline nella pagina e non affiancare a PageGenerator hook API che recuperano gli stessi dati. Passa `form` a `PageGenerator` solo quando deve partecipare al suo scope o layout; altrimenti rendi `FormManager` in un content component. Metti invalidation e notifiche nella `mutationConfig`. Leggi [ecosistema](references/ecosystem.md).
7. Durante un refactor, aggiorna prima tutti i consumer verso il barrel pubblico della nuova ownership, poi elimina file, export e cartelle legacy solo dopo una ricerca globale dei riferimenti. Non conservare moduli vuoti o wrapper pass-through. Leggi [configurazioni esterne e refactor](references/refactoring-and-ownership.md).
8. Configura metadata o integrazioni server solo se richiesto. Leggi [metadata e piattaforme](references/metadata-and-platforms.md) per SSR, Next, sitemap, robots, JSON-LD e `llms.txt`.
9. Verifica il requisito funzionale. Per query dipendenti da route/auth, testa anche la configurazione al primo render; per risposte concorrenti, verifica che una risposta vecchia non sovrascriva la route corrente. Per widget stateful, conta i mount; per paginazione dinamica, usa una request differita e asserisci `dati correnti -> pending con dati ancora visibili -> dati estesi`. Esegui lint, test mirati e build pertinenti.

## Modello di pagina raccomandato

Usa componenti estratti per i content item che leggono dati, modificano variabili o ospitano stato locale. Ricevi `get` e `set` direttamente nelle props del componente; non ricreare la funzione-componente nel componente pagina. Mantieni il componente pagina come composizione di contratti feature già definiti.

```tsx
const PAGE_ID = "orders-page";

// Importa da ./form, ./queries e ./variables.
// OrderFormValues, OrdersQueries, OrderVariables
// ordersQueries, orderVariables

function OrdersTableContent({
  get,
  set,
}: FunctionProps<OrderFormValues, OrdersQueries, OrderVariables>) {
  const orders = get("query", "orders.data", []);
  const search = get("state", "search", "");
  const selectedCustomerIds = get("state", "selectedCustomerIds", []);
  const setState = set("state");

  return (
    <DataTable
      data={filterOrders(orders, search, selectedCustomerIds)}
      globalFilterValue={search}
      onGlobalFilterChange={(value) => setState("search", value)}
    />
  );
}

export function OrdersPage() {
  const contents = useMemo<
    ContentItemsType<OrderFormValues, OrdersQueries, OrderVariables>
  >(
    () => [
      {
        type: "custom",
        key: "orders-table",
        component: OrdersTableContent,
      },
    ],
    [],
  );

  return (
    <PageGenerator<OrderFormValues, OrdersQueries, OrderVariables>
      id={PAGE_ID}
      queries={ordersQueries}
      contents={contents}
      variables={orderVariables}
    />
  );
}
```

`OrdersTableContent` mantiene la stessa reference perché è definito a livello modulo. Non trasformarlo in una callback inline per passare stato della pagina.

## Struttura della feature

Mantieni questi moduli accanto a `page.tsx` (o nei relativi sottofolder se il repository li usa già):

```text
features/orders/
├── content.tsx
├── form.ts
├── queries.ts
├── variables.ts
├── page.tsx
└── index.ts
```

- In `form.ts`, dichiara un'interfaccia che estende `FieldValues` e una costante form completa. Passa la stessa costante a `FormManager`; passa `form` a `PageGenerator` soltanto quando è indispensabile alla sua orchestrazione.
- In `queries.ts`, mantieni in quest'ordine: tupla `QueryDefinition`, endpoint path, keys e costante `queries`. Costruisci `queries` unendo esclusivamente i tre elementi precedenti e tipizzala rispetto a `PageProps`.
- In `variables.ts`, dichiara un'interfaccia per le variabili page-scoped e la costante `variables` completa con i valori iniziali. Non dichiarare queste variabili inline in `page.tsx`.
- In `content.tsx`, dichiara componenti nominati e la configurazione `contents`; ometti il file se la pagina non ha content reali oltre a form/header generati.
- In `page.tsx`, importa contratti e costanti statiche; deriva qui soltanto la configurazione che dipende da hook esterni e passala direttamente a `PageGenerator`.
- In `index.ts`, esporta l'API pubblica necessaria ai consumer senza reimportare il barrel dall'interno della feature.

## Regole non negoziabili di rendering

- Usa `component: NamedFunctionContent` come default per tabelle, form, dialog, popover, editor e contenuti che cambiano spesso. Dichiara la funzione a livello modulo, falla accettare `FunctionProps` e non farle catturare stato o setter locali del componente pagina.
- Usa `component: <NamedContent />` solo quando il componente richiede props aggiuntive non disponibili in `FunctionProps`. In quel caso usa `usePageValues` soltanto nel componente estratto che ne ha realmente bisogno.
- Non usare `component: ({ get }) => ...` dentro il componente pagina quando può essere ricreato. Il renderer finale esegue `<Component />`; una nuova funzione è quindi un nuovo tipo React e rimonta i discendenti.
- Assegna sempre `key` a un content item stateful. Descrivi il ruolo (`orders-table`), non la posizione (`content-2`) né valori volatili (`orders-table-${search}`).
- Mantieni le key dei fratelli indipendenti da inserimenti condizionali. Nei container normali preferisci `hidden` con key esplicita per non spostare i fratelli; ricorda che il content item nascosto stesso viene smontato. Nei container virtualizzati ometti invece l'item se `hidden`/`null` resta nella sorgente e produce una riga vuota, preservando key stabili per gli altri item.
- Non affidarti a `useMemo`, comparatori profondi o React Compiler per correggere un tipo o una key instabile. Usali solo dopo aver reso corretta l'identità React.
- Non modificare `PAGE_ID` per resettare la UI. Resetta esplicitamente soltanto lo stato necessario.
- Non usare `renderInHeader` o `renderInFooter` per eseguire effetti senza UI. Sono slot di presentazione, non una fase di inizializzazione.


## Stato, form, query e mutation

Mantieni il confine di responsabilità seguente:

| Necessità                                                      | Posizione corretta                                                       |
| -------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Ricerca, filtro condiviso, ID occupato, apertura dialog        | `Variables` + `get/set('state')`                                         |
| Form autosufficiente                                           | `FormManager` in un content component                                    |
| Valori form condivisi con altri content o layout PageGenerator | `form` + `get/set('form')`                                               |
| Sorting, paginazione, focus, righe espanse locali              | Widget che li possiede                                                   |
| Snapshot visivo durante cambio key non trattenuto dall'adapter | `Variables`, partizionato per filtro e aggiornato solo con dati definiti |
| Request, invalidation e feedback dell'operazione               | `queries[].queryConfig` / `mutationConfig`                               |
| Conferma utente e orchestrazione transitoria                   | Handler UI stabile (`useCallback` se necessario)                         |

Passa sempre a `PageGenerator` le `variables` corrette per il render corrente. La riconciliazione dopo il mount varia tra versioni e wrapper: controlla il runtime installato. Se non supporta aggiornamenti dinamici delle props, non compensare con un content invisibile; aggiorna o correggi il runtime, oppure implementa una migrazione esplicita e documentata in un componente con responsabilità reale. Il setter di stato sostituisce superficialmente una chiave top-level; aggiorna oggetti annidati in modo immutabile.

Leggi query e mutation con il `get` ricevuto nelle props: `get('query' | 'mutation', path, fallback)`. Leggi e scrivi il form con `get('form', path, fallback)` e `set('form')`; non aggiungere ref imperativi o `onValuesChange` soltanto per esporre il setter del form al page component.

Mantieni le configurazioni non primitive stabili con `useMemo` e gli handler condivisi con `useCallback` quando catturano valori. Includi dipendenze complete. Non memoizzare primitivi banali o nascondere dipendenze necessarie.

## Layout, autenticazione e metadata

Usa `renderInHeader` e `renderInFooter` esclusivamente per contenuti visivi destinati ai rispettivi slot; usa `type: 'container'` per raggruppare elementi nel `ItemsContainer` configurato globalmente. Ordina con `index` solo se necessario, senza usarlo come identità.

Configura una sola volta i container, autenticazione e traduzione tramite `usePageConfigState`. Considera che `enableAuthControl` è attivo di default e una pagina non autenticata renderizza `authPageProps`.

Usa `meta` per metadata statici o con una funzione che accetta `get`/`set` e ritorna la configurazione. Le vecchie logiche SSR basate su `MetadataStoreProvider` e gli evaluator per singola proprietà sono state eliminate. Per integrazioni Next.js o custom SSR, assicurati di estrarre e servire i metadati prima di idratare il ramo client `PageGenerator`.

## Diagnosi e verifica

Distingui re-render e remount con una sonda temporanea:

```tsx
useEffect(() => {
  mounts += 1;
}, []);
```

Esegui l'interazione reale che cambia ricerca o filtro e verifica `mounts === 1`. Un snapshot o l'asserzione che la tabella sia ancora visibile non protegge sorting, focus e paginazione. Considera gli effetti aggiuntivi di Strict Mode nel confronto, quindi misura la variazione relativa. Rimuovi sempre log e sonde temporanee.

Prima di consegnare, verifica:

- componenti stateful con tipo stabile e key esplicite;
- moduli `form`, `queries` e `variables` completi, senza config inline in `page.tsx`;
- form gestito da `FormManager` salvo una motivazione concreta per `PageGenerator.form`;
- auth, route, locale e altri input esterni iniettati dal componente che monta `PageGenerator`, corretti al primo render;
- nessun content invisibile usato per inizializzare `variables`, query o default form;
- `get` e `set` ricevuti nelle props per default, con `usePageValues` limitato ai casi necessari;
- `PAGE_ID` condiviso tra generatore e gli eventuali `usePageValues`;
- stato page-scoped in `variables`, stato locale nel widget;
- config e handler stabili senza dipendere dal React Compiler;
- notifiche e invalidation nella definizione dell'operazione;
- test di mount per la regressione quando il widget conserva stato importante;
- transizioni di paginazione dinamica senza svuotare la sorgente visiva durante il pending;
- risposte obsolete incapaci di sovrascrivere lo stato di una route successiva;
- item invisibili senza righe o spazi vuoti residui nei layout virtualizzati;
- consumer aggiornati prima di eliminare barrel, wrapper e cartelle legacy;
- lint, test mirati e build pertinenti senza mascherare errori preesistenti.
