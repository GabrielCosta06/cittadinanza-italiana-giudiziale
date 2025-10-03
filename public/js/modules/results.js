import { dom } from './dom.js';
import { formatSummary, translate } from './i18n.js';
import { setResults, clearResults } from './state.js';
import { showProcessDetails } from './details.js';

function normalizeResultEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const numero = entry.numero ?? null;
  const anno = entry.anno ?? null;
  const numeroRuoloGenerale =
    entry.numeroRuoloGenerale ||
    entry.ruoloGenerale ||
    [numero, anno].filter(Boolean).join('/');

  const detailParams =
    entry.detailParams && typeof entry.detailParams === 'object' && !Array.isArray(entry.detailParams)
      ? { ...entry.detailParams }
      : null;

  return {
    numeroRuoloGenerale: numeroRuoloGenerale || '',
    ruoloGenerale: entry.ruoloGenerale || numeroRuoloGenerale || '',
    numero,
    anno,
    giudice: entry.giudice ?? '',
    ritualita: entry.ritualita ?? entry.rito ?? '',
    dataProssimaUdienza: entry.dataProssimaUdienza ?? entry.prossimaUdienza ?? '',
    detailParams,
    detailUrl: entry.detailUrl ?? null,
    raw: entry,
  };
}

export function hideResults() {
  if (dom.resultsSection) {
    dom.resultsSection.style.display = 'none';
    dom.resultsSection.classList.remove('visible');
  }
  clearResults();
}

export function showResults(results) {
  const normalizedResults = Array.isArray(results)
    ? results.map(normalizeResultEntry).filter(Boolean)
    : [];

  setResults(normalizedResults);

  if (dom.resultsSummary) {
    dom.resultsSummary.textContent = formatSummary(normalizedResults.length);
  }

  if (dom.resultsTableBody) {
    dom.resultsTableBody.innerHTML = '';
  }

  if (!normalizedResults.length) {
    if (dom.resultsEmpty) dom.resultsEmpty.style.display = 'block';
    if (dom.resultsTableWrapper) dom.resultsTableWrapper.style.display = 'none';
  } else {
    if (dom.resultsEmpty) dom.resultsEmpty.style.display = 'none';
    if (dom.resultsTableWrapper) dom.resultsTableWrapper.style.display = 'block';

    normalizedResults.forEach((result, index) => {
      if (!dom.rowTemplate || !dom.resultsTableBody) return;
      const fragment = dom.rowTemplate.content.cloneNode(true);
      const tr = fragment.querySelector('tr');
      if (!tr) return;

      const rg = tr.querySelector('.rg');
      if (rg) rg.textContent = result.numeroRuoloGenerale || '';
      const giudice = tr.querySelector('.giudice');
      if (giudice) giudice.textContent = result.giudice || '';
      const rito = tr.querySelector('.rito');
      if (rito) rito.textContent = result.ritualita || '';
      const udienza = tr.querySelector('.udienza');
      if (udienza) udienza.textContent = result.dataProssimaUdienza || '';

      const detailBtn = tr.querySelector('.detail-btn');
      if (detailBtn) {
        const detailLabel = detailBtn.querySelector('.detail-btn-label');
        if (detailLabel) {
          detailLabel.textContent = translate('ui.buttons.details');
        }
        detailBtn.addEventListener('click', () => showProcessDetails(index));
      }

      dom.resultsTableBody.appendChild(tr);

      window.requestAnimationFrame(() => {
        tr.style.animation = `slideUp 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${index * 0.1}s both`;
      });
    });
  }

  if (dom.resultsSection) {
    dom.resultsSection.style.display = 'block';
    // Use a timeout to ensure the display property is applied before the transition starts
    setTimeout(() => {
      dom.resultsSection.classList.add('visible');
      dom.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }
}
