export const shadowStyles = `:host {
  display: block;
  font-family: var(--nds-typography-font-family-sans);
}

:host([hidden]) {
  display: none;
}

.nds-select__root {
  display: grid;
  gap: var(--nds-spacing-2);
}

.nds-select__label {
  color: var(--nds-color-text);
  font-size: var(--nds-typography-font-size-sm);
  font-weight: var(--nds-typography-font-weight-medium);
}

.nds-select__control {
  min-height: 2.75rem;
  padding-inline: var(--nds-spacing-4);
  border: 1px solid var(--nds-component-input-border);
  border-radius: var(--nds-radius-md);
  background: var(--nds-component-input-background);
  color: var(--nds-color-text);
  font: inherit;
  font-size: var(--nds-typography-font-size-md);
  box-shadow: var(--nds-shadows-sm);
}

.nds-select__control:focus {
  outline: none;
  border-color: var(--nds-color-accent);
  box-shadow: 0 0 0 4px var(--nds-color-focus);
}

:host([disabled]) .nds-select__control,
.nds-select__control:disabled {
  opacity: 0.56;
  cursor: not-allowed;
}`;
export const lightStyles = `nds-select {
display: block;
  font-family: var(--nds-typography-font-family-sans);
}

nds-select[hidden] {
display: none;
}

nds-select .nds-select__root {
display: grid;
  gap: var(--nds-spacing-2);
}

nds-select .nds-select__label {
color: var(--nds-color-text);
  font-size: var(--nds-typography-font-size-sm);
  font-weight: var(--nds-typography-font-weight-medium);
}

nds-select .nds-select__control {
min-height: 2.75rem;
  padding-inline: var(--nds-spacing-4);
  border: 1px solid var(--nds-component-input-border);
  border-radius: var(--nds-radius-md);
  background: var(--nds-component-input-background);
  color: var(--nds-color-text);
  font: inherit;
  font-size: var(--nds-typography-font-size-md);
  box-shadow: var(--nds-shadows-sm);
}

nds-select .nds-select__control:focus {
outline: none;
  border-color: var(--nds-color-accent);
  box-shadow: 0 0 0 4px var(--nds-color-focus);
}

nds-select[disabled] .nds-select__control,
nds-select .nds-select__control:disabled {
opacity: 0.56;
  cursor: not-allowed;
}`;
