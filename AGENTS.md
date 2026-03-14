# AGENTS.md

## Objetivo del repositorio

`no-dep-ds` es un design system ESM-only basado en Web Components, sin dependencias runtime, con soporte para `shadow` y `light` DOM.

Antes de cambiar codigo, entiende que capa estas tocando:

- `src/foundation/`: primitivas base del sistema (`NDSBaseElement`, decorators, registry, tokens, themes).
- `src/components/<name>/`: componentes publicos.
- `src/utils/`: helpers de DOM, atributos y resolucion de valores.
- `src/generated/`: artefactos generados desde `src/components/*/styles.css`.
- `dist/`: salida de build consumida por tests y por el paquete publicado.

## Reglas de interaccion con el codigo

1. Haz cambios minimos y localizados. No reestructures el proyecto si el problema se resuelve con un ajuste puntual.
2. No agregues dependencias runtime. Este repo protege explicitamente la regla de "cero dependencias runtime".
3. No edites manualmente `src/generated/**` ni `dist/**` salvo que la tarea sea precisamente cambiar el proceso de generacion o build.
4. Si cambias la API publica de un componente, revisa tambien `src/index.ts`, los `exports` de `package.json`, la documentacion y las pruebas afectadas.
5. Manten compatibilidad con ambos modos de render: `shadow` y `light`.

## Fuente de verdad

- La clase y comportamiento del componente viven en `src/components/<name>/component.ts`.
- Los estilos fuente viven en `src/components/<name>/styles.css`.
- El entrypoint publico del componente vive en `src/components/<name>/index.ts`.
- La guia canonica de authoring esta en `docs/authoring-components.md`.

Si hay discrepancias entre `src/generated/*` y `src/components/*/styles.css`, la fuente de verdad es `src/components/*/styles.css`.

## Como modificar componentes

- Usa decoradores existentes: `@component`, `@attr.*`, `@listen`.
- Emite eventos publicos con `this.emit('nds-*', detail?)`.
- Escapa cualquier texto interpolado en templates con `escapeHtml` o `this.escapeText(...)`.
- Cuando el componente refleje estado HTML, prioriza atributos decorados frente a logica manual.
- Si un cambio afecta listeners o rerenders, valida que no se dupliquen handlers tras `attributeChangedCallback`.

## Como crear componentes nuevos

No crees componentes a mano si no hace falta. Usa primero:

```bash
npm run scaffold:component -- <name>
```

Ese script crea la carpeta del componente y actualiza:

- `src/index.ts`
- `package.json` (`exports`)

Despues ajusta el scaffold generado y ejecuta build.

## Estilos y artefactos generados

- `scripts/generate-component-styles.mjs` transforma cada `styles.css` a:
  - `src/generated/components/*/styles.generated.ts`
  - `src/generated/component-styles.generated.ts`
- `src/styles.ts` compone el CSS global publicado.

Si tocas estilos fuente o incorporas un componente nuevo, ejecuta:

```bash
npm run build
```

## Foundation y utilidades

Ten especial cuidado al cambiar estas piezas:

- `src/foundation/base-element.ts`: controla render, `shadow/light` DOM y manejo de slots.
- `src/foundation/component.ts`: listeners declarativos, `emit`, configuracion por DOM mode.
- `src/foundation/decorators.ts`: metadata de decoradores, `observedAttributes` y conexion con estilos generados.
- `src/foundation/registry.ts`: registro idempotente en `customElements`.

Un cambio aqui puede romper muchos componentes a la vez. Si tocas foundation, valida explicitamente:

- render en `shadow`
- render en `light`
- reflexion de atributos
- re-render sin listeners duplicados
- definicion de custom elements sin redefiniciones

## Validacion esperada

Para cualquier cambio relevante, intenta ejecutar:

```bash
npm run build
npm test
```

Notas:

- Los tests importan desde `dist/**`, asi que `build` es requisito real antes de confiar en `test`.
- Si solo has cambiado documentacion, no hace falta regenerar `dist`, pero indicalo en tu cierre.

## Que evitar

- No cambies nombres de tags publicos como `nds-button` sin una peticion explicita.
- No cambies nombres de eventos publicos (`nds-click`, `nds-input`, `nds-change`, etc.) sin revisar compatibilidad.
- No dupliques patrones ya resueltos en `foundation`; reutiliza helpers existentes.
- No metas logica de generacion en tiempo de ejecucion si puede resolverse en build.

## Criterio para documentacion

Actualiza `docs/authoring-components.md` o `README.md` cuando cambies:

- el patron de authoring
- decoradores disponibles
- convenciones de eventos
- flujo de scaffold/build
- superficie publica del paquete

## Resumen operativo

Cuando actues sobre este repo, piensa en este orden:

1. Identifica si el cambio pertenece a `component`, `foundation`, `utils`, `scripts` o `docs`.
2. Modifica la fuente de verdad, no el artefacto generado.
3. Regenera build si el cambio afecta codigo publicado o estilos generados.
4. Valida con tests si el cambio afecta comportamiento.
5. Manten intacta la filosofia del repo: Web Components, ESM-only, cero dependencias runtime.
