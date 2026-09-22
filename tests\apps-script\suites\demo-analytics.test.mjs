import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

export function runDemoAnalyticsSuite() {
  const context=vm.createContext({Logger:{log(){}},Intl});
  for(const name of ['AppConfig','SheetRegistry','SchemaDefinitions','FinancialCoreFormulaInstaller','DemoAndOwnerDesk','OwnerDeskLive','DemoCosts','DemoAnalytics'])vm.runInContext(fs.readFileSync(`src/apps-script/${name}.gs`,'utf8'),context);
  const tests=[];
  const test=(id,run)=>{try{run();tests.push({id,pass:true});}catch(error){tests.push({id,pass:false,message:error.message});}};
  const op=context.LC_getSchemaDefinition('OPERATIONS'), rf=context.LC_getSchemaDefinition('REFUNDS'), ex=context.LC_getSchemaDefinition('EXPENSES');

  test('AN-01 service screen uses only verified demo operation and refund IDs',()=>{
    const matrix=context._LCDA_serviceMatrix_(op,rf,"'_SYS_PERIODS'!O2",';');
    const formulas=matrix.flat().filter(value=>typeof value==='string'&&value.startsWith('=')).join('\n');
    for(const id of ['DEMO-OP-001','DEMO-OP-002','DEMO-OP-003'])assert.ok(formulas.includes(id));
    assert.ok(formulas.includes("'14_Возвраты'"));
  });
  test('AN-02 unavailable service profitability is not replaced with zero',()=>{
    const matrix=context._LCDA_serviceMatrix_(op,rf,"'_SYS_PERIODS'!O2",';');
    assert.deepEqual([matrix[5][6],matrix[6][6],matrix[7][6],matrix[8][6]],Array(4).fill('Недостаточно данных'));
  });
  test('AN-03 team screen shows only final approved demo pay records',()=>{
    const matrix=context._LCDA_teamMatrix_(op,rf,ex,"'_SYS_PERIODS'!O2",';');
    assert.ok(matrix[5][6].includes('DEMO-EXP-PAY-01'));
    assert.ok(matrix[6][6].includes('DEMO-EXP-PAY-02'));
    assert.equal(matrix[10][0],'Недостаточно данных');
  });
  test('AN-04 ru locale formulas use semicolons without changing quoted text',()=>{
    const matrix=context._LCDA_serviceMatrix_(op,rf,"'_SYS_PERIODS'!O2",';');
    assert.ok(matrix[2][0].includes(';'));
    assert.ok(matrix[2][0].includes('Предварительные данные'));
  });
  test('AN-05 target classification is absent, exact or conflict and rejects merges',()=>{
    const matrix=[[1,''],['','']];
    const mock=(values,formulas,merged=[])=>({getRange:()=>({getValues:()=>values,getFormulas:()=>formulas,getMergedRanges:()=>merged})});
    assert.equal(context._LCDA_target_(mock([['',''],['','']],[['',''],['','']]),'x','A1:B2',matrix).state,'absent');
    assert.equal(context._LCDA_target_(mock([[1,''],['','']],[['',''],['','']]),'x','A1:B2',matrix).state,'exact_match');
    assert.equal(context._LCDA_target_(mock([['foreign',''],['','']],[['',''],['','']]),'x','A1:B2',matrix).state,'conflict');
    assert.equal(context._LCDA_target_(mock([['',''],['','']],[['',''],['','']],[{}]),'x','A1:B2',matrix).state,'conflict');
  });
  test('AN-06 write path is approval gated and does not merge cells',()=>{
    const source=fs.readFileSync('src/apps-script/DemoAnalytics.gs','utf8');
    assert.ok(source.indexOf("getProperty('LC_DEMO_ANALYTICS_APPROVAL_TOKEN')")<source.indexOf('.setValues('));
    assert.ok(!source.includes('.merge'));
    assert.ok(!source.includes('.deleteRow('));
  });
  test('AN-07 screens preserve preliminary and missing-data explanations',()=>{
    const service=context._LCDA_serviceMatrix_(op,rf,"'_SYS_PERIODS'!O2",';');
    const team=context._LCDA_teamMatrix_(op,rf,ex,"'_SYS_PERIODS'!O2",';');
    assert.ok(service[11][0].includes('не распределены по услугам'));
    assert.ok(team[11][0].includes('не распределены по мастерам'));
    assert.ok(team[11][0].includes('без смен'));
  });
  return {valid:tests.every(test=>test.pass),tests};
}
