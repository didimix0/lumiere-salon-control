/** Plans the approved append-only completeness headers without writing. @return {!Object} */
function LC_planPeriodCompletenessMigration() { return _LCPCM_public_(_LCPCM_inspect_()); }

/** Applies only the four approved headers after an explicit approval token. @return {!Object} */
function LC_migratePeriodCompletenessSchema() {
  var lock = LockService.getScriptLock(), before, after, labels, statusValues;
  if (!lock.tryLock(5000)) return _LCPCM_result_(false, 'period_completeness_schema_migration_blocked', [{code:'PERIOD_COMPLETENESS_MIGRATION_LOCK_UNAVAILABLE'}], [], []);
  try {
    if (PropertiesService.getScriptProperties().getProperty('LC_PERIOD_COMPLETENESS_SCHEMA_MIGRATION_APPROVAL_TOKEN') !== 'period_completeness_schema_v1') return _LCPCM_result_(false, 'period_completeness_schema_migration_blocked', [{code:'PERIOD_COMPLETENESS_SCHEMA_MIGRATION_APPROVAL_REQUIRED'}], [], []);
    before = _LCPCM_inspect_();
    if (before.status === 'period_completeness_schema_already_aligned') return _LCPCM_result_(true, before.status, [], [], []);
    if (!before.canApply) return _LCPCM_result_(false, 'period_completeness_schema_migration_blocked', before.blockers, before.warnings, []);
    after = _LCPCM_inspect_();
    if (after.fingerprint !== before.fingerprint) return _LCPCM_result_(false, 'period_completeness_schema_migration_blocked', [{code:'PERIOD_COMPLETENESS_SCHEMA_CONCURRENT_CHANGE'}], after.warnings, []);
    if (after.sheet.getMaxColumns() < after.targetColumnCount) after.sheet.insertColumnsAfter(after.sheet.getMaxColumns(), after.targetColumnCount - after.sheet.getMaxColumns());
    if (!after.headersAligned) {
      labels = after.columns.map(function (column) { return column.label; });
      after.sheet.getRange(after.headerRow, after.baseColumnCount + 1, 1, labels.length).setValues([labels]);
      after = _LCPCM_inspect_();
    }
    if (after.periodRowsNeedingInitialization.length) {
      statusValues = after.periodRowsNeedingInitialization.map(function (rowNumber) {
        after.sheet.getRange(rowNumber, after.baseColumnCount + 1, 1, 1).setValues([['incomplete']]);
        return rowNumber;
      });
    }
    SpreadsheetApp.flush();
    after = LC_validatePeriodCompletenessMigration();
    return after.valid ? _LCPCM_result_(true, 'period_completeness_schema_migration_completed', [], after.warnings, [{field:'headers',status:'appended_or_verified',columns:labels || []},{field:'input_completeness_status',status:'initialised_to_incomplete',rowCount:statusValues ? statusValues.length : 0}]) : _LCPCM_result_(false, 'period_completeness_schema_migration_blocked', after.blockers, after.warnings, [{field:'headers_or_status',status:'written_but_validation_failed'}]);
  } finally { lock.releaseLock(); }
}

/** Validates the physical headers without writing. @return {!Object} */
function LC_validatePeriodCompletenessMigration() { var plan = _LCPCM_inspect_(); return _LCPCM_result_(plan.status === 'period_completeness_schema_already_aligned', plan.status, plan.blockers, plan.warnings, []); }

/** @return {!Object} */
function _LCPCM_inspect_() {
  var schema = LC_getSchemaDefinition('SYS_PERIODS'), columns = _LCPCM_columns_(), ss, sheet, base, header = [], labels, blockers = [], aligned = false, fingerprint = null, rows = [], periodRowsNeedingInitialization = [];
  if (!schema) return _LCPCM_plan_(null, columns, 0, blockers.concat([{code:'PERIOD_COMPLETENESS_SCHEMA_UNAVAILABLE'}]), aligned, fingerprint, null);
  base = schema.columns.filter(function (column) { return columns.map(function (item) { return item.name; }).indexOf(column.name) < 0; });
  if (schema.columns.length !== base.length + columns.length) blockers.push({code:'PERIOD_COMPLETENESS_SCHEMA_DEFINITION_INVALID'});
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (error) { ss = null; }
  sheet = ss && ss.getSheetByName(schema.sheetName);
  if (!sheet) blockers.push({code:'PERIOD_COMPLETENESS_SHEET_UNAVAILABLE',sheetName:schema.sheetName});
  if (sheet) {
    header = sheet.getRange(schema.headerRow, 1, 1, Math.max(sheet.getLastColumn(), base.length + columns.length)).getDisplayValues()[0];
    labels = columns.map(function (column) { return column.label; });
    if (!_LCPCM_same_(header.slice(0, base.length), base.map(function (column) { return column.label; }))) blockers.push({code:'PERIOD_COMPLETENESS_BASE_SCHEMA_DRIFT'});
    aligned = _LCPCM_same_(header.slice(base.length, base.length + columns.length), labels);
    if (!aligned && header.slice(base.length, base.length + columns.length).some(function (value) { return value !== ''; })) blockers.push({code:'PERIOD_COMPLETENESS_PARTIAL_SCHEMA'});
    if (header.slice(base.length + columns.length).some(function (value) { return value !== ''; })) blockers.push({code:'PERIOD_COMPLETENESS_UNKNOWN_COLUMNS_PRESENT'});
    if (aligned && sheet.getLastRow() > schema.headerRow) {
      rows = sheet.getRange(schema.headerRow + 1, 1, sheet.getLastRow() - schema.headerRow, base.length + columns.length).getValues();
      rows.forEach(function (row, index) {
        if (/^\d{4}-\d{2}$/.test(String(row[0] || '')) && row[base.length] === '') periodRowsNeedingInitialization.push(schema.headerRow + 1 + index);
      });
    }
    fingerprint = JSON.stringify({header:header,periodRowsNeedingInitialization:periodRowsNeedingInitialization});
  }
  return _LCPCM_plan_(schema, columns, base.length, blockers, aligned, fingerprint, sheet, periodRowsNeedingInitialization);
}

/** @return {!Array<!Object>} */
function _LCPCM_columns_() { return [{name:'input_completeness_status',label:'input completeness status'},{name:'input_completeness_confirmed_at',label:'input completeness confirmed at'},{name:'input_completeness_confirmed_by',label:'input completeness confirmed by'},{name:'input_completeness_source',label:'input completeness source'}]; }
/** @return {!Object} */
function _LCPCM_plan_(schema, columns, baseColumnCount, blockers, aligned, fingerprint, sheet, periodRowsNeedingInitialization) { var needsInitialization = (periodRowsNeedingInitialization || []).length > 0, status = aligned && !needsInitialization && !blockers.length ? 'period_completeness_schema_already_aligned' : blockers.length ? 'period_completeness_schema_migration_blocked' : 'period_completeness_schema_migration_ready'; return {valid:!blockers.length,status:status,canApply:status === 'period_completeness_schema_migration_ready',writeEnabled:false,approvalRequired:true,approvalTokenProperty:'LC_PERIOD_COMPLETENESS_SCHEMA_MIGRATION_APPROVAL_TOKEN',sheetName:schema ? schema.sheetName : '_SYS_PERIODS',headerRow:schema ? schema.headerRow : 1,baseColumnCount:baseColumnCount,targetColumnCount:baseColumnCount + columns.length,columns:columns,headersAligned:aligned,periodRowsNeedingInitialization:periodRowsNeedingInitialization || [],blockers:blockers,warnings:[],fingerprint:fingerprint,sheet:sheet}; }
/** @return {!Object} */
function _LCPCM_public_(plan) { return {valid:plan.valid,status:plan.status,canApply:plan.canApply,writeEnabled:plan.writeEnabled,approvalRequired:plan.approvalRequired,approvalTokenProperty:plan.approvalTokenProperty,sheetName:plan.sheetName,headerRow:plan.headerRow,baseColumnCount:plan.baseColumnCount,targetColumnCount:plan.targetColumnCount,columns:plan.columns,headersAligned:plan.headersAligned,periodRowsNeedingInitialization:plan.periodRowsNeedingInitialization,blockers:plan.blockers,warnings:plan.warnings,fingerprint:plan.fingerprint}; }
/** @return {!Object} */
function _LCPCM_result_(valid, status, blockers, warnings, changes) { return {valid:valid,status:status,writeEnabled:false,approvalRequired:true,blockers:blockers || [],warnings:warnings || [],changes:changes || []}; }
/** @return {boolean} */
function _LCPCM_same_(left, right) { return left.length === right.length && left.every(function (value, index) { return value === right[index]; }); }
