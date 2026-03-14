export const shadowStyles = `:host {
  display: block;
}

:host([hidden]) {
  display: none;
}

.nds-stack__container {
  display: flex;
  flex-direction: var(--nds-stack-direction, column);
  align-items: var(--nds-stack-align, stretch);
  justify-content: var(--nds-stack-justify, flex-start);
  gap: var(--nds-stack-gap, var(--nds-spacing-3));
}`;
export const lightStyles = `nds-stack {
display: block;
}

nds-stack[hidden] {
display: none;
}

nds-stack .nds-stack__container {
display: flex;
  flex-direction: var(--nds-stack-direction, column);
  align-items: var(--nds-stack-align, stretch);
  justify-content: var(--nds-stack-justify, flex-start);
  gap: var(--nds-stack-gap, var(--nds-spacing-3));
}`;
