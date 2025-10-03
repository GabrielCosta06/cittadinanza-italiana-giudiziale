'use strict';

const server = require('./src/server');

if (require.main === module) {
  server.start();
}

module.exports = {
  app: server.app,
  withPstSession: server.withPstSession,
  fetchOffices: (...args) => server.withPstSession(session => server.fetchOffices(session, ...args)),
  fetchRegisters: (...args) => server.withPstSession(session => server.fetchRegisters(session, ...args)),
  fetchRuoli: (...args) => server.withPstSession(session => server.fetchRuoli(session, ...args)),
  searchRuoloGenerale: params => server.withPstSession(session => server.searchRuoloGenerale(session, params)),
  getRuoloGeneraleDetail: params => server.withPstSession(session => server.fetchRuoloGeneraleDetail(session, params)),
  start: server.start,
};
