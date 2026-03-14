import { NDSComponentElement, component, prop } from '../../foundation/index.js';

const textAlignments = ['left', 'center', 'right'] as const;
const textVariants = ['body', 'caption', 'label', 'muted'] as const;
const textWeights = ['regular', 'medium', 'semibold', 'bold'] as const;

@component({
  defaultDomMode: 'shadow',
  stylePath: './styles.css',
  tagName: 'nds-text',
  templatePath: './template.html'
})
export class NDSTextElement extends NDSComponentElement {
  @prop({ reflect: true, values: textAlignments }) accessor align: (typeof textAlignments)[number] = 'left';
  @prop({ reflect: true }) accessor text = '';
  @prop({ reflect: true, values: textVariants }) accessor variant: (typeof textVariants)[number] = 'body';
  @prop({ reflect: true, values: textWeights }) accessor weight: (typeof textWeights)[number] = 'regular';
}
