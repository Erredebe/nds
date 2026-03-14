# Autoria de componentes

Esta guia define el patron interno `component/template/styles` para crear componentes en `no-dep-ds`.

## Convencion de carpetas

Cada componente vive en `src/components/<nombre>/` con esta estructura:

- `component.ts`: clase host (`NDS*Element`) y metadata estatica `definition`.
- `template.ts`: funcion unica `renderXTemplate(element, mode)` con el markup.
- `styles.ts`: `*ShadowStyles` y `*LightStyles`.
- `index.ts`: entrypoint publico (`defineX`, export de `NDS*Element`).

Referencia canonica: `src/components/button`.

## Shape de `NDSComponentDefinition`

```ts
interface NDSComponentDefinition<T extends HTMLElement = NDSComponentElement> {
  tagName: string;
  observedAttributes: string[];
  shadowStyles: string;
  defaultDomMode: DomMode;
  renderTemplate: (element: T, mode: DomMode) => string;
  getDefaultSlotFallbackText?: (element: T) => string;
  afterRender?: (element: T) => void;
}
```

## Resolucion `shadow` y `light`

- `NDSComponentElement` delega en `definition.renderTemplate(element, mode)`.
- En modo `shadow`, el template se inserta en `shadowRoot`.
- En modo `light`, el template se inserta en el host y el slot por defecto se gestiona con `data-nds-slot-target="default"`.
- `getDefaultSlotFallbackText` define el fallback cuando no hay contenido sloteado.
- `afterRender` se ejecuta tras cada `render()` para sincronizacion del host (estilos dinamicos, listeners, etc.).

## Crear un componente nuevo

1. Ejecuta `npm run scaffold:component -- <name>`.
2. Revisa `src/components/<name>/component.ts`:
   - ajusta `definition.tagName`, `observedAttributes`, `defaultDomMode`.
   - anade logica host especifica (getters/setters, handlers, overrides).
3. Implementa el markup en `template.ts` dentro de `renderXTemplate`.
4. Ajusta estilos en `styles.ts`.
5. Verifica `index.ts` (debe exponer `defineX` y `NDS*Element`).
6. Actualiza manualmente:
   - `src/index.ts`
   - `src/styles.ts`
   - `package.json` (`exports` si aplica)
   - tests y ejemplos

## Registro de componentes

- Usa `defineComponent(NDSXElement, options)` en `index.ts`.
- `defineComponent` toma `definition.tagName` y `definition.defaultDomMode`.
- El override de modo sigue siendo `defineX({ dom })`.
- La semantica se mantiene: primera definicion registrada gana.
