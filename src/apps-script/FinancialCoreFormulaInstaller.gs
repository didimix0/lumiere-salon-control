/** Plans missing Financial Core records without changing the workbook. @return {!Object} */
function LC_planFinancialCoreFormulaInstall() {
  return _LCFFI_public_(_LCFFI_inspect_());
}

/** Installs only approved missing Financial Core formula records. @return {!Object} */
function LC_installFinancialCoreFormulas() {
  var lock = LockService.getScriptLock(), before, after, rows, metricFormulas, qualityFormulas, validation;
  if (!lock.tryLock(5000)) return _LCFFI_result_(false, 'financial_core_formula_installation_blocked', [{code:'FINANCIAL_CORE_FORMULA_INSTALL_LOCK_UNAVAILABLE'}], [], []);
  try {
    if (PropertiesService.getScriptProperties().getProperty('LC_FINANCIAL_CORE_FORMULA_INSTALL_APPROVAL_TOKEN') !== 'financial_core_formula_installation_v1') return _LCFFI_result_(false, 'financial_core_formula_installation_blocked', [{code:'FINANCIAL_CORE_FORMULA_INSTALL_APPROVAL_REQUIRED'}], [], []);
    before = _LCFFI_inspect_();
    if (before.status === 'financial_core_formulas_already_aligned') return _LCFFI_result_(true, before.status, [], before.warnings, []);
    if (!before.canApply) return _LCFFI_result_(false, 'financial_core_formula_installation_blocked', before.blockers, before.warnings, []);
    after = _LCFFI_inspect_();
    if (after.fingerprint !== before.fingerprint) return _LCFFI_result_(false, 'financial_core_formula_installation_blocked', [{code:'FINANCIAL_CORE_FORMULA_CONCURRENT_CHANGE'}], after.warnings, []);
    rows = after.records.map(function (record) { return record.values; });
    metricFormulas = after.records.map(function (record) { return [record.metricFormula]; });
    qualityFormulas = after.records.map(function (record) { return [record.qualityFormula]; });
    after.calcSheet.getRange(after.calcSheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    after.calcSheet.getRange(after.calcSheet.getLastRow() - rows.length + 1, after.calcMap.metric_value + 1, rows.length, 1).setFormulas(metricFormulas);
    after.calcSheet.getRange(after.calcSheet.getLastRow() - rows.length + 1, after.calcMap.data_quality_status + 1, rows.length, 1).setFormulas(qualityFormulas);
    SpreadsheetApp.flush();
    validation = LC_validateFinancialCoreFormulaInstall();
    return validation.valid ? _LCFFI_result_(true, 'financial_core_formula_installation_completed', [], validation.warnings, validation.records) : _LCFFI_result_(false, 'financial_core_formula_installation_blocked', validation.blockers, validation.warnings, []);
  } finally {
    lock.releaseLock();
  }
}

/** Validates installed Financial Core records without writing. @return {!Object} */
function LC_validateFinancialCoreFormulaInstall() {
  var plan = _LCFFI_inspect_();
  return _LCFFI_public_(plan);
}

/** Returns JSON-safe installed Financial Core formula records without writing. @return {!Object} */
function LC_debugFinancialCoreFormulaRecords() {
  var ss, schema = LC_getSchemaDefinition('SYS_CALC'), sheet, map, lastRow, values, formulas, result = [];
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (error) { ss = null; }
  if (!ss || !schema || !(sheet = ss.getSheetByName(schema.sheetName))) return {valid:false,status:'financial_core_formula_debug_blocked',sheetName:schema ? schema.sheetName : '_SYS_CALC',records:[],blockers:[{code:'FINANCIAL_CORE_FORMULA_SHEET_UNAVAILABLE'}]};
  map = _LCFFI_map_(schema);
  lastRow = sheet.getLastRow();
  if (lastRow > schema.headerRow) {
    values = sheet.getRange(schema.headerRow + 1, 1, lastRow - schema.headerRow, schema.columns.length).getValues();
    formulas = sheet.getRange(schema.headerRow + 1, 1, lastRow - schema.headerRow, schema.columns.length).getFormulas();
    values.forEach(function (row, index) {
      if (String(row[map.calc_record_id] || '').indexOf('fc_v1_') === 0) result.push({sheetRowNumber:schema.headerRow + 1 + index,calcRecordId:String(row[map.calc_record_id]),periodId:String(row[map.period_id] || ''),metricCode:String(row[map.metric_code] || ''),metricValue:_LCFFI_primitive_(row[map.metric_value]),metricFormula:formulas[index][map.metric_value] || null,dataQualityStatus:_LCFFI_primitive_(row[map.data_quality_status]),dataQualityFormula:formulas[index][map.data_quality_status] || null});
    });
  }
  return {valid:true,status:'financial_core_formula_debug_completed',sheetName:schema.sheetName,recordCount:result.length,records:result,blockers:[]};
}

/** @return {!Object} */
function _LCFFI_inspect_() {
  var migration = LC_validatePeriodCompletenessMigration(), ss, calcSchema = LC_getSchemaDefinition('SYS_CALC'), periodsSchema = LC_getSchemaDefinition('SYS_PERIODS'), operationsSchema = LC_getSchemaDefinition('OPERATIONS'), refundsSchema = LC_getSchemaDefinition('REFUNDS'), blockers = [], warnings = [{code:'FINANCIAL_CORE_FORMULA_INSTALLATION_APPROVAL_REQUIRED'}], calcSheet, periodSheet, calcMap, periods, existing, expected, records, fingerprint;
  if (!migration.valid) blockers.push({code:'PERIOD_COMPLETENESS_SCHEMA_MIGRATION_REQUIRED'});
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (error) { ss = null; }
  if (!ss || !calcSchema || !periodsSchema || !operationsSchema || !refundsSchema) return _LCFFI_plan_(null, null, [], blockers.concat([{code:'FINANCIAL_CORE_FORMULA_SOURCE_UNAVAILABLE'}]), warnings, null);
  calcSheet = ss.getSheetByName(calcSchema.sheetName);
  periodSheet = ss.getSheetByName(periodsSchema.sheetName);
  if (!calcSheet || !periodSheet) return _LCFFI_plan_(calcSheet, null, [], blockers.concat([{code:'FINANCIAL_CORE_FORMULA_SHEET_UNAVAILABLE'}]), warnings, null);
  if (!_LCFFI_headers_(calcSheet, calcSchema) || !_LCFFI_headers_(periodSheet, periodsSchema)) blockers.push({code:'FINANCIAL_CORE_FORMULA_SCHEMA_DRIFT'});
  calcMap = _LCFFI_map_(calcSchema);
  periods = _LCFFI_periods_(periodSheet, periodsSchema);
  if (!periods.length) blockers.push({code:'FINANCIAL_CORE_FORMULA_PERIODS_EMPTY'});
  existing = _LCFFI_existing_(calcSheet, calcSchema);
  expected = _LCFFI_expected_(periods, calcSchema, periodsSchema, operationsSchema, refundsSchema);
  expected.forEach(function (record) {
    var current = existing[record.calcRecordId];
    if (current && current.sourceTraceReference !== 'financial-core-v1') blockers.push({code:'FINANCIAL_CORE_FORMULA_RECORD_CONFLICT',calcRecordId:record.calcRecordId});
  });
  records = expected.filter(function (record) { return !existing[record.calcRecordId]; });
  fingerprint = JSON.stringify({periods:periods,existing:Object.keys(existing).sort()});
  return _LCFFI_plan_(calcSheet, calcMap, records, blockers, warnings, fingerprint, expected.length);
}

/** @return {!Object} */
function _LCFFI_plan_(calcSheet, calcMap, records, blockers, warnings, fingerprint, expectedCount) {
  var status = blockers.length ? 'financial_core_formula_installation_blocked' : records.length ? 'financial_core_formula_installation_ready' : 'financial_core_formulas_already_aligned';
  return {valid:!blockers.length,status:status,canApply:status === 'financial_core_formula_installation_ready',approvalRequired:true,approvalTokenProperty:'LC_FINANCIAL_CORE_FORMULA_INSTALL_APPROVAL_TOKEN',writeEnabled:false,calcSheet:calcSheet,calcMap:calcMap,records:records,expectedCount:expectedCount || 0,blockers:blockers,warnings:warnings,fingerprint:fingerprint};
}

/** @return {!Object} */
function _LCFFI_public_(plan) {
  return {valid:plan.valid,status:plan.status,canApply:plan.canApply,approvalRequired:plan.approvalRequired,approvalTokenProperty:plan.approvalTokenProperty,writeEnabled:false,expectedRecordCount:plan.expectedCount,recordCount:plan.records.length,records:plan.records.map(function (record) { return {calcRecordId:record.calcRecordId,periodId:record.periodId,metricCode:record.metricCode}; }),blockers:plan.blockers,warnings:plan.warnings};
}

/** @return {!Object} */
function _LCFFI_result_(valid, status, blockers, warnings, changes) { return {valid:valid,status:status,writeEnabled:false,blockers:blockers || [],warnings:warnings || [],changes:changes || []}; }
/** @return {boolean} */
function _LCFFI_headers_(sheet, schema) { return sheet.getLastColumn() >= schema.columns.length && _LCPCM_same_(sheet.getRange(schema.headerRow, 1, 1, schema.columns.length).getDisplayValues()[0], schema.columns.map(function (column) { return column.label; })); }
/** @return {!Object} */
function _LCFFI_map_(schema) { var map = {}; schema.columns.forEach(function (column, index) { map[column.name] = index; }); return map; }
/** @return {string} */
function _LCFFI_column_(schema, name) { return _LCFFI_letter_(_LCFFI_map_(schema)[name] + 1); }
/** @return {string} */
function _LCFFI_letter_(number) { var result = ''; while (number) { var remainder = (number - 1) % 26; result = String.fromCharCode(65 + remainder) + result; number = Math.floor((number - 1) / 26); } return result; }
/** @return {!Array<!Object>} */
function _LCFFI_periods_(sheet, schema) { var map = _LCFFI_map_(schema), lastRow = sheet.getLastRow(), values, result = []; if (lastRow <= schema.headerRow) return result; values = sheet.getRange(schema.headerRow + 1, 1, lastRow - schema.headerRow, schema.columns.length).getValues(); values.forEach(function (row) { var periodId = row[map.period_id]; if (typeof periodId === 'string' && /^\d{4}-\d{2}$/.test(periodId)) result.push({periodId:periodId}); }); return result; }
/** @return {!Object} */
function _LCFFI_existing_(sheet, schema) { var map = _LCFFI_map_(schema), lastRow = sheet.getLastRow(), values, result = {}; if (lastRow <= schema.headerRow) return result; values = sheet.getRange(schema.headerRow + 1, 1, lastRow - schema.headerRow, schema.columns.length).getValues(); values.forEach(function (row) { if (row[map.calc_record_id]) result[String(row[map.calc_record_id])] = {sourceTraceReference:String(row[map.source_trace_reference] || '')}; }); return result; }
/** @return {!Array<!Object>} */
function _LCFFI_expected_(periods, calcSchema, periodsSchema, operationsSchema, refundsSchema) {
  var map = _LCFFI_map_(calcSchema), metrics = _LCFCI_metrics_(), now = new Date(), records = [];
  periods.forEach(function (period) { metrics.forEach(function (metric) { var values = Array(calcSchema.columns.length).fill(''), id = 'fc_v1_' + period.periodId + '_' + metric.metricCode; values[map.calc_record_id] = id; values[map.period_id] = period.periodId; values[map.metric_code] = metric.metricCode; values[map.dimension_type] = 'salon'; values[map.value_unit] = 'RUB'; values[map.calculation_rule_version] = 1; values[map.source_trace_reference] = 'financial-core-v1'; values[map.calculated_at] = now; values[map.comment] = 'Financial Core Iteration 4'; records.push({calcRecordId:id,periodId:period.periodId,metricCode:metric.metricCode,values:values,metricFormula:_LCFFI_formula_(metric.metricCode, period.periodId, periodsSchema, operationsSchema, refundsSchema),qualityFormula:_LCFFI_qualityFormula_(period.periodId, periodsSchema)}); }); });
  return records;
}
/** @return {string} */
function _LCFFI_formula_(metric, periodId, periodsSchema, operationsSchema, refundsSchema) {
  var p = 'DATEVALUE("' + periodId + '-01")', complete = _LCFFI_complete_(periodId, periodsSchema), opDate = _LCFFI_column_(operationsSchema, 'operation_date'), opStatus = _LCFFI_column_(operationsSchema, 'operation_status'), opIncluded = _LCFFI_column_(operationsSchema, 'included_in_calculation'), quantity = _LCFFI_column_(operationsSchema, 'quantity'), listPrice = _LCFFI_column_(operationsSchema, 'list_price'), charged = _LCFFI_column_(operationsSchema, 'charged_amount'), refundDate = _LCFFI_column_(refundsSchema, 'refund_date'), refundIncluded = _LCFFI_column_(refundsSchema, 'included_in_calculation'), refundAmount = _LCFFI_column_(refundsSchema, 'refund_amount'), opSheet = "'" + operationsSchema.sheetName + "'!", refundSheet = "'" + refundsSchema.sheetName + "'!", opFilter = '(' + opSheet + '$' + opDate + '$5:$' + opDate + '>=' + p + ')*(' + opSheet + '$' + opDate + '$5:$' + opDate + '<=EOMONTH(' + p + ',0))*(' + opSheet + '$' + opStatus + '$5:$' + opStatus + '="Выполнена")*(' + opSheet + '$' + opIncluded + '$5:$' + opIncluded + '=TRUE)', refundFilter = '(' + refundSheet + '$' + refundDate + '$5:$' + refundDate + '>=' + p + ')*(' + refundSheet + '$' + refundDate + '$5:$' + refundDate + '<=EOMONTH(' + p + ',0))*(' + refundSheet + '$' + opIncluded + '$5:$' + opIncluded + '=TRUE)', value;
  if (metric === 'gross_list_service_value') value = 'SUMPRODUCT(' + opFilter + '*' + opSheet + '$' + quantity + '$5:$' + quantity + '*' + opSheet + '$' + listPrice + '$5:$' + listPrice + ')';
  else if (metric === 'recognized_service_revenue_before_refunds') value = 'SUMPRODUCT(' + opFilter + '*' + opSheet + '$' + charged + '$5:$' + charged + ')';
  else if (metric === 'total_service_discounts') value = 'SUMPRODUCT(' + opFilter + '*(' + opSheet + '$' + quantity + '$5:$' + quantity + '*' + opSheet + '$' + listPrice + '$5:$' + listPrice + '-' + opSheet + '$' + charged + '$5:$' + charged + ')*(' + opSheet + '$' + quantity + '$5:$' + quantity + '*' + opSheet + '$' + listPrice + '$5:$' + listPrice + '>' + opSheet + '$' + charged + '$5:$' + charged + '))';
  else if (metric === 'total_service_refunds') value = 'SUMPRODUCT(' + refundFilter + '*' + refundSheet + '$' + refundAmount + '$5:$' + refundAmount + ')';
  else value = 'SUMIFS($F:$F,$B:$B,"' + periodId + '",$C:$C,"recognized_service_revenue_before_refunds")-SUMIFS($F:$F,$B:$B,"' + periodId + '",$C:$C,"total_service_refunds")';
  return '=IF(' + complete + ',' + value + ',"")';
}
/** @return {string} */
function _LCFFI_complete_(periodId, periodsSchema) { var id = _LCFFI_column_(periodsSchema, 'period_id'), status = _LCFFI_column_(periodsSchema, 'input_completeness_status'), sheet = "'" + periodsSchema.sheetName + "'!"; return 'INDEX(' + sheet + '$' + status + ':$' + status + ',MATCH("' + periodId + '",' + sheet + '$' + id + ':$' + id + ',0))="complete"'; }
/** @return {string} */
function _LCFFI_qualityFormula_(periodId, periodsSchema) { return '=IF(' + _LCFFI_complete_(periodId, periodsSchema) + ',"calculated","incomplete")'; }
/** @param {*} value @return {string|number|boolean|null} */
function _LCFFI_primitive_(value) { if (value === null || value === '' || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value === '' ? null : value; if (Object.prototype.toString.call(value) === '[object Date]') return value.toISOString(); return String(value); }
