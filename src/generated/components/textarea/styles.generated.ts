export const shadowStyles = `:host {
  display: block;
  font-family: var(--nds-typography-font-family-sans);
}

:host([hidden]) {
  display: none;
}

.nds-textarea__root {
  display: grid;
  gap: var(--nds-spacing-2);
}

.nds-textarea__label {
  color: var(--nds-color-text);
  font-size: var(--nds-typography-font-size-sm);
  font-weight: var(--nds-typography-font-weight-medium);
}

.nds-textarea__control {
  min-height: 7rem;
  padding: var(--nds-spacing-3) var(--nds-spacing-4);
  border: 1px solid var(--nds-component-input-border);
  border-radius: var(--nds-radius-md);
  background: var(--nds-component-input-background);
  color: var(--nds-color-text);
  font: inherit;
  font-size: var(--nds-typography-font-size-md);
  line-height: var(--nds-typography-line-height-normal);
  resize: vertical;
  box-shadow: var(--nds-shadows-sm);
}

.nds-textarea__control:focus {
  outline: none;
  border-color: var(--nds-color-accent);
  box-shadow: 0 0 0 4px var(--nds-color-focus);
}

.nds-textarea__control::placeholder {
  color: var(--nds-color-text-muted);
}

:host([disabled]) .nds-textarea__control,
.nds-textarea__control:disabled {
  opacity: 0.56;
  cursor: not-allowed;
}`;
export const lightStyles = `nds-textarea {
display: block;
  font-family: var(--nds-typography-font-family-sans);
}

nds-textarea[hidden] {
display: none;
}

nds-textarea .nds-textarea__root {
display: grid;
  gap: var(--nds-spacing-2);
}

nds-textarea .nds-textarea__label {
color: var(--nds-color-text);
  font-size: var(--nds-typography-font-size-sm);
  font-weight: var(--nds-typography-font-weight-medium);
}

nds-textarea .nds-textarea__control {
min-height: 7rem;
  padding: var(--nds-spacing-3) var(--nds-spacing-4);
  border: 1px solid var(--nds-component-input-border);
  border-radius: var(--nds-radius-md);
  background: var(--nds-component-input-background);
  color: var(--nds-color-text);
  font: inherit;
  font-size: var(--nds-typography-font-size-md);
  line-height: var(--nds-typography-line-height-normal);
  resize: vertical;
  box-shadow: var(--nds-shadows-sm);
}

nds-textarea .nds-textarea__control:focus {
outline: none;
  border-color: var(--nds-color-accent);
  box-shadow: 0 0 0 4px var(--nds-color-focus);
}

nds-textarea .nds-textarea__control::placeholder {
color: var(--nds-color-text-muted);
}

nds-textarea[disabled] .nds-textarea__control,
nds-textarea .nds-textarea__control:disabled {
opacity: 0.56;
  cursor: not-allowed;
}`;
