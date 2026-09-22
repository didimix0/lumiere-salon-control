import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

export function runOwnerDeskPolishSuite() {
  const context = vm.createContext({ Logger:{log(){}} });
  for (const name of ['AppConfig','SheetRegistry','SchemaDefinitions','OwnerDeskPolish']) {
    vm.runInContext(fs.readFileSync(`src/apps-script/${name}.gs`, 'utf8'), context);
  }
  const tests = [];
  const test = (id, run) => { try { run(); tests.push({id,pass:true}); } catch (error) { tests.push({id,pass:false,message:error.message}); } };
  const cells = {A37:10900,A40:500,A43:10400,A46:7332,A49:3068,F49:0.295};
  const formulas = {A37:'=formula()',A40:'=formula()',A43:'=formula()',A46:'=formula()',A49:'=formula()'};
  const sheet = {getRange(a1) { return {getMergedRanges:()=>[],getValue:()=>cells[a1],getFormula:()=>formulas[a1]||''}; }};
  test('POLISH-01 verified control metrics allow visual polish', () => {
    const result = context._LCODP_check_(sheet); assert.equal(result.valid,true); assert.equal(result.metrics.operatingProfit,3068);
  });
  test('POLISH-02 any KPI mismatch blocks formatting', () => {
    cells.A46 = 7000; const result = context._LCODP_check_(sheet); assert.equal(result.valid,false); assert.ok(result.blockers.some(x=>x.cell==='A46')); cells.A46=7332;
  });
  test('POLISH-03 missing formula blocks formatting', () => {
    delete formulas.A49; const result = context._LCODP_check_(sheet); assert.equal(result.valid,false); assert.ok(result.blockers.some(x=>x.code==='OWNER_DESK_EXPECTED_FORMULA_MISSING')); formulas.A49='=formula()';
  });
  test('POLISH-04 merge blocks formatting', () => {
    const merged = {getRange:()=>({getMergedRanges:()=>[{}]})}; assert.equal(context._LCODP_check_(merged).code,'OWNER_DESK_MERGE_CONFLICT');
  });
  test('POLISH-05 style code does not write values or formulas', () => {
    const source = fs.readFileSync('src/apps-script/OwnerDeskPolish.gs','utf8'); assert.ok(!source.includes('.setValue(')); assert.ok(!source.includes('.setFormula('));
  });
  return {valid:tests.every(t=>t.pass),tests};
}
