import { defineAllComponents, setTheme } from '../../dist/index.js';

defineAllComponents({
  input: { dom: 'shadow' }
});
setTheme('dark');

document.body.innerHTML = `
  <div class="example-shell">
    <nds-stack gap="6">
      <nds-heading level="1">Mixed DOM configuration</nds-heading>
      <nds-text tag="p" variant="muted">
        Input se registra en shadow DOM; button conserva el default light DOM para formularios nativos.
      </nds-text>
    </nds-stack>

    <nds-card elevated>
      <nds-stack gap="4">
        <nds-heading level="3">Input in shadow DOM</nds-heading>
        <nds-button variant="outline">Rendered in host</nds-button>
        <nds-input label="Shadow input" placeholder="Shadow DOM input"></nds-input>
        <nds-box surface="subtle" padding="4">
          <nds-text tag="p">Layout and typography keep their configured DOM mode independently.</nds-text>
        </nds-box>
      </nds-stack>
    </nds-card>
  </div>
`;

document.querySelector('nds-button')?.addEventListener('nds-click', () => {
  console.log('mixed-dom button -> nds-click');
});
