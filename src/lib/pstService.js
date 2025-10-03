'use strict';

const cheerio = require('cheerio');
const { URLSearchParams } = require('url');

const {
  DEFAULT_LANGUAGE,
  PLACEHOLDER_CAPTCHA_CODE,
  REGIONS,
} = require('./config');
const {
  withPstSession,
  loadRegisterPage,
} = require('./session');
const { callDwr } = require('./dwr');
const {
  cleanText,
  mapToCodeName,
  parseRuoloGeneraleResults,
  parseRuoloGeneraleDetail,
} = require('./parsers');

function ensureCheerio(html) {
  return cheerio.load(html);
}

async function fetchOffices(session, regionCode, lang = DEFAULT_LANGUAGE) {
  const payload = await callDwr(session, {
    scriptName: 'RegistroListGetter',
    methodName: 'getUfficiPubb',
    params: [regionCode, lang],
  });
  return mapToCodeName(payload);
}

async function fetchRegisters(session, officeCode, lang = DEFAULT_LANGUAGE) {
  const payload = await callDwr(session, {
    scriptName: 'RegistroListGetter',
    methodName: 'getRegistriPub',
    params: [officeCode, lang],
  });
  return mapToCodeName(payload);
}

async function fetchRuoli(session, registerCode, lang = DEFAULT_LANGUAGE) {
  const payload = await callDwr(session, {
    scriptName: 'RegistroListGetter',
    methodName: 'getRuoli',
    params: [registerCode, '', lang],
  });
  return mapToCodeName(payload);
}

async function getRegisterPageCode(session, registerCode) {
  const payload = await callDwr(session, {
    scriptName: 'RegistroListGetter',
    methodName: 'getPageCodePub',
    params: [registerCode],
  });
  return String(payload || '').trim();
}

async function searchRuoloGenerale(session, { region, office, register, numero, anno }) {
  const pageCode = await getRegisterPageCode(session, register);
  if (!pageCode) {
    throw new Error('Impossibile determinare la pagina del registro selezionato');
  }

  const pageUrl = await loadRegisterPage(session, pageCode, { region, office, register });

  const form = new URLSearchParams({
    numeroRuoloGen: numero,
    annoRuoloGen: anno,
    searchType: 'consp_ruolo_gen',
    regioneRicerca: region,
    ufficioRicerca: office,
    registroRicerca: register,
    captCode: PLACEHOLDER_CAPTCHA_CODE,
    captchaIsValid: 'true',
  });

  const resp = await session.client.post(pageUrl, form.toString(), {
    responseType: 'text',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: 'https://servizipst.giustizia.it',
      Referer: pageUrl,
    },
    timeout: 45000,
  });

  const $ = ensureCheerio(resp.data);
  const parsed = parseRuoloGeneraleResults($, resp.data);
  return { pageCode, pageUrl, ...parsed };
}

async function fetchRuoloGeneraleDetail(session, { region, office, register, detailParams, pageCode }) {
  if (!detailParams || typeof detailParams !== 'object' || Array.isArray(detailParams)) {
    throw new Error("Il parametro 'detailParams' deve essere un oggetto");
  }

  const resolvedPageCode = pageCode && String(pageCode).trim()
    ? String(pageCode).trim()
    : await getRegisterPageCode(session, register);

  if (!resolvedPageCode) {
    throw new Error('Impossibile determinare la pagina per il registro selezionato');
  }

  const pageUrl = await loadRegisterPage(session, resolvedPageCode, { region, office, register });

  const detailUrl = new URL(`/PST/it/${resolvedPageCode}.wp`, 'https://servizipst.giustizia.it');
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(detailParams)) {
    if (value === undefined || value === null) continue;
    searchParams.set(key, String(value));
  }

  searchParams.set('regioneRicerca', region);
  searchParams.set('ufficioRicerca', office);
  searchParams.set('registroRicerca', register);

  detailUrl.search = searchParams.toString();

  const resp = await session.client.get(detailUrl.toString(), {
    responseType: 'text',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      Origin: 'https://servizipst.giustizia.it',
      Referer: pageUrl,
    },
    timeout: 45000,
  });

  const $ = ensureCheerio(resp.data);
  const detail = parseRuoloGeneraleDetail($);
  return {
    pageCode: resolvedPageCode,
    url: detailUrl.toString(),
    ...detail,
  };
}

module.exports = {
  REGIONS,
  DEFAULT_LANGUAGE,
  fetchOffices,
  fetchRegisters,
  fetchRuoli,
  searchRuoloGenerale,
  fetchRuoloGeneraleDetail,
  withPstSession,
  cleanText,
};
