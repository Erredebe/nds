# Contributing

## Local workflow

1. Install dependencies with `npm install`.
2. Run `npm run build` after source or style changes.
3. Run `npm test` for unit and integration coverage.
4. Run `npm run build:site` when changing demo or published assets.

## Pull request checklist

- Keep runtime dependencies empty.
- Edit source files under `src/`, never generated artifacts under `src/generated/` or `dist/`.
- Update docs when changing public API or authoring patterns.
- Add or update tests for behavior changes.
- Ensure `npm run release:check` passes before merging.

## Release checklist

- Update `CHANGELOG.md`.
- Confirm `package.json` version and exports.
- Run `npm run release:check`.
