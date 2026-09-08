# Configurazioni esterne, refactor e ownership

Leggi questo riferimento quando una pagina dipende da auth, route, locale,
breakpoint o altri hook esterni, oppure quando devi migrare pagine legacy verso
feature e subfeature PageGenerator.

## Indice

- [Input esterni prima della query](#input-esterni-prima-della-query)
- [Form e defaultValues dinamici](#form-e-defaultvalues-dinamici)
- [Effetti interni reali](#effetti-interni-reali)
- [Ownership di feature e subfeature](#ownership-di-feature-e-subfeature)
- [Migrazione e pulizia legacy](#migrazione-e-pulizia-legacy)
- [Verifiche di regressione](#verifiche-di-regressione)

## Input esterni prima della query

`PageGenerator` configura variables, form e query prima di montare i content.
La stessa regola vale per wrapper applicativi come `PageGeneratorWithHeader`:
gli input vanno passati al wrapper, che deve inoltrarli al generatore. Un
content senza UI che legge auth o route e li copia nello state con `useEffect`
arriva quindi troppo tardi: la prima query può risultare disabilitata, usare
endpoint vuoti o non partire affatto.

Anti-pattern:

```tsx
function OrdersSessionSync({
  get,
  set,
}: FunctionProps<Form, Queries, Variables>) {
  const authId = useAuthValue()?.id ?? "";
  const { customerId = "" } = useRouteParams();

  useEffect(() => {
    set("state")("authId", authId);
    set("state")("customerId", customerId);
  }, [authId, customerId, set]);

  return null;
}

const contents = [
  {
    type: "custom",
    key: "orders-session-sync",
    renderInHeader: true,
    component: OrdersSessionSync,
  },
];
```

Pattern corretto:

```tsx
const pageProps = {
  id: ORDERS_PAGE_ID,
  contents: ordersContents,
  queries: ordersQueries,
} satisfies PageProps<OrderFormValues, OrdersQueries, OrderVariables>;

export function OrdersPage() {
  const authId = useAuthValue()?.id ?? "";
  const { customerId = "" } = useRouteParams();
  const variables = useMemo(
    () => ({ ...orderVariables, authId, customerId }),
    [authId, customerId],
  );

  return <PageGenerator {...pageProps} variables={variables} />;
}
```

Applica lo stesso criterio a lingua, timezone, feature flag, breakpoint,
entitlement, categorie derivate e fallback serializzati nella route. Mantieni
query key ed endpoint in `queries.ts`; una factory `queryConfig: ({ get }) =>`
può leggerli dalle variables già disponibili al primo render.

Non creare un hook parallelo per recuperare `get` e `set` soltanto per
aggirare questa composizione. I content funzione ricevono già `FunctionProps`.
Non affiancare inoltre `useApi`, React Query o fetch manuali per gli stessi dati
gestiti dalla tupla `queries`: produrresti cache, loading ed error state doppi.

La propagazione delle modifiche alle props dopo il mount dipende dalla versione
effettiva di PageGenerator o dal wrapper usato dal consumer. Verifica nei
sorgenti installati come vengono riconciliati `variables`, `queries` e form. Se
il runtime non implementa il contratto dinamico richiesto, correggi o aggiorna
quel runtime; non mascherare il problema con un content invisibile.

## Form e defaultValues dinamici

Se i valori iniziali dipendono dalla route o da un hook esterno, costruisci la
configurazione form nel componente pagina conservando nel modulo `form.ts` il
contratto e la base statica:

```tsx
const form = useMemo(
  () => ({
    ...orderForm,
    defaultValues: {
      ...orderFormDefaultValues,
      orderId: params.orderId ?? "",
      note: params.note ?? "",
    },
  }),
  [params.note, params.orderId],
);

return <PageGenerator {...pageProps} form={form} variables={variables} />;
```

Non montare un content nell'header per chiamare `set('form')` dopo il mount.
Usa invece `set('form')` nei content reali per interazioni successive
dell'utente o per comportamento intenzionalmente page-scoped.

## Effetti interni reali

Non ogni effetto è un sincronizzatore illegittimo. Un effetto che reagisce a
query o state interni per notificare, navigare o coordinare un comportamento
può restare, ma deve avere una responsabilità esplicita:

- preferisci integrarlo in un content visibile che già possiede quel caso d'uso;
- se deve essere separato, dagli un nome funzionale (`BlockedAccountHandler`,
  non `SessionSync`);
- non marcarlo `renderInHeader` o `renderInFooter` se non rende UI per lo slot;
- nei layout virtualizzati non lasciarlo diventare una riga vuota.

## Ownership di feature e subfeature

Raggruppa per capacità di dominio, non per tipo tecnico o percorso storico.
Una subfeature è appropriata quando possiede una pagina o un workflow
navigabile con query, variables e contenuti propri. Un componente condiviso
resta nel dominio che ne possiede la logica; spostalo in UI/core soltanto se è
presentazionale o infrastrutturale e non dipende da modelli, auth, query o
routing del dominio.

Segnali di ownership errata:

- directory generiche come `page`, `shared`, `components` o `queries` che
  raccolgono casi d'uso di domini diversi;
- una feature che importa file privati di una feature sorella;
- wrapper che si limitano a rinominare o riesportare una pagina;
- componenti definiti “UI” ma dipendenti da mutation, auth o route;
- stesso contratto query duplicato in più sottocartelle.

Mantieni autonoma una feature trasversale quando rappresenta davvero una
capacità distinta consumata da più aree. Non forzare ogni directory sotto il
dominio della route che la apre più spesso.

## Migrazione e pulizia legacy

Procedura sicura:

1. censisci route, import, barrel, test e file di configurazione;
2. identifica il dominio proprietario e le eventuali subfeature navigabili;
3. crea i nuovi contratti e sposta il comportamento senza cambiare identità
   della pagina o key dei widget stateful;
4. aggiorna le route e gli altri consumer verso il barrel pubblico corretto;
5. cerca globalmente ogni vecchio path, simbolo ed export;
6. esegui test e typecheck mirati;
7. elimina file, barrel e cartelle legacy soltanto quando non hanno consumer;
8. elimina anche moduli vuoti, wrapper pass-through, export duplicati e codice
   commentato non più utile.

Preserva le modifiche preesistenti del worktree. Non usare la presenza di un
file legacy come prova che sia ancora necessario: verifica i consumer reali.

## Verifiche di regressione

Per pagine dipendenti da auth o route, aggiungi almeno un test che costruisca
la configurazione iniziale e verifichi:

- `enabled` corretto già al primo render;
- endpoint e query key derivati dai parametri iniziali;
- assenza di un content sincronizzatore richiesto per far partire la query.

Per pagine dettaglio o navigazioni rapide, cattura una route identity stabile
(`routeKey`) quando parte la request e consenti a `onDataChanged` di aggiornare
lo state soltanto se l'identità corrente coincide. Una risposta della route A
non deve sovrascrivere la route B aperta nel frattempo.

Mantieni statici nell'array i content che devono apparire quando arrivano i
dati. Fai gestire `undefined` al componente e usa `hidden` come funzione
reattiva quando necessario; non costruire una schermata vuota perché
`contents` è stato calcolato prima della risposta.
