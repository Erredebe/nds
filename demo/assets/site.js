const themeStorageKey = 'nds-demo-theme';

const normalizePath = (value) => value.replace(/index\.html$/, '').replace(/\/+$/, '/');

const resolveDistModuleUrl = () => {
  const meta = document.querySelector('meta[name="nds-dist-path"]');

  if (!(meta instanceof HTMLMetaElement) || !meta.content) {
    throw new Error('Missing meta[name="nds-dist-path"] for demo bootstrap.');
  }

  return new URL(meta.content, window.location.href).href;
};

const readStoredTheme = () => {
  try {
    const storedTheme = window.localStorage.getItem(themeStorageKey);

    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null;
  } catch {
    return null;
  }
};

const writeStoredTheme = (theme) => {
  try {
    window.localStorage.setItem(themeStorageKey, theme);
  } catch {
    // Ignore storage failures in non-persistent contexts.
  }
};

const updateThemeUI = (theme) => {
  document.querySelectorAll('[data-theme-label]').forEach((element) => {
    element.textContent = theme;
  });

  document.querySelectorAll('[data-theme-toggle]').forEach((element) => {
    if (element instanceof HTMLButtonElement) {
      element.setAttribute('aria-label', `Cambiar tema. Tema actual: ${theme}`);
    }
  });
};

const highlightCurrentNavItem = () => {
  const currentPath = normalizePath(window.location.pathname);

  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    if (!(link instanceof HTMLAnchorElement)) {
      return;
    }

    const linkPath = normalizePath(new URL(link.getAttribute('href') ?? '', window.location.href).pathname);

    if (currentPath === linkPath) {
      link.setAttribute('aria-current', 'page');
    }
  });
};

const appendLogEntry = (container, message) => {
  const placeholder = container.querySelector('[data-log-placeholder]');

  if (placeholder) {
    placeholder.remove();
  }

  const entry = document.createElement('div');
  const timestamp = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  entry.className = 'demo-log__entry';
  entry.textContent = `[${timestamp}] ${message}`;
  container.prepend(entry);

  while (container.childElementCount > 6) {
    container.lastElementChild?.remove();
  }
};

const bindCopyButtons = () => {
  document.querySelectorAll('[data-copy-target]').forEach((element) => {
    if (!(element instanceof HTMLButtonElement)) {
      return;
    }

    element.addEventListener('click', async () => {
      const targetId = element.getAttribute('data-copy-target');
      const target = targetId ? document.getElementById(targetId) : null;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const originalText = element.textContent ?? 'Copiar';
      const textToCopy = target.innerText.trim();

      try {
        await navigator.clipboard.writeText(textToCopy);
        element.textContent = 'Copiado';
      } catch {
        element.textContent = 'Sin acceso';
      }

      window.setTimeout(() => {
        element.textContent = originalText;
      }, 1200);
    });
  });
};

const bindDemoEventLogs = () => {
  document.querySelectorAll('[data-demo-events]').forEach((element) => {
    const logSelector = element.getAttribute('data-demo-log');
    const logContainer = logSelector ? document.querySelector(logSelector) : null;

    if (!(logContainer instanceof HTMLElement)) {
      return;
    }

    const eventNames = (element.getAttribute('data-demo-events') ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    for (const eventName of eventNames) {
      element.addEventListener(eventName, (event) => {
        let message = eventName;

        if ('detail' in event && typeof event.detail === 'object' && event.detail !== null && 'value' in event.detail) {
          message = `${message} -> ${String(event.detail.value)}`;
        }

        appendLogEntry(logContainer, message);
      });
    }
  });
};

const resolveDefineConfig = () => {
  const domMode = document.body.dataset.ndsDomMode;

  if (domMode === 'mixed-button-light') {
    return {
      button: { dom: 'light' }
    };
  }

  return {};
};

const bindThemeToggle = (setTheme) => {
  let currentTheme = readStoredTheme() ?? document.body.dataset.theme ?? 'light';

  const applyTheme = (theme) => {
    currentTheme = theme;
    setTheme(theme);
    writeStoredTheme(theme);
    updateThemeUI(theme);
  };

  applyTheme(currentTheme);

  document.querySelectorAll('[data-theme-toggle]').forEach((element) => {
    if (!(element instanceof HTMLButtonElement)) {
      return;
    }

    element.addEventListener('click', () => {
      applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    });
  });
};

const showBootstrapError = (error) => {
  console.error(error);

  const target = document.querySelector('[data-demo-error]');

  if (target instanceof HTMLElement) {
    target.hidden = false;
    target.textContent = 'No se ha podido cargar la demo. Revisa la consola para mas detalle.';
  }
};

const bootstrap = async () => {
  highlightCurrentNavItem();
  bindCopyButtons();

  const { defineAllComponents, setTheme } = await import(resolveDistModuleUrl());

  defineAllComponents(resolveDefineConfig());
  bindThemeToggle(setTheme);
  bindDemoEventLogs();

  document.documentElement.classList.add('nds-demo-ready');
};

bootstrap().catch(showBootstrapError);
