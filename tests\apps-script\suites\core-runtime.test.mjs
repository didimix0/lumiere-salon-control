import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { emptyValidWorkbook } from '../fixtures.mjs';

const root = path.resolve(import.meta.dirname, '../../..');
const runner = fs.readFileSync(path.join(root, 'src/apps-script/DevStageRunner.gs'), 'utf8');
function load(overrides = {}) {
  const calls = [];
  const result = (status, valid = true, extra = {}) => ({status, valid, blockers:[], warnings:[], errors:[], ...extra});
  const context = {Date, JSON, Array, String, Object, Error,
    LC_planWorkbookBootstrap:() => { calls.push('workbook-plan'); return result('plan_ready'); }, LC_bootstrapWorkbook:() => { calls.push('workbook-bootstrap'); return result(calls.filter((x) => x === 'workbook-bootstrap').length > 1 ? 'workbook_already_aligned' : 'workbook_bootstrap_completed'); }, LC_validateWorkbookStructure:() => { calls.push('workbook-validate'); return result('workbook_aligned'); },
    LC_bootstrapLookups:() => { calls.push('lookups-bootstrap'); return result('lookup_sheet_already_aligned'); }, LC_validateLookupSheet:() => { calls.push('lookups-validate'); return result('lookup_aligned'); },
    LC_planDataValidations:() => { calls.push('data-validations-plan'); return result('plan_ready'); }, LC_bootstrapDataValidations:() => { calls.push('data-validations-bootstrap'); return result('data_validations_already_aligned'); }, LC_validateDataValidations:() => { calls.push('data-validations-validate'); return result('data_validations_aligned'); },
    LC_planInputSheetSetup:() => { calls.push('input-sheets-plan'); return result('plan_ready'); }, LC_bootstrapInputSheets:() => { calls.push('input-sheets-bootstrap'); return result('input_sheets_already_aligned'); }, LC_validateInputSheets:() => { calls.push('input-sheets-validate'); return result('input_sheets_aligned'); },
    LC_planPeriodSetup:() => { calls.push('periods-plan'); return result('period_setup_plan_ready'); }, LC_bootstrapPeriods:() => { calls.push('periods-bootstrap'); return result(calls.filter((x) => x === 'periods-bootstrap').length > 1 ? 'periods_already_aligned' : 'period_setup_completed',{createdPeriodIds:['2026-07']}); }, LC_validatePeriods:() => { calls.push('periods-validate'); return result('periods_aligned'); }, LC_planPeriodCompletenessMigration:() => { calls.push('completeness-migration-plan'); return result('period_completeness_schema_migration_ready'); }, LC_validatePeriodCompletenessMigration:() => { calls.push('completeness-migration-validate'); return result('period_completeness_schema_already_aligned'); }, LC_planFinancialCoreRevenue:() => { calls.push('financial-core-plan'); return result('financial_core_revenue_plan_ready'); }, LC_validateFinancialCoreRevenue:() => { calls.push('financial-core-validate'); return result('financial_core_revenue_source_aligned'); }, LC_planFinancialCoreFormulaInstallation:() => { calls.push('financial-core-candidate-plan'); return result('financial_core_formula_candidate_ready'); }, LC_validateFinancialCoreFormulaInstallation:() => { calls.push('financial-core-candidate-validate'); return result('financial_core_formula_candidate_ready'); }, ...overrides};
  vm.createContext(context); vm.runInContext(runner, context); return {context,calls};
}
export function runCoreRuntimeSuite() {
  const tests=[]; const test=(id, fn) => { try { fn(); tests.push({id,pass:true}); } catch (error) { tests.push({id,pass:false,message:error.message}); } };
  test('DP-01',() => { const x=load(), r=x.context.LC_runDevStage({stage:'periods',mode:'plan'}); assert.deepEqual(x.calls,['periods-plan']); assert.equal(r.valid,true); });
  test('DP-02',() => { const x=load(), r=x.context.LC_runDevStage({stage:'periods',mode:'full_safe_cycle'}); assert.deepEqual(x.calls,['periods-plan','periods-bootstrap','periods-validate','periods-bootstrap']); assert.equal(r.valid,true); });
  test('DP-03',() => { const x=load({LC_planPeriodSetup:() => ({valid:false,blockers:[{code:'BLOCK'}],warnings:[],errors:[]})}), r=x.context.LC_runDevStage({stage:'periods',mode:'full_safe_cycle'}); assert.equal(r.status,'dev_stage_blocked'); assert.deepEqual(x.calls,[]); });
  test('DP-04',() => { const x=load({LC_validatePeriods:() => ({valid:false,errors:[{code:'INVALID'}],blockers:[],warnings:[]})}), r=x.context.LC_runDevStage({stage:'periods',mode:'full_safe_cycle'}); assert.equal(r.valid,false); });
  test('DP-05',() => { const x=load({LC_bootstrapPeriods:() => ({valid:false,status:'period_setup_failed',blockers:[],warnings:[],errors:[]})}), r=x.context.LC_runDevStage({stage:'periods',mode:'full_safe_cycle'}); assert.equal(r.valid,false); });
  test('DP-06',() => { const x=load(), r=x.context.LC_runDevStage({stage:'unknown',mode:'plan'}); assert.equal(r.status,'dev_stage_rejected'); assert.equal(x.calls.length,0); });
  test('DP-07',() => { const x=load(), r=x.context.LC_runDevStage({stage:'periods',mode:'close'}); assert.equal(r.status,'dev_stage_rejected'); });
  test('DP-08',() => { const x=load(), r=x.context.LC_runDevStage({stage:'periods',mode:'plan'}); assert.doesNotThrow(() => JSON.stringify(r)); });
  test('DP-09',() => { const x=load({LC_planPeriodSetup:() => { throw new Error('token=private-value'); }}), r=x.context.LC_runDevStage({stage:'periods',mode:'plan'}); assert.equal(JSON.stringify(r).includes('private-value'),false); });
  test('DP-10',() => { const source=fs.readFileSync(path.join(root,'scripts/dev-pipeline.mjs'),'utf8'); assert.ok(source.includes('localOnly')&&source.includes('local_validation_completed')); assert.ok(!source.includes("['clasp',['push']")); });
  test('DP-11',() => { const source=fs.readFileSync(path.join(root,'scripts/dev-pipeline.mjs'),'utf8'); assert.ok(source.includes("finish('push_failed', 1)")); assert.ok(source.indexOf("finish('push_failed', 1)")<source.indexOf("const remote = step('remote_full_safe_cycle'")); });
  test('DP-12',() => { const source=fs.readFileSync(path.join(root,'scripts/dev-pipeline.mjs'),'utf8'); assert.ok(source.includes("'remote_validation_completed'") && source.includes('remote_full_safe_cycle')); });
  test('DP-13',() => { const x=load({LC_planPeriodSetup:() => ({valid:false,blockers:[{code:'BLOCK'}],warnings:[],errors:[]})}), r=x.context.LC_runDevStage({stage:'periods',mode:'full_safe_cycle'}); assert.equal(r.blockerCount,1); });
  test('DP-14',() => { const book=emptyValidWorkbook(), before=book.snapshot(); assert.equal(book.assertReadOnly(before),true); });
  test('DP-15',() => { const source=fs.readFileSync(path.join(root,'scripts/dev-pipeline.mjs'),'utf8'); assert.ok(!source.includes('git push')&&!source.includes("['clasp',['deploy']")&&!source.includes('browser')); });
  test('DP-18',() => { const source=fs.readFileSync(path.join(root,'scripts/dev-pipeline.mjs'),'utf8'); assert.ok(source.includes("'scripts/dev-pipeline-config.json'") && source.includes('remoteSummary')); });
  test('DP-16',() => { const source=fs.readFileSync(path.join(root,'tests/apps-script/run-regression.mjs'),'utf8'); ['workbook','lookups','data-validations','input-sheets','periods','dev-runner'].forEach((name)=>assert.ok(source.includes(`'${name}'`))); });
  test('DP-17',() => { const source=fs.readFileSync(path.join(root,'scripts/validate-apps-script-deployment.mjs'),'utf8'); assert.ok(source.includes('DevStageRunner.gs')&&source.includes('DEV_RUNNER_JSON_SAFE')); });
  test('DP-19',() => { const x=load(),r=x.context.LC_runDevStage({stage:'financial_core_revenue',mode:'plan'});assert.equal(r.valid,true);assert.deepEqual(x.calls,['financial-core-plan']); });
  test('DP-20',() => { const x=load(),r=x.context.LC_runDevStage({stage:'financial_core_revenue',mode:'full_safe_cycle'});assert.equal(r.status,'dev_stage_rejected');assert.equal(x.calls.length,0); });
  test('DP-21',() => { const x=load(),r=x.context.LC_runDevStage({stage:'financial_core_formula_candidate',mode:'plan'});assert.equal(r.valid,true);assert.deepEqual(x.calls,['financial-core-candidate-plan']); });
  test('DP-22',() => { const x=load(),r=x.context.LC_runDevStage({stage:'financial_core_formula_candidate',mode:'full_safe_cycle'});assert.equal(r.status,'dev_stage_rejected');assert.equal(x.calls.length,0); });
  return {valid:tests.every((x)=>x.pass),tests};
}
