import { NDSComponentElement, component, prop } from '../../foundation/index.js';

const buttonSizes = ['sm', 'md', 'lg'] as const;
const buttonTypes = ['button', 'submit', 'reset'] as const;
const buttonVariants = ['solid', 'outline', 'ghost'] as const;

@component({
  defaultDomMode: 'light',
  stylePath: './styles.css',
  tagName: 'nds-button',
  templatePath: './template.html'
})
export class NDSButtonElement extends NDSComponentElement {
  @prop({ reflect: true, attribute: 'aria-describedby' }) accessor ariaDescribedBy = '';
  @prop({ reflect: true, attribute: 'aria-label' }) accessor ariaLabel = '';
  @prop({ reflect: true, attribute: 'aria-labelledby' }) accessor ariaLabelledBy = '';
  @prop({ reflect: true, type: Boolean }) accessor disabled = false;
  @prop({ reflect: true }) accessor label = '';
  @prop({ reflect: true }) accessor name = '';
  @prop({ reflect: true, values: buttonSizes }) accessor size: (typeof buttonSizes)[number] = 'md';
  @prop({ reflect: true, values: buttonTypes }) accessor type: (typeof buttonTypes)[number] = 'button';
  @prop({ reflect: true }) accessor value = '';
  @prop({ reflect: true, values: buttonVariants }) accessor variant: (typeof buttonVariants)[number] = 'solid';

  protected handleControlClick(event: Event): void {
    const target = event.currentTarget;

    if (!(target instanceof HTMLButtonElement) || target.disabled) {
      return;
    }

    if (this.domMode === 'shadow') {
      this.forwardShadowFormAction();
    }

    this.emit('nds-click');
  }

  private forwardShadowFormAction(): void {
    const form = this.closest('form');

    if (!form) {
      return;
    }

    if (this.type === 'reset') {
      form.reset();
      return;
    }

    if (this.type === 'submit') {
      form.requestSubmit();
    }
  }
}
