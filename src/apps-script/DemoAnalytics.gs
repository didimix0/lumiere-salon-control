/** Returns the read-only write plan for the demo service and team screens. @return {!Object} */
function LC_planDemoAnalytics() {
  try { return _LCDA_report_(_LCDA_public_(_LCDA_inspect_())); }
  catch (error) { return _LCDA_report_({valid:false,status:'demo_analytics_blocked',message:String(error.message || error)}); }
}

/** Builds only the approved demo service and team screens. @return {!Object} */
function LC_buildDemoAnalytics() {
  var lock=LockService.getScriptLock(), changes=[];
  if(!lock.tryLock(5000))return _LCDA_report_({valid:false,status:'demo_analytics_blocked',code:'DEMO_ANALYTICS_BUSY'});
  try {
    var before=_LCDA_inspect_();
    if(!before.valid)return _LCDA_report_(_LCDA_public_(before));
    if(PropertiesService.getScriptProperties().getProperty('LC_DEMO_ANALYTICS_APPROVAL_TOKEN')!=='demo_analytics_v1')return _LCDA_report_({valid:false,status:'demo_analytics_approval_required',approvalProperty:'LC_DEMO_ANALYTICS_APPROVAL_TOKEN',approvalToken:'demo_analytics_v1',plan:_LCDA_public_(before)});
    var after=_LCDA_inspect_();
    if(!after.valid||after.fingerprint!==before.fingerprint)throw new Error('DEMO_ANALYTICS_CONCURRENT_CHANGE');
    after.targets.forEach(function(target){
      if(target.state==='absent'){
        target.sheet.getRange(target.range).setValues(target.matrix);
        _LCDA_style_(target.sheet,target.kind);
        changes.push({sheet:target.sheet.getName(),range:target.range,action:'created'});
      } else changes.push({sheet:target.sheet.getName(),range:target.range,action:'already_present'});
    });
    SpreadsheetApp.flush();
    var check=_LCDA_inspect_(), serviceTotal=after.serviceSheet.getRange('E44').getValue(), teamTotal=after.teamSheet.getRange('E43').getValue(), payTotal=after.teamSheet.getRange('G43').getValue();
    var valid=check.valid&&check.targets.every(function(t){return t.state==='exact_match';})&&serviceTotal===10400&&teamTotal===10400&&payTotal===4000;
    return _LCDA_report_({valid:valid,status:valid?'demo_analytics_ready_for_review':'demo_analytics_verification_failed',changes:changes,metrics:{serviceNetRevenue:serviceTotal,teamNetRevenue:teamTotal,masterPay:payTotal},idempotencyPassed:check.valid&&check.targets.every(function(t){return t.state==='exact_match';}),sourceRecordsChanged:0,blockers:check.blockers});
  } catch(error) { return _LCDA_report_({valid:false,status:'demo_analytics_blocked',message:String(error.message || error),changes:changes}); }
  finally { lock.releaseLock(); }
}

function _LCDA_inspect_() {
  var ss=SpreadsheetApp.getActiveSpreadsheet(), blockers=[];
  var op=LC_getSchemaDefinition('OPERATIONS'), rf=LC_getSchemaDefinition('REFUNDS'), ex=LC_getSchemaDefinition('EXPENSES');
  var opSheet=ss.getSheetByName(op.sheetName), rfSheet=ss.getSheetByName(rf.sheetName), exSheet=ss.getSheetByName(ex.sheetName);
  if(!opSheet||!rfSheet||!exSheet||!_LCDOD_headers_(opSheet,op)||!_LCDOD_headers_(rfSheet,rf)||!_LCDOD_headers_(exSheet,ex))throw new Error('DEMO_ANALYTICS_SOURCE_SCHEMA_DRIFT');
  var sourceStates=[
    {sheet:op.sheetName,records:_LCDOD_classify_(opSheet,op,_LCDOD_operations_(op),'internal_operation_id')},
    {sheet:rf.sheetName,records:_LCDOD_classify_(rfSheet,rf,_LCDOD_refunds_(rf),'refund_id')},
    {sheet:ex.sheetName,records:_LCDOD_classify_(exSheet,ex,_LCDCO_rows_(ex),'expense_id')}
  ];
  sourceStates.forEach(function(group){if(group.records.some(function(r){return r.state!=='exact_match';}))blockers.push({code:'DEMO_ANALYTICS_SOURCE_NOT_ALIGNED',sheet:group.sheet,records:group.records.filter(function(r){return r.state!=='exact_match';}).map(function(r){return {id:r.recordId,state:r.state};})});});
  var periods=LC_getSchemaDefinition('SYS_PERIODS'), periodSheet=ss.getSheetByName(periods.sheetName);
  if(!periodSheet)throw new Error('DEMO_ANALYTICS_PERIODS_MISSING');
  var periodHeaders=periodSheet.getRange(periods.headerRow,1,1,periodSheet.getLastColumn()).getDisplayValues()[0], completenessIndex=periodHeaders.indexOf('input completeness status');
  var periodValues=periodSheet.getLastRow()>periods.headerRow?periodSheet.getRange(periods.headerRow+1,1,periodSheet.getLastRow()-periods.headerRow,periodHeaders.length).getValues():[];
  var periodIdIndex=_LCDOD_map_(periods).period_id, periodMatches=periodValues.map(function(row,index){return {row:row,index:index};}).filter(function(item){return String(item.row[periodIdIndex])==='2026-07';});
  if(completenessIndex<0||periodMatches.length!==1||['incomplete','complete'].indexOf(String(periodMatches[0].row[completenessIndex]))<0)blockers.push({code:'DEMO_ANALYTICS_COMPLETENESS_UNRESOLVED'});
  var completeCell=periodMatches.length===1&&completenessIndex>=0?"'"+periods.sheetName+"'!"+_LCFFI_letter_(completenessIndex+1)+(periods.headerRow+1+periodMatches[0].index):null;
  var separator=_LCODL_separator_(ss.getSpreadsheetLocale()), serviceSheet=ss.getSheetByName(LC_getSchemaDefinition('SERVICE_ANALYSIS').sheetName), teamSheet=ss.getSheetByName(LC_getSchemaDefinition('TEAM_ANALYSIS').sheetName);
  if(!serviceSheet||!teamSheet)throw new Error('DEMO_ANALYTICS_TARGET_SHEET_MISSING');
  var targets=[];
  if(completeCell){
    targets.push(_LCDA_target_(serviceSheet,'service','A36:H47',_LCDA_serviceMatrix_(op,rf,completeCell,separator)));
    targets.push(_LCDA_target_(teamSheet,'team','A36:H47',_LCDA_teamMatrix_(op,rf,ex,completeCell,separator)));
    targets.forEach(function(target){if(target.state==='conflict')blockers.push({code:'DEMO_ANALYTICS_TARGET_CONFLICT',sheet:target.sheet.getName(),range:target.range});});
  }
  var fingerprint=JSON.stringify({sources:sourceStates.map(function(g){return g.records.map(function(r){return r.recordId+':'+r.state;});}),targets:targets.map(function(t){return t.sheet.getName()+':'+t.state;}),completeness:periodMatches.length===1?String(periodMatches[0].row[completenessIndex]):null});
  return {valid:!blockers.length,blockers:blockers,sourceStates:sourceStates,targets:targets,serviceSheet:serviceSheet,teamSheet:teamSheet,fingerprint:fingerprint};
}

function _LCDA_serviceMatrix_(op,rf,completeCell,separator) {
  var rows=Array.from({length:12},function(){return Array(8).fill('');});
  rows[0][0]='Аналитика услуг'; rows[1][0]='Июль 2026 · результат по загруженным демонстрационным операциям';
  rows[2][0]='=IF('+completeCell+'="complete","Полнота данных подтверждена","Предварительные данные")';
  rows[4][0]='Услуга'; rows[4][1]='ID'; rows[4][2]='Процедуры'; rows[4][4]='Чистая выручка'; rows[4][6]='Маржинальная прибыль';
  var specs=[['Стрижка','DEMO-SVC-HAIR',['DEMO-OP-001']],['Окрашивание','DEMO-SVC-COLOR',['DEMO-OP-002']],['Маникюр','DEMO-SVC-NAIL',['DEMO-OP-003']]];
  specs.forEach(function(spec,index){var row=5+index;rows[row][0]=spec[0];rows[row][1]=spec[1];rows[row][2]=_LCDA_operationSum_(op,'quantity',spec[2]);rows[row][4]='='+_LCDA_operationSum_(op,'charged_amount',spec[2]).slice(1)+'-'+_LCDA_refundSum_(rf,spec[2]).slice(1);rows[row][6]='Недостаточно данных';});
  rows[8][0]='Итого'; rows[8][2]='=SUM(C41:C43)'; rows[8][4]='=SUM(E41:E43)'; rows[8][6]='Недостаточно данных';
  rows[10][0]='Ограничение анализа'; rows[11][0]='Материалы, налоги и комиссии загружены агрегированно и не распределены по услугам.';
  return _LCDA_localMatrix_(rows,separator);
}

function _LCDA_teamMatrix_(op,rf,ex,completeCell,separator) {
  var rows=Array.from({length:12},function(){return Array(8).fill('');});
  rows[0][0]='Аналитика команды'; rows[1][0]='Июль 2026 · результат по загруженным демонстрационным операциям';
  rows[2][0]='=IF('+completeCell+'="complete","Полнота данных подтверждена","Предварительные данные")';
  rows[4][0]='Мастер'; rows[4][1]='ID'; rows[4][2]='Процедуры'; rows[4][4]='Чистая выручка'; rows[4][6]='Фактическая выплата';
  var specs=[['Мастер 1','DEMO-MASTER-01',['DEMO-OP-001','DEMO-OP-003'],'DEMO-EXP-PAY-01'],['Мастер 2','DEMO-MASTER-02',['DEMO-OP-002'],'DEMO-EXP-PAY-02']];
  specs.forEach(function(spec,index){var row=5+index;rows[row][0]=spec[0];rows[row][1]=spec[1];rows[row][2]=_LCDA_operationSum_(op,'quantity',spec[2]);rows[row][4]='='+_LCDA_operationSum_(op,'charged_amount',spec[2]).slice(1)+'-'+_LCDA_refundSum_(rf,spec[2]).slice(1);rows[row][6]=_LCDA_expenseSum_(ex,spec[3]);});
  rows[7][0]='Итого'; rows[7][2]='=SUM(C41:C42)'; rows[7][4]='=SUM(E41:E42)'; rows[7][6]='=SUM(G41:G42)';
  rows[9][0]='Прямой результат мастера'; rows[10][0]='Недостаточно данных'; rows[11][0]='Материалы, налоги и комиссии не распределены по мастерам; загрузка без смен не рассчитывается.';
  return _LCDA_localMatrix_(rows,separator);
}

function _LCDA_operationSum_(schema,field,ids) {
  var amount=_LCDA_ref_(schema,field), id=_LCDA_ref_(schema,'internal_operation_id'), status=_LCDA_ref_(schema,'operation_status'), included=_LCDA_ref_(schema,'included_in_calculation');
  return '=SUM('+ids.map(function(value){return 'SUMIFS('+amount+','+id+',"'+value+'",'+status+',"Выполнена",'+included+',TRUE)';}).join(',')+')';
}
function _LCDA_refundSum_(schema,operationIds) {
  var amount=_LCDA_ref_(schema,'refund_amount'), id=_LCDA_ref_(schema,'original_operation_id'), included=_LCDA_ref_(schema,'included_in_calculation');
  return '=SUM('+operationIds.map(function(value){return 'SUMIFS('+amount+','+id+',"'+value+'",'+included+',TRUE)';}).join(',')+')';
}
function _LCDA_expenseSum_(schema,expenseId) {
  return '=SUMIFS('+_LCDA_ref_(schema,'amount')+','+_LCDA_ref_(schema,'expense_id')+',"'+expenseId+'",'+_LCDA_ref_(schema,'included_in_calculation')+',TRUE)';
}
function _LCDA_ref_(schema,field) { var column=_LCFFI_column_(schema,field); return "'"+schema.sheetName.replace(/'/g,"''")+"'!"+column+(schema.headerRow+1)+':'+column; }
function _LCDA_localMatrix_(matrix,separator) { return matrix.map(function(row){return row.map(function(value){return typeof value==='string'&&value.charAt(0)==='='?_LCODL_localFormula_(value,separator):value;});}); }

function _LCDA_target_(sheet,kind,rangeA1,matrix) {
  var range=sheet.getRange(rangeA1), values=range.getValues(), formulas=range.getFormulas();
  if(range.getMergedRanges().length)return {sheet:sheet,kind:kind,range:rangeA1,matrix:matrix,state:'conflict'};
  var actual=values.map(function(row,i){return row.map(function(value,j){return formulas[i][j]||value;});});
  if(_LCDOD_equal_(actual,matrix))return {sheet:sheet,kind:kind,range:rangeA1,matrix:matrix,state:'exact_match'};
  var blank=values.every(function(row,i){return row.every(function(value,j){return value===''&&!formulas[i][j];});});
  return {sheet:sheet,kind:kind,range:rangeA1,matrix:matrix,state:blank?'absent':'conflict'};
}

function _LCDA_style_(sheet,kind) {
  var range=sheet.getRange('A36:H47');
  range.setFontFamily('Arial').setFontSize(10).setFontColor('#1F2933').setVerticalAlignment('middle');
  sheet.setRowHeights(36,12,25); sheet.setRowHeight(36,40);
  sheet.getRange('A36:H36').setBackground('#17212B').setFontColor('#FFFFFF').setFontSize(16).setFontWeight('bold');
  sheet.getRange('A37:H37').setFontColor('#64748B').setFontStyle('italic');
  sheet.getRange('A38:H38').setBackground('#FFF4D6').setFontColor('#9A6700').setFontWeight('bold');
  sheet.getRange('A40:H40').setBackground('#DDE6EC').setFontColor('#334E68').setFontWeight('bold');
  var lastDataRow=kind==='service'?43:42, totalRow=kind==='service'?44:43;
  sheet.getRange(41,1,lastDataRow-40,8).setBackground('#F8FAFC');
  sheet.getRange(totalRow,1,1,8).setBackground('#E1F2EA').setFontColor('#146C43').setFontWeight('bold');
  sheet.getRange('C41:C44').setNumberFormat('0').setHorizontalAlignment('right');
  sheet.getRange('E41:E44').setNumberFormat('#,##0" ₽"').setHorizontalAlignment('right');
  sheet.getRange('G41:G44').setNumberFormat('#,##0" ₽"').setHorizontalAlignment('right');
  sheet.getRange('A46:H47').setFontColor('#64748B');
  sheet.getRange('A47:H47').setFontStyle('italic').setFontSize(9);
}

function _LCDA_public_(plan) {
  return {valid:plan.valid,status:plan.valid?'demo_analytics_awaiting_approval':'demo_analytics_blocked',periodId:'2026-07',targets:plan.targets.map(function(target){return {sheet:target.sheet.getName(),range:target.range,state:target.state};}),sources:plan.sourceStates.map(function(group){return {sheet:group.sheet,records:group.records.map(function(record){return {id:record.recordId,state:record.state};})};}),blockers:plan.blockers,expected:{serviceNetRevenue:10400,teamNetRevenue:10400,masterPay:4000},limitations:['Service contribution profit unavailable: direct costs are not allocated by service.','Master direct result unavailable: materials, tax and fees are not allocated by master.','Utilization unavailable: shifts are not loaded.'],approvalProperty:'LC_DEMO_ANALYTICS_APPROVAL_TOKEN',approvalToken:'demo_analytics_v1'};
}
function _LCDA_report_(result) { Logger.log(JSON.stringify(result)); return result; }
