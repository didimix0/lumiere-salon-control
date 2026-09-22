import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(import.meta.dirname,'../../..');
const source=fs.readFileSync(path.join(root,'src/apps-script/PeriodRuntime.gs'),'utf8');
const names=['period_id','period_type','date_from','date_to','period_status','closed_at','closed_by','reopened_at','reopened_by','reopen_reason','snapshot_reference','created_at','updated_at','comment'];
const schema={sheetName:'_SYS_PERIODS',headerRow:1,columns:names.map((name)=>({name,label:name}))};
function fixedDate(value){return class extends Date{constructor(...args){super(...(args.length?args:[value]));}static now(){return new Date(value).getTime();}};}
function format(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function fixture(options={}) {
  const Clock=options.Clock||fixedDate(options.today||'2026-07-25T12:00:00Z'), data=[names.slice()].concat((options.rows||[]).map((row)=>Array.isArray(row)?row.slice():names.map((name)=>row[name]??'')));
  let maxRows=options.maxRows===undefined?8:options.maxRows, reads=0, writes=0, inserts=0, flushed=0, formats=0, numberFormat=options.numberFormat||'yyyy-mm-dd';
  const getRange=(row,column,count,width)=>({
    getValues(){reads+=1;if(options.concurrentAtRead===reads){data[1]=period('2026-07','current_preliminary',Clock);}return Array.from({length:count},(_,r)=>Array.from({length:width},(_,c)=>data[row-1+r]?.[column-1+c]??''));},
    getDisplayValues(){return this.getValues().map((line)=>line.map((value)=>value instanceof Clock?format(value):String(value)));},
    setValues(values){writes+=1;values.forEach((line,index)=>{const target=data[row-1+index]||(data[row-1+index]=Array(names.length).fill(''));line.forEach((value,offset)=>{target[column-1+offset]=value;});});if(options.invalidateAfterWrite)data[1][4]='forecast';},getNumberFormats(){return Array.from({length:count},()=>Array(width).fill(numberFormat));},setNumberFormat(value){formats+=1;numberFormat=value;}
  });
  const sheet={getMaxColumns:()=>names.length,getMaxRows:()=>maxRows,getRange,insertRowsAfter:(index,count)=>{inserts+=1;maxRows+=count;for(let i=0;i<count;i+=1)data.splice(index,0,Array(names.length).fill(''));}};
  const context={Date:Clock,Array,JSON,String,Number,Math,console:{log:()=>{},error:()=>{}},Utilities:{formatDate:(date)=>format(date)},SpreadsheetApp:{getActiveSpreadsheet:()=>({getSpreadsheetTimeZone:()=>options.timeZone||'Europe/Moscow',getSheetByName:()=>sheet}),flush:()=>{flushed+=1;}},PropertiesService:{getScriptProperties:()=>({getProperty:()=>options.token||null})},LC_getSchemaDefinition:()=>schema};
  vm.createContext(context);vm.runInContext(source,context);return {api:context,state:()=>({data,writes,inserts,reads,flushed,formats,numberFormat,maxRows})};
}
function period(id,status,Clock=Date,closed=''){const year=Number(id.slice(0,4)),month=Number(id.slice(5,7)),row=Array(names.length).fill('');row[0]=id;row[2]=`${id}-01`;row[3]=format(new Date(year,month,0));row[4]=status;row[5]=closed;return row;}
export function runPeriodsRuntimeSuite(){const tests=[];const test=(id,fn)=>{try{fn();tests.push({id,pass:true});}catch(error){tests.push({id,pass:false,message:error.message});}};
  test('PB-01',()=>{const x=fixture(),r=x.api.LC_bootstrapPeriods();assert.equal(r.status,'period_setup_completed');assert.equal(x.state().writes,1);assert.equal(x.state().data[1][0],'2026-07');assert.equal(x.state().data[2][0],'2026-08');});
  test('PB-02',()=>{const Clock=fixedDate('2026-07-25T12:00:00Z'),x=fixture({rows:[period('2026-07','current_preliminary',Clock)]}),r=x.api.LC_bootstrapPeriods();assert.deepEqual(Array.from(r.createdPeriodIds),['2026-08']);});
  test('PB-03',()=>{const Clock=fixedDate('2026-07-25T12:00:00Z'),x=fixture({rows:[period('2026-08','forecast',Clock)]}),r=x.api.LC_bootstrapPeriods();assert.deepEqual(Array.from(r.createdPeriodIds),['2026-07']);});
  test('PB-04',()=>{const Clock=fixedDate('2026-07-25T12:00:00Z'),x=fixture({rows:[period('2026-07','current_preliminary',Clock),period('2026-08','forecast',Clock)]}),r=x.api.LC_bootstrapPeriods();assert.equal(r.status,'periods_already_aligned');assert.equal(x.state().writes,0);});
  test('PB-05',()=>{const Clock=fixedDate('2026-07-25T12:00:00Z'),x=fixture({rows:[period('2026-07','current_preliminary',Clock),period('2026-07','current_preliminary',Clock)]});assert.equal(x.api.LC_planPeriodSetup().valid,false);assert.equal(x.state().writes,0);});
  test('PB-06',()=>{const Clock=fixedDate('2026-07-25T12:00:00Z'),x=fixture({rows:[period('2026-06','forecast',Clock)]});assert.equal(x.api.LC_bootstrapPeriods().status,'period_setup_blocked');assert.equal(x.state().writes,0);});
  test('PB-07',()=>{const x=fixture({concurrentAtRead:3}),r=x.api.LC_bootstrapPeriods();assert.ok(r.blockers.some((item)=>item.code==='PERIOD_SETUP_CONCURRENT_CHANGE'));assert.equal(x.state().writes,0);});
  test('PB-08',()=>{const x=fixture({maxRows:1}),r=x.api.LC_bootstrapPeriods();assert.equal(r.status,'period_setup_completed');assert.equal(x.state().inserts,1);assert.equal(x.state().writes,1);});
  test('PB-09',()=>{const x=fixture({invalidateAfterWrite:true}),r=x.api.LC_bootstrapPeriods();assert.equal(r.status,'period_setup_failed');assert.equal(r.createdPeriodIds.length,0);assert.deepEqual(Array.from(r.potentiallyChangedPeriodIds),['2026-07','2026-08']);assert.equal(x.state().writes,1);});
  test('PB-10',()=>{const x=fixture();x.api.LC_bootstrapPeriods();assert.equal(x.api.LC_bootstrapPeriods().status,'periods_already_aligned');assert.equal(x.state().writes,1);});
  test('PB-11',()=>{const x=fixture({today:'2026-12-31T23:30:00Z',timeZone:'Pacific/Kiritimati'}),p=x.api.LC_planPeriodSetup();assert.deepEqual(Array.from(p.expectedPeriodIds),['2027-01','2027-02']);});
  test('PB-12',()=>{const x=fixture(),p=x.api.LC_planPeriodSetup();assert.doesNotThrow(()=>JSON.stringify(p));assert.equal(JSON.stringify(p).includes('Spreadsheet'),false);});
  test('PB-13',()=>{const x=fixture(),before=JSON.stringify(x.state().data);x.api.LC_planPeriodSetup();assert.equal(JSON.stringify(x.state().data),before);assert.equal(x.state().writes,0);});
  test('PB-14',()=>{const x=fixture(),before=JSON.stringify(x.state().data);x.api.LC_validatePeriods();assert.equal(JSON.stringify(x.state().data),before);assert.equal(x.state().writes,0);});
  test('PB-15',()=>{const Clock=fixedDate('2026-07-25T12:00:00Z'),existing=period('2026-07','current_preliminary',Clock),x=fixture({rows:[existing]});x.api.LC_bootstrapPeriods();assert.equal(x.state().data[1][0],'2026-07');assert.equal(x.state().data[1][4],'current_preliminary');});
  test('PB-16',()=>{const x=fixture({rows:[period('bad','forecast')]}),before=JSON.stringify(x.state().data),r=JSON.parse(x.api.LC_debugPeriodsRows());assert.equal(r.rows[0].sheetRowNumber,2);assert.equal(r.rows[0].derivedChecks.periodIdFormatValid,false);assert.ok(r.rows[0].blockerCodes.includes('PERIOD_ID_FORMAT_INVALID'));assert.equal(JSON.stringify(x.state().data),before);assert.equal(x.state().writes,0);});
  test('PB-17',()=>{const Clock=fixedDate('2026-07-25T12:00:00Z'),a=period('2026-07','current_preliminary',Clock),b=period('2026-08','forecast',Clock);a[0]=new Clock('2026-07-01T00:00:00Z');b[0]=new Clock('2026-08-01T00:00:00Z');const x=fixture({rows:[a,b],Clock,token:'period_id_normalization_2026_07_08'}),r=x.api.LC_repairApprovedPeriodIds();assert.equal(r.status,'period_runtime_repair_completed',JSON.stringify(r));assert.equal(x.state().formats,1);assert.equal(x.state().numberFormat,'@');assert.equal(x.state().data[1][0],'2026-07');assert.equal(x.state().data[2][0],'2026-08');assert.equal(x.state().data[1][2],'2026-07-01');assert.equal(x.state().data[2][4],'forecast');});
  test('PB-18',()=>{const Clock=fixedDate('2026-07-25T12:00:00Z'),a=period('2026-07','current_preliminary',Clock),b=period('2026-08','forecast',Clock);a[0]=new Clock('2026-07-01T00:00:00Z');b[0]=new Clock('2026-08-01T00:00:00Z');const x=fixture({rows:[a,b],Clock}),r=x.api.LC_repairApprovedPeriodIds();assert.equal(r.status,'period_runtime_repair_blocked');assert.equal(r.blockers[0].code,'PERIOD_REPAIR_APPROVAL_TOKEN_REQUIRED');assert.equal(x.state().writes,0);assert.equal(x.state().formats,0);});
  return {valid:tests.every((test)=>test.pass),tests};
}
