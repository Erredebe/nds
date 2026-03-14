import { type DomMode, NDSComponentElement, attr, component, listen } from '../../foundation/index.js';
import { escapeHtml } from '../../utils/dom.js';

const inputTypes = ['email', 'number', 'password', 'search', 'tel', 'text', 'url'] as const;

@component({
  defaultDomMode: 'shadow',
  stylePath: './styles.css',
  tagName: 'nds-input'
})
export class NDSInputElement extends NDSComponentElement {
  @attr.boolean() accessor disabled = false;
  @attr.string() accessor label = '';
  @attr.string() accessor name = '';
  @attr.string() accessor placeholder = '';
  @attr.enum(inputTypes) accessor type: (typeof inputTypes)[number] = 'text';
  @attr.string() accessor value = '';

  #control: HTMLInputElement | null = null;

  override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) {
      return;
    }

    if (name === 'value' && this.#control) {
      if (this.#control.value !== (newValue ?? '')) {
        this.#control.value = newValue ?? '';
      }

      return;
    }

    super.attributeChangedCallback(name, oldValue, newValue);
  }

  protected override renderTemplate(_mode: DomMode): string {
    const label = escapeHtml(this.label || 'Field');
    const name = escapeHtml(this.name);
    const placeholder = escapeHtml(this.placeholder);
    const value = escapeHtml(this.value);

    return `
      <div class="nds-input__root">
        <label part="field" class="nds-input__field">
          <span part="label" class="nds-input__label">${label}</span>
          <input
            part="input"
            class="nds-input__control"
            type="${this.type}"
            value="${value}"
            placeholder="${placeholder}"
            name="${name}"
            ${this.disabled ? 'disabled' : ''}
          />
        </label>
      </div>
    `.trim();
  }

  protected override rendered(): void {
    const nextControl = this.renderRoot.querySelector<HTMLInputElement>('.nds-input__control');

    if (!nextControl) {
      this.#control = null;
      return;
    }

    this.#control = nextControl;
    this.#control.value = this.value;
  }

  @listen('input', { selector: '.nds-input__control' })
  protected handleSyncValue(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;

    if (this.value !== target.value) {
      this.value = target.value;
    }

    this.emit('nds-input', { value: target.value });
  }

  @listen('change', { selector: '.nds-input__control' })
  protected handleCommitValue(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;

    if (this.value !== target.value) {
      this.value = target.value;
    }

    this.emit('nds-change', { value: target.value });
  }
}
