# Referencia de componentes V1

## `nds-button`

- Atributos: `aria-describedby`, `aria-label`, `aria-labelledby`, `disabled`, `label`, `name`, `size`, `type`, `value`, `variant`
- Eventos: `nds-click`
- Slots: default
- Parts: `control`, `label`

## `nds-input`

- Atributos: `autocomplete`, `aria-describedby`, `aria-errormessage`, `aria-label`, `aria-labelledby`, `disabled`, `invalid`, `label`, `name`, `placeholder`, `readonly`, `required`, `type`, `value`
- Eventos: `nds-input`, `nds-change`
- Slots: ninguno
- Parts: `label`, `input`

## `nds-text`

- Atributos: `align`, `tag`, `text`, `variant`, `weight`
- Eventos: ninguno
- Slots: default
- Parts: `text`

## `nds-heading`

- Atributos: `align`, `level`, `text`
- Eventos: ninguno
- Slots: default
- Parts: `heading`

## `nds-box`

- Atributos: `padding`, `radius`, `surface`
- Eventos: ninguno
- Slots: default
- Parts: `container`, `content`

## `nds-stack`

- Atributos: `align`, `direction`, `gap`, `justify`
- Eventos: ninguno
- Slots: default
- Parts: `container`, `content`

## `nds-card`

- Atributos: `elevated`, `padding`, `tag`
- Eventos: ninguno
- Slots: default
- Parts: `surface`

## `nds-alert`

- Atributos: `dismissible`, `features`, `message`, `title`, `tone`
- Eventos: `nds-dismiss`
- Slots: default
- Parts: `root`, `title`, `dismiss`

## Notas

- Todos los componentes soportan `shadow` y `light` DOM via `defineX({ dom })` o `defineAllComponents({ ... })`.
- Cualquier `[innerHTML]` se sanitiza antes de renderizar; el runtime conserva solo un subconjunto seguro de tags y atributos.
- `nds-alert` usa `message` para texto plano y slot content para contenido enriquecido authored por la app.
