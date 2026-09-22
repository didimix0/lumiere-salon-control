/** Validates the complete demonstration scenario without changing the workbook. @return {!Object} */
function LC_validateDemoMvp() {
  try { return _LCDMA_report_(_LCDMA_inspect_()); }
  catch (error) { return _LCDMA_report_({valid:false,status:'demo_mvp_acceptance_blocked',message:String(error.message || error)}); }
}

function _LCDMA_inspect_() {
  var ss=SpreadsheetApp.getActiveSpreadsheet(), blockers=[];
  var sourceSpecs=[
    ['OPERATIONS','internal_operation_id',_LCDOD_operations_],
    ['REFUNDS','refund_id',_LCDOD_refunds_],
    ['EXPENSES','expense_id',_LCDCO_rows_]
  ];
  var sources=sourceSpecs.map(function(spec){
    var schema=LC_getSchemaDefinition(spec[0]), sheet=ss.getSheetByName(schema.sheetName);
    if(!sheet||!_LCDOD_headers_(sheet,schema))throw new Error('DEMO_MVP_SOURCE_SCHEMA_DRIFT_'+spec[0]);
    var records=_LCDOD_classify_(sheet,schema,spec[2](schema),spec[1]);
    if(records.some(function(record){return record.state!=='exact_match';}))blockers.push({code:'DEMO_MVP_SOURCE_NOT_ALIGNED',sheet:schema.sheetName});
    return {sheet:schema.sheetName,records:records.map(function(record){return {id:record.recordId,state:record.state};})};
  });
  var period=_LCDMA_period_(ss);
  if(!period.valid)blockers.push({code:period.code});
  var owner=_LCDMA_screen_(ss,'OWNER_DESK','A30:H54',[
    ['A37',10900,true],['A40',500,true],['A43',10400,true],['A46',7332,true],['A49',3068,true],['F49',0.295,true],['A52','Недостаточно данных',false]
  ]);
  var services=_LCDMA_screen_(ss,'SERVICE_ANALYSIS','A36:H47',[
    ['C44',3,true],['E44',10400,true],['G41','Недостаточно данных',false],['G42','Недостаточно данных',false],['G43','Недостаточно данных',false],['G44','Недостаточно данных',false]
  ]);
  var team=_LCDMA_screen_(ss,'TEAM_ANALYSIS','A36:H47',[
    ['C43',3,true],['E43',10400,true],['G43',4000,true],['A46','Недостаточно данных',false]
  ]);
  [owner,services,team].forEach(function(screen){screen.blockers.forEach(function(blocker){blockers.push(blocker);});});
  var valid=!blockers.length;
  return {valid:valid,status:valid?'demo_mvp_acceptance_passed':'demo_mvp_acceptance_failed',periodId:'2026-07',periodCompleteness:period.completeness,metrics:{revenue:owner.values.A37,refunds:owner.values.A40,netRevenue:owner.values.A43,expenses:owner.values.A46,operatingProfit:owner.values.A49,operatingMargin:owner.values.F49,serviceNetRevenue:services.values.E44,teamNetRevenue:team.values.E43,masterPay:team.values.G43},limitations:{ownerAvailable:owner.values.A52,serviceContribution:services.values.G44,masterDirectResult:team.values.A46,utilization:'Недостаточно данных'},screens:[owner.publicResult,services.publicResult,team.publicResult],sources:sources,blockers:blockers,readOnly:true};
}

function _LCDMA_period_(ss) {
  var schema=LC_getSchemaDefinition('SYS_PERIODS'), sheet=ss.getSheetByName(schema.sheetName);
  if(!sheet)return {valid:false,code:'DEMO_MVP_PERIODS_MISSING',completeness:null};
  var headers=sheet.getRange(schema.headerRow,1,1,sheet.getLastColumn()).getDisplayValues()[0], completenessIndex=headers.indexOf('input completeness status');
  if(completenessIndex<0)return {valid:false,code:'DEMO_MVP_COMPLETENESS_HEADER_MISSING',completeness:null};
  var rows=sheet.getLastRow()>schema.headerRow?sheet.getRange(schema.headerRow+1,1,sheet.getLastRow()-schema.headerRow,headers.length).getValues():[], idIndex=_LCDOD_map_(schema).period_id;
  var matches=rows.filter(function(row){return String(row[idIndex])==='2026-07';});
  if(matches.length!==1)return {valid:false,code:'DEMO_MVP_PERIOD_NOT_UNIQUE',completeness:null};
  var completeness=String(matches[0][completenessIndex]);
  return {valid:completeness==='incomplete',code:completeness==='incomplete'?null:'DEMO_MVP_PRELIMINARY_STATUS_CHANGED',completeness:completeness};
}

function _LCDMA_screen_(ss,schemaKey,rangeA1,checks) {
  var schema=LC_getSchemaDefinition(schemaKey), sheet=ss.getSheetByName(schema.sheetName), blockers=[], values={};
  if(!sheet)return {blockers:[{code:'DEMO_MVP_SCREEN_MISSING',sheet:schema.sheetName}],values:values,publicResult:{sheet:schema.sheetName,range:rangeA1,valid:false}};
  var range=sheet.getRange(rangeA1);
  if(range.getMergedRanges().length)blockers.push({code:'DEMO_MVP_SCREEN_MERGED',sheet:schema.sheetName,range:rangeA1});
  range.getDisplayValues().forEach(function(row,i){row.forEach(function(value,j){if(_LCDMA_isFormulaError_(value))blockers.push({code:'DEMO_MVP_FORMULA_ERROR',sheet:schema.sheetName,cell:_LCFFI_letter_(j+1)+(range.getRow()+i),value:value});});});
  checks.forEach(function(check){
    var cell=sheet.getRange(check[0]), value=cell.getValue(); values[check[0]]=value;
    var matches=typeof check[1]==='number'?typeof value==='number'&&Math.abs(value-check[1])<0.0000001:value===check[1];
    if(!matches)blockers.push({code:'DEMO_MVP_CONTROL_MISMATCH',sheet:schema.sheetName,cell:check[0],expected:check[1],actual:value});
    if(check[2]&&!cell.getFormula())blockers.push({code:'DEMO_MVP_FORMULA_MISSING',sheet:schema.sheetName,cell:check[0]});
  });
  return {blockers:blockers,values:values,publicResult:{sheet:schema.sheetName,range:rangeA1,valid:!blockers.length}};
}
function _LCDMA_isFormulaError_(value) { return /^#(?:ERROR!|N\/A|REF!|VALUE!|DIV\/0!|NAME\?|NUM!|NULL!)$/i.test(String(value)); }
function _LCDMA_report_(result) { Logger.log(JSON.stringify(result)); return result; }
