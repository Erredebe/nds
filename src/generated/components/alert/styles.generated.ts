export const shadowStyles = `:host {
  display: block;
  --nds-alert-accent: #11736b;
  --nds-alert-background: color-mix(in srgb, var(--nds-alert-accent) 12%, var(--nds-color-surface, #ffffff));
  --nds-alert-border: color-mix(in srgb, var(--nds-alert-accent) 36%, transparent);
  --nds-alert-text: var(--nds-color-text, #0f172a);
}

:host([hidden]) {
  display: none;
}

:host([tone='success']) {
  --nds-alert-accent: #17803d;
}

:host([tone='warning']) {
  --nds-alert-accent: #b35b00;
}

:host([tone='danger']) {
  --nds-alert-accent: #b42318;
}

.nds-alert__root {
  display: block;
}

.nds-alert__frame {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.875rem;
  padding: 1rem 1.125rem;
  border: 1px solid var(--nds-alert-border);
  border-radius: 1rem;
  background: var(--nds-alert-background);
  color: var(--nds-alert-text);
}

.nds-alert__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--nds-alert-accent) 18%, transparent);
  color: var(--nds-alert-accent);
  font-size: 0.875rem;
  font-weight: 700;
}

.nds-alert__body {
  display: grid;
  gap: 0.625rem;
  min-width: 0;
}

.nds-alert__header {
  display: flex;
  gap: 0.75rem;
  align-items: start;
  justify-content: space-between;
}

.nds-alert__title {
  font-size: 0.95rem;
  line-height: 1.3;
}

.nds-alert__dismiss {
  padding: 0.35rem 0.7rem;
  border: 1px solid color-mix(in srgb, var(--nds-alert-accent) 28%, transparent);
  border-radius: 999px;
  background: transparent;
  color: var(--nds-alert-accent);
  font: inherit;
  cursor: pointer;
}

.nds-alert__message,
.nds-alert__slot {
  color: color-mix(in srgb, var(--nds-alert-text) 82%, var(--nds-alert-accent) 18%);
  line-height: 1.55;
}

.nds-alert__message p {
  margin: 0;
}

.nds-alert__features {
  display: grid;
  gap: 0.45rem;
  margin: 0;
  padding: 0 0 0 1.1rem;
}

.nds-alert__feature {
  color: color-mix(in srgb, var(--nds-alert-text) 78%, var(--nds-alert-accent) 22%);
}

.nds-alert__slot:empty {
  display: none;
}`;
export const lightStyles = `nds-alert {
display: block;
  --nds-alert-accent: #11736b;
  --nds-alert-background: color-mix(in srgb, var(--nds-alert-accent) 12%, var(--nds-color-surface, #ffffff));
  --nds-alert-border: color-mix(in srgb, var(--nds-alert-accent) 36%, transparent);
  --nds-alert-text: var(--nds-color-text, #0f172a);
}

nds-alert[hidden] {
display: none;
}

nds-alert[tone='success'] {
--nds-alert-accent: #17803d;
}

nds-alert[tone='warning'] {
--nds-alert-accent: #b35b00;
}

nds-alert[tone='danger'] {
--nds-alert-accent: #b42318;
}

nds-alert .nds-alert__root {
display: block;
}

nds-alert .nds-alert__frame {
display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.875rem;
  padding: 1rem 1.125rem;
  border: 1px solid var(--nds-alert-border);
  border-radius: 1rem;
  background: var(--nds-alert-background);
  color: var(--nds-alert-text);
}

nds-alert .nds-alert__icon {
display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--nds-alert-accent) 18%, transparent);
  color: var(--nds-alert-accent);
  font-size: 0.875rem;
  font-weight: 700;
}

nds-alert .nds-alert__body {
display: grid;
  gap: 0.625rem;
  min-width: 0;
}

nds-alert .nds-alert__header {
display: flex;
  gap: 0.75rem;
  align-items: start;
  justify-content: space-between;
}

nds-alert .nds-alert__title {
font-size: 0.95rem;
  line-height: 1.3;
}

nds-alert .nds-alert__dismiss {
padding: 0.35rem 0.7rem;
  border: 1px solid color-mix(in srgb, var(--nds-alert-accent) 28%, transparent);
  border-radius: 999px;
  background: transparent;
  color: var(--nds-alert-accent);
  font: inherit;
  cursor: pointer;
}

nds-alert .nds-alert__message,
nds-alert .nds-alert__slot {
color: color-mix(in srgb, var(--nds-alert-text) 82%, var(--nds-alert-accent) 18%);
  line-height: 1.55;
}

nds-alert .nds-alert__message p {
margin: 0;
}

nds-alert .nds-alert__features {
display: grid;
  gap: 0.45rem;
  margin: 0;
  padding: 0 0 0 1.1rem;
}

nds-alert .nds-alert__feature {
color: color-mix(in srgb, var(--nds-alert-text) 78%, var(--nds-alert-accent) 22%);
}

nds-alert .nds-alert__slot:empty {
display: none;
}`;
