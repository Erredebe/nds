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

const bindAlertPlayground = () => {
  const target = document.querySelector('#alert-playground');
  const status = document.querySelector('[data-alert-demo-status]');

  if (!(target instanceof HTMLElement) || !(status instanceof HTMLElement)) {
    return;
  }

  const initialFeatures = target.getAttribute('features') ?? '';
  const initialMessage = target.getAttribute('message') ?? '';
  const updateStatus = () => {
    const features = (target.getAttribute('features') ?? '').split('|').filter(Boolean);
    const keys = Array.from(target.shadowRoot?.querySelectorAll('[data-nds-key]') ?? target.querySelectorAll('[data-nds-key]')).map(
      (element) => element.getAttribute('data-nds-key') ?? ''
    );

    status.replaceChildren();
    appendLogEntry(status, `features -> ${features.join(' | ') || 'none'}`);
    appendLogEntry(status, `keys -> ${keys.join(' | ') || 'none'}`);
  };

  const replaceSets = [
    ['Check dashboards', 'Post changelog', 'Confirm rollback owner'],
    ['Warm caches', 'Ping support', 'Archive snapshot']
  ];
  let replaceIndex = 0;

  document.querySelectorAll('[data-alert-demo-action]').forEach((element) => {
    if (!(element instanceof HTMLButtonElement)) {
      return;
    }

    element.addEventListener('click', () => {
      const action = element.dataset.alertDemoAction;
      const current = (target.getAttribute('features') ?? '').split('|').filter(Boolean);

      if (action === 'shuffle') {
        target.setAttribute('features', [...current].reverse().join('|'));
      }

      if (action === 'replace') {
        target.setAttribute('features', replaceSets[replaceIndex % replaceSets.length].join('|'));
        target.setAttribute('message', `Lista reemplazada ${replaceIndex + 1}.`);
        replaceIndex += 1;
      }

      if (action === 'reset') {
        target.setAttribute('features', initialFeatures);
        target.setAttribute('message', initialMessage);
      }

      window.requestAnimationFrame(updateStatus);
    });
  });

  updateStatus();
};

const bindHomeDemo = () => {
  const form = document.querySelector('[data-home-demo-form]');
  const submitButton = document.querySelector('[data-home-demo-submit]');
  const dialogButton = document.querySelector('[data-home-demo-dialog-open]');
  const dialog = document.querySelector('#home-adoption-dialog');
  const alert = document.querySelector('#home-adoption-alert');
  const stackBadge = document.querySelector('#home-stack-badge');
  const teamBadge = document.querySelector('#home-team-badge');
  const summary = document.querySelector('#home-adoption-summary');
  const log = document.querySelector('#home-event-log');

  if (
    !(form instanceof HTMLFormElement) ||
    !(submitButton instanceof HTMLElement) ||
    !(dialogButton instanceof HTMLElement) ||
    !(dialog instanceof HTMLElement) ||
    !(alert instanceof HTMLElement) ||
    !(stackBadge instanceof HTMLElement) ||
    !(teamBadge instanceof HTMLElement) ||
    !(summary instanceof HTMLElement) ||
    !(log instanceof HTMLElement)
  ) {
    return;
  }

  const email = form.querySelector('nds-input[name="email"]');
  const team = form.querySelector('nds-select[name="team"]');
  const stack = form.querySelector('nds-radio-group[name="stack"]');
  const notes = form.querySelector('nds-textarea[name="notes"]');
  const updates = form.querySelector('nds-checkbox[name="updates"]');

  if (!email || !team || !stack || !notes || !updates) {
    return;
  }

  const teamLabels = {
    growth: 'Growth',
    ops: 'Operations',
    platform: 'Platform',
    product: 'Product'
  };
  const stackLabels = {
    astro: 'Astro',
    html: 'HTML',
    react: 'React',
    vue: 'Vue'
  };

  const readState = () => {
    const teamValue = team.value || 'platform';
    const stackValue = stack.value || 'astro';

    return {
      email: email.value || '',
      notes: notes.value || '',
      stackLabel: stackLabels[stackValue] ?? stackValue,
      teamLabel: teamLabels[teamValue] ?? teamValue,
      updatesRequested: Boolean(updates.checked)
    };
  };

  const renderSummary = (items) => {
    summary.replaceChildren(
      ...items.map((item) => {
        const element = document.createElement('li');
        element.textContent = item;
        return element;
      })
    );
  };

  const renderState = (mode = 'preview') => {
    const state = readState();
    const hasEmail = state.email.trim().length > 0;

    stackBadge.textContent = `Stack: ${state.stackLabel}`;
    teamBadge.textContent = `Team: ${state.teamLabel}`;

    if (!hasEmail) {
      alert.setAttribute('tone', 'warning');
      alert.setAttribute('title', 'Falta una pieza minima para arrancar');
      alert.setAttribute('message', 'Completa un email de equipo y podras simular una primera adopcion multi-stack.');
      alert.setAttribute('features', 'Integracion gradual|Contrato estable|Sin runtime extra');
      renderSummary([
        'Email de equipo: pendiente',
        `Equipo principal: ${state.teamLabel}`,
        `Stack prioritario: ${state.stackLabel}`,
        `Guia multi-stack: ${state.updatesRequested ? 'solicitada' : 'no solicitada'}`
      ]);
      return;
    }

    const shortNotes = state.notes.trim().slice(0, 88) || 'Sin notas adicionales.';

    if (mode === 'submitted') {
      alert.setAttribute('tone', 'success');
      alert.setAttribute('title', 'Listo para una primera integracion');
      alert.setAttribute(
        'message',
        `El mismo paquete puede arrancar en ${state.stackLabel} y mantenerse util para mas equipos sin rehacer la UI base.`
      );
      alert.setAttribute(
        'features',
        [
          `Team ${state.teamLabel}`,
          `Stack ${state.stackLabel}`,
          state.updatesRequested ? 'Guia solicitada' : 'Integracion autonoma'
        ].join('|')
      );
      renderSummary([
        `Email de equipo: ${state.email}`,
        `Equipo principal: ${state.teamLabel}`,
        `Stack prioritario: ${state.stackLabel}`,
        `Contexto: ${shortNotes}`,
        `Guia multi-stack: ${state.updatesRequested ? 'solicitada' : 'no solicitada'}`
      ]);
      appendLogEntry(log, `adoption-ready -> ${state.teamLabel} / ${state.stackLabel}`);
      return;
    }

    alert.setAttribute('tone', 'info');
    alert.setAttribute('title', 'Preview de adopcion portable');
    alert.setAttribute(
      'message',
      `Reutiliza la misma base visual para ${state.teamLabel} sin cambiar de design system cuando cambie el stack.`
    );
    alert.setAttribute('features', [`Stack ${state.stackLabel}`, 'Zero runtime deps', 'Shadow or light DOM'].join('|'));
    renderSummary([
      `Email de equipo: ${state.email}`,
      `Equipo principal: ${state.teamLabel}`,
      `Stack prioritario: ${state.stackLabel}`,
      `Guia multi-stack: ${state.updatesRequested ? 'solicitada' : 'no solicitada'}`
    ]);
  };

  const handleLiveUpdate = () => {
    renderState();
  };

  for (const element of [email, team, stack, notes, updates]) {
    element.addEventListener('nds-input', handleLiveUpdate);
    element.addEventListener('nds-change', handleLiveUpdate);
  }

  submitButton.addEventListener('nds-click', (event) => {
    event.preventDefault();
    renderState('submitted');
  });

  dialogButton.addEventListener('nds-click', (event) => {
    event.preventDefault();
    dialog.open = true;
  });

  form.addEventListener('reset', () => {
    window.setTimeout(() => {
      renderState();
      appendLogEntry(log, 'demo-reset');
    }, 0);
  });

  renderState();
};

const bindDialogDemos = () => {
  document.querySelectorAll('[data-dialog-demo-action]').forEach((element) => {
    const selector = element.getAttribute('data-dialog-demo-target');
    const target = selector ? document.querySelector(selector) : null;

    if (!(element instanceof HTMLElement) || !(target instanceof HTMLElement)) {
      return;
    }

    const applyAction = () => {
      const action = element.getAttribute('data-dialog-demo-action');

      if (action === 'open') {
        target.open = true;
      }

      if (action === 'close') {
        target.open = false;
      }

      if (action === 'toggle') {
        target.open = !target.open;
      }
    };

    if (element.tagName === 'NDS-BUTTON') {
      element.addEventListener('nds-click', applyAction);
      return;
    }

    element.addEventListener('click', applyAction);
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
  bindAlertPlayground();
  bindHomeDemo();
  bindDialogDemos();

  document.documentElement.classList.add('nds-demo-ready');
};

bootstrap().catch(showBootstrapError);
