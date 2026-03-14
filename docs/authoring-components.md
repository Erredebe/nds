# Autoria de componentes

Esta guia define el patron actual basado en decoradores y archivos `styles.css`.

## Convencion de carpetas

Cada componente vive en `src/components/<nombre>/` con esta estructura:

- `component.ts`: clase host (`NDS*Element`), atributos decorados, template y listeners.
- `styles.css`: fuente unica de estilos.
- `index.ts`: entrypoint publico (`defineX`, export de `NDS*Element`).

Referencia canonica: `src/components/button`.

## Decoradores disponibles

```ts
@component({
  tagName: 'nds-button',
  defaultDomMode: 'shadow',
  stylePath: './styles.css'
})
export class NDSButtonElement extends NDSComponentElement {
  @attr.boolean() accessor disabled = false;
  @attr.string() accessor label = '';
  @attr.enum(['button', 'submit', 'reset'] as const) accessor type = 'button';

  protected override renderTemplate(mode: DomMode): string {
    return mode === 'shadow' ? '<button><slot></slot></button>' : '<button data-nds-slot-target="default"></button>';
  }

  @listen('click', { selector: '.nds-button__control' })
  protected handleClick(): void {
    this.emit('nds-click');
  }
}
```

- `@component(...)` registra metadata de tag, DOM mode por defecto y hoja de estilos.
- `@attr.string()`, `@attr.boolean()` y `@attr.enum(...)` reflejan atributos HTML y alimentan `observedAttributes`.
- `@listen(...)` rebindea listeners despues de cada render, sin duplicarlos.

## Render y estilos

- El markup vive en `protected renderTemplate(mode)`.
- En `shadow`, el template se inserta en `shadowRoot`.
- En `light`, el slot por defecto se reemplaza con `data-nds-slot-target="default"`.
- `styles.css` se transforma en build a `src/generated/components/*/styles.generated.ts`.
- `src/generated/component-styles.generated.ts` agrega los estilos `shadow` y `light`, y `src/styles.ts` compone `dist/styles.css` desde ese manifiesto.

## Custom events

- Usa `this.emit('nds-*', detail?)` para emitir eventos publicos desde el host.
- Los defaults son `bubbles: true` y `composed: true`, asi que se pueden escuchar desde fuera tanto en `shadow` como en `light`.
- Convencion actual para interactivos:
  - `nds-button` emite `nds-click`
  - `nds-input` emite `nds-input` y `nds-change`

## Crear un componente nuevo

1. Ejecuta `npm run scaffold:component -- <name>`.
2. Ajusta `src/components/<name>/component.ts`.
3. Edita `src/components/<name>/styles.css`.
4. Revisa `src/components/<name>/index.ts`.
5. El scaffold actualiza automaticamente:
   - `src/index.ts`
   - `package.json` (`exports`)
6. Ejecuta `npm run build` para regenerar `src/generated/*` y `dist/*`.

## Registro de componentes

- Usa `defineComponent(NDSXElement, options)` en `index.ts`.
- `defineComponent` sigue respetando `definition.tagName` y `definition.defaultDomMode`.
- El override de modo sigue siendo `defineX({ dom })`.
- La primera definicion registrada sigue ganando.
