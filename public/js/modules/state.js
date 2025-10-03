// Application state management

const appState = {
  context: null,
  results: [],
};

export const selectState = {
  tokens: {
    regions: 0,
    offices: 0,
    registers: 0,
  },
  currentRegion: '',
  currentOffice: '',
};

export function getContext() {
  return appState.context;
}

export function updateContext(partial) {
  appState.context = { ...(appState.context || {}), ...partial };
  return appState.context;
}

export function getResults() {
  return appState.results;
}

export function setResults(results) {
  appState.results = Array.isArray(results) ? results : [];
  return appState.results;
}

export function clearResults() {
  appState.results = [];
}

export function resetSelectState() {
  selectState.tokens.regions = 0;
  selectState.tokens.offices = 0;
  selectState.tokens.registers = 0;
  selectState.currentRegion = '';
  selectState.currentOffice = '';
}
