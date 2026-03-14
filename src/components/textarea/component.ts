import { NDSComponentElement, component, prop } from '../../foundation/index.js';

let textareaIdCounter = 0;

@component({
  defaultDomMode: 'light',
  stylePath: './styles.css',
  tagName: 'nds-textarea',
  templatePath: './template.html'
})
export class NDSTextareaElement extends NDSComponentElement {
  static formAssociated = true;

  readonly #controlId = `nds-textarea-control-${textareaIdCounter++}`;
  readonly #internals = typeof this.attachInternals === 'function' ? this.attachInternals() : null;
  #fallbackControl: HTMLTextAreaElement | null = null;
  #defaultValue = '';
  #didInitializeDefaultValue = false;
  #fallbackForm: HTMLFormElement | null = null;
  readonly #handleFormReset = (): void => {
    this.formResetCallback();
  };

  @prop({ reflect: true, attribute: 'aria-describedby' }) accessor describedBy = '';
  @prop({ reflect: true, type: Boolean }) accessor disabled = false;
  @prop({ reflect: true, attribute: 'aria-errormessage' }) accessor errorMessage = '';
  @prop({ reflect: true, attribute: 'aria-label' }) accessor ariaLabel = '';
  @prop({ reflect: true, attribute: 'aria-labelledby' }) accessor ariaLabelledBy = '';
  @prop({ reflect: true, type: Boolean }) accessor invalid = false;
  @prop({ reflect: true }) accessor label = '';
  @prop({ reflect: true }) accessor name = '';
  @prop({ reflect: true }) accessor placeholder = '';
  @prop({ reflect: true, attribute: 'readonly', type: Boolean }) accessor readOnly = false;
  @prop({ reflect: true, type: Boolean }) accessor required = false;
  @prop({ reflect: true }) accessor rows = '4';
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

  protected get controlId(): string {
    return this.#controlId;
  }

  protected handleSyncValue(event: Event): void {
    const target = event.currentTarget as HTMLTextAreaElement;

    if (this.value !== target.value) {
      this.value = target.value;
    }

    this.emit('nds-input', { value: target.value });
  }

  protected handleCommitValue(event: Event): void {
    const target = event.currentTarget as HTMLTextAreaElement;

    if (this.value !== target.value) {
      this.value = target.value;
    }

    this.emit('nds-change', { value: target.value });
  }

  protected override rendered(): void {
    const control = this.refs.control;

    if (control instanceof HTMLTextAreaElement && control.value !== this.value) {
      control.value = this.value;
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
    internals.setFormValue(this.disabled ? null : this.value);

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

    const control = this.#fallbackControl ?? document.createElement('textarea');

    if (!this.#fallbackControl) {
      control.setAttribute('aria-hidden', 'true');
      control.dataset.ndsTextareaFallback = 'true';
      control.tabIndex = -1;
      this.append(control);
      this.#fallbackControl = control;
    }

    control.name = this.name;
    control.value = this.value;
    control.defaultValue = this.#defaultValue;
    control.disabled = this.disabled;
    control.required = this.required;
    control.readOnly = this.readOnly;
    control.rows = Number(this.rows) || 4;

    if (this.placeholder) {
      control.placeholder = this.placeholder;
    } else {
      control.removeAttribute('placeholder');
    }

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
