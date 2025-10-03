import { dom } from './dom.js';
import { escapeHtml } from './utils.js';

const STATUS_VARIANTS = {
  loading: { variant: 'primary', spinner: true },
  error: { variant: 'danger', spinner: false },
  warn: { variant: 'warning', spinner: false },
  success: { variant: 'success', spinner: false },
  info: { variant: 'info', spinner: false },
};

export function setStatus(message, state = 'info') {
  if (!message) {
    dom.statusBox.innerHTML = '';
    return;
  }

  const config = STATUS_VARIANTS[state] || STATUS_VARIANTS.info;
  const spinnerHtml = config.spinner ? '<div class="status-spinner"></div>' : '';

  dom.statusBox.innerHTML = `
    <div class="status-message status-${config.variant}">
      ${spinnerHtml}<span>${escapeHtml(message)}</span>
    </div>
  `;
}

export function clearStatus() {
  dom.statusBox.innerHTML = '';
}
