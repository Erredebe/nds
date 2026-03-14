import { NDSComponentElement, component, prop } from '../../foundation/index.js';

const headingLevels = ['1', '2', '3', '4', '5', '6'] as const;
const headingAlignments = ['left', 'center', 'right'] as const;

@component({
  defaultDomMode: 'shadow',
  stylePath: './styles.css',
  tagName: 'nds-heading',
  templatePath: './template.html'
})
export class NDSHeadingElement extends NDSComponentElement {
  @prop({ reflect: true, values: headingAlignments }) accessor align: (typeof headingAlignments)[number] = 'left';
  @prop({ reflect: true, values: headingLevels }) accessor level: (typeof headingLevels)[number] = '2';
  @prop({ reflect: true }) accessor text = '';
}
