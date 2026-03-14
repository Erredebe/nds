import { boxLightStyles } from './components/box/styles.js';
import { buttonLightStyles } from './components/button/styles.js';
import { cardLightStyles } from './components/card/styles.js';
import { headingLightStyles } from './components/heading/styles.js';
import { inputLightStyles } from './components/input/styles.js';
import { stackLightStyles } from './components/stack/styles.js';
import { textLightStyles } from './components/text/styles.js';
import { createThemeCss, createTokenCss } from './foundation/css-vars.js';

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
  [
    createTokenCss(),
    createThemeCss(),
    globalBaseStyles,
    boxLightStyles,
    buttonLightStyles,
    cardLightStyles,
    headingLightStyles,
    inputLightStyles,
    stackLightStyles,
    textLightStyles
  ].join('\n\n');
