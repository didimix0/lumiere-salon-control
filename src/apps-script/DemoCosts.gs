/** Shows the complete demo-cost write plan without writes. @return {!Object} */
function LC_planDemoCosts() {
  try {return _LCDCO_report_(_LCDCO_public_(_LCDCO_inspect_()));}
  catch(error){return _LCDCO_report_({valid:false,status:'demo_costs_blocked',message:String(error.message||error)});}
}

/** Installs the explicitly approved six manual demo costs and desk formulas. @return {!Object} */
function LC_installDemoCosts() {
  var lock=LockService.getScriptLock(), changes=[];
  if(!lock.tryLock(5000))return _LCDCO_report_({valid:false,code:'DEMO_COSTS_BUSY'});
  try {
    var before=_LCDCO_inspect_();
    if(!before.valid)return _LCDCO_report_(_LCDCO_public_(before));
    if(PropertiesService.getScriptProperties().getProperty('LC_DEMO_COSTS_APPROVAL_TOKEN')!=='demo_costs_v1')return _LCDCO_report_({valid:false,code:'DEMO_COSTS_APPROVAL_REQUIRED',plan:_LCDCO_public_(before)});
    var after=_LCDCO_inspect_();
    if(!after.valid||after.fingerprint!==before.fingerprint)throw new Error('DEMO_COSTS_CONCURRENT_CHANGE');
    if(after.append.length){
      var auditMap=_LCDOD_map_(after.schema), now=new Date();
      var writeRows=after.append.map(function(row){var copy=row.slice();copy[auditMap.created_at]=now;copy[auditMap.updated_at]=now;return copy;});
      after.sheet.getRange(after.startRow,1,after.append.length,after.schema.columns.length).setValues(writeRows);
      changes.push({sheet:after.schema.sheetName,startRow:after.startRow,appendedRows:after.append.length});
    }
    after.cells.forEach(function(cell){
      var range=after.desk.getRange(cell.a1);
      if((range.getFormula()||range.getValue())!==cell.value){
        if(cell.value.charAt(0)==='=')range.setFormula(cell.value);else range.setValue(cell.value);
        if(cell.format)range.setNumberFormat(cell.format);
        changes.push({sheet:after.desk.getName(),cell:cell.a1});
      }
    });
    SpreadsheetApp.flush();
    var check=_LCDCO_inspect_(), expenses=after.desk.getRange('A46').getValue(), profit=after.desk.getRange('A49').getValue(), margin=after.desk.getRange('F49').getValue();
    var valid=check.valid&&check.append.length===0&&check.pendingCells===0&&expenses===7332&&profit===3068&&typeof margin==='number'&&Math.abs(margin-0.295)<1e-9;
    return _LCDCO_report_({valid:valid,status:valid?'demo_costs_ready_for_review':'demo_costs_verification_failed',changes:changes,metrics:{expenses:expenses,operatingProfit:profit,operatingMargin:margin},idempotencyPassed:check.valid&&check.append.length===0&&check.pendingCells===0,blockers:check.blockers,periodCompletenessChanged:false});
  }catch(error){return _LCDCO_report_({valid:false,status:'demo_costs_blocked',message:String(error.message||error),changes:changes});}
  finally{lock.releaseLock();}
}

function _LCDCO_rows_(schema) {
  var data=[['DEMO-EXP-MATERIALS','Материалы','Переменный операционный',1500,''],['DEMO-EXP-PAY-01','Оплата труда','Переменный операционный',1800,'DEMO-MASTER-01'],['DEMO-EXP-PAY-02','Оплата труда','Переменный операционный',2200,'DEMO-MASTER-02'],['DEMO-EXP-RENT','Аренда','Постоянный операционный',1000,''],['DEMO-EXP-TAX','Налоги','Переменный операционный',624,''],['DEMO-EXP-FEES','Банковские комиссии','Переменный операционный',208,'']];
  return data.map(function(r){return _LCDOD_row_(schema,{expense_id:r[0],recognition_date:new Date('2026-07-31T12:00:00+03:00'),expense_category:r[1],expense_nature:r[2],amount:r[3],master_id:r[4],source_type:'Ручной ввод',validation_status:'Корректна',included_in_calculation:true,comment:'DEMO costs v1: итоговый ручной расход за июль 2026; не клиентские данные; не начислять повторно. Материалы после возврата сохраняются.'});});
}

function _LCDCO_inspect_() {
  var ss=SpreadsheetApp.getActiveSpreadsheet(), schema=LC_getSchemaDefinition('EXPENSES'), sheet=ss.getSheetByName(schema.sheetName), desk=ss.getSheetByName(LC_getSchemaDefinition('OWNER_DESK').sheetName), blockers=[];
  if(!sheet||!desk||!_LCDOD_headers_(sheet,schema))throw new Error('DEMO_COSTS_SCHEMA_DRIFT');
  var expected=_LCDCO_rows_(schema), states=_LCDOD_classify_(sheet,schema,expected,'expense_id'), map=_LCDOD_map_(schema);
  states.forEach(function(r){if(r.state==='partial_or_conflicting')blockers.push({code:'DEMO_COST_ID_CONFLICT',id:r.recordId});});
  var existing=sheet.getLastRow()>schema.headerRow?sheet.getRange(schema.headerRow+1,1,sheet.getLastRow()-schema.headerRow,schema.columns.length).getValues():[];
  existing.forEach(function(r){if(_LCDCO_july_(r[map.recognition_date],ss.getSpreadsheetTimeZone())&&states.every(function(s){return s.recordId!==r[map.expense_id];}))blockers.push({code:'DEMO_COSTS_OTHER_PERIOD_EXPENSES'});});
  // This demo uses one manual expense ledger; alternative sources would double count costs.
  ['MATERIALS','SHIFTS','COMPENSATION_SCHEMES'].forEach(function(key){var s=LC_getSchemaDefinition(key), sh=ss.getSheetByName(s.sheetName);if(!sh||!_LCDOD_headers_(sh,s))throw new Error('DEMO_COSTS_SCHEMA_DRIFT_'+key);if(sh.getLastRow()>s.headerRow&&sh.getRange(s.headerRow+1,1,sh.getLastRow()-s.headerRow,s.columns.length).getValues().some(function(r){return r.some(function(v){return v!=='';});}))blockers.push({code:'DEMO_COSTS_ALTERNATIVE_SOURCE_PRESENT',sheet:s.sheetName});});
  var op=LC_getSchemaDefinition('OPERATIONS'), rf=LC_getSchemaDefinition('REFUNDS');
  [op,rf].forEach(function(s,index){
    var sh=ss.getSheetByName(s.sheetName), m=_LCDOD_map_(s);
    if(!sh||!_LCDOD_headers_(sh,s))throw new Error('DEMO_COSTS_SOURCE_SCHEMA_DRIFT');
    var demo=index===0?_LCDOD_operations_(s):_LCDOD_refunds_(s), id=index===0?'internal_operation_id':'refund_id';
    var state=_LCDOD_classify_(sh,s,demo,id);
    if(state.some(function(r){return r.state!=='exact_match';}))blockers.push({code:'DEMO_COSTS_SOURCE_CHANGED',sheet:s.sheetName});
    if(sh.getLastRow()>s.headerRow)sh.getRange(s.headerRow+1,1,sh.getLastRow()-s.headerRow,s.columns.length).getValues().forEach(function(r){
      if(!_LCDCO_july_(r[m[index===0?'operation_date':'refund_date']],ss.getSpreadsheetTimeZone()))return;
      if(state.every(function(d){return d.recordId!==r[m[id]];}))blockers.push({code:'DEMO_COSTS_OTHER_SOURCE_ROWS'});
      var fields=index===0?['actual_material_cost','actual_fee']:['master_pay_adjustment_amount'];
      if(fields.some(function(f){return m[f]!==undefined&&r[m[f]]!=='';}))blockers.push({code:'DEMO_COSTS_EXISTING_DIRECT_COST'});
    });
  });
  var startRow=Math.max(sheet.getLastRow()+1,schema.headerRow+1), append=states.filter(function(s){return s.state==='absent';}).map(function(s){return s.row;});
  if(startRow+append.length-1>sheet.getMaxRows())blockers.push({code:'DEMO_COSTS_INSUFFICIENT_ROWS'});
  append.forEach(function(row,i){
    var range=sheet.getRange(startRow+i,1,1,schema.columns.length);
    if(range.getMergedRanges().length)blockers.push({code:'DEMO_COSTS_MERGED_TARGET'});
    var rules=range.getDataValidations()[0];
    schema.columns.forEach(function(col,j){
      if(row[j]===''||!rules[j])return;
      var rule=rules[j],type=String(rule.getCriteriaType()),args=rule.getCriteriaValues(),allowed;
      if(type==='VALUE_IN_LIST')allowed=args[0];
      else if(type==='VALUE_IN_RANGE')allowed=args[0].getValues().reduce(function(a,r){return a.concat(r);},[]);
      else if(type==='CHECKBOX'){if(typeof row[j]!=='boolean')blockers.push({code:'DEMO_COSTS_BOOLEAN_INVALID',field:col.name});return;}
      else {blockers.push({code:'DEMO_COSTS_VALIDATION_UNSUPPORTED',field:col.name,rule:type});return;}
      if(allowed.map(String).indexOf(String(row[j]))<0)blockers.push({code:'DEMO_COSTS_LOOKUP_INVALID',field:col.name,value:String(row[j])});
    });
  });
  var cells=_LCDCO_cells_(schema,_LCODL_separator_(ss.getSpreadsheetLocale())), pendingCells=0;
  cells.forEach(function(c){var r=desk.getRange(c.a1),f=r.getFormula(),v=r.getValue();if(r.getMergedRanges().length)blockers.push({code:'DEMO_COSTS_DESK_MERGE',cell:c.a1});if((f||v)===c.value)return;if(f||v!==c.previous)blockers.push({code:'DEMO_COSTS_DESK_CONFLICT',cell:c.a1});else pendingCells++;});
  if(desk.getRange('A37').getValue()!==10900||desk.getRange('A40').getValue()!==500||desk.getRange('A43').getValue()!==10400)blockers.push({code:'DEMO_COSTS_REVENUE_NOT_VERIFIED'});
  return {valid:!blockers.length,blockers:blockers,schema:schema,sheet:sheet,desk:desk,states:states,startRow:startRow,append:append,cells:cells,pendingCells:pendingCells,fingerprint:JSON.stringify({existing:existing,states:states.map(function(s){return s.state;}),pending:pendingCells})};
}
function _LCDCO_july_(value,timeZone){return Object.prototype.toString.call(value)==='[object Date]'&&!isNaN(value.getTime())&&Utilities.formatDate(value,timeZone,'yyyy-MM')==='2026-07';}

function _LCDCO_cells_(schema,separator) {
  var ref=function(name){var c=_LCFFI_column_(schema,name);return "'"+schema.sheetName+"'!"+c+(schema.headerRow+1)+':'+c;};
  var date=ref('recognition_date'), filters=date+',">="&DATE(2026,7,1),'+date+',"<"&DATE(2026,8,1),'+ref('included_in_calculation')+',TRUE';
  var guards=_LCDCO_rows_(schema).map(function(r){return 'COUNTIFS('+ref('expense_id')+',"'+r[0]+'",'+filters+','+ref('amount')+',"<>",'+ref('amount')+',">=0")=1';}).join(',');
  var cells=[{a1:'A46',previous:'Недостаточно данных',value:'=IF(AND('+guards+'),SUMIFS('+ref('amount')+','+filters+'),"Недостаточно данных")',format:'#,##0" ₽"'},
    {a1:'A49',previous:'Недостаточно данных',value:'=IF(AND(ISNUMBER(A43),ISNUMBER(A46)),A43-A46,"Недостаточно данных")',format:'#,##0" ₽"'},
    {a1:'F48',previous:'',value:'Операционная маржинальность'},
    {a1:'F49',previous:'',value:'=IF(AND(ISNUMBER(A49),ISNUMBER(A43),A43<>0),A49/A43,"Недостаточно данных")',format:'0.0%'}];
  ['Материалы','Оплата труда','Аренда','Налоги','Банковские комиссии'].forEach(function(category,i){cells.push({a1:'F'+(36+i),previous:'',value:category},{a1:'H'+(36+i),previous:'',value:'=IF(ISNUMBER(A46),SUMIFS('+ref('amount')+','+filters+','+ref('expense_category')+',"'+category+'"),"Недостаточно данных")',format:'#,##0" ₽"'});});
  return cells.map(function(c){if(c.value.charAt(0)==='=')c.value=_LCODL_localFormula_(c.value,separator);return c;});
}
function _LCDCO_public_(p){return {valid:p.valid,status:p.valid?'demo_costs_awaiting_approval':'demo_costs_blocked',periodId:'2026-07',sheet:p.schema.sheetName,appendRows:p.append.length,appendRange:p.append.length?'A'+p.startRow+':'+_LCFFI_letter_(p.schema.columns.length)+(p.startRow+p.append.length-1):null,records:p.states.map(function(s){return {id:s.recordId,state:s.state};}),deskCells:p.cells.map(function(c){return c.a1;}),blockers:p.blockers,expected:{expenses:7332,operatingProfit:3068,operatingMargin:0.295},approvalProperty:'LC_DEMO_COSTS_APPROVAL_TOKEN',approvalToken:'demo_costs_v1'};}
function _LCDCO_report_(result){Logger.log(JSON.stringify(result));return result;}
