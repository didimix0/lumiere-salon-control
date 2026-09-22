import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '../../..');
const source = fs.readFileSync(path.join(root, 'src/apps-script/PeriodCompletenessMigration.gs'), 'utf8');
const base = ['period id','period type','date from','date to','period status','closed at','closed by','reopened at','reopened by','reopen reason','snapshot reference','created at','updated at','comment'];
const extra = ['input completeness status','input completeness confirmed at','input completeness confirmed by','input completeness source'];
const schema = {sheetName:'_SYS_PERIODS',headerRow:1,columns:base.concat(extra).map((label) => ({name:label.replaceAll(' ','_'),label}))};
function load(options={}) {
  const header = (options.header || base).slice(), writes = [];
  const sheet = {getLastColumn:()=>header.length,getLastRow:()=>1,getMaxColumns:()=>Math.max(26,header.length),getRange:(row,column,count,width)=>({getDisplayValues:()=>[Array.from({length:width},(_,i)=>header[column-1+i] || '')],setValues:(values)=>{writes.push(values); values[0].forEach((value,index)=>{header[column-1+index]=value;});}}),insertColumnsAfter:()=>{throw new Error('unexpected column insert')}};
  const context = {Array,JSON,String,Math,SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:()=>sheet}),flush:()=>{}},LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},PropertiesService:{getScriptProperties:()=>({getProperty:()=>options.token || null})},LC_getSchemaDefinition:()=>schema};
  vm.createContext(context); vm.runInContext(source,context); return {api:context,state:()=>({header,writes})};
}
export function runPeriodCompletenessMigrationSuite() {
  const tests=[], test=(id,fn)=>{try{fn();tests.push({id,pass:true});}catch(error){tests.push({id,pass:false,message:error.message});}};
  test('PCM-01',()=>{const x=load(),r=x.api.LC_planPeriodCompletenessMigration();assert.equal(r.status,'period_completeness_schema_migration_ready');assert.equal(Object.prototype.hasOwnProperty.call(r,'sheet'),false);assert.doesNotThrow(()=>JSON.stringify(r));assert.equal(x.state().writes.length,0);});
  test('PCM-02',()=>{const x=load({header:base.concat(extra)}),r=x.api.LC_validatePeriodCompletenessMigration();assert.equal(r.valid,true);assert.equal(r.status,'period_completeness_schema_already_aligned');assert.equal(x.state().writes.length,0);});
  test('PCM-03',()=>{const x=load(),r=x.api.LC_migratePeriodCompletenessSchema();assert.equal(r.blockers[0].code,'PERIOD_COMPLETENESS_SCHEMA_MIGRATION_APPROVAL_REQUIRED');assert.equal(x.state().writes.length,0);});
  test('PCM-04',()=>{const x=load({token:'period_completeness_schema_v1'}),r=x.api.LC_migratePeriodCompletenessSchema();assert.equal(r.status,'period_completeness_schema_migration_completed');assert.deepEqual(x.state().header,base.concat(extra));assert.equal(x.api.LC_migratePeriodCompletenessSchema().status,'period_completeness_schema_already_aligned');assert.equal(x.state().writes.length,1);});
  test('PCM-05',()=>{const x=load({header:base.concat(['unexpected'])}),r=x.api.LC_planPeriodCompletenessMigration();assert.ok(r.blockers.some((item)=>item.code==='PERIOD_COMPLETENESS_PARTIAL_SCHEMA'));assert.equal(x.state().writes.length,0);});
  return {valid:tests.every((item)=>item.pass),tests};
}
