import { dom } from './dom.js';
import { selectState, updateContext } from './state.js';
import { setStatus, clearStatus } from './status.js';
import { getPlaceholder, translate } from './i18n.js';
import { hideResults } from './results.js';
import { fetchRegions, fetchOffices, fetchRegisters } from './api.js';

export function renderSelectOptions(select, placeholderText, items, config = {}) {
  const { disabled, activeValue } = config;
  const list = Array.isArray(items) ? items : [];
  const targetValue = Object.prototype.hasOwnProperty.call(config, 'activeValue')
    ? config.activeValue
    : select.value;

  select.innerHTML = '';

  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = placeholderText;
  placeholderOption.selected = true;
  select.appendChild(placeholderOption);

  list.forEach(item => {
    if (!item) return;
    const option = document.createElement('option');
    const value = item.code != null ? String(item.code) : '';
    option.value = value;
    option.textContent = item.name || item.label || value;
    select.appendChild(option);
  });

  if (list.length > 0 && list.some(item => item && String(item.code) === String(targetValue))) {
    select.value = String(targetValue);
  } else {
    select.value = '';
  }

  select.disabled = typeof disabled === 'boolean' ? disabled : list.length === 0;
}

export function resetSelectControl(select, placeholderKey, config = {}) {
  renderSelectOptions(select, getPlaceholder(placeholderKey), [], {
    activeValue: '',
    disabled: config.disabled !== false,
  });
}

export async function refreshRegions() {
  resetSelectControl(dom.regionSelect, 'selectRegion', { disabled: true });
  resetSelectControl(dom.officeSelect, 'selectOffice', { disabled: true });
  resetSelectControl(dom.registerSelect, 'selectRegister', { disabled: true });

  updateContext({ region: '', office: '', register: '', pageCode: undefined });
  selectState.currentRegion = '';
  selectState.currentOffice = '';
  hideResults();

  const token = ++selectState.tokens.regions;
  setStatus(translate('status.loadingRegions'), 'loading');

  try {
    const data = await fetchRegions();
    if (token !== selectState.tokens.regions) {
      return;
    }

    const regions = Array.isArray(data.regions) ? data.regions : [];
    renderSelectOptions(dom.regionSelect, getPlaceholder('selectRegion'), regions, {
      disabled: regions.length === 0,
    });
    dom.regionSelect.disabled = regions.length === 0;
    clearStatus();
  } catch (error) {
    if (token !== selectState.tokens.regions) {
      return;
    }
    setStatus(error.message, 'error');
  }
}

export async function refreshOffices(regionCode) {
  selectState.currentRegion = regionCode;
  selectState.currentOffice = '';

  resetSelectControl(dom.officeSelect, 'selectOffice', { disabled: true });
  resetSelectControl(dom.registerSelect, 'selectRegister', { disabled: true });
  hideResults();

  updateContext({ region: regionCode, office: '', register: '', pageCode: undefined });

  if (!regionCode) {
    dom.officeSelect.disabled = true;
    dom.registerSelect.disabled = true;
    return;
  }

  const token = ++selectState.tokens.offices;
  setStatus(translate('status.loadingOffices'), 'loading');

  try {
    const data = await fetchOffices(regionCode);
    if (token !== selectState.tokens.offices) {
      return;
    }

    const offices = Array.isArray(data.offices) ? data.offices : [];
    renderSelectOptions(dom.officeSelect, getPlaceholder('selectOffice'), offices, {
      disabled: offices.length === 0,
    });
    dom.officeSelect.disabled = offices.length === 0;
    clearStatus();
  } catch (error) {
    if (token !== selectState.tokens.offices) {
      return;
    }
    setStatus(error.message, 'error');
  }
}

export async function refreshRegisters(officeCode) {
  selectState.currentOffice = officeCode;

  resetSelectControl(dom.registerSelect, 'selectRegister', { disabled: true });
  hideResults();

  updateContext({ office: officeCode, register: '', pageCode: undefined });

  if (!officeCode) {
    dom.registerSelect.disabled = true;
    return;
  }

  const token = ++selectState.tokens.registers;
  setStatus(translate('status.loadingRegisters'), 'loading');

  try {
    const data = await fetchRegisters(officeCode);
    if (token !== selectState.tokens.registers) {
      return;
    }

    const registers = Array.isArray(data.registers) ? data.registers : [];
    renderSelectOptions(dom.registerSelect, getPlaceholder('selectRegister'), registers, {
      disabled: registers.length === 0,
    });
    dom.registerSelect.disabled = registers.length === 0;
    clearStatus();
  } catch (error) {
    if (token !== selectState.tokens.registers) {
      return;
    }
    setStatus(error.message, 'error');
  }
}
