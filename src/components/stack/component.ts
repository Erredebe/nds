import { NDSComponentElement, component, prop } from '../../foundation/index.js';
import { resolveSpaceValue } from '../../utils/style-values.js';

const stackAlignments = ['baseline', 'center', 'end', 'start', 'stretch'] as const;
const stackDirections = ['column', 'row'] as const;
const stackJustifyValues = ['center', 'end', 'space-around', 'space-between', 'start'] as const;

const toFlexAlignment = (value: string): string => {
  if (value === 'start') {
    return 'flex-start';
  }

  if (value === 'end') {
    return 'flex-end';
  }

  return value;
};

const applyStackStyles = (element: NDSStackElement): void => {
  element.style.setProperty('--nds-stack-gap', resolveSpaceValue(element.gap || null, 'var(--nds-spacing-3)'));
  element.style.setProperty('--nds-stack-direction', element.direction);
  element.style.setProperty('--nds-stack-align', toFlexAlignment(element.align));
  element.style.setProperty('--nds-stack-justify', toFlexAlignment(element.justify));
};

@component({
  defaultDomMode: 'shadow',
  stylePath: './styles.css',
  tagName: 'nds-stack',
  templatePath: './template.html'
})
export class NDSStackElement extends NDSComponentElement {
  @prop({ reflect: true, values: stackAlignments }) accessor align: (typeof stackAlignments)[number] = 'stretch';
  @prop({ reflect: true, values: stackDirections }) accessor direction: (typeof stackDirections)[number] = 'column';
  @prop({ reflect: true }) accessor gap = '';
  @prop({ reflect: true, values: stackJustifyValues }) accessor justify: (typeof stackJustifyValues)[number] = 'start';

  protected override rendered(): void {
    applyStackStyles(this);
  }
}
