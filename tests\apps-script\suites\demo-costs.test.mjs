import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

export function runDemoCostsSuite(){
  const c=vm.createContext({Logger:{log(){}}});
  for(const file of ['AppConfig','SheetRegistry','SchemaDefinitions','LookupStarterDefaults','DemoAndOwnerDesk','FinancialCoreFormulaInstaller','OwnerDeskLive','DemoCosts'])vm.runInContext(fs.readFileSync(`src/apps-script/${file}.gs`,'utf8'),c);
  const fixture=JSON.parse(fs.readFileSync('data/demo/financial-core-costs.v1.json','utf8'));
  const schema=c.LC_getSchemaDefinition('EXPENSES'),map=c._LCDOD_map_(schema),rows=c._LCDCO_rows_(schema),tests=[];
  const test=(id,fn)=>{try{fn();tests.push({id,pass:true});}catch(e){tests.push({id,pass:false,message:e.message});}};
  test('COST-01 runtime matches reviewed fixture amounts and categories',()=>{
    assert.equal(rows.length,6);
    rows.forEach((r,i)=>{for(const [key,value]of Object.entries(fixture.rows[i]))assert.equal(r[map[key]],value);});
    assert.equal(new Set(rows.map(r=>r[map.expense_id])).size,6);
  });
  test('COST-02 expense totals reconcile to profit and margin',()=>{
    const amount=rows.reduce((sum,r)=>sum+r[map.amount],0);
    assert.equal(amount,7332);assert.equal(10400-amount,3068);assert.equal((10400-amount)/10400,0.295);
    assert.equal(rows.filter(r=>r[map.expense_category]==='Оплата труда').reduce((s,r)=>s+r[map.amount],0),4000);
  });
  test('COST-03 exact persisted rows with audit values are not duplicated',()=>{
    const existing=rows.map(r=>Array.from(r));existing.forEach(r=>{r[map.created_at]=new Date();r[map.updated_at]=new Date();});
    const sheet={getLastRow:()=>10,getRange:()=>({getValues:()=>existing})};
    assert.ok(c._LCDOD_classify_(sheet,schema,rows,'expense_id').every(s=>s.state==='exact_match'));
    existing[0][map.amount]=999;
    assert.equal(c._LCDOD_classify_(sheet,schema,rows,'expense_id')[0].state,'partial_or_conflicting');
  });
  test('COST-04 duplicate IDs are conflicts',()=>{
    const existing=rows.map(r=>Array.from(r));existing.push(existing[0]);
    const sheet={getLastRow:()=>11,getRange:()=>({getValues:()=>existing})};
    assert.equal(c._LCDOD_classify_(sheet,schema,rows,'expense_id')[0].duplicateRecordCount,2);
  });
  test('COST-05 formulas use six explicit records, source amounts and guarded margin',()=>{
    const cells=c._LCDCO_cells_(schema,';'),expenses=cells.find(x=>x.a1==='A46').value;
    for(const r of fixture.rows)assert.ok(expenses.includes(r.expense_id));
    assert.ok(expenses.includes('SUMIFS('));assert.ok(expenses.includes('DATE(2026;8;1)'));
    assert.ok(expenses.includes('"<>"'));
    assert.ok(!cells.find(x=>x.a1==='A49').value.includes('3068'));
    assert.ok(cells.find(x=>x.a1==='F49').value.includes('A43<>0'));
    assert.ok(!cells.some(x=>x.a1==='A52'));
  });
  test('COST-07 full read-only plan validates canonical enums and all target cells',()=>{
    const sheets=new Map();
    function table(key,source=[]){
      const s=c.LC_getSchemaDefinition(key),grid=Array.from({length:s.headerRow},()=>Array(s.columns.length).fill(''));
      grid[s.headerRow-1]=s.columns.map(x=>x.label);source.forEach(r=>grid.push(Array.from(r)));
      const sh={getName:()=>s.sheetName,getLastRow:()=>grid.length,getMaxRows:()=>1000,
        getRange(row,col,count=1,width=1){
          if(typeof row==='string'){const match=/^([A-Z]+)(\d+)$/.exec(row);col=Array.from(match[1]).reduce((a,v)=>a*26+v.charCodeAt(0)-64,0);row=Number(match[2]);}
          const values=()=>Array.from({length:count},(_,i)=>Array.from({length:width},(_,j)=>grid[row+i-1]?.[col+j-1]??''));
          return {getValues:values,getDisplayValues:()=>values().map(r=>r.map(String)),getMergedRanges:()=>[],getFormula:()=>'',getValue:()=>values()[0][0],
            getDataValidations:()=>[Array.from({length:width},(_,j)=>{
              const field=s.columns[col+j-1];if(!field?.enumKey)return null;
              const catalog=c.LCLD_MVP_LOOKUP_STARTER_DEFAULTS;
              const lookup=[...catalog.lookups,...catalog.alreadyDefinedLookups].find(x=>x.key===field.enumKey);
              if(!lookup)return null; // Key-only groups have no configured rule in this fixture.
              return {getCriteriaType:()=> 'VALUE_IN_LIST',getCriteriaValues:()=>[lookup.values]};
            })]};
        }};
      sheets.set(s.sheetName,sh);return {sh,grid};
    }
    table('EXPENSES');
    for(const key of ['MATERIALS','SHIFTS','COMPENSATION_SCHEMES'])table(key);
    table('OPERATIONS',c._LCDOD_operations_(c.LC_getSchemaDefinition('OPERATIONS')));
    table('REFUNDS',c._LCDOD_refunds_(c.LC_getSchemaDefinition('REFUNDS')));
    const deskName=c.LC_getSchemaDefinition('OWNER_DESK').sheetName;
    const own=new Map([['A37',10900],['A40',500],['A43',10400],['A46','Недостаточно данных'],['A49','Недостаточно данных']]);
    sheets.set(deskName,{getName:()=>deskName,getRange:a=>({getValue:()=>own.get(a)??'',getFormula:()=>'',getMergedRanges:()=>[]})});
    c.Utilities={formatDate:date=>date.toISOString().slice(0,7)};
    c.SpreadsheetApp={getActiveSpreadsheet:()=>({getSheetByName:name=>sheets.get(name),getSpreadsheetLocale:()=> 'ru_RU',getSpreadsheetTimeZone:()=> 'Europe/Moscow'})};
    const plan=c._LCDCO_inspect_();assert.equal(plan.valid,true,JSON.stringify(plan.blockers));assert.equal(plan.append.length,6);assert.equal(plan.startRow,5);
    own.set('F48','User content');const conflict=c._LCDCO_inspect_();assert.equal(conflict.valid,false);assert.ok(conflict.blockers.some(b=>b.cell==='F48'));
  });
  test('COST-06 approval missing prevents writes',()=>{
    let released=false;
    c.LockService={getScriptLock:()=>({tryLock:()=>true,releaseLock(){released=true;}})};
    c.PropertiesService={getScriptProperties:()=>({getProperty:()=>null})};
    c._LCDCO_inspect_=()=>({valid:true,schema,append:[],states:[],cells:[],blockers:[]});
    const report=c.LC_installDemoCosts();assert.equal(report.code,'DEMO_COSTS_APPROVAL_REQUIRED');assert.equal(released,true);
  });
  return {valid:tests.every(t=>t.pass),tests};
}
