import { NDSComponentElement, component, prop } from '../../foundation/index.js';
import { mergeIdRefs } from '../../utils/form-options.js';

let fieldIdCounter = 0;

@component({
  defaultDomMode: 'light',
  stylePath: './styles.css',
  tagName: 'nds-field',
  templatePath: './template.html'
})
export class NDSFieldElement extends NDSComponentElement {
  readonly #descriptionId = `nds-field-description-${fieldIdCounter++}`;
  readonly #errorId = `nds-field-error-${fieldIdCounter++}`;

  @prop({ reflect: true }) accessor description = '';
  @prop({ reflect: true }) accessor error = '';
  @prop({ reflect: true, type: Boolean }) accessor invalid = false;
  @prop({ reflect: true }) accessor label = '';
  @prop({ reflect: true, type: Boolean }) accessor required = false;

  protected get descriptionId(): string {
    return this.#descriptionId;
  }

  protected get errorId(): string {
    return this.#errorId;
  }

  protected override rendered(): void {
    const control = this.resolveControl();

    if (!control) {
      return;
    }

    if (!control.id) {
      control.id = `nds-field-control-${fieldIdCounter++}`;
    }

    const describedBy = mergeIdRefs(
      control.getAttribute('aria-describedby'),
      this.description ? this.#descriptionId : '',
      this.error ? this.#errorId : ''
    );

    if (describedBy) {
      control.setAttribute('aria-describedby', describedBy);
    } else {
      control.removeAttribute('aria-describedby');
    }

    if (this.invalid || this.error) {
      control.setAttribute('aria-invalid', 'true');
      control.setAttribute('aria-errormessage', this.#errorId);
    } else {
      control.removeAttribute('aria-invalid');
      control.removeAttribute('aria-errormessage');
    }

    if (this.required && !control.hasAttribute('required')) {
      control.setAttribute('required', '');
    }

    const label = this.refs.label;

    if (label instanceof HTMLLabelElement && this.domMode === 'light') {
      label.htmlFor = control.id;
    }

    if (
      this.domMode === 'shadow' &&
      this.label &&
      !control.hasAttribute('aria-label') &&
      !control.hasAttribute('aria-labelledby')
    ) {
      control.setAttribute('aria-label', this.label);
    }
  }

  private resolveControl(): HTMLElement | null {
    if (this.domMode === 'shadow') {
      const slot = this.refs.controlSlot;

      if (slot instanceof HTMLSlotElement) {
        return slot.assignedElements({ flatten: true }).find(this.isSupportedControl) as HTMLElement | null;
      }

      return null;
    }

    return Array.from(this.querySelectorAll<HTMLElement>('input, textarea, select')).find(this.isSupportedControl) ?? null;
  }

  private readonly isSupportedControl = (value: Element): boolean =>
    value instanceof HTMLInputElement || value instanceof HTMLTextAreaElement || value instanceof HTMLSelectElement;
}
