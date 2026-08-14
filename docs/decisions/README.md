# Decisiones de arquitectura

Cada archivo registra una decisión que costó discutir: por qué se tomó, qué se
descartó y qué se paga por ella. Sirven para no volver a discutir lo mismo, y
sobre todo para que quien llegue después no deshaga algo sin saber qué sostenía.

## Registro

| ADR                                            | Tema         | Decisión                                                        |
| ---------------------------------------------- | ------------ | --------------------------------------------------------------- |
| [001](ADR-001-fsd-with-next-app-router.md)     | Arquitectura | `src/app` es la capa de rutas; no hay capas `app` ni `pages`    |
| [002](ADR-002-money-as-integer-minor-units.md) | Dominio      | El dinero se guarda como entero en centavos, nunca como decimal |
| [003](ADR-003-double-entry-ledger.md)          | Dominio      | Un movimiento son asientos que suman cero, con el tipo deducido |
| [004](ADR-004-debts-as-liability-accounts.md)  | Dominio      | Una deuda es una cuenta de pasivo, no una entidad aparte        |

Las tres de dominio construyen una sobre otra y conviene leerlas en ese orden: el
dinero es entero, los movimientos son asientos sobre ese dinero, y una deuda es
una cuenta dentro de esos asientos.

## Cómo agregar una

Copiar [`_template/ADR-template.md`](_template/ADR-template.md) y numerar con el
siguiente número libre.

**El número no se reordena ni se reutiliza.** Estas cuatro se escribieron todas en
retrospectiva y de una sola vez, así que se numeraron en el orden en que se
tomaron las decisiones — FSD es la primera porque la estructura del repositorio se
eligió en el commit inicial, siete meses antes que el resto. Esa ventana ya se
cerró: de aquí en adelante el número es el orden en que se **escribe** el
registro, y la fecha del encabezado es cuándo se **tomó** la decisión. Cuando las
dos no coincidan, manda la fecha.

Una decisión aceptada tampoco se edita. Si se reemplaza, se escribe una nueva y la
vieja pasa a `superseded by ADR-00X` — sigue siendo relevante saber que **fue** la
decisión, aunque ya no lo sea.

Vale la pena escribir una cuando la decisión afecta la estructura, una
característica no funcional, las dependencias entre módulos, una interfaz o la
plataforma. Si no toca ninguna de esas, probablemente sea una nota de código y no
una ADR.
