/** Updates only the existing demo block; never loads or repairs source records. @return {!Object} */
function LC_updateOwnerDeskLive() {
  var lock = LockService.getScriptLock(), result;
  if (!lock.tryLock(5000)) return _LCODL_report_({valid:false,code:'OWNER_DESK_BUSY'});
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet(), sheet = ss.getSheetByName(LC_getSchemaDefinition('OWNER_DESK').sheetName);
    var op = LC_getSchemaDefinition('OPERATIONS'), rf = LC_getSchemaDefinition('REFUNDS');
    var os = ss.getSheetByName(op.sheetName), rs = ss.getSheetByName(rf.sheetName);
    if (!sheet || !os || !rs || !_LCDOD_headers_(os,op) || !_LCDOD_headers_(rs,rf)) throw new Error('OWNER_DESK_SCHEMA_DRIFT');
    var records = _LCDOD_classify_(os,op,_LCDOD_operations_(op),'internal_operation_id').concat(_LCDOD_classify_(rs,rf,_LCDOD_refunds_(rf),'refund_id'));
    if (records.some(function(r){return r.state !== 'exact_match';})) return _LCODL_report_({valid:false,code:'OWNER_DESK_DEMO_NOT_ALIGNED',records:records});
    var ps = LC_getSchemaDefinition('SYS_PERIODS'), periods = ss.getSheetByName(ps.sheetName);
    if (!periods) throw new Error('OWNER_DESK_PERIODS_MISSING');
    var headers = periods.getRange(ps.headerRow,1,1,periods.getLastColumn()).getDisplayValues()[0];
    var completenessIndex = headers.indexOf('input completeness status');
    var periodRows = periods.getRange(ps.headerRow+1,1,periods.getLastRow()-ps.headerRow,headers.length).getValues();
    var matches = periodRows.map(function(r,i){return {row:r,index:i};}).filter(function(r){return r.row[_LCDOD_map_(ps).period_id] === '2026-07';});
    if (completenessIndex < 0 || matches.length !== 1 || ['incomplete','complete'].indexOf(matches[0].row[completenessIndex]) < 0) throw new Error('OWNER_DESK_COMPLETENESS_UNRESOLVED');
    var completeCell = "'"+ps.sheetName.replace(/'/g,"''")+"'!"+_LCFFI_letter_(completenessIndex+1)+(ps.headerRow+1+matches[0].index);
    var locale = ss.getSpreadsheetLocale(), separator = _LCODL_separator_(locale);
    var canonical = _LCODL_cells_(op,rf,completeCell);
    var expected = _LCODL_localCells_(canonical,separator), range = sheet.getRange(30,1,25,8);
    if (range.getMergedRanges().length) throw new Error('OWNER_DESK_MERGE_CONFLICT');
    var values = range.getValues(), formulas = range.getFormulas();
    var display = range.getDisplayValues();
    var state = _LCODL_state_(values,formulas,expected,display);
    if (state === 'conflict' && _LCODL_state_(values,formulas,canonical,display) === 'aligned') state = 'formula_upgrade';
    if (state === 'conflict') return _LCODL_report_({valid:false,status:'owner_desk_live_blocked',message:'OWNER_DESK_CONTENT_CONFLICT',conflicts:_LCODL_conflicts_(values,formulas,display),changed:false});
    var changedCells=[];
    if (state === 'formula_upgrade') {
      changedCells=_LCODL_writeFormulas_(sheet,formulas,expected);
      SpreadsheetApp.flush();
    } else if (state !== 'aligned') {
      range.setValues(expected);
      range.setBackground('#ffffff').setFontColor('#20282b').setFontFamily('Arial').setFontSize(11).setVerticalAlignment('middle');
      sheet.setRowHeights(30,25,26);
      sheet.getRange('A30:H30').setBackground('#20282b').setFontColor('#ffffff').setFontSize(20).setFontWeight('bold');
      sheet.setRowHeight(30,42);
      sheet.getRange('A34:H34').setBackground('#fff1cc').setFontColor('#704c00');
      [36,39,42].forEach(function(row){
        sheet.getRange(row,1,2,8).setBackground(row === 42 ? '#e0f0e9' : '#edf1f4');
        sheet.getRange(row,1).setFontWeight('bold');
        sheet.getRange(row+1,1).setFontSize(16).setFontWeight('bold').setNumberFormat('#,##0" ₽"');
        sheet.setRowHeight(row+1,38);
      });
      [46,49,52].forEach(function(row){sheet.getRange(row,1,1,8).setFontColor('#677277');});
      SpreadsheetApp.flush();
    }
    var after = range.getValues(), afterFormulas = range.getFormulas();
    var metrics = {revenue:after[7][0],refunds:after[10][0],netRevenue:after[13][0]};
    var valid = metrics.revenue === 10900 && metrics.refunds === 500 && metrics.netRevenue === 10400;
    var formulaChecks=[3,4,7,10,13].map(function(index){return {cell:'A'+(30+index),formula:afterFormulas[index][0],value:after[index][0]};});
    result = {valid:valid,status:valid?'owner_desk_live_ready_for_review':'owner_desk_live_control_mismatch',changed:state!=='aligned',changedFormulaCells:changedCells,locale:locale,argumentSeparator:separator,sheetName:sheet.getName(),range:'A30:H54',metrics:metrics,formulaChecks:formulaChecks,idempotencyPassed:valid&&_LCODL_state_(after,afterFormulas,expected)==='aligned',sourceRecordsChanged:0};
    ss.setActiveSheet(sheet);
    sheet.setActiveRange(sheet.getRange('A30'));
  } catch(error) {result={valid:false,status:'owner_desk_live_blocked',message:String(error.message || error)};}
  finally {lock.releaseLock();}
  return _LCODL_report_(result);
}

function _LCODL_cells_(op,rf,completeCell) {
  var cells = Array.from({length:25},function(){return Array(8).fill('');});
  cells[0][0]='Lumiere Salon Control'; cells[1][0]='Рабочий стол владельца · Июль 2026';
  cells[3][0]='=IF('+completeCell+'="complete","Полнота данных подтверждена","Предварительные данные")';
  cells[4][0]='=IF('+completeCell+'="complete","","Данные за период заполнены не полностью")';
  cells[6][0]='Выручка'; cells[7][0]=_LCODL_sumFormula_(op,'operation_date','charged_amount',completeCell,true);
  cells[9][0]='Возвраты'; cells[10][0]=_LCODL_sumFormula_(rf,'refund_date','refund_amount',completeCell,false);
  cells[12][0]='Чистая выручка'; cells[13][0]='=IF(AND(ISNUMBER(A37),ISNUMBER(A40)),A37-A40,"Недостаточно данных")';
  cells[15][0]='Расходы'; cells[16][0]='Недостаточно данных';
  cells[18][0]='Операционная прибыль'; cells[19][0]='Недостаточно данных';
  cells[21][0]='Доступно владельцу'; cells[22][0]='Недостаточно данных';
  cells[24][0]='Демонстрационные данные · 2026-07';
  return cells;
}

function _LCODL_sumFormula_(schema,dateField,amountField,completeCell,operations) {
  var ref = function(field){var col=_LCFFI_column_(schema,field);return "'"+schema.sheetName.replace(/'/g,"''")+"'!"+col+(schema.headerRow+1)+':'+col;};
  var date=ref(dateField), included=ref('included_in_calculation');
  var dates=date+',">="&DATE(2026,7,1),'+date+',"<"&DATE(2026,8,1)';
  var filters=dates+','+included+',TRUE'+(operations?','+ref('operation_status')+',"Выполнена"':'');
  return '=IFERROR(IF(OR('+completeCell+'="complete",COUNTIFS('+filters+')>0),SUMIFS('+ref(amountField)+','+filters+'),"Недостаточно данных"),"Проверьте исходные данные")';
}

function _LCODL_state_(values,formulas,expected,display) {
  var actual=values.map(function(row,i){return row.map(function(v,j){return formulas[i][j]||v;});});
  if (_LCDOD_equal_(actual,expected)) return 'aligned';
  var legacy=_LCDOD_deskValues_();
  if (formulas.some(function(row){return row.some(Boolean);})) return 'conflict';
  // The original installer verified its text template through getDisplayValues.
  // Preserve that contract for legacy cells; never ignore formulas or extra content.
  if (!_LCDOD_equal_((display || values).slice(0,8),legacy)) return 'conflict';
  return values.slice(8).every(function(row){return row.every(function(v){return v==='';});})?'upgrade':'conflict';
}
function _LCODL_conflicts_(values,formulas,display) {
  var legacy=_LCDOD_deskValues_(), conflicts=[];
  values.forEach(function(row,i){row.forEach(function(value,j){
    var expected=i<legacy.length?legacy[i][j]:'';
    if (formulas[i][j] || (i<legacy.length ? display[i][j]!==expected : value!=='')) {
      conflicts.push({cell:_LCFFI_letter_(j+1)+(30+i),reason:formulas[i][j]?'EXISTING_FORMULA':i<legacy.length?'LEGACY_TEXT_MISMATCH':'OCCUPIED_EXTENSION',valueType:Object.prototype.toString.call(value)});
    }
  });});
  return conflicts;
}
function _LCODL_report_(result){Logger.log(JSON.stringify(result));return result;}

function _LCODL_separator_(locale) {
  var tag=String(locale).replace(/_/g,'-');
  if (/^ru(?:-|$)/i.test(tag)) return ';';
  if (/^en(?:-|$)/i.test(tag)) return ',';
  return new Intl.NumberFormat(tag).format(1.1).indexOf(',')>=0?';':',';
}

// Only argument separators change; quoted labels and sheet names remain intact.
function _LCODL_localFormula_(formula,separator) {
  var quote=null, result='';
  for(var i=0;i<formula.length;i++) {
    var ch=formula[i];
    if(quote) {
      result+=ch;
      if(ch===quote) {
        if(formula[i+1]===quote) result+=formula[++i];
        else quote=null;
      }
    } else if(ch==='"'||ch==="'") {quote=ch;result+=ch;}
    else result+=(ch===','||ch===';')?separator:ch;
  }
  return result;
}
function _LCODL_localCells_(cells,separator) {
  return cells.map(function(row){return row.map(function(v){return typeof v==='string'&&v.charAt(0)==='='?_LCODL_localFormula_(v,separator):v;});});
}
function _LCODL_writeFormulas_(sheet,formulas,expected) {
  var changes=[];
  [3,4,7,10,13].forEach(function(index){
    if(formulas[index][0]!==expected[index][0]) {
      var cell='A'+(30+index);
      sheet.getRange(cell).setFormula(expected[index][0]);
      changes.push(cell);
    }
  });
  return changes;
}
