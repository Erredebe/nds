export const shadowStyles = `:host {
  display: block;
}

:host([hidden]) {
  display: none;
}

.nds-box__container {
  padding: var(--nds-box-padding, 0);
  border-radius: var(--nds-box-radius, var(--nds-radius-md));
  background: var(--nds-box-background, transparent);
  border: var(--nds-box-border, 0 solid transparent);
}`;
export const lightStyles = `nds-box {
display: block;
}

nds-box[hidden] {
display: none;
}

nds-box .nds-box__container {
padding: var(--nds-box-padding, 0);
  border-radius: var(--nds-box-radius, var(--nds-radius-md));
  background: var(--nds-box-background, transparent);
  border: var(--nds-box-border, 0 solid transparent);
}`;
