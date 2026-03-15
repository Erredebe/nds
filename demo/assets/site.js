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

const ensureLiveAnnouncer = () => {
  let announcer = document.querySelector('[data-demo-announcer]');

  if (announcer instanceof HTMLElement) {
    return announcer;
  }

  announcer = document.createElement('div');
  announcer.className = 'sr-only';
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.setAttribute('data-demo-announcer', '');
  document.body.append(announcer);
  return announcer;
};

const announce = (message) => {
  const announcer = ensureLiveAnnouncer();

  announcer.textContent = '';

  window.setTimeout(() => {
    announcer.textContent = message;
  }, 20);
};

const pulseElement = (element) => {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  element.classList.remove('is-updated');
  window.requestAnimationFrame(() => {
    element.classList.add('is-updated');
    window.setTimeout(() => {
      element.classList.remove('is-updated');
    }, 900);
  });
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

const workspaceStorageKey = 'nds-demo-workspace-draft-v2';

const bindWorkspaceDemos = () => {
  document.querySelectorAll('[data-workspace-demo]').forEach((container) => {
    const form = container.querySelector('form');
    const submitButton = container.querySelector('[data-workspace-submit]');
    const timeoutButton = container.querySelector('[data-workspace-force-timeout]');
    const dialogButton = container.querySelector('[data-workspace-dialog-open]');
    const resetButton = container.querySelector('[data-workspace-reset]');
    const dialog = container.querySelector('#home-adoption-dialog');
    const alert = container.querySelector('#home-adoption-alert');
    const stateBadge = container.querySelector('#home-state-badge');
    const stackBadge = container.querySelector('#home-stack-badge');
    const teamBadge = container.querySelector('#home-team-badge');
    const scenarioBadge = container.querySelector('#home-scenario-badge');
    const summary = container.querySelector('#home-adoption-summary');
    const log = container.querySelector('.demo-log');
    const payloadPreview = container.querySelector('#home-payload-preview code');
    const draftStatus = container.querySelector('#home-draft-status');
    const resultStatus = container.querySelector('#home-result-status');

    if (
      !(form instanceof HTMLFormElement) ||
      !(submitButton instanceof HTMLElement) ||
      !(timeoutButton instanceof HTMLElement) ||
      !(dialogButton instanceof HTMLElement) ||
      !(resetButton instanceof HTMLButtonElement) ||
      !(dialog instanceof HTMLElement) ||
      !(alert instanceof HTMLElement) ||
      !(stateBadge instanceof HTMLElement) ||
      !(stackBadge instanceof HTMLElement) ||
      !(teamBadge instanceof HTMLElement) ||
      !(scenarioBadge instanceof HTMLElement) ||
      !(summary instanceof HTMLElement) ||
      !(log instanceof HTMLElement) ||
      !(payloadPreview instanceof HTMLElement) ||
      !(draftStatus instanceof HTMLElement) ||
      !(resultStatus instanceof HTMLElement)
    ) {
      return;
    }

    const email = form.querySelector('nds-input[name="email"]');
    const team = form.querySelector('nds-select[name="team"]');
    const stack = form.querySelector('nds-radio-group[name="stack"]');
    const domMode = form.querySelector('nds-select[name="domMode"]');
    const scenario = form.querySelector('nds-select[name="scenario"]');
    const notes = form.querySelector('nds-textarea[name="notes"]');
    const updates = form.querySelector('nds-checkbox[name="updates"]');

    if (!email || !team || !stack || !domMode || !scenario || !notes || !updates) {
      return;
    }

    const defaults = {
      email: email.value || '',
      team: team.value || 'platform',
      stack: stack.value || 'astro',
      domMode: domMode.value || 'shadow',
      scenario: scenario.value || 'success',
      notes: notes.value || '',
      updates: Boolean(updates.checked)
    };

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
    const domModeLabels = {
      light: 'Light para host styles',
      mixed: 'Mixed por componente',
      shadow: 'Shadow por defecto'
    };
    const scenarioLabels = {
      approval: 'Bloqueo por aprobacion',
      success: 'Happy path con validacion',
      timeout: 'Timeout con retry'
    };

    let lastOutcome = 'pending';
    let isBusy = false;

    const setBusy = (value) => {
      isBusy = value;

      for (const element of [submitButton, timeoutButton, dialogButton]) {
        if (value) {
          element.setAttribute('disabled', '');
        } else {
          element.removeAttribute('disabled');
        }
      }
    };

    const readState = () => {
      const teamValue = team.value || defaults.team;
      const stackValue = stack.value || defaults.stack;
      const domModeValue = domMode.value || defaults.domMode;
      const scenarioValue = scenario.value || defaults.scenario;

      return {
        domMode: domModeValue,
        domModeLabel: domModeLabels[domModeValue] ?? domModeValue,
        email: email.value || '',
        notes: notes.value || '',
        scenario: scenarioValue,
        scenarioLabel: scenarioLabels[scenarioValue] ?? scenarioValue,
        stack: stackValue,
        stackLabel: stackLabels[stackValue] ?? stackValue,
        team: teamValue,
        teamLabel: teamLabels[teamValue] ?? teamValue,
        updatesRequested: Boolean(updates.checked)
      };
    };

    const persistDraft = (state) => {
      if (!state.updatesRequested) {
        window.localStorage.removeItem(workspaceStorageKey);
        draftStatus.textContent = 'Persistencia desactivada por el usuario.';
        return;
      }

      window.localStorage.setItem(
        workspaceStorageKey,
        JSON.stringify({
          domMode: state.domMode,
          email: state.email,
          notes: state.notes,
          scenario: state.scenario,
          stack: state.stack,
          team: state.team,
          updates: state.updatesRequested
        })
      );
      draftStatus.textContent = 'Guardado automaticamente en localStorage.';
    };

    const restoreDraft = () => {
      try {
        const raw = window.localStorage.getItem(workspaceStorageKey);

        if (!raw) {
          return false;
        }

        const draft = JSON.parse(raw);

        email.value = draft.email ?? defaults.email;
        team.value = draft.team ?? defaults.team;
        stack.value = draft.stack ?? defaults.stack;
        domMode.value = draft.domMode ?? defaults.domMode;
        scenario.value = draft.scenario ?? defaults.scenario;
        notes.value = draft.notes ?? defaults.notes;
        updates.checked = Boolean(draft.updates ?? defaults.updates);
        draftStatus.textContent = 'Draft restaurado tras la ultima sesion.';
        appendLogEntry(log, 'draft-restored');
        return true;
      } catch {
        return false;
      }
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

    const renderPayload = (state, status) => {
      payloadPreview.textContent = JSON.stringify(
        {
          deployment: {
            domMode: state.domMode,
            draftPersistence: state.updatesRequested,
            ownerEmail: state.email,
            scenario: state.scenario,
            stack: state.stack,
            status,
            team: state.team
          },
          notes: state.notes.trim()
        },
        null,
        2
      );
    };

    const validateState = (state) => {
      if (!state.email.includes('@')) {
        return 'Necesitas un email valido para asignar ownership al rollout.';
      }

      if (state.notes.trim().length < 24) {
        return 'Describe un contexto de integracion un poco mas real para que la simulacion tenga sentido.';
      }

      return null;
    };

    const renderState = (mode = 'draft', overrideScenario) => {
      const state = readState();
      const activeScenario = overrideScenario ?? state.scenario;
      const validationError = validateState(state);

      stackBadge.textContent = `Stack: ${state.stackLabel}`;
      teamBadge.textContent = `Team: ${state.teamLabel}`;
      scenarioBadge.textContent = `Escenario: ${scenarioLabels[activeScenario] ?? activeScenario}`;
      summary.setAttribute('aria-live', 'polite');
      log.setAttribute('aria-live', 'polite');
      log.setAttribute('aria-atomic', 'false');
      payloadPreview.parentElement?.setAttribute('aria-live', 'polite');

      persistDraft(state);

      if (validationError) {
        stateBadge.setAttribute('tone', 'warning');
        stateBadge.textContent = 'Estado: Revisar input';
        alert.setAttribute('tone', 'warning');
        alert.setAttribute('title', 'Faltan datos para una simulacion creible');
        alert.setAttribute('message', validationError);
        alert.setAttribute('features', 'Validacion previa|Contrato estable|Sin perder draft');
        resultStatus.textContent = 'Pendiente de correccion antes de ejecutar.';
        renderSummary([
          `Email owner: ${state.email || 'pendiente'}`,
          `Equipo owner: ${state.teamLabel}`,
          `Stack prioritario: ${state.stackLabel}`,
          `Modo DOM: ${state.domModeLabel}`,
          `Escenario: ${scenarioLabels[activeScenario] ?? activeScenario}`
        ]);
        renderPayload(state, 'needs_input');
        announce('La simulacion necesita mas datos antes de ejecutarse.');
        return false;
      }

      const shortNotes = state.notes.trim().slice(0, 92);
      renderSummary([
        `Email owner: ${state.email}`,
        `Equipo owner: ${state.teamLabel}`,
        `Stack prioritario: ${state.stackLabel}`,
        `Modo DOM: ${state.domModeLabel}`,
        `Escenario: ${scenarioLabels[activeScenario] ?? activeScenario}`,
        `Contexto: ${shortNotes}`
      ]);

      if (mode === 'loading') {
        form.setAttribute('aria-busy', 'true');
        stateBadge.setAttribute('tone', 'warning');
        stateBadge.textContent = 'Estado: Ejecutando';
        alert.setAttribute('tone', 'info');
        alert.setAttribute('title', 'Simulacion en curso');
        alert.setAttribute('message', `Validando rollout para ${state.teamLabel} en ${state.stackLabel} con modo ${state.domMode}.`);
        alert.setAttribute('features', 'Payload preparado|Eventos del host|Esperando resultado');
        resultStatus.textContent = 'Simulacion en progreso.';
        renderPayload(state, 'loading');
        pulseElement(stateBadge);
        pulseElement(alert);
        announce(`Simulacion en curso para ${state.teamLabel} en ${state.stackLabel}.`);
        return true;
      }

      form.setAttribute('aria-busy', 'false');

      if (mode === 'success') {
        stateBadge.setAttribute('tone', 'success');
        stateBadge.textContent = 'Estado: Rollout valido';
        alert.setAttribute('tone', 'success');
        alert.setAttribute('title', 'Rollout listo para la primera ola');
        alert.setAttribute(
          'message',
          `El paquete queda listo para ${state.stackLabel} y mantiene una historia coherente para otros equipos sin rehacer el DS.`
        );
        alert.setAttribute('features', ['Validacion OK', `DOM ${state.domMode}`, 'Contrato publico'].join('|'));
        resultStatus.textContent = 'Simulacion completada con exito.';
        renderPayload(state, 'ready');
        lastOutcome = 'success';
        pulseElement(stateBadge);
        pulseElement(alert);
        announce('Simulacion completada con exito. El rollout queda listo para la primera ola.');
        return true;
      }

      if (mode === 'error' && activeScenario === 'timeout') {
        stateBadge.setAttribute('tone', 'danger');
        stateBadge.textContent = 'Estado: Timeout';
        alert.setAttribute('tone', 'warning');
        alert.setAttribute('title', 'Timeout recuperable en el rollout');
        alert.setAttribute('message', 'El host conserva el draft y propone retry sin obligarte a rehacer la configuracion.');
        alert.setAttribute('features', 'Draft persistido|Retry sugerido|Sin perdida de contexto');
        resultStatus.textContent = 'Error recuperable: reintentar o ajustar el host.';
        renderPayload(state, 'timeout');
        lastOutcome = 'timeout';
        pulseElement(stateBadge);
        pulseElement(alert);
        announce('La simulacion ha terminado con timeout recuperable.');
        return true;
      }

      if (mode === 'error' && activeScenario === 'approval') {
        stateBadge.setAttribute('tone', 'warning');
        stateBadge.textContent = 'Estado: Pendiente de aprobacion';
        alert.setAttribute('tone', 'warning');
        alert.setAttribute('title', 'El rollout queda bloqueado por governance');
        alert.setAttribute('message', 'No falla el componente: falla la aprobacion. El host puede explicarlo sin perder el payload.');
        alert.setAttribute('features', 'Payload intacto|Handoff claro|Siguiente paso visible');
        resultStatus.textContent = 'Esperando aprobacion de seguridad o plataforma.';
        renderPayload(state, 'awaiting_approval');
        lastOutcome = 'approval';
        pulseElement(stateBadge);
        pulseElement(alert);
        announce('La simulacion requiere aprobacion antes del rollout.');
        return true;
      }

      stateBadge.setAttribute('tone', 'info');
      stateBadge.textContent = 'Estado: Draft';
      alert.setAttribute('tone', 'info');
      alert.setAttribute('title', 'Draft listo para validar');
      alert.setAttribute('message', 'El flujo mantiene contexto, payload y decision tree antes de ejecutar la simulacion.');
      alert.setAttribute('features', 'Persistencia local|Eventos del host|Sin runtime extra');
      resultStatus.textContent = lastOutcome === 'pending' ? 'Pendiente de simulacion.' : `Ultimo resultado: ${lastOutcome}.`;
      renderPayload(state, 'draft');
      return true;
    };

    const runSimulation = (forcedScenario) => {
      if (isBusy) {
        return;
      }

      if (forcedScenario) {
        scenario.value = forcedScenario;
      }

      const canProceed = renderState('draft', forcedScenario);

      if (!canProceed) {
        appendLogEntry(log, 'simulation-blocked -> invalid-input');
        return;
      }

      const state = readState();
      const activeScenario = forcedScenario ?? state.scenario;

      setBusy(true);
      renderState('loading', activeScenario);
      appendLogEntry(log, `simulation-start -> ${state.teamLabel} / ${state.stackLabel} / ${activeScenario}`);

      window.setTimeout(() => {
        if (activeScenario === 'success') {
          renderState('success', activeScenario);
          appendLogEntry(log, `simulation-success -> ${state.domMode}`);
        } else {
          renderState('error', activeScenario);
          appendLogEntry(log, `simulation-${activeScenario} -> recovery-required`);
        }

        setBusy(false);
      }, 900);
    };

    const handleLiveUpdate = () => {
      renderState();
    };

    for (const element of [email, team, stack, domMode, scenario, notes, updates]) {
      element.addEventListener('nds-input', handleLiveUpdate);
      element.addEventListener('nds-change', handleLiveUpdate);
    }

    submitButton.addEventListener('nds-click', (event) => {
      event.preventDefault();
      runSimulation();
    });

    timeoutButton.addEventListener('nds-click', (event) => {
      event.preventDefault();
      runSimulation('timeout');
    });

    dialogButton.addEventListener('nds-click', (event) => {
      event.preventDefault();
      dialog.open = true;
    });

    resetButton.addEventListener('click', () => {
      email.value = defaults.email;
      team.value = defaults.team;
      stack.value = defaults.stack;
      domMode.value = defaults.domMode;
      scenario.value = defaults.scenario;
      notes.value = defaults.notes;
      updates.checked = defaults.updates;
      window.localStorage.removeItem(workspaceStorageKey);
      draftStatus.textContent = 'Draft eliminado. Se restauran los valores iniciales.';
      lastOutcome = 'pending';
      renderState();
      appendLogEntry(log, 'draft-reset');
      announce('Draft eliminado y valores iniciales restaurados.');
    });

    restoreDraft();
    renderState();
  });
};

const bindOpsConsoleDemos = () => {
  document.querySelectorAll('[data-ops-demo]').forEach((container) => {
    const alert = container.querySelector('#ops-alert');
    const statusBadge = container.querySelector('#ops-status-badge');
    const severityBadge = container.querySelector('#ops-severity-badge');
    const checklist = container.querySelector('#ops-checklist');
    const log = container.querySelector('#ops-event-log');
    const dialog = container.querySelector('#ops-war-room-dialog');

    if (
      !(alert instanceof HTMLElement) ||
      !(statusBadge instanceof HTMLElement) ||
      !(severityBadge instanceof HTMLElement) ||
      !(checklist instanceof HTMLElement) ||
      !(log instanceof HTMLElement) ||
      !(dialog instanceof HTMLElement)
    ) {
      return;
    }

    const renderChecklist = (items) => {
      checklist.replaceChildren(
        ...items.map((item) => {
          const element = document.createElement('li');
          element.textContent = item;
          return element;
        })
      );
    };

    const applyState = (mode) => {
      log.setAttribute('aria-live', 'polite');

      if (mode === 'ack') {
        statusBadge.setAttribute('tone', 'info');
        statusBadge.textContent = 'Estado: Acknowledged';
        alert.setAttribute('tone', 'info');
        alert.setAttribute('title', 'Incidente reconocido por el equipo on-call');
        alert.setAttribute('message', 'La consola registra ownership y prepara rollback sin perder el contexto del incidente.');
        alert.setAttribute('features', 'Owner asignado|War room abierta|Rollback listo');
        renderChecklist([
          'Incidente reconocido por on-call.',
          'War room preparada para producto, ops y soporte.',
          'Rollback disponible como siguiente paso.',
          'Comunicacion externa en preparacion.'
        ]);
        appendLogEntry(log, 'ops-acknowledged');
        pulseElement(statusBadge);
        pulseElement(alert);
        announce('Incidente reconocido por el equipo on-call.');
        return;
      }

      if (mode === 'rollback') {
        statusBadge.setAttribute('tone', 'warning');
        statusBadge.textContent = 'Estado: Rollback en progreso';
        severityBadge.setAttribute('tone', 'warning');
        severityBadge.textContent = 'Severidad: Contenida';
        alert.setAttribute('tone', 'warning');
        alert.setAttribute('title', 'Rollback iniciado');
        alert.setAttribute('message', 'La UI mantiene el estado del incidente mientras se ejecuta la mitigacion.');
        alert.setAttribute('features', 'Rollback activo|Dashboards en revision|Soporte informado');
        renderChecklist([
          'Rollback lanzado sobre la release afectada.',
          'Dashboards observados para confirmar recuperacion.',
          'Soporte informado con mensaje temporal.',
          'Postmortem pendiente al cerrar el incidente.'
        ]);
        appendLogEntry(log, 'ops-rollback-started');
        pulseElement(statusBadge);
        pulseElement(alert);
        announce('Rollback iniciado para contener el incidente.');
        return;
      }

      if (mode === 'resolve') {
        statusBadge.setAttribute('tone', 'success');
        statusBadge.textContent = 'Estado: Resuelto';
        severityBadge.setAttribute('tone', 'success');
        severityBadge.textContent = 'Severidad: Mitigada';
        alert.setAttribute('tone', 'success');
        alert.setAttribute('title', 'Incidente resuelto');
        alert.setAttribute('message', 'Los componentes dejan una salida clara hacia comunicacion final y aprendizaje operativo.');
        alert.setAttribute('features', 'Servicio estable|Comunicacion cerrada|Postmortem abierto');
        renderChecklist([
          'Rollback verificado y servicio estable.',
          'Comunicacion externa cerrada.',
          'Postmortem agendado con owners claros.',
          'Acciones preventivas pendientes de priorizar.'
        ]);
        appendLogEntry(log, 'ops-resolved');
        pulseElement(statusBadge);
        pulseElement(alert);
        announce('Incidente resuelto y comunicacion cerrada.');
      }
    };

    container.querySelectorAll('[data-ops-action]').forEach((element) => {
      if (!(element instanceof HTMLElement)) {
        return;
      }

      element.addEventListener('nds-click', () => {
        applyState(element.dataset.opsAction ?? 'ack');
      });
    });

    const dialogButton = container.querySelector('[data-ops-dialog-open]');

    if (dialogButton instanceof HTMLElement) {
      dialogButton.addEventListener('nds-click', () => {
        dialog.open = true;
        appendLogEntry(log, 'ops-war-room-opened');
        announce('War room abierta para coordinacion de incidente.');
      });
    }
  });
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
  bindWorkspaceDemos();
  bindOpsConsoleDemos();
  bindDialogDemos();

  document.documentElement.classList.add('nds-demo-ready');
};

bootstrap().catch(showBootstrapError);
