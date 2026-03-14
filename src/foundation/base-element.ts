import { applyShadowStyles, escapeHtml } from '../utils/dom.js';

export type DomMode = 'shadow' | 'light';

const managedRootAttribute = 'data-nds-managed-root';
const HTMLElementBase = globalThis.HTMLElement ?? class {};

type FocusSnapshot = {
  end: number | null;
  ref: string;
  start: number | null;
};

const isTextControl = (
  value: Element | null
): value is HTMLInputElement | HTMLTextAreaElement => value instanceof HTMLInputElement || value instanceof HTMLTextAreaElement;

export abstract class NDSBaseElement extends HTMLElementBase {
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

  protected get renderRoot(): ShadowRoot | this {
    return (this.shadowRoot ?? this) as ShadowRoot | this;
  }

  protected escapeText(value: string): string {
    return escapeHtml(value);
  }

  protected captureFocusSnapshot(): FocusSnapshot | null {
    const activeElement =
      this.domMode === 'shadow'
        ? (this.shadowRoot?.activeElement as HTMLElement | null | undefined) ?? null
        : document.activeElement instanceof HTMLElement && this.contains(document.activeElement)
          ? document.activeElement
          : null;

    if (!activeElement) {
      return null;
    }

    const ref = activeElement.getAttribute('data-nds-ref');

    if (!ref) {
      return null;
    }

    return {
      end: isTextControl(activeElement) ? activeElement.selectionEnd : null,
      ref,
      start: isTextControl(activeElement) ? activeElement.selectionStart : null
    };
  }

  protected restoreFocusSnapshot(snapshot: FocusSnapshot | null, refs: Record<string, Element>): void {
    if (!snapshot) {
      return;
    }

    const nextElement = refs[snapshot.ref];

    if (!(nextElement instanceof HTMLElement)) {
      return;
    }

    nextElement.focus();

    if (isTextControl(nextElement) && snapshot.start !== null && snapshot.end !== null) {
      nextElement.setSelectionRange(snapshot.start, snapshot.end);
    }
  }

  protected collectLightDomSlotNodes(): Node[] {
    const existingSlotTarget = this.querySelector<HTMLElement>(
      `[${managedRootAttribute}] [data-nds-slot-target="default"], [${managedRootAttribute}][data-nds-slot-target="default"]`
    );

    if (existingSlotTarget) {
      return Array.from(existingSlotTarget.childNodes);
    }

    return Array.from(this.childNodes).filter(
      (node) => !(node instanceof HTMLElement && node.hasAttribute(managedRootAttribute))
    );
  }

  protected mountManagedFragment(fragment: DocumentFragment): void {
    if (this.domMode === 'shadow') {
      const shadowRoot = this.shadowRoot ?? this.attachShadow({ mode: 'open' });

      if (!this.#shadowMountPoint) {
        this.#shadowMountPoint = document.createElement('div');
        this.#shadowMountPoint.setAttribute(managedRootAttribute, '');
        shadowRoot.replaceChildren(this.#shadowMountPoint);
      }

      if (this.shadowStyles) {
        applyShadowStyles(shadowRoot, this.shadowStyles, `${this.tagName.toLowerCase()}::${this.shadowStyles}`);
      }

      this.#shadowMountPoint.replaceChildren(...Array.from(fragment.childNodes));
      return;
    }

    const childNodes = Array.from(fragment.childNodes);

    if (childNodes.length === 0) {
      this.replaceChildren();
      return;
    }

    for (const node of childNodes) {
      if (node instanceof HTMLElement) {
        node.setAttribute(managedRootAttribute, '');
      }
    }

    this.replaceChildren(...childNodes);
  }
}
