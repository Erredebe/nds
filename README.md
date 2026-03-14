# no-dep-ds

Guia de autoria de componentes:

- [docs/authoring-components.md](./docs/authoring-components.md)

El authoring actual usa decoradores (`@component`, `@attr`, `@listen`), `styles.css` por componente y custom events `nds-*` emitidos desde el host.

## Demo y despliegue

- `npm run build` genera el paquete publicable en `dist/`.
- `npm run build:site` genera `site-dist/` con la demo en la raiz y el build accesible en `site-dist/dist/`.
- `npm run serve` levanta un servidor estatico del repo; tras `npm run build:site`, la demo queda disponible en `http://localhost:4173/site-dist/`.
- Netlify queda configurado con [netlify.toml](./netlify.toml) para ejecutar `npm run build:site` y publicar `site-dist`.
