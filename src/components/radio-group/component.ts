import { NDSComponentElement, component, prop } from '../../foundation/index.js';
import { parseOptionItems, type NDSOptionItem } from '../../utils/form-options.js';

let radioGroupIdCounter = 0;

@component({
  defaultDomMode: 'light',
  stylePath: './styles.css',
  tagName: 'nds-radio-group',
  templatePath: './template.html'
})
export class NDSRadioGroupElement extends NDSComponentElement {
  static formAssociated = true;

  readonly #internals = typeof this.attachInternals === 'function' ? this.attachInternals() : null;
  readonly #groupId = `nds-radio-group-${radioGroupIdCounter++}`;
  #fallbackControl: HTMLInputElement | null = null;
  #defaultValue = '';
  #didInitializeDefaultValue = false;
  #fallbackForm: HTMLFormElement | null = null;
  readonly #handleFormReset = (): void => {
    this.formResetCallback();
  };

  @prop({ reflect: true, attribute: 'aria-describedby' }) accessor describedBy = '';
  @prop({ reflect: true, type: Boolean }) accessor disabled = false;
  @prop({ reflect: true, attribute: 'aria-errormessage' }) accessor errorMessage = '';
  @prop({ reflect: true, type: Boolean }) accessor invalid = false;
  @prop({ reflect: true }) accessor label = '';
  @prop({ reflect: true }) accessor name = '';
  @prop({ reflect: true }) accessor options = '';
  @prop({ reflect: true, type: Boolean }) accessor required = false;
  @prop({ reflect: false }) accessor value = '';

  private get formInternals(): Pick<ElementInternals, 'setFormValue' | 'setValidity'> | null {
    if (
      this.#internals &&
      typeof this.#internals.setFormValue === 'function' &&
      typeof this.#internals.setValidity === 'function'
    ) {
      return this.#internals;
    }

    return null;
  }

  connectedCallback(): void {
    super.connectedCallback();

    if (!this.#didInitializeDefaultValue) {
      this.#defaultValue = this.value;
      this.#didInitializeDefaultValue = true;
    }

    this.syncFallbackFormBinding();
  }

  disconnectedCallback(): void {
    this.teardownFallbackFormBinding();
  }

  protected optionItems(): Array<NDSOptionItem & { id: string }> {
    return parseOptionItems(this.options).map((item, index) => ({
      ...item,
      id: `${this.#groupId}-option-${index}`
    }));
  }

  protected descriptionId(): string {
    return `${this.#groupId}-description`;
  }

  protected handleChange(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;

    if (!target.checked) {
      return;
    }

    if (this.value !== target.value) {
      this.value = target.value;
    }

    this.emit('nds-change', { value: target.value });
  }

  protected override rendered(): void {
    for (const input of Array.from(this.renderRoot.querySelectorAll<HTMLInputElement>('.nds-radio-group__control'))) {
      input.checked = input.value === this.value;
    }

    this.syncFormValue();
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.value = this.#defaultValue;
    this.invalid = false;
  }

  private syncFormValue(): void {
    const internals = this.formInternals;

    if (!internals) {
      this.syncFallbackControl();
      return;
    }

    this.teardownFallbackControl();
    internals.setFormValue(this.disabled ? null : this.value || null);

    if (this.invalid) {
      internals.setValidity({ customError: true }, 'Invalid field value.');
      return;
    }

    if (this.required && !this.value) {
      internals.setValidity({ valueMissing: true }, 'This field is required.');
      return;
    }

    internals.setValidity({});
  }

  private syncFallbackControl(): void {
    if (this.domMode !== 'shadow' || !this.isConnected) {
      this.teardownFallbackControl();
      this.teardownFallbackFormBinding();
      return;
    }

    this.syncFallbackFormBinding();

    const control = this.#fallbackControl ?? document.createElement('input');

    if (!this.#fallbackControl) {
      control.type = 'hidden';
      control.dataset.ndsRadioGroupFallback = 'true';
      this.append(control);
      this.#fallbackControl = control;
    }

    control.name = this.name;
    control.disabled = this.disabled;
    control.value = this.value;
  }

  private syncFallbackFormBinding(): void {
    const nextForm = this.domMode === 'shadow' ? this.closest('form') : null;

    if (nextForm === this.#fallbackForm) {
      return;
    }

    this.teardownFallbackFormBinding();
    nextForm?.addEventListener('reset', this.#handleFormReset);
    this.#fallbackForm = nextForm;
  }

  private teardownFallbackControl(): void {
    this.#fallbackControl?.remove();
    this.#fallbackControl = null;
  }

  private teardownFallbackFormBinding(): void {
    this.#fallbackForm?.removeEventListener('reset', this.#handleFormReset);
    this.#fallbackForm = null;
  }
}
