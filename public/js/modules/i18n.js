// Internationalization utilities

const PST_LANGUAGE_MAP = {
    pt: 'it',
    it: 'it',
  };

const translations = {
    pt: {
      ui: {
        nav: {
          brand: 'PST Consulta',
          hero: 'Início',
          consultation: 'Consulta',
          contact: 'Contato',
        },
        hero: {
          overline: 'Consulta profissional',
          title: 'Consulte processos judiciais com tecnologia premium',
          subtitle: 'Acesse diretamente os registros oficiais do Portale dei Servizi Telematici. Plataforma profissional para advogados, escritórios e consultores jurídicos.',
          action: 'Iniciar Consulta Premium',
          hint: 'Totalmente online e sem burocracia.',
        },
        contact: {
          overline: 'Precisa de ajuda especializada?',
          title: 'Não deixe seus processos nas mãos do acaso',
          subtitle: 'Nossos especialistas respondem em minutos pelo WhatsApp. Orientação personalizada para cada etapa da sua consulta.',
          button: 'Falar no WhatsApp',
        },
        languageLabel: 'Idioma',
        title: 'Consulta do Ruolo Generale',
        subtitle: 'Explore os processos diretamente do Portale dei Servizi Telematici.',
        labels: {
          region: 'Região *',
          office: 'Órgão judiciário *',
          register: 'Registro *',
          numero: 'Número *',
          anno: 'Ano *',
        },
        placeholders: {
          selectRegion: 'Selecione uma região',
          selectOffice: 'Selecione um órgão',
          selectRegister: 'Selecione um registro',
          numero: 'Ex. 1',
          anno: 'Ex. 2024',
        },
        buttons: {
          search: 'Pesquisar Processo',
          details: 'Detalhes',
          close: 'Fechar',
        },
        resultsHeader: 'Resultados',
        resultsSubtitle: 'Lista de processos encontrados.',
        emptyResults: 'Inicie uma pesquisa para visualizar os resultados.',
        tableHeaders: {
          ruolo: 'Ruolo generale',
          giudice: 'Juiz',
          rito: 'Rito',
          udienza: 'Próxima audiência',
          dettagli: 'Detalhes',
        },
        modalTitle: 'Detalhe do processo',
        footer: '© 2025 PST Consulta - Consulta Profissional de Processos',
      },
      status: {
        loadingRegions: 'Carregando regiões...',
        loadingOffices: 'Carregando órgãos...',
        loadingRegisters: 'Carregando registros...',
        searching: 'Pesquisando...',
        missingFields: 'Por favor, preencha todos os campos obrigatórios.',
        noResults: 'Nenhum resultado encontrado.',
        invalidResponse: 'Resposta inválida do servidor',
        detailLoading: 'Carregando detalhes...',
        detailError: 'Não foi possível carregar os detalhes.',
      },
      detail: {
        mainInfo: 'Informações principais',
        partyTypes: 'Tipos de parte',
        history: 'Histórico',
        noInfo: 'Nenhuma informação disponível.',
        noParties: 'Nenhum tipo de parte informado.',
        noHistory: 'Nenhum histórico disponível.',
        otherSectionFallback: 'Nenhum dado disponível.',
        fieldNames: {
          numeroRuoloGenerale: 'Número do processo',
          ritualita: 'Ritualità',
          oggettoDelFascicolo: 'Objeto do processo',
          giudice: 'Juiz',
          sezione: 'Seção',
          dataIscrizioneARuolo: 'Data de inscrição',
          dataCitazione: 'Data de citação',
          dataProssimaUdienza: 'Próxima audiência',
          sentenza: 'Sentença',
          decretoIngiuntivo: 'Decreto injuntivo',
          statoDelFascicolo: 'Estado do processo',
        },
        additionalInfo: 'Informações adicionais',
      },
      summary: {
        zero: '0 resultados',
        one: '1 resultado',
        other: '{count} resultados',
      },
    },
    it: {
      ui: {
        nav: {
          brand: 'PST Consulta',
          hero: 'Home',
          consultation: 'Consultazione',
          contact: 'Contattaci',
        },
        hero: {
          overline: 'Consultazione professionale',
          title: 'Consulta fascicoli giudiziari con tecnologia premium',
          subtitle: 'Accedi direttamente ai registri ufficiali del Portale dei Servizi Telematici. Piattaforma professionale per avvocati, studi legali e consulenti.',
          action: 'Avvia Consultazione Premium',
          hint: 'Tutto online, senza burocrazia.',
        },
        contact: {
          overline: 'Serve aiuto specializzato?',
          title: 'Non lasciare i tuoi fascicoli al caso',
          subtitle: 'I nostri specialisti rispondono in pochi minuti su WhatsApp. Orientamento personalizzato per ogni fase della tua consultazione.',
          button: 'Scrivici su WhatsApp',
        },
        languageLabel: 'Lingua',
        title: 'Consultazione del Ruolo Generale',
        subtitle: 'Esplora i fascicoli direttamente dal Portale dei Servizi Telematici.',
        labels: {
          region: 'Regione *',
          office: 'Ufficio giudiziario *',
          register: 'Registro *',
          numero: 'Numero *',
          anno: 'Anno *',
        },
        placeholders: {
          selectRegion: 'Seleziona una regione',
          selectOffice: 'Seleziona un ufficio',
          selectRegister: 'Seleziona un registro',
          numero: 'Es. 1',
          anno: 'Es. 2024',
        },
        buttons: {
          search: 'Cerca Fascicolo',
          details: 'Dettagli',
          close: 'Chiudi',
        },
        resultsHeader: 'Risultati',
        resultsSubtitle: 'Elenco dei fascicoli trovati.',
        emptyResults: 'Avvia una ricerca per visualizzare i risultati.',
        tableHeaders: {
          ruolo: 'Ruolo generale',
          giudice: 'Giudice',
          rito: 'Rito',
          udienza: 'Prossima udienza',
          dettagli: 'Dettagli',
        },
        modalTitle: 'Dettaglio fascicolo',
        footer: '© 2025 PST Consulta - Consultazione Professionale Fascicoli',
      },
      status: {
        loadingRegions: 'Caricamento regioni...',
        loadingOffices: 'Caricamento uffici...',
        loadingRegisters: 'Caricamento registri...',
        searching: 'Ricerca in corso...',
        missingFields: 'Per favore, compila tutti i campi obbligatori.',
        noResults: 'Nessun risultato trovato.',
        invalidResponse: 'Risposta non valida dal server',
        detailLoading: 'Caricamento dettagli...',
        detailError: 'Impossibile caricare i dettagli.',
      },
      detail: {
        mainInfo: 'Informazioni principali',
        partyTypes: 'Tipologie di parti',
        history: 'Storico',
        noInfo: 'Nessuna informazione disponibile.',
        noParties: 'Nessuna tipologia indicata.',
        noHistory: 'Nessuno storico disponibile.',
        otherSectionFallback: 'Nessun dato disponibile.',
        fieldNames: {
          numeroRuoloGenerale: 'Numero ruolo generale',
          ritualita: 'Ritualità',
          oggettoDelFascicolo: 'Oggetto del fascicolo',
          giudice: 'Giudice',
          sezione: 'Sezione',
          dataIscrizioneARuolo: 'Data di iscrizione a ruolo',
          dataCitazione: 'Data citazione',
          dataProssimaUdienza: 'Data prossima udienza',
          sentenza: 'Sentenza',
          decretoIngiuntivo: 'Decreto ingiuntivo',
          statoDelFascicolo: 'Stato del fascicolo',
        },
        additionalInfo: 'Informazioni aggiuntive',
      },
      summary: {
        zero: '0 risultati',
        one: '1 risultato',
        other: '{count} risultati',
      },
    },
  };

let currentLanguage = 'pt';

function resolveLanguage(lang) {
  const requested = lang ? String(lang).toLowerCase() : 'pt';
  const mapped = PST_LANGUAGE_MAP[requested] || requested;
  return Object.prototype.hasOwnProperty.call(translations, mapped) ? mapped : 'pt';
}

export function getLanguage() {
  return currentLanguage;
}

export function setLanguage(lang) {
  currentLanguage = resolveLanguage(lang);
}

export function translate(path, replacements = {}) {
  const segments = path.split('.');
  let node = translations[currentLanguage];
  for (const segment of segments) {
    if (node && Object.prototype.hasOwnProperty.call(node, segment)) {
      node = node[segment];
    } else {
      return path;
    }
  }
  if (node == null) return '';
  return String(node).replace(/\{(\w+)\}/g, (match, token) =>
    Object.prototype.hasOwnProperty.call(replacements, token) ? replacements[token] : match
  );
}

export function formatSummary(count) {
  if (count === 0) return translate('summary.zero');
  if (count === 1) return translate('summary.one');
  return translate('summary.other', { count });
}

export function getPlaceholder(key) {
  return translate(`ui.placeholders.${key}`);
}

export const languageResources = {
  PST_LANGUAGE_MAP,
  translations,
};
