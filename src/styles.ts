import { createThemeCss, createTokenCss } from './foundation/css-vars.js';
import { generatedLightStyles } from './generated/component-styles.generated.js';

const globalBaseStyles = `
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  color: var(--nds-color-text);
  background: var(--nds-color-surface);
  font-family: var(--nds-typography-font-family-sans);
}

body {
  margin: 0;
  color: inherit;
  background: inherit;
  font-family: inherit;
}
`.trim();

export const createDesignSystemCss = (): string =>
  [createTokenCss(), createThemeCss(), globalBaseStyles, ...generatedLightStyles].join('\n\n');
