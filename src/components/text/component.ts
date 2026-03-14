import { type DomMode, NDSComponentElement, attr, component } from '../../foundation/index.js';
import { escapeHtml } from '../../utils/dom.js';

const textAlignments = ['left', 'center', 'right'] as const;
const textVariants = ['body', 'caption', 'label', 'muted'] as const;
const textWeights = ['regular', 'medium', 'semibold', 'bold'] as const;

@component({
  defaultDomMode: 'shadow',
  stylePath: './styles.css',
  tagName: 'nds-text'
})
export class NDSTextElement extends NDSComponentElement {
  @attr.enum(textAlignments) accessor align: (typeof textAlignments)[number] = 'left';
  @attr.string() accessor text = '';
  @attr.enum(textVariants) accessor variant: (typeof textVariants)[number] = 'body';
  @attr.enum(textWeights) accessor weight: (typeof textWeights)[number] = 'regular';

  protected override renderTemplate(mode: DomMode): string {
    const fallbackText = escapeHtml(this.defaultSlotFallbackText());
    const content =
      mode === 'shadow'
        ? `<slot>${fallbackText}</slot>`
        : `<span data-nds-slot-target="default">${fallbackText}</span>`;

    return `<p part="text" class="nds-text__content">${content}</p>`;
  }

  protected override defaultSlotFallbackText(): string {
    return this.text;
  }
}
