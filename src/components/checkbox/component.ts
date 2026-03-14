import { NDSComponentElement, component, prop } from '../../foundation/index.js';

let checkboxIdCounter = 0;

@component({
  defaultDomMode: 'light',
  stylePath: './styles.css',
  tagName: 'nds-checkbox',
  templatePath: './template.html'
})
export class NDSCheckboxElement extends NDSComponentElement {
  static formAssociated = true;

  readonly #controlId = `nds-checkbox-control-${checkboxIdCounter++}`;
  readonly #internals = typeof this.attachInternals === 'function' ? this.attachInternals() : null;
  #fallbackControl: HTMLInputElement | null = null;
  #defaultChecked = false;
  #fallbackForm: HTMLFormElement | null = null;
  readonly #handleFormReset = (): void => {
    this.formResetCallback();
  };

  @prop({ reflect: true, attribute: 'aria-describedby' }) accessor describedBy = '';
  @prop({ reflect: true, attribute: 'aria-label' }) accessor ariaLabel = '';
  @prop({ reflect: true, attribute: 'aria-labelledby' }) accessor ariaLabelledBy = '';
  @prop({ reflect: true, type: Boolean }) accessor checked = false;
  @prop({ reflect: true }) accessor description = '';
  @prop({ reflect: true, type: Boolean }) accessor disabled = false;
  @prop({ reflect: true, type: Boolean }) accessor invalid = false;
  @prop({ reflect: true }) accessor label = '';
  @prop({ reflect: true }) accessor name = '';
  @prop({ reflect: true, type: Boolean }) accessor required = false;
  @prop({ reflect: true }) accessor value = 'on';

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
    this.#defaultChecked = this.checked;
    this.syncFallbackFormBinding();
  }

  disconnectedCallback(): void {
    this.teardownFallbackFormBinding();
  }

  protected get controlId(): string {
    return this.#controlId;
  }

  protected descriptionId(): string {
    return `${this.#controlId}-description`;
  }

  protected handleInput(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;

    if (this.checked !== target.checked) {
      this.checked = target.checked;
    }

    this.emit('nds-input', { checked: target.checked, value: this.value });
  }

  protected handleChange(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;

    if (this.checked !== target.checked) {
      this.checked = target.checked;
    }

    this.emit('nds-change', { checked: target.checked, value: this.value });
  }

  protected override rendered(): void {
    const control = this.refs.control;

    if (control instanceof HTMLInputElement) {
      control.checked = this.checked;
    }

    this.syncFormValue();
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.checked = this.#defaultChecked;
    this.invalid = false;
  }

  private syncFormValue(): void {
    const internals = this.formInternals;

    if (!internals) {
      this.syncFallbackControl();
      return;
    }

    this.teardownFallbackControl();
    internals.setFormValue(this.checked && !this.disabled ? this.value : null);

    if (this.invalid) {
      internals.setValidity({ customError: true }, 'Invalid field value.');
      return;
    }

    if (this.required && !this.checked) {
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
      control.type = 'checkbox';
      control.setAttribute('aria-hidden', 'true');
      control.dataset.ndsCheckboxFallback = 'true';
      control.tabIndex = -1;
      this.append(control);
      this.#fallbackControl = control;
    }

    control.name = this.name;
    control.value = this.value;
    control.checked = this.checked;
    control.defaultChecked = this.#defaultChecked;
    control.disabled = this.disabled;
    control.required = this.required;

    if (this.invalid) {
      control.setCustomValidity('Invalid field value.');
      return;
    }

    control.setCustomValidity('');
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
