export const headingShadowStyles = `
:host {
  display: block;
  color: var(--nds-color-text);
  font-family: var(--nds-typography-font-family-sans);
}

:host([hidden]) {
  display: none;
}

.nds-heading__content {
  margin: 0;
  color: inherit;
  line-height: var(--nds-typography-line-height-tight);
  font-weight: var(--nds-typography-font-weight-bold);
}

:host([level="1"]) .nds-heading__content {
  font-size: var(--nds-typography-font-size-4xl);
}

:host([level="2"]) .nds-heading__content {
  font-size: var(--nds-typography-font-size-3xl);
}

:host([level="3"]) .nds-heading__content {
  font-size: var(--nds-typography-font-size-2xl);
}

:host([level="4"]) .nds-heading__content {
  font-size: var(--nds-typography-font-size-xl);
}

:host([level="5"]) .nds-heading__content,
:host([level="6"]) .nds-heading__content {
  font-size: var(--nds-typography-font-size-lg);
}

:host([align="center"]) .nds-heading__content {
  text-align: center;
}

:host([align="right"]) .nds-heading__content {
  text-align: right;
}
`.trim();

export const headingLightStyles = `
nds-heading {
  display: block;
  color: var(--nds-color-text);
  font-family: var(--nds-typography-font-family-sans);
}

nds-heading[hidden] {
  display: none;
}

nds-heading .nds-heading__content {
  margin: 0;
  color: inherit;
  line-height: var(--nds-typography-line-height-tight);
  font-weight: var(--nds-typography-font-weight-bold);
}

nds-heading[level="1"] .nds-heading__content {
  font-size: var(--nds-typography-font-size-4xl);
}

nds-heading[level="2"] .nds-heading__content {
  font-size: var(--nds-typography-font-size-3xl);
}

nds-heading[level="3"] .nds-heading__content {
  font-size: var(--nds-typography-font-size-2xl);
}

nds-heading[level="4"] .nds-heading__content {
  font-size: var(--nds-typography-font-size-xl);
}

nds-heading[level="5"] .nds-heading__content,
nds-heading[level="6"] .nds-heading__content {
  font-size: var(--nds-typography-font-size-lg);
}

nds-heading[align="center"] .nds-heading__content {
  text-align: center;
}

nds-heading[align="right"] .nds-heading__content {
  text-align: right;
}
`.trim();
