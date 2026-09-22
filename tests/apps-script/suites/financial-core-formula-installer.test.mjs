import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '../../..');
const source = fs.readFileSync(path.join(root, 'src/apps-script/FinancialCoreFormulaInstaller.gs'), 'utf8');

function load(options = {}) {
  const writes = [];
  const context = {
    Array, JSON, String, Math, Date,
    LC_validatePeriodCompletenessMigration: () => ({valid:options.migrationValid === true}),
    LC_getSchemaDefinition: () => null,
    SpreadsheetApp: {getActiveSpreadsheet: () => null, flush: () => { writes.push('flush'); }},
    LockService: {getScriptLock: () => ({tryLock: () => true, releaseLock: () => {}})},
    PropertiesService: {getScriptProperties: () => ({getProperty: () => options.token || null})}
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return {api:context, writes};
}

export function runFinancialCoreFormulaInstallerSuite() {
  const tests = [], test = (id, fn) => { try { fn(); tests.push({id,pass:true}); } catch (error) { tests.push({id,pass:false,message:error.message}); } };
  test('FCIW-01', () => { const x=load(), r=x.api.LC_planFinancialCoreFormulaInstall(); assert.equal(r.writeEnabled,false); assert.equal(r.valid,false); assert.ok(r.blockers.some((item) => item.code === 'PERIOD_COMPLETENESS_SCHEMA_MIGRATION_REQUIRED')); assert.equal(x.writes.length,0); });
  test('FCIW-02', () => { const x=load(), r=x.api.LC_installFinancialCoreFormulas(); assert.equal(r.status,'financial_core_formula_installation_blocked'); assert.equal(r.blockers[0].code,'FINANCIAL_CORE_FORMULA_INSTALL_APPROVAL_REQUIRED'); assert.equal(x.writes.length,0); });
  test('FCIW-03', () => { assert.match(source,/function LC_planFinancialCoreFormulaInstall\(\)/); assert.match(source,/function LC_installFinancialCoreFormulas\(\)/); assert.match(source,/function LC_validateFinancialCoreFormulaInstall\(\)/); assert.equal((source.match(/function LC_planFinancialCoreFormulaInstallation\(/g) || []).length,0); });
  test('FCIW-04', () => { assert.match(source,/return '=IF\(' \+ complete \+ ',' \+ value \+ ',""\)'/); assert.match(source,/PERIOD_COMPLETENESS_SCHEMA_MIGRATION_REQUIRED/); assert.doesNotMatch(source,/appendRow\(/); });
  test('FCIW-05', () => { const x=load({token:'financial_core_formula_installation_v1'}), r=x.api.LC_validateFinancialCoreFormulaInstall(); assert.doesNotThrow(() => JSON.stringify(r)); assert.equal(r.writeEnabled,false); assert.equal(x.writes.length,0); });
  test('FCIW-06', () => { assert.match(source,/function LC_debugFinancialCoreFormulaRecords\(\)/); assert.match(source,/financial_core_formula_debug_completed/); assert.doesNotMatch(source.slice(source.indexOf('function LC_debugFinancialCoreFormulaRecords()')),/\.setValues\(/); });
  return {valid:tests.every((item) => item.pass),tests};
}
