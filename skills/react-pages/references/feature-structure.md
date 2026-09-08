# Struttura della feature PageGenerator

Mantieni contratti e configurazioni statiche fuori da `page.tsx`. Il componente
pagina può derivare con hook soltanto gli input esterni necessari al render
corrente e iniettarli nelle props di PageGenerator. Se il repository usa
directory al posto dei file singoli, conserva la stessa separazione di
responsabilità.

## Indice

- [form.ts](#formts)
- [queries.ts](#queriests)
- [variables.ts](#variablests)
- [content.tsx](#contenttsx)
- [page.tsx](#pagetsx)
- [index.ts](#indexts)

```text
features/orders/
├── content.tsx
├── form.ts
├── queries.ts
├── variables.ts
├── page.tsx
└── index.ts
```

## form.ts

Dichiara prima l'interfaccia `FieldValues`, poi la costante form completa. Riutilizza la costante per `FormManager` e, soltanto se necessario, per `PageGenerator.form`.

```tsx
import type { FieldValues, FormManagerProps } from "@gaddario98/react-form";

export interface OrderFormValues extends FieldValues {
  orderId?: string;
  isDialogOpen: boolean;
  note: string;
}

export const orderForm = {
  defaultValues: {
    orderId: undefined,
    isDialogOpen: false,
    note: "",
  },
  data: [
    /* FormManagerConfig<OrderFormValues> */
  ],
  submit: [
    /* Submit<OrderFormValues> */
  ],
} satisfies FormManagerProps<OrderFormValues>;
```

Rendi il form con un componente nominato:

```tsx
function OrderFormContent() {
  return <FormManager {...orderForm} id="order-form" />;
}
```

Passa `form={orderForm}` a `PageGenerator` solo quando almeno una delle seguenti condizioni è vera:

- un altro content item deve leggere o impostare il form con `get('form', ...)` e `set('form')`;
- i field e submit devono essere distribuiti nel layout header/body/footer di `PageGenerator`;
- la configurazione form deve dipendere da query o variables tramite le factory `form.data`, `form.submit` o `form.hidden`.

Non usare `PageGenerator.form` per un dialog o una form autosufficiente che `FormManager` può possedere direttamente.

## queries.ts

Mantieni l'ordine: contratto tuple, endpoint, keys, configurazione `queries`. Non mescolare request, endpoint o query key in `page.tsx`.

```tsx
import type { PageProps } from "@gaddario98/react-pages";
import type { Endpoint, QueryDefinition } from "@gaddario98/react-queries";
import type { OrderFormValues } from "./form";
import type { OrderVariables } from "./variables";

export type OrdersQueries = [
  QueryDefinition<"orders", "query", void, Array<Order>>,
  QueryDefinition<"deleteOrder", "mutation", { id: string }, void>,
];

type EndpointPath = [keyof Endpoint, string];

export const ORDER_ENDPOINTS: {
  list: EndpointPath;
  remove: EndpointPath;
  detail: (id: string) => EndpointPath;
} = {
  list: ["api", "orders"],
  remove: ["api", "orders/:id"],
  detail: (id: string) => ["api", `orders/${id}`],
};

export const ORDER_KEYS = {
  all: ["orders"] as const,
  list: () => [...ORDER_KEYS.all, "list"].join("/"),
  detail: (id: string) => [...ORDER_KEYS.all, id].join("/"),
};

export const ordersQueries: NonNullable<
  PageProps<OrderFormValues, OrdersQueries, OrderVariables>["queries"]
> = [
  {
    type: "query",
    key: "orders",
    queryConfig: {
      endpoint: ORDER_ENDPOINTS.list,
      queryKey: [ORDER_KEYS.list()],
      enabled: true,
    },
  },
  {
    type: "mutation",
    key: "deleteOrder",
    mutationConfig: {
      endpoint: ORDER_ENDPOINTS.remove,
      method: "DELETE",
      queryKeyToInvalidate: [ORDER_KEYS.list()],
    },
  },
];
```

Usa endpoint come path tuple (`['api', 'orders']`) oppure factory che restituiscono la tuple. Tieni le keys separate dagli endpoint: una query key identifica cache e invalidation, non la URL. Conserva notification e invalidation nella `mutationConfig` corrispondente.

## variables.ts

Dichiara l'interfaccia delle sole variabili page-scoped e una costante iniziale completa. Estendi `Record<string, unknown>` per soddisfare il vincolo generico di `PageGenerator`.

```ts
export interface OrderVariables extends Record<string, unknown> {
  search: string;
  selectedCustomerIds: Array<string>;
  busyOrderId: string | null;
}

export const orderVariables: OrderVariables = {
  search: "",
  selectedCustomerIds: [],
  busyOrderId: null,
};
```

Mantieni qui soltanto stato condiviso da content item della pagina. Non inserire sorting, focus o altri dettagli posseduti dal widget.

## content.tsx

Definisci qui i componenti nominati che ricevono `FunctionProps` e la
configurazione `contents`. Mantieni la struttura dei content che reagiscono ai
dati query anche prima che i dati esistano; lascia che ogni componente gestisca
loading o `undefined`.

Non creare content invisibili per copiare auth, route, locale o altri hook
esterni nelle variables. Non usare `renderInHeader`/`renderInFooter` per
nascondere inizializzatori. Se la pagina è composta soltanto dal form integrato
o dall'header generato, ometti `content.tsx` invece di mantenere un array vuoto.

## page.tsx

Importa le costanti già costruite e passale senza ricostruirle inline quando
sono statiche:

```tsx
<PageGenerator<OrderFormValues, OrdersQueries, OrderVariables>
  id={PAGE_ID}
  queries={ordersQueries}
  variables={orderVariables}
  contents={contents}
/>
```

Aggiungi `form={orderForm}` soltanto quando rispetta una delle condizioni della sezione `form.ts`. Altrimenti monta `<FormManager {...orderForm} />` nel content component che possiede la form.

Quando auth, route, locale o breakpoint modificano la configurazione, leggili
nel componente pagina e sovrascrivi soltanto le proprietà derivate:

```tsx
export function OrdersPage() {
  const authId = useAuthValue()?.id ?? "";
  const { customerId = "" } = useRouteParams();
  const variables = useMemo(
    () => ({ ...orderVariables, authId, customerId }),
    [authId, customerId],
  );

  return (
    <PageGenerator<OrderFormValues, OrdersQueries, OrderVariables>
      {...orderPageProps}
      variables={variables}
    />
  );
}
```

Mantieni `orderPageProps` a livello modulo per `id`, `queries`, `contents`,
`viewSettings` e altre parti statiche. Non inserire endpoint o query key nel
componente pagina.

## index.ts

Esporta l'API pubblica consumata dalle route o da altri layer. All'interno
della stessa feature usa import relativi diretti per evitare cicli. Durante una
migrazione aggiorna prima i consumer, poi elimina barrel e path legacy.
