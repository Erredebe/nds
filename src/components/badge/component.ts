import { NDSComponentElement, component, prop } from '../../foundation/index.js';

const badgeEmphases = ['soft', 'solid'] as const;
const badgeTones = ['neutral', 'info', 'success', 'warning', 'danger'] as const;

@component({
  defaultDomMode: 'shadow',
  stylePath: './styles.css',
  tagName: 'nds-badge',
  templatePath: './template.html'
})
export class NDSBadgeElement extends NDSComponentElement {
  @prop({ reflect: true, values: badgeEmphases }) accessor emphasis: (typeof badgeEmphases)[number] = 'soft';
  @prop({ reflect: true }) accessor text = '';
  @prop({ reflect: true, values: badgeTones }) accessor tone: (typeof badgeTones)[number] = 'neutral';
}
