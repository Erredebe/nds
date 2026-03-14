import { NDSComponentElement, component, prop } from '../../foundation/index.js';
import { parseOptionItems, type NDSOptionItem } from '../../utils/form-options.js';

let selectIdCounter = 0;

@component({
  defaultDomMode: 'light',
  stylePath: './styles.css',
  tagName: 'nds-select',
  templatePath: './template.html'
})
export class NDSSelectElement extends NDSComponentElement {
  static formAssociated = true;

  readonly #controlId = `nds-select-control-${selectIdCounter++}`;
  readonly #internals = typeof this.attachInternals === 'function' ? this.attachInternals() : null;
  #fallbackControl: HTMLSelectElement | null = null;
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
  @prop({ reflect: true }) accessor options = '';
  @prop({ reflect: true }) accessor placeholder = '';
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

  protected get controlId(): string {
    return this.#controlId;
  }

  protected optionItems(): NDSOptionItem[] {
    return parseOptionItems(this.options);
  }

  protected showPlaceholderOption(): boolean {
    return Boolean(this.placeholder);
  }

  protected handleSyncValue(event: Event): void {
    const target = event.currentTarget as HTMLSelectElement;

    if (this.value !== target.value) {
      this.value = target.value;
    }

    this.emit('nds-input', { value: target.value });
  }

  protected handleCommitValue(event: Event): void {
    const target = event.currentTarget as HTMLSelectElement;

    if (this.value !== target.value) {
      this.value = target.value;
    }

    this.emit('nds-change', { value: target.value });
  }

  protected override rendered(): void {
    const control = this.refs.control;

    if (control instanceof HTMLSelectElement && control.value !== this.value) {
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

    const control = this.#fallbackControl ?? document.createElement('select');

    if (!this.#fallbackControl) {
      control.setAttribute('aria-hidden', 'true');
      control.dataset.ndsSelectFallback = 'true';
      control.tabIndex = -1;
      this.append(control);
      this.#fallbackControl = control;
    }

    control.replaceChildren();
    control.name = this.name;
    control.disabled = this.disabled;
    control.required = this.required;

    if (this.placeholder) {
      const placeholderOption = document.createElement('option');
      placeholderOption.value = '';
      placeholderOption.textContent = this.placeholder;
      control.append(placeholderOption);
    }

    for (const item of this.optionItems()) {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.label;
      control.append(option);
    }

    control.value = this.value;

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
