import { dom } from './dom.js';
import { getContext, updateContext, getResults } from './state.js';
import { setStatus } from './status.js';
import { translate } from './i18n.js';
import { fetchProcessDetail } from './api.js';
import { escapeHtml } from './utils.js';
import { openModal } from './modal.js';

function normalizeDetailPayload(detail) {
  const source = detail && typeof detail === 'object' ? detail : {};
  const generalSource =
    source.general && typeof source.general === 'object' ? source.general : {};
  const flattened = { ...generalSource };

  const candidateKeys = [
    'numeroRuoloGenerale',
    'ritualita',
    'oggettoDelFascicolo',
    'giudice',
    'sezione',
    'dataIscrizioneARuolo',
    'dataCitazione',
    'dataProssimaUdienza',
    'sentenza',
    'decretoIngiuntivo',
    'statoDelFascicolo',
    'numero',
    'anno',
  ];

  candidateKeys.forEach(key => {
    if (source[key] != null && flattened[key] == null) {
      flattened[key] = source[key];
    }
  });

  const partyTypes = Array.isArray(source.partyTypes)
    ? source.partyTypes
    : Array.isArray(source.tipiParte)
    ? source.tipiParte
    : [];

  const history = Array.isArray(source.history)
    ? source.history
    : Array.isArray(source.storico)
    ? source.storico
    : [];

  const sections = Array.isArray(source.sections)
    ? source.sections
    : Array.isArray(source.otherSections)
    ? source.otherSections
    : [];

  return {
    general: flattened,
    rawGeneral: generalSource,
    partyTypes,
    history,
    sections,
  };
}

function formatDetailLabel(key) {
  if (!key) return '';
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, char => char.toUpperCase());
}

function extractDetailParams(detailParams, detailUrl) {
  if (detailParams && typeof detailParams === 'object' && !Array.isArray(detailParams)) {
    return { ...detailParams };
  }
  if (!detailUrl) {
    return null;
  }
  try {
    const url = new URL(detailUrl, window.location.origin);
    const params = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return Object.keys(params).length ? params : null;
  } catch (_err) {
    return null;
  }
}

function hasDetailRequestData(context, params) {
  return Boolean(
    context?.region &&
    context?.office &&
    context?.register &&
    params &&
    Object.keys(params).length > 0
  );
}

function createFallbackDetail(process) {
  if (!process) {
    return {
      general: {},
      partyTypes: [],
      history: [],
      sections: [],
    };
  }

  return {
    general: {
      numeroRuoloGenerale: process.numeroRuoloGenerale || process.ruoloGenerale || '',
      ritualita: process.ritualita || '',
      giudice: process.giudice || '',
      dataProssimaUdienza: process.dataProssimaUdienza || '',
      numero: process.numero ?? '',
      anno: process.anno ?? '',
    },
    partyTypes: [],
    history: [],
    sections: [],
  };
}

export function displayProcessDetails(detail) {
  const { general, rawGeneral, partyTypes, history, sections: additionalSections } = normalizeDetailPayload(detail);
  const fieldMap = translate('detail.fieldNames') || {};
  const mainInfoEntries = [];

  Object.entries(fieldMap).forEach(([key, label]) => {
    const value = general[key];
    if (value) {
      mainInfoEntries.push(`
        <div class="detail-item">
          <span class="detail-label">${escapeHtml(label)}:</span>
          <span class="detail-value">${escapeHtml(value)}</span>
        </div>
      `);
    }
  });

  const contentSections = [];
  const knownFields = new Set(Object.keys(fieldMap));
  const extraEntries = Object.entries(rawGeneral || {})
    .filter(([key, value]) => value && !knownFields.has(key))
    .map(([key, value]) => `
      <div class="detail-item">
        <span class="detail-label">${escapeHtml(formatDetailLabel(key))}:</span>
        <span class="detail-value">${escapeHtml(value)}</span>
      </div>
    `);

  if (mainInfoEntries.length > 0) {
    contentSections.push(`
      <div class="detail-section">
        <h4>${translate('detail.mainInfo')}</h4>
        <div class="detail-grid">
          ${mainInfoEntries.join('')}
        </div>
      </div>
    `);
  }

  if (extraEntries.length > 0) {
    contentSections.push(`
      <div class="detail-section">
        <h4>${translate('detail.additionalInfo')}</h4>
        <div class="detail-grid">
          ${extraEntries.join('')}
        </div>
      </div>
    `);
  }

  if (Array.isArray(partyTypes) && partyTypes.length > 0) {
    const partyTypeHtml = partyTypes
      .filter(Boolean)
      .map(tipo => `<span class="tipo-badge">${escapeHtml(tipo)}</span>`)
      .join('');
    if (partyTypeHtml) {
      contentSections.push(`
        <div class="detail-section">
          <h4>${translate('detail.partyTypes')}</h4>
          <div class="tipos-parte">${partyTypeHtml}</div>
        </div>
      `);
    }
  }

  if (Array.isArray(history) && history.length > 0) {
    const historyHtml = history
      .map(item => {
        if (!item) return '';
        if (typeof item === 'string') {
          return `
            <div class="historico-item">
              <span class="historico-data"></span>
              <span class="historico-evento">${escapeHtml(item)}</span>
            </div>
          `;
        }
        const date = item.data ?? item.date ?? '';
        const description = item.evento ?? item.description ?? item.raw ?? '';
        if (!date && !description) return '';
        return `
          <div class="historico-item">
            <span class="historico-data">${escapeHtml(date)}</span>
            <span class="historico-evento">${escapeHtml(description)}</span>
          </div>
        `;
      })
      .join('');
    if (historyHtml) {
      contentSections.push(`
        <div class="detail-section">
          <h4>${translate('detail.history')}</h4>
          <div class="historico">${historyHtml}</div>
        </div>
      `);
    }
  }

  if (Array.isArray(additionalSections) && additionalSections.length > 0) {
    additionalSections.forEach(section => {
      if (!section || !section.title) return;
      const items = Array.isArray(section.items) ? section.items.filter(Boolean) : [];
      const sectionContent = items.length
        ? `<ul class="detail-list">${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
        : `<p>${translate('detail.otherSectionFallback')}</p>`;
      contentSections.push(`
        <div class="detail-section">
          <h4>${escapeHtml(section.title)}</h4>
          ${sectionContent}
        </div>
      `);
    });
  }

  if (dom.modalContent) {
    dom.modalContent.innerHTML = `
      <div class="process-details">
        ${contentSections.length > 0 ? contentSections.join('') : `<p>${translate('detail.noInfo')}</p>`}
      </div>
    `;
  }
}

export async function showProcessDetails(index) {
  const results = getResults();
  const process = results[index];
  if (!process) return;

  const processLabel = process.numeroRuoloGenerale || process.ruoloGenerale || '';
  if (dom.modalTitle) {
    dom.modalTitle.textContent = processLabel
      ? `${translate('ui.modalTitle')} - ${processLabel}`
      : translate('ui.modalTitle');
  }

  if (dom.modalContent) {
    dom.modalContent.innerHTML = `
      <div class="loading-state">
        <div class="status-spinner"></div>
        <p>${translate('status.detailLoading')}</p>
      </div>
    `;
  }

  openModal();

  const detailParams = extractDetailParams(process.detailParams, process.detailUrl);
  if (detailParams && !process.detailParams) {
    process.detailParams = detailParams;
  }

  if (process.detail) {
    displayProcessDetails(process.detail);
    return;
  }

  const context = getContext() || {};
  if (!hasDetailRequestData(context, process.detailParams)) {
    displayProcessDetails(createFallbackDetail(process));
    return;
  }

  try {
    const payload = {
      region: context.region,
      office: context.office,
      register: context.register,
      pageCode: context.pageCode || undefined,
      detailParams: process.detailParams,
    };

    const data = await fetchProcessDetail(payload);

    if (data.pageCode) {
      updateContext({ pageCode: data.pageCode });
    }

    if (data.detail) {
      displayProcessDetails(data.detail);
      process.detail = data.detail;
    } else {
      displayProcessDetails(createFallbackDetail(process));
    }
  } catch (error) {
    setStatus(translate('status.detailError'), 'warn');
    displayProcessDetails(createFallbackDetail(process));
  }
}
