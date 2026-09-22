import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

export function runDemoMvpAcceptanceSuite() {
  const context=vm.createContext({Logger:{log(){}}});
  vm.runInContext(fs.readFileSync('src/apps-script/DemoMvpAcceptance.gs','utf8'),context);
  const tests=[];
  const test=(id,run)=>{try{run();tests.push({id,pass:true});}catch(error){tests.push({id,pass:false,message:error.message});}};

  test('ACC-01 common Sheets formula errors are detected',()=>{
    for(const value of ['#ERROR!','#N/A','#REF!','#VALUE!','#DIV/0!','#NAME?','#NUM!','#NULL!'])assert.equal(context._LCDMA_isFormulaError_(value),true);
  });
  test('ACC-02 ordinary labels and numbers are not errors',()=>{
    for(const value of ['Недостаточно данных','10 400 ₽','',10400])assert.equal(context._LCDMA_isFormulaError_(value),false);
  });
  test('ACC-03 acceptance is strictly read-only',()=>{
    const source=fs.readFileSync('src/apps-script/DemoMvpAcceptance.gs','utf8');
    for(const forbidden of ['.setValue(','.setValues(','.setFormula(','.setFormulas(','.clear(','.deleteRow(','.insertRow(','.merge'])assert.ok(!source.includes(forbidden),forbidden);
  });
  test('ACC-04 all three user screens are covered',()=>{
    const source=fs.readFileSync('src/apps-script/DemoMvpAcceptance.gs','utf8');
    for(const key of ['OWNER_DESK','SERVICE_ANALYSIS','TEAM_ANALYSIS'])assert.ok(source.includes(`'${key}'`));
  });
  test('ACC-05 unavailable metrics are required as text, not zero',()=>{
    const source=fs.readFileSync('src/apps-script/DemoMvpAcceptance.gs','utf8');
    assert.ok(source.includes("['A52','Недостаточно данных',false]"));
    assert.ok(source.includes("['G44','Недостаточно данных',false]"));
    assert.ok(source.includes("['A46','Недостаточно данных',false]"));
  });
  test('ACC-06 preliminary completeness remains mandatory for this demo',()=>{
    const source=fs.readFileSync('src/apps-script/DemoMvpAcceptance.gs','utf8');
    assert.ok(source.includes("completeness==='incomplete'"));
    assert.ok(source.includes('DEMO_MVP_PRELIMINARY_STATUS_CHANGED'));
  });
  return {valid:tests.every(test=>test.pass),tests};
}
