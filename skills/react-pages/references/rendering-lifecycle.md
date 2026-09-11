# Rendering stabile e lifecycle

## Indice

- [Causa reale del remount](#causa-reale-del-remount)
- [Pattern sicuri](#pattern-sicuri)
- [Sincronizzatori invisibili e primo render](#sincronizzatori-invisibili-e-primo-render)
- [Key e contenuti condizionali](#key-e-contenuti-condizionali)
- [Layout virtualizzati](#layout-virtualizzati)
- [Scroll reset durante una query dinamica](#scroll-reset-durante-una-query-dinamica)
- [Pattern di migrazione](#pattern-di-migrazione)
- [Diagnosi](#diagnosi)

## Causa reale del remount

Il rendering di un custom function content finisce in `RenderComponent`:

```tsx
return <Component get={get} set={set} />;
```

Per React una nuova funzione passata come `Component` è un tipo differente. Perciò questo anti-pattern rimonta i discendenti a ogni render del page component:

```tsx
function BadPage() {
  const [search, setSearch] = useState("");

  return (
    <PageGenerator
      contents={[
        {
          type: "custom",
          component: ({ get }) => (
            <DataTable
              data={filterRows(get("query", "rows.data", []), search)}
              onGlobalFilterChange={setSearch}
            />
          ),
        },
      ]}
    />
  );
}
```

`useMemo` sull'array non risolve nulla se una sua dipendenza cambia e ricrea la funzione-componente. `memo` e il comparatore profondo del framework non cambiano la semantica dell'identità di tipo React.

## Pattern sicuri

### Funzione nominata a livello modulo

È il default per contenuti stateful o che reagiscono a filtri e query. Il renderer passa direttamente `get` e `set`; evita quindi un hook aggiuntivo.

```tsx
const PAGE_ID = "example-page";

function ResultsContent({
  get,
  set,
}: FunctionProps<FormValues, Queries, Variables>) {
  const rows = get("query", "rows.data", []);
  const search = get("state", "search", "");
  const setState = set("state");

  return (
    <DataTable
      data={filterRows(rows, search)}
      globalFilterValue={search}
      onGlobalFilterChange={(value) => setState("search", value)}
    />
  );
}

const contents = [
  { type: "custom", key: "results-table", component: ResultsContent },
];
```

`ResultsContent` mantiene la propria reference perché è dichiarato a livello modulo. Usa `useMemo`/`useCallback` per configurazioni o callback non primitive, senza trasformare il content component in una closure.

### Elemento JSX con usePageValues

Usalo solo quando un componente estratto richiede props aggiuntive non disponibili in `FunctionProps` e passarle al function component renderebbe il design peggiore. Leggi query, form e variables attraverso `usePageValues` esclusivamente in quel componente.

```tsx
function FormDialogContent({ title }: { title: string }) {
  const { get, set } = usePageValues<FormValues, Queries, Variables>({
    pageId: PAGE_ID,
  });
  const open = get("form", "isOpen", false);
  const setForm = set("form");
  return (
    <FormDialog
      title={title}
      open={open}
      onOpenChange={(next) => setForm("isOpen", next)}
    />
  );
}

const contents = [
  {
    type: "custom",
    key: "form-dialog",
    component: <FormDialogContent title="Edit" />,
  },
];
```

Non usare questa variante soltanto per evitare di ricevere `get` e `set` nelle props.

## Sincronizzatori invisibili e primo render

`PageGenerator` prepara form, variables e query prima che i content item siano montati. Di conseguenza un content invisibile non può essere usato per fornire una dipendenza necessaria alla prima query:

```tsx
function SessionSync({ set }: FunctionProps<FormValues, Queries, Variables>) {
  const session = useAuthValue();

  useEffect(() => {
    set("variables")("userId", session?.user.id);
  }, [session?.user.id, set]);

  return null;
}

const contents = [
  {
    type: "custom",
    key: "session-sync",
    component: SessionSync,
    renderInHeader: true,
  },
];
```

Questo pattern può lasciare una query dipendente disabilitata al primo render e produrre una pagina vuota con il solo header. Leggi invece sessione, route, locale o altre dipendenze esterne nel componente pagina e passale direttamente a `PageGenerator` tramite `variables`, `queries` o `form.defaultValues`.

`renderInHeader` e `renderInFooter` descrivono una posizione visiva. Non sono lifecycle hook e non devono ospitare componenti `Session`, `Route`, `Init` o `Sync` che restituiscono `null`. Se un effetto non visivo è davvero necessario dopo il mount, integralo nel content reale che possiede quel comportamento e dagli un nome che ne descriva l'effetto di dominio.

## Key e contenuti condizionali

`useGenerateContentRender` usa `content.key` oppure una key derivata dall'indice per il wrapper esterno `PageContentItem`. Una key su un figlio JSX non protegge questo wrapper. Le key implicite diventano pericolose se inserisci o rimuovi un item prima di fratelli stateful.

Regole:

1. Metti `key` esplicita sul content item, non soltanto sul JSX interno.
2. Usa una key permanente e semantica: `company-form-dialog`, non `content-3` e non `table-${search}`.
3. Mantieni la tabella e gli altri widget che devono conservare stato nell'array con stessa key e tipo.
4. Per un dialog o alert condizionale, usa `hidden` e una key propria se l'obiettivo è non spostare i fratelli. `hidden` restituisce `null`, quindi quel content item si smonta intenzionalmente quando è nascosto.
5. Non usare `index` come sostituto della key; dopo l'ordinamento è solo posizione di layout.
6. Per una pagina detail, mantieni statico l'array dei content item e lascia che il componente legga dati query eventualmente `undefined`. Se serve, usa una factory `hidden` reattiva; non costruire l'intero body soltanto dopo l'arrivo dei dati.

## Pagine in cache, Tab e Keep-Alive: ciclo di vita con `isActive`

Nelle interfacce a schede (Tab views), layout persistenti (Ionic `IonRouterOutlet`, navigazione multi-tab, o router keep-alive), più istanze di `PageGenerator` restano **montate contemporaneamente** per preservare lo scroll, il form state o le query senza rifare il fetch.

### Il problema del remount mancato
Se una pagina resta montata mentre l'utente visualizza un'altra scheda, passare tra una pagina e l'altra non genera eventi di mount o unmount. Di conseguenza:
- I metadati nel `<head>` rimarrebbero fissati sull'ultima pagina montata o visitata.
- Rientrare in una pagina precedentemente montata non ne aggiornerebbe i metadati se ci si affidasse al solo ciclo di vita React mount/unmount.

### Soluzione con `isActive`
Passa la prop `isActive` derivata dal tab corrente a ciascun `PageGenerator`:

```tsx
function TabContainer() {
  const [currentTab, setCurrentTab] = useState<"uno" | "due">("uno");

  return (
    <>
      <div style={{ display: currentTab === "uno" ? "block" : "none" }}>
        <PageGenerator
          id="pagina-uno"
          isActive={currentTab === "uno"}
          meta={{ title: "Pagina Uno", description: "Descrizione uno" }}
          contents={unoContents}
        />
      </div>

      <div style={{ display: currentTab === "due" ? "block" : "none" }}>
        <PageGenerator
          id="pagina-due"
          isActive={currentTab === "due"}
          meta={{ title: "Pagina Due", description: "Descrizione due" }}
          contents={dueContents}
        />
      </div>
    </>
  );
}
```

Quando `currentTab` passa da `"due"` a `"uno"`:
1. `PageGenerator` di "due" riceve `isActive: false` e pulisce i propri tag specifici.
2. `PageGenerator` di "uno" riceve `isActive: true` e riapplica immediatamente i propri metadati, rimuovendo tag orfani lasciati da "due" (es. openGraph o twitter specifici).
3. Nessun componente o stato locale viene smontato, preservando completamente la reattività e le performance.

## Layout virtualizzati

In un layout virtualizzato, i content item possono diventare direttamente i dati della lista. Un item `hidden`, un fragment vuoto o un componente che restituisce `null` può quindi continuare a occupare padding, span o altezza nel wrapper esterno, anche se non disegna contenuto.

Ispeziona il mapping `allContents -> data -> renderItem`. Se l'item invisibile resta nei dati, omettilo condizionalmente dall'array invece di usare `hidden`, mantenendo key semantiche e permanenti per tutti i fratelli. Elimina i sincronizzatori di configurazione: le dipendenze esterne devono essere iniettate dal componente pagina. Un effetto non visivo legittimo va integrato nel content reale che ne possiede il comportamento, non trasformato in una riga vuota della lista.

## Scroll reset durante una query dinamica

Uno scroll che torna all'inizio non dimostra da solo un remount. Se un cambio di limite o cursore produce temporaneamente `data === undefined`, la sorgente visiva può passare da `[A]` a `[]`, mostrare il loader e poi diventare `[A, B]`; molte liste reagiscono allo svuotamento ripristinando la posizione.

Diagnostica separatamente:

- mount count del widget e degli item esistenti;
- numero e key degli elementi visibili durante il pending;
- valore query prima e dopo il cambio key;
- comportamento con la nuova request intenzionalmente sospesa.

Il test minimo deve verificare `[A] visibile -> richiesta pending con [A] ancora visibile -> risposta [A, B]`, con `A` montato una sola volta e il solo `B` aggiunto. Se il runtime non trattiene i dati precedenti, usa il fallback di snapshot descritto in [ecosistema](ecosystem.md#transizioni-di-query-e-paginazione), senza trasferire allo snapshot loading, errori o refetch.

## Pattern di migrazione

Per migrare una pagina legacy senza introdurre remount o doppie sorgenti dati:

1. estrai ogni widget stateful in un componente nominato a livello modulo;
2. assegna un `PAGE_ID` stabile e key semantiche ai content item;
3. sposta in `Variables` soltanto lo stato condiviso tra più content item;
4. inietta route, sessione e altre dipendenze esterne dal componente che renderizza `PageGenerator`;
5. fai leggere query e variables tramite `FunctionProps`; usa `usePageValues` solo per il caso eccezionale documentato in [Pattern sicuri](#elemento-jsx-con-usepagevalues);
6. elimina wrapper e sincronizzatori rimasti vuoti solo dopo aver aggiornato import, barrel e route;
7. verifica con un test che una normale interazione aggiorni i dati senza rimontare il widget stateful.

## Diagnosi

Un `useEffect(..., [])` misura mount/unmount, non re-render. Aggiungi temporaneamente una sonda, esercita filtri/ricerca/apertura condizionale, confronta i mount e rimuovi la sonda.

```tsx
let mounts = 0;

function TableProbe() {
  useEffect(() => {
    mounts += 1;
  }, []);
  return <input aria-label="search" />;
}
```

In Strict Mode di sviluppo considera i controlli lifecycle extra; confronta lo stesso scenario prima e dopo l'interazione. Per indagini più grandi usa React Profiler o React DevTools.
