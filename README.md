# no-dep-ds

`no-dep-ds` es un design system ESM-only basado en Web Components, sin dependencias runtime, con soporte para `shadow` y `light` DOM.

## Estado

- Objetivo actual: V1 cerrada del design system con despliegue automatico en Netlify.
- Superficie publica actual: `button`, `input`, `field`, `textarea`, `select`, `checkbox`, `radio-group`, `text`, `heading`, `box`, `stack`, `card`, `badge`, `alert`, `dialog`.
- Contrato de build: el codigo fuente vive en `src/` y el artefacto publicable se genera en `dist/`.

## Instalacion

```bash
npm install no-dep-ds
```

## Uso rapido

Importa los componentes que quieras registrar y carga el CSS publicado:

```ts
import 'no-dep-ds/styles.css';
import { defineAllComponents, setTheme } from 'no-dep-ds';

defineAllComponents();
setTheme('light');
```

En apps con SSR, deja el registro de componentes del lado cliente. Los tokens y temas si pueden importarse de forma segura en servidor.

```ts
import { themes, tokens } from 'no-dep-ds';

console.log(tokens.spacing[4]);
console.log(themes.light.color.background.canvas);
```

Tambien puedes registrar componentes individuales:

```ts
import 'no-dep-ds/styles.css';
import { defineButton } from 'no-dep-ds/button';
import { defineInput } from 'no-dep-ds/input';
import { defineDialog } from 'no-dep-ds/dialog';

defineButton();
defineInput({ dom: 'shadow' });
defineDialog();
```

Ejemplo de markup:

```html
<nds-stack gap="4">
  <nds-heading level="2">Account access</nds-heading>
  <nds-text variant="muted">Use your work email to continue.</nds-text>
  <nds-field label="Email" description="We only use it for account access.">
    <nds-input type="email" name="email" required aria-label="Email"></nds-input>
  </nds-field>
  <nds-checkbox name="terms" label="Accept terms" required></nds-checkbox>
  <nds-button variant="solid">Continue</nds-button>
</nds-stack>
```

## API publica

### Entrypoint raiz

- `defineAllComponents(config?)`
- `tokens`
- `semanticTokens`
- `themes`
- `setTheme(theme, root?)`

### Subpath exports

- `no-dep-ds/button`
- `no-dep-ds/input`
- `no-dep-ds/text`
- `no-dep-ds/heading`
- `no-dep-ds/box`
- `no-dep-ds/stack`
- `no-dep-ds/card`
- `no-dep-ds/alert`
- `no-dep-ds/field`
- `no-dep-ds/textarea`
- `no-dep-ds/select`
- `no-dep-ds/checkbox`
- `no-dep-ds/radio-group`
- `no-dep-ds/badge`
- `no-dep-ds/dialog`
- `no-dep-ds/styles.css`

## Componentes V1

- `nds-button`: accion clickable con `variant`, `size`, `type`, `disabled` y evento `nds-click`.
- `nds-input`: input de formulario con `label`, `name`, `placeholder`, `required`, `readonly`, `autocomplete`, `invalid`, `value` y eventos `nds-input`/`nds-change`.
- `nds-text`: tipografia base con `variant`, `weight`, `align`, `tag` y contenido por slot o atributo `text`.
- `nds-heading`: encabezados semanticos `h1..h6` con `level`, `align` y contenido por slot o atributo `text`.
- `nds-box`: contenedor liviano con `surface`, `padding` y `radius`.
- `nds-stack`: layout flex con `direction`, `gap`, `align` y `justify`.
- `nds-card`: superficie agrupadora con `tag`, `padding` y `elevated`.
- `nds-field`: wrapper accesible para `label`, `description`, `error`, `required` e IDs ARIA del primer control slotted.
- `nds-textarea`: textarea de formulario con `label`, `rows`, `required`, `readonly`, `invalid`, `value` y eventos `nds-input`/`nds-change`.
- `nds-select`: select nativo con `label`, `options`, `placeholder`, `required`, `invalid`, `value` y eventos `nds-input`/`nds-change`.
- `nds-checkbox`: checkbox nativo con `label`, `description`, `checked`, `required` y eventos `nds-input`/`nds-change`.
- `nds-radio-group`: grupo de radios nativo con `label`, `options`, `name`, `required`, `invalid`, `value` y evento `nds-change`.
- `nds-badge`: etiqueta compacta para estados con `tone`, `emphasis` y contenido por slot o atributo `text`.
- `nds-alert`: feedback con `tone`, `title`, `message`, `features`, `dismissible` y evento `nds-dismiss`.
- `nds-dialog`: modal accesible sobre `<dialog>` con `title`, `description`, `open`, `dismissible` y eventos `nds-open`/`nds-close`/`nds-cancel`.

## Accesibilidad

- Los controles nuevos siguen HTML nativo primero y usan ARIA solo para nombre, descripcion o estado cuando hace falta.
- `nds-input`, `nds-textarea`, `nds-select`, `nds-checkbox` y `nds-radio-group` mantienen modo `light` por defecto para preservar semantica de formularios.
- `nds-dialog` usa `<dialog>` nativo con cierre por `Escape`, foco inicial del navegador y retorno de foco al trigger al cerrar.
- `nds-field` enlaza `description` y `error` al primer control slotted mediante `aria-describedby` y `aria-errormessage`.

## Theming

- `styles.css` publica tokens y temas listos para usar.
- `setTheme('light')` y `setTheme('dark')` escriben `data-nds-theme` sobre un root.
- Puedes leer `tokens`, `semanticTokens` y `themes` para integraciones o tooling.

```ts
import { setTheme, themes, tokens } from 'no-dep-ds';

setTheme('dark', document.documentElement);

console.log(tokens.spacing[4]);
console.log(themes.dark.color.background.canvas);
```

## Seguridad y limites actuales

- `{{ expr }}` siempre escapa texto.
- `[innerHTML]` sanea strings antes de renderizar y elimina markup/atributos inseguros.
- El runtime de templates ya no depende de `unsafe-eval`; las expresiones se interpretan dentro de un scope acotado al componente, locals y `$event`.
- `nds-input` mantiene `value` como propiedad reactiva, pero no lo refleja de vuelta al atributo host; para `type="password"` tampoco reexpone el valor en `nds-input`/`nds-change`.
- `nds-alert` usa `message` para texto simple y slot/default content para markup authored por la app.

## Compatibilidad

- Paquete ESM-only.
- Runtime de desarrollo y build: Node `>=20`.
- Navegadores objetivo: `Chrome`, `Edge`, `Firefox`, `Safari` macOS e iOS en sus ultimas 2 versiones estables.
- Registro de componentes (`defineAllComponents`, `defineButton`, etc.): solo cliente/navegador.
- Imports SSR-safe: `tokens`, `semanticTokens`, `themes` y `setTheme` forman parte de la API publica del root package; el registro de componentes sigue siendo solo cliente.
- El runtime de templates usa parser e interprete propios, sin depender de `unsafe-eval`.

## Desarrollo

- `npm run build`: genera estilos, templates, JS, tipos y CSS publicados.
- `npm test`: ejecuta Vitest sobre el paquete generado.
- `npm run build:site`: genera `site-dist/` con la demo y el paquete publicado.
- `npm run release:check`: corre el flujo completo de validacion de release.
- `npm run serve`: sirve el repo en local para revisar la demo.

## Documentacion

- Consumo V1: `README.md`
- Referencia de componentes: `docs/component-reference.md`
- Autoria de componentes: `docs/authoring-components.md`
- Contribucion: `CONTRIBUTING.md`
- Historial de cambios: `CHANGELOG.md`

## Demo y despliegue

- Demo desplegada: `https://nds1.netlify.app/`
- `npm run build:site` genera `site-dist/` con la demo en la raiz y el build accesible en `site-dist/dist/`.
- `npm run serve` levanta un servidor estatico del repo; tras `npm run build:site`, la demo queda disponible en `http://localhost:4173/site-dist/`.
- Netlify ejecuta `npm run build:site` y publica `site-dist`.
