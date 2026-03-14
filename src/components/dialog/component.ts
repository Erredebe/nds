import { NDSComponentElement, component, prop, watch } from '../../foundation/index.js';

let dialogIdCounter = 0;

@component({
  defaultDomMode: 'shadow',
  stylePath: './styles.css',
  tagName: 'nds-dialog',
  templatePath: './template.html'
})
export class NDSDialogElement extends NDSComponentElement {
  #previousActiveElement: HTMLElement | null = null;
  readonly #titleId = `nds-dialog-title-${dialogIdCounter++}`;
  readonly #descriptionId = `nds-dialog-description-${dialogIdCounter++}`;

  @prop({ reflect: true, attribute: 'aria-label' }) accessor ariaLabel = '';
  @prop({ reflect: true }) accessor closeLabel = 'Close dialog';
  @prop({ reflect: true }) accessor description = '';
  @prop({ reflect: true, type: Boolean }) accessor dismissible = true;
  @prop({ reflect: true, type: Boolean }) accessor open = false;
  @prop({ reflect: true }) accessor title = '';

  protected dialogLabelledBy(): string | null {
    return this.title ? this.#titleId : null;
  }

  protected dialogDescribedBy(): string | null {
    return this.description ? this.#descriptionId : null;
  }

  protected handleCancel(event: Event): void {
    event.preventDefault();

    if (!this.dismissible) {
      return;
    }

    this.emit('nds-cancel');
    this.open = false;
  }

  protected handleClose(): void {
    if (this.open) {
      this.open = false;
      return;
    }
  }

  protected handleDismiss(): void {
    if (!this.dismissible) {
      return;
    }

    this.open = false;
  }

  protected override rendered(): void {
    this.syncDialogState();
  }

  @watch('open')
  protected handleOpenChanged(nextValue: unknown, previousValue: unknown): void {
    const nextOpen = Boolean(nextValue);
    const previousOpen = Boolean(previousValue);

    if (!previousOpen && nextOpen) {
      this.#previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      this.emit('nds-open');
      return;
    }

    if (previousOpen && !nextOpen) {
      this.restoreTriggerFocus();
      this.emit('nds-close');
    }
  }

  private syncDialogState(): void {
    const dialog = this.refs.dialog;

    if (!(dialog instanceof HTMLDialogElement)) {
      return;
    }

    if (this.open) {
      if (!dialog.open) {
        if (typeof dialog.showModal === 'function') {
          dialog.showModal();
        } else {
          dialog.setAttribute('open', '');
        }
      }

      return;
    }

    if (dialog.open) {
      if (typeof dialog.close === 'function') {
        dialog.close();
      }

      dialog.removeAttribute('open');
      return;
    }

    dialog.removeAttribute('open');
  }

  private restoreTriggerFocus(): void {
    if (this.#previousActiveElement && this.#previousActiveElement.isConnected) {
      this.#previousActiveElement.focus();
    }

    this.#previousActiveElement = null;
  }
}
