import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

export function runOwnerDeskLiveSuite() {
  const context=vm.createContext({});
  for(const name of ['DemoAndOwnerDesk','FinancialCoreFormulaInstaller','OwnerDeskLive']) {
    vm.runInContext(fs.readFileSync(`src/apps-script/${name}.gs`,'utf8'),context);
  }
  const tests=[];
  function test(id,fn){try{fn();tests.push({id,pass:true});}catch(e){tests.push({id,pass:false,message:e.message});}}
  const schema=(sheetName,names)=>({sheetName,headerRow:4,columns:names.map(name=>({name}))});
  const op=schema('Operations',['operation_date','charged_amount','included_in_calculation','operation_status']);
  const rf=schema('Refunds',['refund_date','refund_amount','included_in_calculation']);
  const cells=context._LCODL_cells_(op,rf,"'Periods'!O2");
  const blanks=()=>Array.from({length:25},()=>Array(8).fill(''));
  test('ODL-01 legacy exact block may be upgraded',()=>{
    const values=blanks();context._LCDOD_deskValues_().forEach((r,i)=>values[i]=Array.from(r));
    assert.equal(context._LCODL_state_(values,blanks(),cells),'upgrade');
  });
  test('ODL-02 occupied extension blocks upgrade',()=>{
    const values=blanks();context._LCDOD_deskValues_().forEach((r,i)=>values[i]=Array.from(r));values[10][7]='User note';
    assert.equal(context._LCODL_state_(values,blanks(),cells),'conflict');
  });
  test('ODL-08 legacy displayed numbers match despite Sheets coercion',()=>{
    const values=blanks(),display=blanks();context._LCDOD_deskValues_().forEach((r,i)=>{values[i]=Array.from(r);display[i]=Array.from(r);});
    values[3][1]=10900;values[3][3]=500;values[3][5]=10400;
    values[1][1]=new Date('2026-07-01');
    assert.equal(context._LCODL_state_(values,blanks(),cells,display),'upgrade');
  });
  test('ODL-09 changed legacy text remains a conflict with cell evidence',()=>{
    const values=blanks();context._LCDOD_deskValues_().forEach((r,i)=>values[i]=Array.from(r));values[3][1]='12 000';
    assert.equal(context._LCODL_state_(values,blanks(),cells,values),'conflict');
    const report=context._LCODL_conflicts_(values,blanks(),values);assert.equal(report[0].cell,'B33');
  });
  test('ODL-03 visually blank formula also blocks upgrade',()=>{
    const values=blanks(), formulas=blanks();context._LCDOD_deskValues_().forEach((r,i)=>values[i]=Array.from(r));formulas[10][7]='=""';
    assert.equal(context._LCODL_state_(values,formulas,cells),'conflict');
  });
  test('ODL-04 calculated values preserve idempotency',()=>{
    const values=blanks(),formulas=blanks();cells.forEach((row,i)=>row.forEach((v,j)=>{if(String(v).startsWith('=')){formulas[i][j]=v;values[i][j]=10400;}else values[i][j]=v;}));
    assert.equal(context._LCODL_state_(values,formulas,cells),'aligned');
  });
  test('ODL-05 refunds use their own included column',()=>{
    const formula=cells[10][0];assert.ok(formula.includes("'Refunds'!C5:C,TRUE"));assert.ok(formula.includes('DATE(2026,8,1)'));assert.ok(formula.includes('COUNTIFS('));
  });
  test('ODL-06 unknown financial results remain text',()=>{
    for(const row of [16,19,22])assert.equal(cells[row][0],'Недостаточно данных');
    assert.ok(cells[13][0].includes('ISNUMBER(A37)'));assert.ok(cells[13][0].includes('A37-A40'));
  });
  test('ODL-07 missing source returns a clear blocker',()=>{
    context.LockService={getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})};
    context.Logger={log(){}};context.SpreadsheetApp={getActiveSpreadsheet:()=>({getSheetByName:()=>null})};
    context.LC_getSchemaDefinition=key=>({sheetName:key});
    const result=context.LC_updateOwnerDeskLive();assert.equal(result.valid,false);assert.equal(result.message,'OWNER_DESK_SCHEMA_DRIFT');
  });
  test('ODL-10 separators follow ru and en locales',()=>{
    assert.equal(context._LCODL_separator_('ru_RU'),';');
    assert.equal(context._LCODL_separator_('en_US'),',');
    const localized=context._LCODL_localCells_(cells,';');
    assert.ok(localized[7][0].includes('DATE(2026;7;1)'));
    assert.ok(localized[13][0].includes('ISNUMBER(A37);ISNUMBER(A40)'));
  });
  test('ODL-11 commas and escaped quotes inside strings remain intact',()=>{
    assert.equal(context._LCODL_localFormula_('=IF(1,"a,b; ""quoted""",\'Owner, desk\'!A1)',';'),'=IF(1;"a,b; ""quoted""";\'Owner, desk\'!A1)');
  });
  test('ODL-12 formula migration writes only five cells and repeats without writes',()=>{
    const formulas=blanks(), localized=context._LCODL_localCells_(cells,';'), writes=[];
    cells.forEach((row,i)=>row.forEach((v,j)=>{if(String(v).startsWith('='))formulas[i][j]=v;}));
    const sheet={getRange(cell){return {setFormula(value){writes.push(cell);formulas[Number(cell.slice(1))-30][0]=value;}};}};
    context._LCODL_writeFormulas_(sheet,formulas,localized);
    assert.deepEqual(writes,['A33','A34','A37','A40','A43']);
    context._LCODL_writeFormulas_(sheet,formulas,localized);
    assert.equal(writes.length,5);
  });
  return {valid:tests.every(t=>t.pass),tests};
}
