import { applyShadowStyles, escapeHtml, htmlToFragment } from '../utils/dom.js';

export type DomMode = 'shadow' | 'light';

const managedRootAttribute = 'data-nds-managed-root';
const slotTargetAttribute = 'data-nds-slot-target';

export abstract class NDSBaseElement extends HTMLElement {
  static domMode: DomMode = 'shadow';
  static shadowStyles = '';
  static observedAttributes: string[] = [];

  #shadowMountPoint?: HTMLDivElement;

  protected get domMode(): DomMode {
    return (this.constructor as typeof NDSBaseElement).domMode;
  }

  protected get shadowStyles(): string {
    return (this.constructor as typeof NDSBaseElement).shadowStyles;
  }

  protected abstract renderShadowTemplate(): string;

  protected abstract renderLightTemplate(): string;

  protected afterRender(): void {}

  protected getDefaultSlotFallbackText(): string {
    return '';
  }

  protected escapeText(value: string): string {
    return escapeHtml(value);
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) {
      return;
    }

    this.render();
  }

  protected render(): void {
    if (this.domMode === 'shadow') {
      this.renderShadowDom();
    } else {
      this.renderLightDom();
    }

    this.afterRender();
  }

  private renderShadowDom(): void {
    const shadowRoot = this.shadowRoot ?? this.attachShadow({ mode: 'open' });

    if (!this.#shadowMountPoint) {
      this.#shadowMountPoint = document.createElement('div');
      this.#shadowMountPoint.setAttribute(managedRootAttribute, '');
      shadowRoot.replaceChildren(this.#shadowMountPoint);
    }

    if (this.shadowStyles) {
      applyShadowStyles(shadowRoot, this.shadowStyles, `${this.tagName.toLowerCase()}::${this.shadowStyles}`);
    }

    this.#shadowMountPoint.innerHTML = this.renderShadowTemplate();
  }

  private renderLightDom(): void {
    const slottedNodes = this.collectLightDomSlotNodes();
    const fragment = htmlToFragment(this.renderLightTemplate());
    const managedRoot = fragment.firstElementChild;

    if (!managedRoot) {
      this.replaceChildren();
      return;
    }

    managedRoot.setAttribute(managedRootAttribute, '');

    const slotTarget = managedRoot.querySelector<HTMLElement>(`[${slotTargetAttribute}="default"]`);

    if (slotTarget && slottedNodes.length > 0) {
      slotTarget.replaceChildren(...slottedNodes);
    } else if (slotTarget && slottedNodes.length === 0) {
      const fallbackText = this.getDefaultSlotFallbackText();

      if (fallbackText) {
        slotTarget.textContent = fallbackText;
      }
    }

    this.replaceChildren(managedRoot);
  }

  private collectLightDomSlotNodes(): Node[] {
    const managedRoot = this.querySelector<HTMLElement>(`[${managedRootAttribute}]`);
    const existingSlotTarget = managedRoot?.querySelector<HTMLElement>(`[${slotTargetAttribute}="default"]`);

    if (existingSlotTarget) {
      return Array.from(existingSlotTarget.childNodes);
    }

    return Array.from(this.childNodes).filter(
      (node) => !(node instanceof HTMLElement && node.hasAttribute(managedRootAttribute))
    );
  }
}
