import { defineAllComponents, setTheme } from '../../dist/index.js';

defineAllComponents({
  button: { dom: 'light' }
});
setTheme('dark');

document.body.innerHTML = `
  <div class="example-shell">
    <nds-stack gap="6">
      <nds-heading level="1">Mixed DOM configuration</nds-heading>
      <nds-text variant="muted">
        Button se registra en light DOM; el resto conserva el default shadow DOM.
      </nds-text>
    </nds-stack>

    <nds-card elevated>
      <nds-stack gap="4">
        <nds-heading level="3">Button in light DOM</nds-heading>
        <nds-button variant="outline">Rendered in host</nds-button>
        <nds-input label="Still shadow" placeholder="Shadow DOM input"></nds-input>
        <nds-box surface="subtle" padding="4">
          <nds-text>Layout and typography remain in shadow mode.</nds-text>
        </nds-box>
      </nds-stack>
    </nds-card>
  </div>
`;
document.querySelector('nds-button')?.addEventListener('nds-click', () => {
  console.log('mixed-dom button -> nds-click');
});
