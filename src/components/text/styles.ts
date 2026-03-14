export const textShadowStyles = `
:host {
  display: block;
  color: var(--nds-color-text);
  font-family: var(--nds-typography-font-family-sans);
}

:host([hidden]) {
  display: none;
}

.nds-text__content {
  margin: 0;
  color: inherit;
  font-size: var(--nds-typography-font-size-md);
  line-height: var(--nds-typography-line-height-normal);
}

:host([variant="muted"]) .nds-text__content {
  color: var(--nds-color-text-muted);
}

:host([variant="label"]) .nds-text__content {
  font-size: var(--nds-typography-font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

:host([variant="caption"]) .nds-text__content {
  font-size: var(--nds-typography-font-size-xs);
  color: var(--nds-color-text-muted);
}

:host([weight="medium"]) .nds-text__content {
  font-weight: var(--nds-typography-font-weight-medium);
}

:host([weight="semibold"]) .nds-text__content {
  font-weight: var(--nds-typography-font-weight-semibold);
}

:host([weight="bold"]) .nds-text__content {
  font-weight: var(--nds-typography-font-weight-bold);
}

:host([align="center"]) .nds-text__content {
  text-align: center;
}

:host([align="right"]) .nds-text__content {
  text-align: right;
}
`.trim();

export const textLightStyles = `
nds-text {
  display: block;
  color: var(--nds-color-text);
  font-family: var(--nds-typography-font-family-sans);
}

nds-text[hidden] {
  display: none;
}

nds-text .nds-text__content {
  margin: 0;
  color: inherit;
  font-size: var(--nds-typography-font-size-md);
  line-height: var(--nds-typography-line-height-normal);
}

nds-text[variant="muted"] .nds-text__content {
  color: var(--nds-color-text-muted);
}

nds-text[variant="label"] .nds-text__content {
  font-size: var(--nds-typography-font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

nds-text[variant="caption"] .nds-text__content {
  font-size: var(--nds-typography-font-size-xs);
  color: var(--nds-color-text-muted);
}

nds-text[weight="medium"] .nds-text__content {
  font-weight: var(--nds-typography-font-weight-medium);
}

nds-text[weight="semibold"] .nds-text__content {
  font-weight: var(--nds-typography-font-weight-semibold);
}

nds-text[weight="bold"] .nds-text__content {
  font-weight: var(--nds-typography-font-weight-bold);
}

nds-text[align="center"] .nds-text__content {
  text-align: center;
}

nds-text[align="right"] .nds-text__content {
  text-align: right;
}
`.trim();
