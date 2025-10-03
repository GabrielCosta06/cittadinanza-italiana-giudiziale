import { dom } from './dom.js';
import { setLanguage, getLanguage, translate } from './i18n.js';
import { refreshRegions } from './selects.js';

export function updateUI() {
  const elements = {
    navHero: 'ui.nav.hero',
    navConsultation: 'ui.nav.consultation',
    navContact: 'ui.nav.contact',
    heroActionLabel: 'ui.hero.action',
    contactButtonLabel: 'ui.contact.button',
    regionLabel: 'ui.labels.region',
    officeLabel: 'ui.labels.office',
    registerLabel: 'ui.labels.register',
    numeroLabel: 'ui.labels.numero',
    annoLabel: 'ui.labels.anno',
    searchButtonLabel: 'ui.buttons.search',
    resultsHeader: 'ui.resultsHeader',
    resultsSubtitle: 'ui.resultsSubtitle',
    footerCopy: 'ui.footer',
    colRuolo: 'ui.tableHeaders.ruolo',
    colGiudice: 'ui.tableHeaders.giudice',
    colRito: 'ui.tableHeaders.rito',
    colUdienza: 'ui.tableHeaders.udienza',
    colDettagli: 'ui.tableHeaders.dettagli',
    modalCloseBtn: 'ui.buttons.close',
    resultsEmpty: 'ui.emptyResults',
  };

  Object.entries(elements).forEach(([id, path]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = translate(path);
    }
  });

  if (dom.numeroInput) {
    dom.numeroInput.placeholder = translate('ui.placeholders.numero');
  }
  if (dom.annoInput) {
    dom.annoInput.placeholder = translate('ui.placeholders.anno');
  }

  if (dom.regionSelect?.options.length) {
    dom.regionSelect.options[0].textContent = translate('ui.placeholders.selectRegion');
  }
  if (dom.officeSelect?.options.length) {
    dom.officeSelect.options[0].textContent = translate('ui.placeholders.selectOffice');
  }
  if (dom.registerSelect?.options.length) {
    dom.registerSelect.options[0].textContent = translate('ui.placeholders.selectRegister');
  }
}

export function switchLanguage(lang) {
  setLanguage(lang);
  updateUI();
  refreshRegions();
}

export function initializeLanguageSelector() {
  if (dom.languageSelect) {
    dom.languageSelect.value = getLanguage();
  }
}
