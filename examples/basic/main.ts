import { defineAllComponents, setTheme } from '../../dist/index.js';

defineAllComponents();
setTheme('light');

document.body.innerHTML = `
  <div class="example-shell">
    <nds-stack gap="6">
      <nds-heading level="1">no-dep-ds</nds-heading>
      <nds-text variant="muted">
        Design system ESM-only con Web Components, tokens TypeScript y soporte shadow/light.
      </nds-text>
      <nds-button id="theme-toggle" variant="outline">Toggle theme</nds-button>
    </nds-stack>

    <div class="example-grid">
      <nds-card elevated>
        <nds-stack gap="4">
          <nds-heading level="3">Button</nds-heading>
          <nds-button>Primary action</nds-button>
          <nds-button variant="outline">Secondary action</nds-button>
          <nds-button variant="ghost">Ghost action</nds-button>
        </nds-stack>
      </nds-card>

      <nds-card>
        <nds-stack gap="4">
          <nds-heading level="3">Input</nds-heading>
          <nds-input label="Email" placeholder="hello@example.com"></nds-input>
        </nds-stack>
      </nds-card>

      <nds-card>
        <nds-stack gap="4">
          <nds-heading level="3">Typography</nds-heading>
          <nds-heading level="4">Heading level 4</nds-heading>
          <nds-text>Default body text.</nds-text>
          <nds-text variant="muted">Muted text for secondary information.</nds-text>
          <nds-text variant="caption">Caption text</nds-text>
        </nds-stack>
      </nds-card>

      <nds-card>
        <nds-stack gap="4">
          <nds-heading level="3">Layout</nds-heading>
          <nds-box surface="subtle" padding="4" radius="lg">
            <nds-text>Box with semantic surface and token-based spacing.</nds-text>
          </nds-box>
          <nds-stack direction="row" gap="3" align="center">
            <nds-box surface="accent" padding="3" radius="pill">
              <nds-text variant="label">Chip A</nds-text>
            </nds-box>
            <nds-box surface="subtle" padding="3" radius="pill">
              <nds-text variant="label">Chip B</nds-text>
            </nds-box>
          </nds-stack>
        </nds-stack>
      </nds-card>
    </div>
  </div>
`;

const toggleButton = document.getElementById('theme-toggle');
let currentTheme: 'light' | 'dark' = 'light';

toggleButton?.addEventListener('click', () => {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(currentTheme);
});
