import { NDSComponentElement, component, prop } from '../../foundation/index.js';

const inputTypes = ['email', 'number', 'password', 'search', 'tel', 'text', 'url'] as const;

@component({
  defaultDomMode: 'shadow',
  stylePath: './styles.css',
  tagName: 'nds-input',
  templatePath: './template.html'
})
export class NDSInputElement extends NDSComponentElement {
  @prop({ reflect: true, type: Boolean }) accessor disabled = false;
  @prop({ reflect: true }) accessor label = '';
  @prop({ reflect: true }) accessor name = '';
  @prop({ reflect: true }) accessor placeholder = '';
  @prop({ reflect: true, values: inputTypes }) accessor type: (typeof inputTypes)[number] = 'text';
  @prop({ reflect: true }) accessor value = '';

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
}
