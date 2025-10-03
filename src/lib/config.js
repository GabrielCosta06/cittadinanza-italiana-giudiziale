'use strict';

const START_URL = 'https://servizipst.giustizia.it/PST/it/pst_2_6_7.wp';
const BASE = 'https://servizipst.giustizia.it';
const HOST = 'servizipst.giustizia.it';
const DEFAULT_LANGUAGE = 'it';
const PLACEHOLDER_CAPTCHA_CODE = 'ABCD';

const REGIONS = [
  { code: '1', name: 'Abruzzo' },
  { code: '2', name: 'Basilicata' },
  { code: '3', name: 'Calabria' },
  { code: '4', name: 'Campania' },
  { code: '5', name: 'Emilia-Romagna' },
  { code: '6', name: 'Friuli-Venezia Giulia' },
  { code: '7', name: 'Lazio' },
  { code: '8', name: 'Liguria' },
  { code: '9', name: 'Lombardia' },
  { code: '10', name: 'Marche' },
  { code: '11', name: 'Molise' },
  { code: '12', name: 'Piemonte' },
  { code: '13', name: 'Puglia' },
  { code: '14', name: 'Sardegna' },
  { code: '15', name: 'Sicilia' },
  { code: '16', name: 'Toscana' },
  { code: '17', name: 'Trentino-Alto Adige' },
  { code: '18', name: 'Umbria' },
  { code: '19', name: "Valle d'Aosta" },
  { code: '20', name: 'Veneto' },
];

module.exports = {
  START_URL,
  BASE,
  HOST,
  DEFAULT_LANGUAGE,
  PLACEHOLDER_CAPTCHA_CODE,
  REGIONS,
};
