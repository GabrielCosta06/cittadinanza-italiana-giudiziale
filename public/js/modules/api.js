import { translate } from './i18n.js';

export async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (_err) {
      throw new Error(translate('status.invalidResponse'));
    }
  }

  if (!response.ok) {
    const message = data && data.error ? data.error : `${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return data;
}

export function fetchRegions() {
  return fetchJson('/api/regions');
}

export function fetchOffices(regionCode) {
  return fetchJson(`/api/offices?region=${encodeURIComponent(regionCode)}`);
}

export function fetchRegisters(officeCode) {
  return fetchJson(`/api/registers?office=${encodeURIComponent(officeCode)}`);
}

export function searchProcesses(payload) {
  return fetchJson('/api/search/ruolo-generale', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function fetchProcessDetail(payload) {
  return fetchJson('/api/search/ruolo-generale/detail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}
