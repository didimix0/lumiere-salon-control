export class MockSpreadsheet {
  constructor() { this.writeCalls = []; this.sheets = []; this.timeZone = 'Europe/Moscow'; }
  getSpreadsheetTimeZone() { return this.timeZone; }
  snapshot() { return JSON.parse(JSON.stringify({sheets:this.sheets,writeCalls:this.writeCalls})); }
  assertReadOnly(before) { return JSON.stringify(before) === JSON.stringify(this.snapshot()); }
}

export function createRuntimeContext(functions = {}) {
  const book = new MockSpreadsheet();
  return {book, context:{SpreadsheetApp:{getActiveSpreadsheet:() => book, flush:() => {}}, Utilities:{formatDate:(date) => date.toISOString().slice(0, 10)}, LockService:{getScriptLock:() => ({tryLock:() => true,releaseLock:() => {}}),}, ...functions}};
}
