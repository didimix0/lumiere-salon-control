import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '../../..');
const source = fs.readFileSync(path.join(root, 'src/apps-script/FinancialCoreFormulaInstallationCandidate.gs'), 'utf8');
const required = ['input_completeness_status','input_completeness_confirmed_at','input_completeness_confirmed_by','input_completeness_source'];
function load(options = {}) {
  const writes = [];
  const periods = {columns:(options.withCompleteness ? required : []).map((name) => ({name}))};
  const calc = {columns:[{name:'period_id'}]};
  const context = {LC_getSchemaDefinition:(key) => options.missingSchema === key ? null : key === 'SYS_PERIODS' ? periods : key === 'SYS_CALC' ? calc : null};
  vm.createContext(context); vm.runInContext(source, context); return {api:context,writes};
}
export function runFinancialCoreFormulaCandidateSuite() {
  const tests = [], test = (id, fn) => { try { fn(); tests.push({id,pass:true}); } catch (error) { tests.push({id,pass:false,message:error.message}); } };
  test('FCI-01',() => { const x=load(),r=x.api.LC_planFinancialCoreFormulaInstallation(); assert.equal(r.valid,false); assert.equal(r.writeEnabled,false); assert.equal(r.approvalRequired,true); assert.ok(r.blockers.some((item) => item.code === 'PERIOD_COMPLETENESS_SCHEMA_MIGRATION_REQUIRED')); assert.equal(x.writes.length,0); });
  test('FCI-02',() => { const x=load({withCompleteness:true}),r=x.api.LC_validateFinancialCoreFormulaInstallation(); assert.equal(r.valid,true); assert.equal(r.status,'financial_core_formula_candidate_ready'); assert.equal(r.metrics.length,5); assert.equal(x.writes.length,0); });
  test('FCI-03',() => { const x=load({missingSchema:'SYS_CALC'}),r=x.api.LC_planFinancialCoreFormulaInstallation(); assert.equal(r.valid,false); assert.ok(r.blockers.some((item) => item.code === 'FINANCIAL_CORE_FORMULA_SCHEMA_UNAVAILABLE')); assert.equal(x.writes.length,0); });
  test('FCI-04',() => { const x=load(),r=x.api.LC_planFinancialCoreFormulaInstallation(); assert.doesNotThrow(() => JSON.stringify(r)); assert.equal(r.protectedConditions.includes('incomplete empty source yields null, not zero'),true); });
  return {valid:tests.every((item) => item.pass),tests};
}
