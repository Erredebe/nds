const styleSheetCache = new Map<string, CSSStyleSheet>();

export const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export const htmlToFragment = (html: string): DocumentFragment => {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content;
};

export const applyShadowStyles = (
  shadowRoot: ShadowRoot,
  cssText: string,
  cacheKey: string
): void => {
  const rootWithAdoptedSheets = shadowRoot as ShadowRoot & {
    adoptedStyleSheets?: CSSStyleSheet[];
  };

  if ('adoptedStyleSheets' in rootWithAdoptedSheets && typeof CSSStyleSheet !== 'undefined') {
    let sheet = styleSheetCache.get(cacheKey);

    if (!sheet) {
      sheet = new CSSStyleSheet();

      if ('replaceSync' in sheet) {
        sheet.replaceSync(cssText);
      }

      styleSheetCache.set(cacheKey, sheet);
    }

    rootWithAdoptedSheets.adoptedStyleSheets = [sheet];
    return;
  }

  const existingStyleElement = shadowRoot.querySelector<HTMLStyleElement>('style[data-nds-style]');

  if (existingStyleElement) {
    existingStyleElement.textContent = cssText;
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.dataset.ndsStyle = 'true';
  styleElement.textContent = cssText;
  shadowRoot.prepend(styleElement);
};
