'use strict';

const vm = require('vm');
const { BASE, START_URL } = require('./config');

function seemsHTML(value, contentType) {
  if (contentType && /text\/html/i.test(contentType)) return true;
  const text = String(value || '');
  return /<!doctype html>|<html[\s>]/i.test(text) || (text.includes('<') && text.includes('</'));
}

function extractDwrPayload(responseText) {
  const txt = String(responseText || '').replace(/^\uFEFF/, '');

  const sandbox = {
    __payload: null,
    dwr: {
      engine: {
        _remoteHandleCallback(_batchId, _callId, data) {
          sandbox.__payload = data;
        },
        remoteHandleCallback(_batchId, _callId, data) {
          sandbox.__payload = data;
        },
        _setScriptSessionId() {},
        remote: {
          handleCallback(_batchId, _callId, data) {
            sandbox.__payload = data;
          },
          handleNewScriptSession() {},
        },
      },
    },
  };
  vm.createContext(sandbox);
  try {
    vm.runInContext(txt, sandbox, { timeout: 2000 });
  } catch (_err) {}
  if (sandbox.__payload != null) return sandbox.__payload;

  const match =
    txt.match(/_remoteHandleCallback\s*\(\s*[^,]+,\s*[^,]+,\s*([\s\S]+?)\s*\)\s*;/) ||
    txt.match(/remoteHandleCallback\s*\(\s*[^,]+,\s*[^,]+,\s*([\s\S]+?)\s*\)\s*;/) ||
    txt.match(/handleCallback\s*\(\s*[^,]+,\s*[^,]+,\s*([\s\S]+?)\s*\)\s*;/);
  if (match) {
    const fragment = match[1];
    const sb = { __out: null };
    vm.createContext(sb);
    try {
      vm.runInContext(`__out = (${fragment});`, sb, { timeout: 2000 });
      if (sb.__out != null) return sb.__out;
    } catch (_err) {}
  }

  const arrayMatch = txt.match(/\[\s*\[(?:.|\s)*\]\s*\]/);
  if (arrayMatch) {
    let candidate = arrayMatch[0];
    try {
      candidate = candidate
        .replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":')
        .replace(/'/g, '"');
      const parsed = JSON.parse(candidate);
      return Array.isArray(parsed) ? parsed[0] : parsed;
    } catch (_err) {}
  }

  return null;
}

async function callDwr(session, { scriptName, methodName, params = [], batchId = 1, pagePath = '/PST/it/pst_2_6_7.wp' }) {
  const { client, jsessionId, scriptSessionId } = session;
  const url = `${BASE}/PST/dwr/call/plaincall/${scriptName}.${methodName}.dwr`;

  const lines = [
    'callCount=1',
    'windowName=',
    `c0-scriptName=${scriptName}`,
    `c0-methodName=${methodName}`,
    'c0-id=0',
  ];

  params.forEach((value, index) => {
    const val = value == null ? '' : String(value);
    lines.push(`c0-param${index}=string:${val}`);
  });

  lines.push(`batchId=${batchId}`);
  lines.push(`page=${encodeURIComponent(pagePath)}`);
  lines.push(`httpSessionId=${encodeURIComponent(jsessionId)}`);
  lines.push(`scriptSessionId=${encodeURIComponent(scriptSessionId)}`);
  lines.push('');

  const body = lines.join('\n');

  const resp = await client.post(url, body, {
    responseType: 'text',
    headers: {
      'Content-Type': 'text/plain',
      'X-Requested-With': 'XMLHttpRequest',
      Origin: BASE,
      Referer: START_URL,
      Accept: 'text/javascript,text/plain,application/javascript,application/x-javascript,*/*;q=0.8',
      'Cache-Control': 'no-cache',
    },
    timeout: 45000,
  });

  if (seemsHTML(resp.data, resp.headers['content-type'])) {
    throw new Error('Il server ha restituito HTML invece di una risposta DWR');
  }

  const payload = extractDwrPayload(resp.data);
  if (payload == null) {
    throw new Error(`Impossibile analizzare la risposta di ${scriptName}.${methodName}`);
  }

  return payload;
}

module.exports = {
  callDwr,
  seemsHTML,
  extractDwrPayload,
};
