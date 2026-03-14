export const shadowStyles = `:host {
  display: inline-flex;
  vertical-align: middle;
  font-family: var(--nds-typography-font-family-sans);
}

:host([hidden]) {
  display: none;
}

.nds-button__control {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding-inline: var(--nds-spacing-4);
  border: 1px solid transparent;
  border-radius: var(--nds-radius-pill);
  background: var(--nds-component-button-solid-background);
  color: var(--nds-component-button-solid-foreground);
  box-shadow: var(--nds-shadows-sm);
  cursor: pointer;
  font: inherit;
  font-size: var(--nds-typography-font-size-md);
  font-weight: var(--nds-typography-font-weight-semibold);
  line-height: var(--nds-typography-line-height-tight);
  transition:
    background-color 140ms ease,
    color 140ms ease,
    border-color 140ms ease,
    transform 140ms ease,
    box-shadow 140ms ease;
}

.nds-button__control:hover {
  transform: translateY(-1px);
  box-shadow: var(--nds-shadows-md);
}

:host([variant="outline"]) .nds-button__control {
  background: transparent;
  color: var(--nds-component-button-outline-foreground);
  border-color: var(--nds-color-border);
  box-shadow: none;
}

:host([variant="ghost"]) .nds-button__control {
  background: transparent;
  color: var(--nds-component-button-outline-foreground);
  box-shadow: none;
}

:host([variant="ghost"]) .nds-button__control:hover {
  background: var(--nds-component-button-ghost-hover-background);
  transform: none;
}

:host([size="sm"]) .nds-button__control {
  min-height: 2.25rem;
  padding-inline: var(--nds-spacing-3);
  font-size: var(--nds-typography-font-size-sm);
}

:host([size="lg"]) .nds-button__control {
  min-height: 3.25rem;
  padding-inline: var(--nds-spacing-5);
  font-size: var(--nds-typography-font-size-lg);
}

:host([disabled]) .nds-button__control,
.nds-button__control:disabled {
  opacity: 0.56;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}`;
export const lightStyles = `nds-button {
display: inline-flex;
  vertical-align: middle;
  font-family: var(--nds-typography-font-family-sans);
}

nds-button[hidden] {
display: none;
}

nds-button .nds-button__control {
display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding-inline: var(--nds-spacing-4);
  border: 1px solid transparent;
  border-radius: var(--nds-radius-pill);
  background: var(--nds-component-button-solid-background);
  color: var(--nds-component-button-solid-foreground);
  box-shadow: var(--nds-shadows-sm);
  cursor: pointer;
  font: inherit;
  font-size: var(--nds-typography-font-size-md);
  font-weight: var(--nds-typography-font-weight-semibold);
  line-height: var(--nds-typography-line-height-tight);
  transition:
    background-color 140ms ease,
    color 140ms ease,
    border-color 140ms ease,
    transform 140ms ease,
    box-shadow 140ms ease;
}

nds-button .nds-button__control:hover {
transform: translateY(-1px);
  box-shadow: var(--nds-shadows-md);
}

nds-button[variant="outline"] .nds-button__control {
background: transparent;
  color: var(--nds-component-button-outline-foreground);
  border-color: var(--nds-color-border);
  box-shadow: none;
}

nds-button[variant="ghost"] .nds-button__control {
background: transparent;
  color: var(--nds-component-button-outline-foreground);
  box-shadow: none;
}

nds-button[variant="ghost"] .nds-button__control:hover {
background: var(--nds-component-button-ghost-hover-background);
  transform: none;
}

nds-button[size="sm"] .nds-button__control {
min-height: 2.25rem;
  padding-inline: var(--nds-spacing-3);
  font-size: var(--nds-typography-font-size-sm);
}

nds-button[size="lg"] .nds-button__control {
min-height: 3.25rem;
  padding-inline: var(--nds-spacing-5);
  font-size: var(--nds-typography-font-size-lg);
}

nds-button[disabled] .nds-button__control,
nds-button .nds-button__control:disabled {
opacity: 0.56;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}`;
