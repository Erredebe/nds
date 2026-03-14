const styleSheetCache = new Map<string, CSSStyleSheet>();

const allowedHtmlTags = new Set([
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'i',
  'li',
  'ol',
  'p',
  'pre',
  'small',
  'span',
  'strong',
  'ul'
]);

const dropHtmlSubtreeTags = new Set(['iframe', 'math', 'object', 'script', 'style', 'svg', 'template']);

const safeUrlPattern = /^(?:https?:|mailto:|tel:|\/|#|\.?\.\/)/i;

export const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const parseHtmlDocument = (html: string): Document => {
  if (typeof DOMParser !== 'undefined') {
    return new DOMParser().parseFromString(html, 'text/html');
  }

  const documentNode = document.implementation.createHTMLDocument('nds-html');
  documentNode.body.textContent = html;
  return documentNode;
};

const sanitizeUrl = (value: string): string | null => {
  const normalized = value.trim();
  return safeUrlPattern.test(normalized) ? normalized : null;
};

const copySafeAttributes = (source: Element, target: HTMLElement): void => {
  for (const { name, value } of Array.from(source.attributes)) {
    const normalizedName = name.toLowerCase();

    if (normalizedName === 'href' && target.tagName.toLowerCase() === 'a') {
      const safeHref = sanitizeUrl(value);

      if (safeHref) {
        target.setAttribute('href', safeHref);
      }

      continue;
    }

    if (normalizedName === 'target' && target.tagName.toLowerCase() === 'a') {
      if (value === '_blank' || value === '_self' || value === '_parent' || value === '_top') {
        target.setAttribute('target', value);
      }

      continue;
    }

    if (normalizedName === 'rel' && target.tagName.toLowerCase() === 'a') {
      target.setAttribute('rel', value);
      continue;
    }

    if (normalizedName === 'title' || normalizedName === 'role' || normalizedName === 'dir' || normalizedName === 'lang') {
      target.setAttribute(normalizedName, value);
      continue;
    }

    if (normalizedName.startsWith('aria-')) {
      target.setAttribute(normalizedName, value);
    }
  }

  if (target.tagName.toLowerCase() === 'a' && target.getAttribute('target') === '_blank') {
    const rel = new Set((target.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    target.setAttribute('rel', Array.from(rel).join(' '));
  }
};

const sanitizeHtmlNode = (node: Node, ownerDocument: Document): Node[] => {
  if (node.nodeType === node.TEXT_NODE) {
    return [ownerDocument.createTextNode(node.textContent ?? '')];
  }

  if (!(node instanceof Element)) {
    return [];
  }

  const tagName = node.tagName.toLowerCase();

  if (dropHtmlSubtreeTags.has(tagName)) {
    return [];
  }

  if (!allowedHtmlTags.has(tagName)) {
    return Array.from(node.childNodes).flatMap((child) => sanitizeHtmlNode(child, ownerDocument));
  }

  const element = ownerDocument.createElement(tagName);
  copySafeAttributes(node, element);
  element.append(...Array.from(node.childNodes).flatMap((child) => sanitizeHtmlNode(child, ownerDocument)));
  return [element];
};

export const sanitizeHtmlToFragment = (html: string): DocumentFragment => {
  const parsed = parseHtmlDocument(html);
  const fragment = document.createDocumentFragment();
  fragment.append(...Array.from(parsed.body.childNodes).flatMap((node) => sanitizeHtmlNode(node, document)));
  return fragment;
};

export const htmlToFragment = (html: string): DocumentFragment => sanitizeHtmlToFragment(html);

export const setSanitizedInnerHtml = (element: Element, value: string): void => {
  element.replaceChildren(...Array.from(sanitizeHtmlToFragment(value).childNodes));
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
