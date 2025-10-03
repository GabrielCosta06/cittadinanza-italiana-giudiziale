'use strict';

const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');
const dns = require('dns');
const http = require('http');
const https = require('https');
const axiosRetry = require('axios-retry').default;
const { HttpsProxyAgent } = require('https-proxy-agent');

const { START_URL, BASE, HOST, DEFAULT_LANGUAGE } = require('./config');

const DEBUG = !!process.env.DEBUG;
const FORCE_IPV4 = !!process.env.FORCE_IPV4;

function makeLookup(forceIPv4) {
  if (!forceIPv4) return undefined;
  return (hostname, options, callback) => {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    dns.lookup(hostname, { family: 4, all: false }, callback);
  };
}

function shouldBypassProxyForHost(hostname) {
  const raw = process.env.NO_PROXY || process.env.no_proxy;
  if (!raw) return false;
  const items = raw.split(',').map(s => s.trim()).filter(Boolean);
  const host = hostname.toLowerCase();
  return items.some(rule => {
    const r = rule.toLowerCase();
    if (r === '*') return true;
    if (r === host) return true;
    if (r.startsWith('.')) return host.endsWith(r);
    return host === r || host.endsWith(`.${r}`);
  });
}

function detectProxyUrlForHost(hostname) {
  if (shouldBypassProxyForHost(hostname)) return null;
  return (
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy ||
    null
  );
}

function makeClient() {
  const cookieJar = new tough.CookieJar(undefined, { looseMode: true });
  const proxyUrl = detectProxyUrlForHost(HOST);

  const client = wrapper(
    axios.create({
      jar: cookieJar,
      withCredentials: true,
      maxRedirects: 10,
      timeout: 45000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/javascript,text/plain,application/javascript,application/x-javascript,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
        Connection: 'keep-alive',
      },
      validateStatus: status => status >= 200 && status < 400,
      proxy: false,
    })
  );

  if (proxyUrl) {
    const agent = new HttpsProxyAgent(proxyUrl);
    client.defaults.httpAgent = agent;
    client.defaults.httpsAgent = agent;
  } else if (FORCE_IPV4) {
    const lookup = makeLookup(true);
    client.defaults.httpAgent = new http.Agent({ keepAlive: true, maxSockets: 16, lookup });
    client.defaults.httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 16, lookup });
  }

  axiosRetry(client, {
    retries: 3,
    shouldResetTimeout: true,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: err => {
      if (axiosRetry.isNetworkError(err) || axiosRetry.isRetryableError(err)) return true;
      const status = err?.response?.status || 0;
      return status === 408 || status === 429 || status >= 500;
    },
  });

  return { client, cookieJar };
}

async function connectivityCheck(client) {
  try {
    await client.get(`${BASE}/PST/dwr/engine.js`, {
      headers: { Referer: START_URL, 'Cache-Control': 'no-cache' },
      timeout: 30000,
    });
  } catch (error) {
    if (DEBUG) console.warn('Warning: connectivity check failed', error.message);
  }
}

async function getSessionCookieAndClient() {
  const { client, cookieJar } = makeClient();
  await connectivityCheck(client);

  const resp = await client.get(START_URL, {
    timeout: 30000,
    headers: { Referer: START_URL },
  });
  if (DEBUG) console.log('GET start:', resp.status, resp.headers['content-type']);

  const cookies = await cookieJar.getCookies(START_URL);
  if (DEBUG) {
    console.log('Cookies:', cookies.map(c => ({ key: c.key, path: c.path, domain: c.domain })));
  }

  const jsession =
    cookies
      .filter(c => /^JSESSIONID$/i.test(c.key))
      .sort((a, b) => (b.path || '').length - (a.path || '').length)
      .find(c => (c.path || '').startsWith('/PST')) ||
    cookies.find(c => /^JSESSIONID$/i.test(c.key));

  if (!jsession) {
    throw new Error('JSESSIONID non trovato (verifica la lettura dei cookie per il path /PST)');
  }

  return { client, cookieJar, jsessionId: jsession.value };
}

function genFallbackScriptSessionId() {
  const rand = Math.floor(Math.random() * 1000);
  return String(rand) + Date.now();
}

function tryExtractScriptSessionIdFromText(text) {
  const vm = require('vm');
  const code = String(text || '').replace(/^\uFEFF/, '');
  const sandbox = {
    __result: { id: null },
    dwr: {
      engine: {
        _setScriptSessionId(id) {
          sandbox.__result.id = String(id || '').trim();
        },
        _remoteHandleCallback() {},
        remoteHandleCallback() {},
        _scriptSessionId: null,
      },
    },
  };
  vm.createContext(sandbox);
  try {
    vm.runInContext(code, sandbox, { timeout: 1500 });
  } catch (_err) {}

  if (sandbox.__result.id) return sandbox.__result.id;
  if (sandbox?.dwr?.engine?._scriptSessionId) {
    return String(sandbox.dwr.engine._scriptSessionId).trim();
  }

  const match =
    code.match(/_setScriptSessionId\("([^"]+)"\)/) ||
    code.match(/scriptSessionId","([^"]+)"/) ||
    code.match(/dwr\.engine\._scriptSessionId\s*=\s*"([^"]+)"/);
  return match ? match[1].trim() : null;
}

async function getScriptSessionId(client, jsessionId) {
  try {
    await client.get(`${BASE}/PST/dwr/engine.js`, {
      headers: { Referer: START_URL },
      timeout: 10000,
    });
  } catch (_err) {}

  try {
    await client.post(
      `${BASE}/PST/dwr/call/plaincall/__System.pageLoaded.dwr`,
      'callCount=0\n',
      {
        headers: { 'Content-Type': 'text/plain', Referer: START_URL },
        timeout: 10000,
      }
    );
  } catch (_err) {}

  const body = [
    'callCount=1',
    'windowName=',
    'c0-scriptName=__System',
    'c0-methodName=pageLoaded',
    'c0-id=0',
    'batchId=0',
    'page=%2FPST%2Fit%2Fpst_2_6_7.wp',
    `httpSessionId=${encodeURIComponent(jsessionId)}`,
    'scriptSessionId=',
    '',
  ].join('\n');

  const resp = await client.post(
    `${BASE}/PST/dwr/call/plaincall/__System.pageLoaded.dwr`,
    body,
    {
      responseType: 'text',
      headers: {
        'Content-Type': 'text/plain',
        'X-Requested-With': 'XMLHttpRequest',
        Origin: BASE,
        Referer: START_URL,
      },
      timeout: 30000,
    }
  );

  const extracted = tryExtractScriptSessionIdFromText(resp.data);
  return extracted || genFallbackScriptSessionId();
}

async function loadRegisterPage(session, pageCode, { region, office, register }) {
  const url = `${BASE}/PST/it/${pageCode}.wp`;
  await session.client.get(url, {
    params: {
      regioneRicerca: region,
      ufficioRicerca: office,
      registroRicerca: register,
    },
    headers: {
      Referer: START_URL,
    },
    timeout: 45000,
  });
  return url;
}

async function withPstSession(task) {
  const { client, cookieJar, jsessionId } = await getSessionCookieAndClient();

  const destroyAgent = agent => {
    if (agent && typeof agent.destroy === 'function') {
      try {
        agent.destroy();
      } catch (error) {
        if (DEBUG) console.warn('Errore durante la chiusura dell\'agent', error.message);
      }
    }
  };

  try {
    const scriptSessionId = await getScriptSessionId(client, jsessionId);
    const session = { client, cookieJar, jsessionId, scriptSessionId };
    return await task(session);
  } finally {
    destroyAgent(client.defaults?.httpAgent);
    destroyAgent(client.defaults?.httpsAgent);
  }
}

module.exports = {
  DEFAULT_LANGUAGE,
  makeClient,
  getSessionCookieAndClient,
  getScriptSessionId,
  loadRegisterPage,
  withPstSession,
};
