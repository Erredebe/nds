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

## `nds-field`

- Atributos: `description`, `error`, `invalid`, `label`, `required`
- Eventos: ninguno
- Slots: default
- Parts: `root`, `label`, `control`, `description`, `error`

## `nds-textarea`

- Atributos: `aria-describedby`, `aria-errormessage`, `aria-label`, `aria-labelledby`, `disabled`, `invalid`, `label`, `name`, `placeholder`, `readonly`, `required`, `rows`, `value`
- Eventos: `nds-input`, `nds-change`
- Slots: ninguno
- Parts: `label`, `textarea`

## `nds-select`

- Atributos: `aria-describedby`, `aria-errormessage`, `aria-label`, `aria-labelledby`, `disabled`, `invalid`, `label`, `name`, `options`, `placeholder`, `required`, `value`
- Eventos: `nds-input`, `nds-change`
- Slots: ninguno
- Parts: `label`, `select`

## `nds-checkbox`

- Atributos: `aria-describedby`, `aria-label`, `aria-labelledby`, `checked`, `description`, `disabled`, `invalid`, `label`, `name`, `required`, `value`
- Eventos: `nds-input`, `nds-change`
- Slots: ninguno
- Parts: `root`, `input`, `label`, `description`

## `nds-radio-group`

- Atributos: `aria-describedby`, `aria-errormessage`, `disabled`, `invalid`, `label`, `name`, `options`, `required`, `value`
- Eventos: `nds-change`
- Slots: ninguno
- Parts: `root`, `legend`

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

## `nds-badge`

- Atributos: `emphasis`, `text`, `tone`
- Eventos: ninguno
- Slots: default
- Parts: `root`

## `nds-dialog`

- Atributos: `aria-label`, `close-label`, `description`, `dismissible`, `open`, `title`
- Eventos: `nds-open`, `nds-close`, `nds-cancel`
- Slots: default
- Parts: `root`, `title`, `description`, `dismiss`, `body`

## Notas

- Todos los componentes soportan `shadow` y `light` DOM via `defineX({ dom })` o `defineAllComponents({ ... })`.
- Cualquier `[innerHTML]` se sanitiza antes de renderizar; el runtime conserva solo un subconjunto seguro de tags y atributos.
- `nds-alert` usa `message` para texto plano y slot content para contenido enriquecido authored por la app.
- Los controles de formulario nuevos priorizan elementos nativos (`textarea`, `select`, `input[type="checkbox"]`, radios con `fieldset`/`legend`) para alinearse con WAI-ARIA/APG y con la documentacion del repo.
