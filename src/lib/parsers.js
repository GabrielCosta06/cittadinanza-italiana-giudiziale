'use strict';

function cleanText(value) {
  return String(value ?? '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

const DETAIL_LABEL_MAP = {
  'Numero ruolo generale': 'numeroRuoloGenerale',
  'Ritualità': 'ritualita',
  "Oggetto del fascicolo": 'oggettoDelFascicolo',
  'Giudice': 'giudice',
  'Sezione': 'sezione',
  'Data di iscrizione a ruolo': 'dataIscrizioneARuolo',
  'Data citazione': 'dataCitazione',
  'Data prossima udienza': 'dataProssimaUdienza',
  'Sentenza': 'sentenza',
  'Decreto ingiuntivo': 'decretoIngiuntivo',
  'Stato del fascicolo': 'statoDelFascicolo',
};

function normalizeDetailLabel(label) {
  if (!label) return null;
  const mapped = DETAIL_LABEL_MAP[label];
  if (mapped) return mapped;
  const ascii = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .toLowerCase();
  if (!ascii) return null;
  const words = ascii.split(' ').filter(Boolean);
  if (!words.length) return null;
  return words
    .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('');
}

function mapToCodeName(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(item => {
      const code = item && (item.name ?? item.codice ?? item.id ?? item.codiceUfficio ?? item.codiceAmministrazione);
      const label = item && (item.value ?? item.denominazione ?? item.descrizione ?? item.descr ?? item.label);
      return {
        code: code != null ? String(code).trim() : '',
        name: label != null ? String(label).trim() : '',
      };
    })
    .filter(entry => entry.code);
}

function parseRuoloGeneraleResults($, html) {
  const table = $('#fascicoli');
  if (!table.length) {
    const message = $('p.noElementFound').first().text().trim() ||
      $('div.alert, p.message, div.messaggio').first().text().trim() ||
      'Risultati non disponibili';
    return { results: [], message };
  }

  const rows = table.find('tbody tr').toArray();
  if (!rows.length || $(rows[0]).hasClass('empty')) {
    const message = table.find('tbody tr.empty .noElementFound').text().trim() || 'Nessun risultato trovato';
    return { results: [], message };
  }

  const results = rows
    .map(row => {
      const cells = $(row).find('td');
      if (!cells.length) return null;

      const link = $(cells[0]).find('a');
      const rawText = cleanText(link.text());
      const [numeroPart = null, annoPart = null] = rawText.split('/').map(part => part.trim());
      const detailPath = link.attr('href') || '';
      let detailUrl = null;
      let detailParams = null;
      if (detailPath) {
        try {
          const url = new URL(detailPath, 'https://servizipst.giustizia.it');
          detailUrl = url.toString();
          detailParams = {};
          for (const [key, value] of url.searchParams.entries()) {
            detailParams[key] = value;
          }
        } catch (_err) {
          detailUrl = detailPath;
        }
      }

      const giudice = cleanText($(cells[1]).text()) || null;
      const rito = cleanText($(cells[2]).text()) || null;
      const prossimaUdienza = cleanText($(cells[3]).text()) || null;

      return {
        ruoloGenerale: rawText || null,
        numero: numeroPart || null,
        anno: annoPart || null,
        giudice,
        rito,
        prossimaUdienza: prossimaUdienza || null,
        detailUrl,
        detailParams,
      };
    })
    .filter(Boolean);

  return { results, message: null };
}

function parseRuoloGeneraleDetail($) {
  const general = {};
  const generalList = $('ul.dettaglioRuoloGenerale').first();

  if (generalList.length) {
    generalList.find('li').each((_, li) => {
      const strong = $(li).find('strong').first();
      if (!strong.length) return;
      const rawLabel = cleanText(strong.text()).replace(/:$/, '').trim();
      const key = normalizeDetailLabel(rawLabel);
      const value = cleanText($(li).clone().children('strong').remove().end().text());
      const targetKey = key || rawLabel;
      general[targetKey] = value || null;
    });
  }

  const sections = [];
  $('div.dettaglioRuoloGenerale').each((_, section) => {
    const heading = cleanText($(section).find('> h3').first().text()).replace(/:$/, '');
    if (!heading) return;
    const items = $(section)
      .find('> ul > li')
      .map((__, li) => cleanText($(li).text()))
      .get()
      .filter(Boolean);
    sections.push({ title: heading, items });
  });

  const partyTypesSection = sections.find(section => /tipologie.+parti/i.test(section.title));
  const historySection = sections.find(section => /storico/i.test(section.title));

  const partyTypes = partyTypesSection ? partyTypesSection.items : [];
  const history = historySection
    ? historySection.items.map(item => {
        const [date, ...rest] = item.split(/\s*-\s*/);
        return {
          date: date || null,
          description: rest.length ? rest.join(' - ').trim() : null,
          raw: item,
        };
      })
    : [];

  const otherSections = sections.filter(section => section !== partyTypesSection && section !== historySection);

  return { general, partyTypes, history, sections: otherSections };
}

module.exports = {
  cleanText,
  normalizeDetailLabel,
  mapToCodeName,
  parseRuoloGeneraleResults,
  parseRuoloGeneraleDetail,
};
