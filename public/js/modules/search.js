import { dom } from './dom.js';
import { translate } from './i18n.js';
import { setStatus, clearStatus } from './status.js';
import { updateContext } from './state.js';
import { searchProcesses } from './api.js';
import { showResults, hideResults } from './results.js';

export async function performSearch() {
  const formData = {
    region: dom.regionSelect?.value,
    office: dom.officeSelect?.value,
    register: dom.registerSelect?.value,
    numero: dom.numeroInput?.value,
    anno: dom.annoInput?.value,
  };

  if (!formData.region || !formData.office || !formData.register || !formData.numero || !formData.anno) {
    setStatus(translate('status.missingFields'), 'warn');
    return;
  }

  setStatus(translate('status.searching'), 'loading');
  if (dom.searchButton) dom.searchButton.disabled = true;
  if (dom.searchButtonLabel) dom.searchButtonLabel.textContent = translate('status.searching');

  try {
    const data = await searchProcesses(formData);

    updateContext({
      region: formData.region,
      office: formData.office,
      register: formData.register,
      pageCode: data.pageCode || undefined,
    });

    clearStatus();
    showResults(data.results || []);

    if (!data.results || data.results.length === 0) {
      setStatus(data.message || translate('status.noResults'), 'info');
    }
  } catch (error) {
    setStatus(error.message, 'error');
    hideResults();
  } finally {
    if (dom.searchButton) dom.searchButton.disabled = false;
    if (dom.searchButtonLabel) dom.searchButtonLabel.textContent = translate('ui.buttons.search');
  }
}
