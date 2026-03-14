# Autoria de componentes

La autoria ahora sigue un patron orientado a `component.ts` + `template.html` + `styles.css`, con sintaxis de template parecida a Angular y compilacion en build.

## Convencion de carpetas

Cada componente vive en `src/components/<nombre>/` con esta estructura:

- `component.ts`: clase host (`NDS*Element`), props, estado, watchers y handlers.
- `template.html`: markup fuente con bindings Angular-like.
- `styles.css`: fuente unica de estilos.
- `index.ts`: entrypoint publico (`defineX`, export de `NDS*Element`).

Referencia canonica: `src/components/input`.

## Decoradores disponibles

```ts
@component({
  tagName: 'nds-input',
  defaultDomMode: 'shadow',
  stylePath: './styles.css',
  templatePath: './template.html'
})
export class NDSInputElement extends NDSComponentElement {
  @prop({ reflect: true }) accessor label = '';
  @prop({ reflect: true }) accessor value = '';
  @prop({ reflect: true, type: Boolean }) accessor disabled = false;

  protected handleSyncValue(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;
    this.value = target.value;
    this.emit('nds-input', { value: target.value });
  }
}
```

- `@component(...)` registra metadata de tag, DOM mode por defecto, hoja de estilos y template fuente.
- `@prop(...)` define API publica reactiva; puede reflejar a atributo y validar enums via `values`.
- `@state()` define estado interno reactivo no reflejado al DOM.
- `@watch('prop')` reacciona a cambios de una prop o state con firma `(next, prev)`.

## Sintaxis de `template.html`

Soportado actualmente:

- `{{ expr }}` para texto escapado.
- `[prop]="expr"` para property binding.
- `[attr.name]="expr"` para atributos.
- `[class.name]="expr"` para clases condicionales.
- `[style.name]="expr"` para estilos inline puntuales.
- `(event)="expr"` para eventos.
- `ref="name"` para exponer referencias en `this.refs.name`.
- `*if="expr"` para render condicional.
- `*for="item in items"`, `*for="item, index in items"` y `*for="item in items; trackBy: expr"` para listas.
- `[innerHTML]="expr"` para inyectar HTML confiable de forma explicita.

Ejemplo:

```html
<label class="nds-input__field">
  <span class="nds-input__label">{{ label || 'Field' }}</span>
  <input
    ref="control"
    class="nds-input__control"
    [value]="value"
    [disabled]="disabled"
    (input)="handleSyncValue($event)"
  />
</label>
```

Notas importantes:

- `{{ }}` siempre escapa texto.
- `[innerHTML]` no escapa; usalo solo con HTML confiable o pre-sanitizado.
- `trackBy` hoy expone claves estables en `data-nds-key` para cada item repetido.

## Render y artefactos generados

- `template.html` se compila en build a `src/generated/component-templates.generated.ts`.
- `styles.css` se transforma en build a `src/generated/components/*/styles.generated.ts`.
- `src/generated/component-styles.generated.ts` agrega los estilos `shadow` y `light`.
- `src/styles.ts` compone `dist/styles.css` desde el manifiesto generado.
- El componente author escribe un solo template; `foundation` resuelve `shadow` y `light`.

## Custom events

- Usa `this.emit('nds-*', detail?)` para emitir eventos publicos desde el host.
- Los defaults son `bubbles: true` y `composed: true`.
- Convencion actual para interactivos:
  - `nds-button` emite `nds-click`
  - `nds-input` emite `nds-input` y `nds-change`

## Crear un componente nuevo

1. Ejecuta `npm run scaffold:component -- <name>`.
2. Ajusta `src/components/<name>/component.ts`.
3. Edita `src/components/<name>/template.html`.
4. Edita `src/components/<name>/styles.css`.
5. Revisa `src/components/<name>/index.ts`.
6. El scaffold actualiza automaticamente:
   - `src/index.ts`
   - `package.json` (`exports`)
7. Ejecuta `npm run build` para regenerar `src/generated/*` y `dist/*`.

## Registro de componentes

- Usa `defineComponent(NDSXElement, options)` en `index.ts`.
- `defineComponent` respeta `definition.tagName` y `definition.defaultDomMode`.
- El override de modo sigue siendo `defineX({ dom })`.
- La primera definicion registrada sigue ganando.
