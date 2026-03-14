import { type DomMode, NDSComponentElement, attr, component } from '../../foundation/index.js';
import { resolveRadiusValue, resolveSpaceValue } from '../../utils/style-values.js';

const boxSurfaces = ['accent', 'subtle', 'transparent'] as const;

const applyBoxStyles = (element: NDSBoxElement): void => {
  element.style.setProperty('--nds-box-padding', resolveSpaceValue(element.padding || null));
  element.style.setProperty('--nds-box-radius', resolveRadiusValue(element.radius || null));

  const surface = boxSurfaces.includes(element.surface) ? element.surface : 'transparent';

  if (surface === 'subtle') {
    element.style.setProperty('--nds-box-background', 'var(--nds-component-box-subtle-background)');
    element.style.setProperty('--nds-box-border', '1px solid var(--nds-color-border)');
    return;
  }

  if (surface === 'accent') {
    element.style.setProperty('--nds-box-background', 'var(--nds-component-box-accent-background)');
    element.style.setProperty('--nds-box-border', '1px solid var(--nds-color-accent)');
    return;
  }

  element.style.setProperty('--nds-box-background', 'transparent');
  element.style.setProperty('--nds-box-border', '0 solid transparent');
};

@component({
  defaultDomMode: 'shadow',
  stylePath: './styles.css',
  tagName: 'nds-box'
})
export class NDSBoxElement extends NDSComponentElement {
  @attr.string() accessor padding = '';
  @attr.string() accessor radius = '';
  @attr.enum(boxSurfaces) accessor surface: (typeof boxSurfaces)[number] = 'transparent';

  protected override renderTemplate(mode: DomMode): string {
    const content =
      mode === 'shadow'
        ? '<slot></slot>'
        : '<div part="content" class="nds-box__content" data-nds-slot-target="default"></div>';

    return `
      <div part="container" class="nds-box__container">
        ${content}
      </div>
    `.trim();
  }

  protected override rendered(): void {
    applyBoxStyles(this);
  }
}
