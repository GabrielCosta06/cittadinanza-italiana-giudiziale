import { dom } from './modules/dom.js';
import { refreshRegions, refreshOffices, refreshRegisters } from './modules/selects.js';
import { performSearch } from './modules/search.js';
import { switchLanguage, updateUI, initializeLanguageSelector } from './modules/language.js';
import { addLiquidEffects } from './modules/effects.js';
import { closeModal } from './modules/modal.js';
import { hideResults } from './modules/results.js';
import { updateContext } from './modules/state.js';

function bindEvents() {
  if (dom.searchForm) {
    dom.searchForm.addEventListener('submit', event => {
      event.preventDefault();
      performSearch();
    });
  }

  if (dom.regionSelect) {
    dom.regionSelect.addEventListener('change', event => {
      refreshOffices(event.target.value);
    });
  }

  if (dom.officeSelect) {
    dom.officeSelect.addEventListener('change', event => {
      refreshRegisters(event.target.value);
    });
  }

  if (dom.registerSelect) {
    dom.registerSelect.addEventListener('change', event => {
      updateContext({ register: event.target.value });
      hideResults();
    });
  }

  if (dom.languageSelect) {
    dom.languageSelect.addEventListener('change', event => {
      switchLanguage(event.target.value);
    });
  }

  if (dom.modalClose) {
    dom.modalClose.addEventListener('click', closeModal);
  }

  if (dom.modalCloseBtn) {
    dom.modalCloseBtn.addEventListener('click', closeModal);
  }

  if (dom.modalBackdrop) {
    dom.modalBackdrop.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dom.processModal?.classList.contains('active')) {
      closeModal();
    }
  });

  if (dom.heroAction) {
    dom.heroAction.addEventListener('click', () => {
      const target = document.getElementById('search');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}

function init() {
  updateUI();
  initializeLanguageSelector();
  addLiquidEffects();
  bindEvents();
  refreshRegions();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
