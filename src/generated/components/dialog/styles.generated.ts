export const shadowStyles = `:host {
  display: contents;
}

:host([hidden]) {
  display: none;
}

.nds-dialog__root {
  inline-size: min(32rem, calc(100vw - 2rem));
  padding: 0;
  border: 1px solid var(--nds-color-border);
  border-radius: var(--nds-radius-lg);
  background: var(--nds-component-card-background);
  color: var(--nds-color-text);
  box-shadow: var(--nds-shadows-lg);
}

.nds-dialog__root::backdrop {
  background: rgb(15 23 42 / 0.52);
}

.nds-dialog__panel {
  display: grid;
  gap: var(--nds-spacing-5);
  padding: var(--nds-spacing-5);
}

.nds-dialog__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--nds-spacing-4);
}

.nds-dialog__heading-group {
  display: grid;
  gap: var(--nds-spacing-2);
}

.nds-dialog__title,
.nds-dialog__description {
  margin: 0;
}

.nds-dialog__title {
  font-size: var(--nds-typography-font-size-xl);
  line-height: var(--nds-typography-line-height-tight);
}

.nds-dialog__description {
  color: var(--nds-color-text-muted);
}

.nds-dialog__dismiss {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: 2.25rem;
  block-size: 2.25rem;
  border: 1px solid var(--nds-color-border);
  border-radius: var(--nds-radius-pill);
  background: transparent;
  color: var(--nds-color-text);
  cursor: pointer;
  font: inherit;
}

.nds-dialog__dismiss:focus {
  outline: none;
  box-shadow: 0 0 0 4px var(--nds-color-focus);
}

.nds-dialog__body {
  display: block;
}`;
export const lightStyles = `nds-dialog {
display: contents;
}

nds-dialog[hidden] {
display: none;
}

nds-dialog .nds-dialog__root {
inline-size: min(32rem, calc(100vw - 2rem));
  padding: 0;
  border: 1px solid var(--nds-color-border);
  border-radius: var(--nds-radius-lg);
  background: var(--nds-component-card-background);
  color: var(--nds-color-text);
  box-shadow: var(--nds-shadows-lg);
}

nds-dialog .nds-dialog__root::backdrop {
background: rgb(15 23 42 / 0.52);
}

nds-dialog .nds-dialog__panel {
display: grid;
  gap: var(--nds-spacing-5);
  padding: var(--nds-spacing-5);
}

nds-dialog .nds-dialog__header {
display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--nds-spacing-4);
}

nds-dialog .nds-dialog__heading-group {
display: grid;
  gap: var(--nds-spacing-2);
}

nds-dialog .nds-dialog__title,
nds-dialog .nds-dialog__description {
margin: 0;
}

nds-dialog .nds-dialog__title {
font-size: var(--nds-typography-font-size-xl);
  line-height: var(--nds-typography-line-height-tight);
}

nds-dialog .nds-dialog__description {
color: var(--nds-color-text-muted);
}

nds-dialog .nds-dialog__dismiss {
display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: 2.25rem;
  block-size: 2.25rem;
  border: 1px solid var(--nds-color-border);
  border-radius: var(--nds-radius-pill);
  background: transparent;
  color: var(--nds-color-text);
  cursor: pointer;
  font: inherit;
}

nds-dialog .nds-dialog__dismiss:focus {
outline: none;
  box-shadow: 0 0 0 4px var(--nds-color-focus);
}

nds-dialog .nds-dialog__body {
display: block;
}`;
