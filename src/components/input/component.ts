import { NDSComponentElement, component, prop } from '../../foundation/index.js';

const inputTypes = ['email', 'number', 'password', 'search', 'tel', 'text', 'url'] as const;

let inputIdCounter = 0;

@component({
  defaultDomMode: 'light',
  stylePath: './styles.css',
  tagName: 'nds-input',
  templatePath: './template.html'
})
export class NDSInputElement extends NDSComponentElement {
  static formAssociated = true;

  readonly #controlId = `nds-input-control-${inputIdCounter++}`;
  readonly #internals = typeof this.attachInternals === 'function' ? this.attachInternals() : null;
  #defaultValue = '';
  #didInitializeDefaultValue = false;

  @prop({ reflect: true }) accessor autocomplete = '';
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
  @prop({ reflect: true, values: inputTypes }) accessor type: (typeof inputTypes)[number] = 'text';
  @prop({ reflect: true }) accessor value = '';

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
  }

  protected get controlId(): string {
    return this.#controlId;
  }

  protected handleSyncValue(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;

    if (this.value !== target.value) {
      this.value = target.value;
    }

    this.emit('nds-input', { value: target.value });
  }

  protected handleCommitValue(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;

    if (this.value !== target.value) {
      this.value = target.value;
    }

    this.emit('nds-change', { value: target.value });
  }

  protected override rendered(): void {
    const control = this.refs.control;

    if (control instanceof HTMLInputElement && control.value !== this.value) {
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
      return;
    }

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
}
