import { type DomMode, NDSComponentElement, attr, component, listen } from '../../foundation/index.js';
import { escapeHtml } from '../../utils/dom.js';

const buttonSizes = ['sm', 'md', 'lg'] as const;
const buttonTypes = ['button', 'submit', 'reset'] as const;
const buttonVariants = ['solid', 'outline', 'ghost'] as const;

@component({
  defaultDomMode: 'shadow',
  stylePath: './styles.css',
  tagName: 'nds-button'
})
export class NDSButtonElement extends NDSComponentElement {
  @attr.boolean() accessor disabled = false;
  @attr.string() accessor label = '';
  @attr.enum(buttonSizes) accessor size: (typeof buttonSizes)[number] = 'md';
  @attr.enum(buttonTypes) accessor type: (typeof buttonTypes)[number] = 'button';
  @attr.enum(buttonVariants) accessor variant: (typeof buttonVariants)[number] = 'solid';

  protected override renderTemplate(mode: DomMode): string {
    const fallbackLabel = escapeHtml(this.defaultSlotFallbackText());
    const content =
      mode === 'shadow'
        ? `<span part="label" class="nds-button__label"><slot>${fallbackLabel}</slot></span>`
        : `<span part="label" class="nds-button__label" data-nds-slot-target="default">${fallbackLabel}</span>`;

    return `
      <span class="nds-button__root">
        <button part="control" class="nds-button__control" type="${this.type}"${this.disabled ? ' disabled' : ''}>
          ${content}
        </button>
      </span>
    `.trim();
  }

  protected override defaultSlotFallbackText(): string {
    return this.label || 'Button';
  }

  @listen('click', { selector: '.nds-button__control' })
  protected handleControlClick(event: Event): void {
    const target = event.currentTarget;

    if (!(target instanceof HTMLButtonElement) || target.disabled) {
      return;
    }

    this.emit('nds-click');
  }
}
