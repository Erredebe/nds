import { NDSComponentElement, component, prop, state } from '../../foundation/index.js';

const alertTones = ['info', 'success', 'warning', 'danger'] as const;
let hasWarnedDeprecatedMessageHtml = false;

export const resetAlertDeprecationWarningsForTesting = (): void => {
  hasWarnedDeprecatedMessageHtml = false;
};

@component({
  defaultDomMode: 'shadow',
  stylePath: './styles.css',
  tagName: 'nds-alert',
  templatePath: './template.html'
})
export class NDSAlertElement extends NDSComponentElement {
  @prop({ reflect: true, type: Boolean }) accessor dismissible = false;
  @prop({ reflect: true }) accessor features = '';
  @prop({ reflect: true }) accessor message = '';
  /** @deprecated Use `message`, trusted slot content, or sanitized app-level markup instead. */
  @prop({ reflect: true, attribute: 'message-html' }) accessor messageHtml = '';
  @prop({ reflect: true, values: alertTones }) accessor tone: (typeof alertTones)[number] = 'info';
  @prop({ reflect: true }) accessor title = '';

  @state({ type: Boolean }) accessor dismissed = false;

  protected featureItems(): string[] {
    return this.features
      .split('|')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  protected handleDismiss(): void {
    if (!this.dismissible || this.dismissed) {
      return;
    }

    this.dismissed = true;
    this.emit('nds-dismiss', { tone: this.tone });
  }

  protected override rendered(): void {
    this.warnDeprecatedMessageHtmlUsage();
  }

  protected iconGlyph(): string {
    if (this.tone === 'success') {
      return 'OK';
    }

    if (this.tone === 'warning') {
      return '!';
    }

    if (this.tone === 'danger') {
      return 'X';
    }

    return 'i';
  }

  protected messageMarkup(): string {
    if (this.messageHtml) {
      return this.messageHtml;
    }

    return this.escapeText(this.message);
  }

  protected roleValue(): string {
    return this.tone === 'danger' || this.tone === 'warning' ? 'alert' : 'status';
  }

  protected showCopy(): boolean {
    return Boolean(this.title || this.message || this.messageHtml || this.featureItems().length > 0 || this.innerHTML.trim());
  }

  private warnDeprecatedMessageHtmlUsage(): void {
    if (!this.messageHtml || hasWarnedDeprecatedMessageHtml || typeof console === 'undefined' || typeof console.warn !== 'function') {
      return;
    }

    hasWarnedDeprecatedMessageHtml = true;
    console.warn(
      '[no-dep-ds] `nds-alert[message-html]` is deprecated and will be removed in a future release. Prefer `message` or slot content.'
    );
  }
}
