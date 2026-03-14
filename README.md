# no-dep-ds

`no-dep-ds` es un design system ESM-only basado en Web Components, sin dependencias runtime, con soporte para `shadow` y `light` DOM.

## Estado

- Objetivo actual: V1 cerrada del design system con despliegue automatico en Netlify.
- Superficie publica actual: `button`, `input`, `text`, `heading`, `box`, `stack`, `card`, `alert`.
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

Tambien puedes registrar componentes individuales:

```ts
import 'no-dep-ds/styles.css';
import { defineButton } from 'no-dep-ds/button';
import { defineInput } from 'no-dep-ds/input';

defineButton();
defineInput({ dom: 'shadow' });
```

Ejemplo de markup:

```html
<nds-stack gap="4">
  <nds-heading level="2">Account access</nds-heading>
  <nds-text variant="muted">Use your work email to continue.</nds-text>
  <nds-input label="Email" type="email" required></nds-input>
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
- `no-dep-ds/styles.css`

## Componentes V1

- `nds-button`: accion clickable con `variant`, `size`, `type`, `disabled` y evento `nds-click`.
- `nds-input`: input de formulario con `label`, `name`, `placeholder`, `required`, `readonly`, `autocomplete`, `invalid`, `value` y eventos `nds-input`/`nds-change`.
- `nds-text`: tipografia base con `variant`, `weight`, `align`, `tag` y contenido por slot o atributo `text`.
- `nds-heading`: encabezados semanticos `h1..h6` con `level`, `align` y contenido por slot o atributo `text`.
- `nds-box`: contenedor liviano con `surface`, `padding` y `radius`.
- `nds-stack`: layout flex con `direction`, `gap`, `align` y `justify`.
- `nds-card`: superficie agrupadora con `tag`, `padding` y `elevated`.
- `nds-alert`: feedback con `tone`, `title`, `message`, `message-html`, `features`, `dismissible` y evento `nds-dismiss`.

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
- `[innerHTML]` existe solo para HTML confiable o previamente sanitizado.
- El compilador/runtime de templates esta pensado para templates del repo, no para plantillas arbitrarias de usuarios finales.

## Compatibilidad

- Paquete ESM-only.
- Runtime de desarrollo y build: Node `>=20`.
- Navegadores objetivo: entornos modernos con Custom Elements, Shadow DOM y ES modules.

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
