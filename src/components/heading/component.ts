import { type DomMode, NDSComponentElement, attr, component } from '../../foundation/index.js';
import { escapeHtml } from '../../utils/dom.js';

const headingLevels = ['1', '2', '3', '4', '5', '6'] as const;
const headingAlignments = ['left', 'center', 'right'] as const;

const resolveHeadingTag = (value: string): `h${1 | 2 | 3 | 4 | 5 | 6}` =>
  headingLevels.includes(value as (typeof headingLevels)[number])
    ? (`h${value}` as `h${1 | 2 | 3 | 4 | 5 | 6}`)
    : 'h2';

@component({
  defaultDomMode: 'shadow',
  stylePath: './styles.css',
  tagName: 'nds-heading'
})
export class NDSHeadingElement extends NDSComponentElement {
  @attr.enum(headingAlignments) accessor align: (typeof headingAlignments)[number] = 'left';
  @attr.enum(headingLevels) accessor level: (typeof headingLevels)[number] = '2';
  @attr.string() accessor text = '';

  protected override renderTemplate(mode: DomMode): string {
    const fallbackText = escapeHtml(this.defaultSlotFallbackText());
    const tagName = resolveHeadingTag(this.level);
    const content =
      mode === 'shadow'
        ? `<slot>${fallbackText}</slot>`
        : `<span data-nds-slot-target="default">${fallbackText}</span>`;

    return `<${tagName} part="heading" class="nds-heading__content">${content}</${tagName}>`;
  }

  protected override defaultSlotFallbackText(): string {
    return this.text;
  }
}
