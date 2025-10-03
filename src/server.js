'use strict';

const path = require('path');
const express = require('express');

const {
  REGIONS,
  DEFAULT_LANGUAGE,
  fetchOffices,
  fetchRegisters,
  fetchRuoli,
  searchRuoloGenerale,
  fetchRuoloGeneraleDetail,
  withPstSession,
} = require('./lib/pstService');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const DEBUG = !!process.env.DEBUG;

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/api/regions', (_req, res) => {
  res.json({ regions: REGIONS });
});

app.get('/api/offices', asyncRoute(async (req, res) => {
  const region = (req.query.region || '').trim();
  const lang = (req.query.lang || DEFAULT_LANGUAGE).trim();
  if (!region) {
    throw httpError(400, "Il parametro 'region' � obbligatorio");
  }

  const offices = await withPstSession(session => fetchOffices(session, region, lang));
  res.json({ region, offices });
}));

app.get('/api/registers', asyncRoute(async (req, res) => {
  const office = (req.query.office || '').trim();
  const lang = (req.query.lang || DEFAULT_LANGUAGE).trim();
  if (!office) {
    throw httpError(400, "Il parametro 'office' � obbligatorio");
  }

  const registers = await withPstSession(session => fetchRegisters(session, office, lang));
  res.json({ office, registers });
}));

app.get('/api/ruoli', asyncRoute(async (req, res) => {
  const register = (req.query.register || '').trim();
  const lang = (req.query.lang || DEFAULT_LANGUAGE).trim();
  if (!register) {
    throw httpError(400, "Il parametro 'register' � obbligatorio");
  }

  const ruoli = await withPstSession(session => fetchRuoli(session, register, lang));
  res.json({ register, ruoli });
}));

app.post('/api/search/ruolo-generale', asyncRoute(async (req, res) => {
  const region = (req.body.region || '').trim();
  const office = (req.body.office || '').trim();
  const register = (req.body.register || '').trim();
  const numero = (req.body.numero || '').toString().trim();
  const anno = (req.body.anno || '').toString().trim();

  if (!region || !office || !register) {
    throw httpError(400, 'Regione, ufficio e registro sono obbligatori');
  }
  if (!/^\d+$/.test(numero)) {
    throw httpError(400, 'Numero ruolo non valido');
  }
  if (!/^\d{4}$/.test(anno)) {
    throw httpError(400, 'Anno ruolo non valido (formato AAAA)');
  }

  if (DEBUG) {
    console.log('Ricerca ruolo generale', { region, office, register, numero, anno });
  }

  const outcome = await withPstSession(session =>
    searchRuoloGenerale(session, { region, office, register, numero, anno })
  );

  res.json({
    region,
    office,
    register,
    numero,
    anno,
    pageCode: outcome.pageCode,
    results: outcome.results,
    message: outcome.message,
  });
}));

app.post('/api/search/ruolo-generale/detail', asyncRoute(async (req, res) => {
  const region = String(req.body?.region ?? '').trim();
  const office = String(req.body?.office ?? '').trim();
  const register = String(req.body?.register ?? '').trim();
  const pageCode = req.body?.pageCode ? String(req.body.pageCode).trim() : undefined;
  const detailParams = req.body?.detailParams;

  if (!region || !office || !register) {
    throw httpError(400, 'Regione, ufficio e registro sono obbligatori');
  }

  if (!detailParams || typeof detailParams !== 'object' || Array.isArray(detailParams)) {
    throw httpError(400, "Il parametro 'detailParams' � obbligatorio");
  }

  const sanitizedDetailParams = Object.fromEntries(
    Object.entries(detailParams).map(([key, value]) => [key, value == null ? '' : String(value)])
  );

  const detail = await withPstSession(session =>
    fetchRuoloGeneraleDetail(session, {
      region,
      office,
      register,
      pageCode,
      detailParams: sanitizedDetailParams,
    })
  );

  res.json({
    region,
    office,
    register,
    pageCode: detail.pageCode,
    detail,
  });
}));

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint non trovato' });
});

app.use(express.static(PUBLIC_DIR));

app.get(/^(?!\/api\/).*/, (req, res, next) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'), err => {
    if (err) next(err);
  });
});

app.use((err, _req, res, _next) => {
  if (DEBUG) console.error('Errore durante la richiesta', err);
  const status = Number.isInteger(err.status) ? err.status : 500;
  res.status(status).json({ error: err.message || 'Errore interno' });
});

const PORT = Number(process.env.PORT) || 3000;

function start() {
  app.listen(PORT, () => {
    console.log(`[cittadinanza] server avviato su http://localhost:${PORT}`);
  });
}

module.exports = {
  app,
  start,
  withPstSession,
  fetchOffices,
  fetchRegisters,
  fetchRuoli,
  searchRuoloGenerale,
  fetchRuoloGeneraleDetail,
};
