import { NDSComponentElement, type NDSComponentDefinition } from '../../foundation/component.js';
import { inputShadowStyles } from './styles.js';
import { renderInputTemplate } from './template.js';

export class NDSInputElement extends NDSComponentElement {
  static definition: NDSComponentDefinition<NDSInputElement> = {
    tagName: 'nds-input',
    observedAttributes: ['disabled', 'label', 'name', 'placeholder', 'type', 'value'],
    shadowStyles: inputShadowStyles,
    defaultDomMode: 'shadow',
    renderTemplate: renderInputTemplate
  };

  #control: HTMLInputElement | null = null;

  get value(): string {
    return this.getAttribute('value') ?? '';
  }

  set value(nextValue: string) {
    this.setAttribute('value', nextValue);
  }

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

  protected override afterRender(): void {
    const root = this.shadowRoot ?? this;
    const nextControl = root.querySelector<HTMLInputElement>('.nds-input__control');

    if (!nextControl) {
      this.#control = null;
      return;
    }

    this.#control = nextControl;
    this.#control.removeEventListener('input', this.handleSyncValue);
    this.#control.removeEventListener('change', this.handleSyncValue);
    this.#control.addEventListener('input', this.handleSyncValue);
    this.#control.addEventListener('change', this.handleSyncValue);
  }

  private readonly handleSyncValue = (event: Event): void => {
    const target = event.currentTarget as HTMLInputElement;

    if (this.getAttribute('value') !== target.value) {
      this.setAttribute('value', target.value);
    }
  };
}
