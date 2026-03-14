export const shadowStyles = `:host {
  display: block;
  font-family: var(--nds-typography-font-family-sans);
}

:host([hidden]) {
  display: none;
}

.nds-card__surface {
  padding: var(--nds-card-padding, var(--nds-spacing-5));
  border: 1px solid var(--nds-component-card-border);
  border-radius: var(--nds-radius-lg);
  background: var(--nds-component-card-background);
  box-shadow: var(--nds-card-shadow, var(--nds-shadows-sm));
}`;
export const lightStyles = `nds-card {
display: block;
  font-family: var(--nds-typography-font-family-sans);
}

nds-card[hidden] {
display: none;
}

nds-card .nds-card__surface {
padding: var(--nds-card-padding, var(--nds-spacing-5));
  border: 1px solid var(--nds-component-card-border);
  border-radius: var(--nds-radius-lg);
  background: var(--nds-component-card-background);
  box-shadow: var(--nds-card-shadow, var(--nds-shadows-sm));
}`;
