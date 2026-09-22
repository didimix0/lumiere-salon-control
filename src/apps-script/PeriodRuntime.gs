/** @return {!Object} */
function LC_planPeriodSetup() { return _LCP_publicPlan_(_LCP_inspect_()); }
/** @return {!Object} */
function LC_bootstrapPeriods() {
  var firstPlan = _LCP_inspect_(), freshPlan, writeRows, values, range, finalValidation, writeApplied = false;
  if (!firstPlan.valid) return _LCP_writeResult_('period_setup_blocked', firstPlan, [], []);
  if (!firstPlan.canApply) return _LCP_writeResult_('periods_already_aligned', firstPlan, [], []);
  freshPlan = _LCP_inspect_();
  if (!freshPlan.valid) return _LCP_writeResult_('period_setup_blocked', freshPlan, [], []);
  if (firstPlan.readFingerprint !== freshPlan.readFingerprint) {
    freshPlan.blockers.push({code:'PERIOD_SETUP_CONCURRENT_CHANGE'});
    freshPlan.valid = false;
    return _LCP_writeResult_('period_setup_blocked', freshPlan, [], []);
  }
  try {
    writeRows = _LCP_writeRows_(freshPlan);
    if (!writeRows.valid) return _LCP_writeResult_('period_setup_blocked', writeRows.plan, [], []);
    values = freshPlan.plannedActions.map(function (action) { return _LCP_newRow_(freshPlan, action); });
    range = freshPlan.sheet.getRange(writeRows.startRow, 1, values.length, freshPlan.columnCount);
    range.setValues(values);
    writeApplied = true;
    SpreadsheetApp.flush();
    finalValidation = LC_validatePeriods();
    if (!finalValidation.valid || finalValidation.missingExpectedPeriodIds.length) {
      return _LCP_writeResult_('period_setup_failed', freshPlan, writeRows.rowNumbers, finalValidation.errors, finalValidation, true);
    }
    return _LCP_writeResult_('period_setup_completed', freshPlan, writeRows.rowNumbers, [], finalValidation);
  } catch (error) {
    return _LCP_writeResult_('period_setup_failed', freshPlan, writeRows ? writeRows.rowNumbers : [], [{code:'PERIOD_SETUP_WRITE_FAILED', message:String(error && error.message || error)}], null, writeApplied);
  }
}
/** @return {!Object} */
function LC_validatePeriods() {
  var plan = _LCP_inspect_();
  return {
    valid:plan.valid,
    targetSheetName:plan.targetSheetName,
    periodCount:plan.existingPeriodCount,
    missingExpectedPeriodIds:plan.missingExpectedPeriodIds,
    resolvedStateCounts:plan.resolvedStateCounts,
    errors:plan.blockers,
    warnings:plan.warnings,
    rows:plan.rows
  };
}
/** Returns a JSON-safe, read-only diagnostic snapshot of nonempty period rows. @return {string} */
function LC_debugPeriodsRows() {
  var plan = _LCP_inspect_(), map = plan.columnMap || {}, values = plan.readValues ? plan.readValues.values : [];
  return JSON.stringify({status:plan.valid ? 'period_rows_diagnostic_completed' : 'period_rows_diagnostic_blocked', sheetName:plan.targetSheetName, rowCount:plan.rows.length, rows:plan.rows.map(function (row, index) {
    var raw = values[index] || [], codes = (row.errors || []).map(function (error) { return error.code; }), state = row.storedState;
    return {sheetRowNumber:row.rowNumber, periodId:row.periodId, dateFrom:row.periodStart, dateTo:row.periodEnd, storedState:state, closedAt:_LCP_iso_(raw[map.closed_at]), snapshotReference:_LCP_primitive_(raw[map.snapshot_reference]), rawValues:raw.map(_LCP_primitive_), derivedChecks:{periodIdFormatValid:codes.indexOf('PERIOD_ID_FORMAT_INVALID') < 0, dateRangeValid:codes.indexOf('PERIOD_DATE_RANGE_INVALID') < 0, expectedState:row.resolvedState, stateConflict:codes.indexOf('PERIOD_STORED_STATE_CONFLICT') >= 0}, blockerCodes:codes};
  })});
}
/** Applies only the approved period-id normalization after an explicit Script Properties token. @return {!Object} */
function LC_repairApprovedPeriodIds() {
  var token = PropertiesService.getScriptProperties().getProperty('LC_PERIOD_ID_REPAIR_APPROVAL_TOKEN'), plan = _LCP_inspect_(), expected = [{row:2,id:'2026-07',state:'current_preliminary'},{row:3,id:'2026-08',state:'forecast'}], tz = plan.spreadsheetTimeZone, rows, changes = [], validation, idempotency, idRange, persistedValues, persistedFormats, persisted;
  if (token !== 'period_id_normalization_2026_07_08') return {status:'period_runtime_repair_blocked',valid:false,blockers:[{code:'PERIOD_REPAIR_APPROVAL_TOKEN_REQUIRED'}],errors:[],warnings:[],changes:[]};
  if (!plan.sheet || !plan.columnMap || !plan.valid && !plan.rows.length) return {status:'period_runtime_repair_blocked',valid:false,blockers:plan.blockers || [{code:'PERIOD_REPAIR_SHEET_UNAVAILABLE'}],errors:[],warnings:plan.warnings || [],changes:[]};
  idRange = plan.sheet.getRange(2, plan.columnMap.period_id + 1, 2, 1);
  rows = expected.map(function (item) { return {item:item, values:plan.sheet.getRange(item.row, 1, 1, plan.columnCount).getValues()[0]}; });
  if (rows.every(function (entry) { return _LCP_text_(entry.values[plan.columnMap.period_id]) === entry.item.id; }) && idRange.getNumberFormats().every(function (formatRow) { return formatRow[0] === '@'; })) { validation = LC_validatePeriods(); return {status:'period_runtime_repair_already_aligned',valid:validation.valid && !validation.errors.length,blockers:validation.errors,errors:[],warnings:validation.warnings,changes:[],validation:validation}; }
  for (var index = 0; index < rows.length; index += 1) {
    var entry = rows[index], value = entry.values, map = plan.columnMap, rawId = value[map.period_id];
    if (!(rawId instanceof Date) || _LCP_date_(rawId, tz) !== entry.item.id + '-01' || _LCP_date_(value[map.date_from], tz) !== entry.item.id + '-01' || _LCP_date_(value[map.date_to], tz) !== _LCP_date_(_LCP_monthDates_(entry.item.id).end, tz) || _LCP_text_(value[map.period_status]) !== entry.item.state) return {status:'period_runtime_repair_blocked',valid:false,blockers:[{code:'PERIOD_REPAIR_CANDIDATE_MISMATCH',sheetRowNumber:entry.item.row}],errors:[],warnings:[],changes:[]};
  }
  idRange.setNumberFormat('@');
  idRange.setValues(expected.map(function (item) { return [item.id]; }));
  changes = expected.map(function (item) { return {sheetRowNumber:item.row,field:'period_id',numberFormat:'@',value:item.id}; });
  SpreadsheetApp.flush();
  persistedValues = idRange.getValues();
  persistedFormats = idRange.getNumberFormats();
  persisted = expected.every(function (item, index) { return typeof persistedValues[index][0] === 'string' && persistedValues[index][0] === item.id && persistedFormats[index][0] === '@'; });
  if (!persisted) return {status:'period_runtime_repair_blocked',valid:false,blockers:[{code:'PERIOD_REPAIR_TEXT_WRITE_NOT_PRESERVED'}],errors:[],warnings:[],changes:changes,actualNumberFormats:persistedFormats,actualValueTypes:persistedValues.map(function (row) { return row[0] instanceof Date ? 'date' : typeof row[0]; }),actualValues:persistedValues.map(function (row) { return _LCP_primitive_(row[0]); })};
  validation = LC_validatePeriods();
  if (!validation.valid || validation.errors.length) return {status:'period_runtime_repair_blocked',valid:false,blockers:validation.errors,errors:[],warnings:validation.warnings,changes:changes,validation:validation};
  idempotency = LC_repairApprovedPeriodIds();
  return {status:'period_runtime_repair_completed',valid:idempotency.status==='period_runtime_repair_already_aligned',blockers:[],errors:[],warnings:validation.warnings,changes:changes,validation:validation,idempotency:idempotency};
}

/** @return {!Object} */
function _LCP_inspect_() {
  var ss = _LCP_active_(), schema = LC_getSchemaDefinition('SYS_PERIODS'), blockers = [], warnings = [];
  var tz, today, currentPeriodId, nextPeriodId, sheet, map, values, rows, actions, ids, plan;
  if (!ss || !schema) return _LCP_planResult_(null, schema, null, null, [], blockers.concat([{code:'PERIOD_SHEET_NOT_FOUND'}]), warnings, null, null, null);
  tz = ss.getSpreadsheetTimeZone();
  today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  currentPeriodId = today.slice(0, 7);
  nextPeriodId = _LCP_next_(currentPeriodId);
  sheet = ss.getSheetByName(schema.sheetName);
  if (!sheet) return _LCP_planResult_(null, schema, tz, today, [], blockers.concat([{code:'PERIOD_SHEET_NOT_FOUND'}]), warnings, currentPeriodId, nextPeriodId, null);
  map = _LCP_columnMap_(schema, blockers);
  if (sheet.getMaxColumns() < schema.columns.length) blockers.push({code:'PERIOD_SHEET_COLUMN_COUNT_MISMATCH'});
  if (!_LCP_same_(sheet.getRange(schema.headerRow, 1, 1, schema.columns.length).getDisplayValues()[0], schema.columns.map(function (column) { return column.label; }))) blockers.push({code:'PERIOD_SHEET_HEADER_MISMATCH'});
  values = _LCP_readRows_(sheet, schema);
  rows = _LCP_rows_(values, schema, map, tz, currentPeriodId, blockers);
  ids = rows.map(function (row) { return row.periodId; }).filter(Boolean);
  actions = _LCP_missingActions_(ids, currentPeriodId, nextPeriodId, warnings);
  plan = _LCP_planResult_(sheet, schema, tz, today, rows, blockers, warnings, currentPeriodId, nextPeriodId, values);
  plan.columnMap = map;
  plan.plannedActions = actions;
  plan.canApply = plan.valid && actions.length > 0;
  plan.writeEnabled = plan.valid;
  return plan;
}

/** @param {!Object} sheet @param {!Object} schema @return {!Object} */
function _LCP_readRows_(sheet, schema) {
  var first = schema.headerRow + 1, count = Math.max(0, sheet.getMaxRows() - schema.headerRow);
  return {firstRow:first, values:count ? sheet.getRange(first, 1, count, schema.columns.length).getValues() : []};
}
/** @param {!Object} read @param {!Object} schema @param {!Object} map @param {string} tz @param {string} current @param {!Array} blockers @return {!Array} */
function _LCP_rows_(read, schema, map, tz, current, blockers) {
  var rows = [], seen = {}, seenBlank = false;
  read.values.forEach(function (valueRow, index) {
    var empty = _LCP_empty_(valueRow), periodId, start, end, state, closed, errors, resolved;
    if (empty) { seenBlank = true; return; }
    if (seenBlank) blockers.push({code:'PERIOD_INTERNAL_EMPTY_ROW', rowNumber:read.firstRow + index});
    periodId = _LCP_text_(valueRow[map.period_id]);
    start = _LCP_date_(valueRow[map.date_from], tz);
    end = _LCP_date_(valueRow[map.date_to], tz);
    state = _LCP_text_(valueRow[map.period_status]);
    closed = !_LCP_emptyValue_(valueRow[map.closed_at]);
    errors = [];
    if (!/^\d{4}-\d{2}$/.test(periodId)) errors.push({code:'PERIOD_ID_FORMAT_INVALID'});
    if (seen[periodId]) errors.push({code:'PERIOD_ID_DUPLICATE'});
    seen[periodId] = true;
    resolved = closed ? 'closed_actual' : periodId === current ? 'current_preliminary' : periodId > current ? 'forecast' : null;
    if (!resolved) errors.push({code:'PAST_PERIOD_NOT_CLOSED'});
    if (state && ['closed_actual','current_preliminary','forecast'].indexOf(state) < 0) errors.push({code:'PERIOD_STATE_INVALID'});
    if (state && resolved && state !== resolved) errors.push({code:'PERIOD_STORED_STATE_CONFLICT'});
    if (!_LCP_validPeriodDates_(periodId, start, end, tz)) errors.push({code:'PERIOD_DATE_RANGE_INVALID'});
    errors.forEach(function (error) { blockers.push(error); });
    rows.push({rowNumber:read.firstRow + index, periodId:periodId || null, periodStart:start, periodEnd:end, storedState:state || null, explicitlyClosed:closed, resolvedState:resolved, isCurrentMonth:periodId === current, isPastMonth:periodId < current, isFutureMonth:periodId > current, errors:errors, warnings:[]});
  });
  return rows;
}
/** @param {!Array<string>} ids @param {string} current @param {string} next @param {!Array} warnings @return {!Array} */
function _LCP_missingActions_(ids, current, next, warnings) {
  var result = [];
  [{periodId:current, periodStatus:'current_preliminary', action:'create_current_preliminary_period', warning:'CURRENT_PERIOD_ROW_MISSING'}, {periodId:next, periodStatus:'forecast', action:'create_next_forecast_period', warning:'NEXT_FORECAST_PERIOD_ROW_MISSING'}].forEach(function (item) {
    if (ids.indexOf(item.periodId) < 0) { warnings.push({code:item.warning, periodId:item.periodId}); result.push({action:item.action, periodId:item.periodId, periodStatus:item.periodStatus}); }
  });
  return result;
}
/** @param {!Object} plan @return {!Object} */
function _LCP_writeRows_(plan) {
  var emptyRows = [], needed = plan.plannedActions.length, row, maxRows, trailing;
  plan.readValues.values.forEach(function (values, index) { if (_LCP_empty_(values)) emptyRows.push(plan.readValues.firstRow + index); });
  for (row = 0; row <= emptyRows.length - needed; row += 1) {
    if (_LCP_consecutive_(emptyRows.slice(row, row + needed))) return {valid:true, startRow:emptyRows[row], rowNumbers:emptyRows.slice(row, row + needed), plan:plan};
  }
  if (emptyRows.length < needed) {
    maxRows = plan.sheet.getMaxRows();
    trailing = emptyRows.length === 0 || (emptyRows[emptyRows.length - 1] === maxRows && _LCP_consecutive_(emptyRows));
    if (!trailing) {
      plan.blockers.push({code:'PERIOD_WRITE_ROWS_NOT_CONTIGUOUS'});
      plan.valid = false;
      return {valid:false, plan:plan};
    }
    plan.sheet.insertRowsAfter(maxRows, needed - emptyRows.length);
    row = emptyRows.length ? emptyRows[0] : maxRows + 1;
    return {valid:true, startRow:row, rowNumbers:Array.from({length:needed}, function (unused, index) { return row + index; }), plan:plan};
  }
  plan.blockers.push({code:'PERIOD_WRITE_ROWS_NOT_CONTIGUOUS'});
  plan.valid = false;
  return {valid:false, plan:plan};
}
/** @param {!Object} plan @param {!Object} action @return {!Array} */
function _LCP_newRow_(plan, action) {
  var row = Array(plan.columnCount).fill(''), dates = _LCP_monthDates_(action.periodId);
  row[plan.columnMap.period_id] = action.periodId;
  row[plan.columnMap.date_from] = dates.start;
  row[plan.columnMap.date_to] = dates.end;
  row[plan.columnMap.period_status] = action.periodStatus;
  return row;
}
/** @param {!Object} sheet @param {!Object} schema @param {?string} tz @param {?string} today @param {!Array} rows @param {!Array} blockers @param {!Array} warnings @param {?string} current @param {?string} next @param {?Object} read @return {!Object} */
function _LCP_planResult_(sheet, schema, tz, today, rows, blockers, warnings, current, next, read) {
  var counts = {closed_actual:0,current_preliminary:0,forecast:0}, ids = rows.map(function (row) { return row.periodId; }).filter(Boolean);
  rows.forEach(function (row) { if (row.resolvedState) counts[row.resolvedState] += 1; });
  if (counts.current_preliminary > 1) blockers.push({code:'MULTIPLE_CURRENT_PRELIMINARY_PERIODS'});
  return {valid:blockers.length === 0, canApply:false, writeEnabled:false, status:'period_setup_plan_ready', spreadsheetTimeZone:tz, today:today, currentPeriodId:current, targetSheetName:schema ? schema.sheetName : '_SYS_PERIODS', existingPeriodCount:rows.length, expectedPeriodIds:current ? [current,next] : [], existingPeriodIds:ids, missingExpectedPeriodIds:current ? [current,next].filter(function (id) { return ids.indexOf(id) < 0; }) : [], unexpectedPeriodIds:[], resolvedStateCounts:counts, plannedActions:[], blockers:blockers, warnings:warnings, rows:rows, columnCount:schema ? schema.columns.length : 0, readValues:read, readFingerprint:_LCP_fingerprint_(read ? read.values : []), sheet:sheet};
}
/** @param {!Object} plan @return {!Object} */
function _LCP_publicPlan_(plan) {
  return {valid:plan.valid, canApply:plan.canApply, writeEnabled:plan.writeEnabled, status:plan.status, spreadsheetTimeZone:plan.spreadsheetTimeZone, today:plan.today, currentPeriodId:plan.currentPeriodId, targetSheetName:plan.targetSheetName, existingPeriodCount:plan.existingPeriodCount, expectedPeriodIds:plan.expectedPeriodIds, existingPeriodIds:plan.existingPeriodIds, missingExpectedPeriodIds:plan.missingExpectedPeriodIds, unexpectedPeriodIds:plan.unexpectedPeriodIds, resolvedStateCounts:plan.resolvedStateCounts, plannedActions:plan.plannedActions, blockers:plan.blockers, warnings:plan.warnings, rows:plan.rows};
}
/** @param {string} status @param {!Object} plan @param {!Array<number>} rows @param {!Array} errors @param {?Object=} validation @param {boolean=} writeApplied @return {!Object} */
function _LCP_writeResult_(status, plan, rows, errors, validation, writeApplied) {
  var changed = !!writeApplied && status !== 'period_setup_completed' ? plan.plannedActions.map(function (action) { return action.periodId; }) : [];
  return {status:status, valid:status === 'period_setup_completed' || status === 'periods_already_aligned', writeEnabled:plan.writeEnabled, plannedActions:plan.plannedActions, blockers:plan.blockers, warnings:plan.warnings, createdRowNumbers:status === 'period_setup_completed' ? rows : [], createdPeriodIds:status === 'period_setup_completed' ? plan.plannedActions.map(function (action) { return action.periodId; }) : [], potentiallyChangedRowNumbers:changed.length ? rows : [], potentiallyChangedPeriodIds:changed, errors:errors, validation:validation || null};
}
/** @param {!Object} schema @param {!Array} blockers @return {!Object} */
function _LCP_columnMap_(schema, blockers) {
  var map = {};
  schema.columns.forEach(function (column, index) { map[column.name] = index; });
  ['period_id','date_from','date_to','period_status','closed_at'].forEach(function (name) { if (map[name] === undefined) blockers.push({code:'PERIOD_SCHEMA_COLUMN_MISSING', columnName:name}); });
  return map;
}
/** @param {string} id @return {!Object} */
function _LCP_monthDates_(id) { var parts = id.split('-'), year = Number(parts[0]), month = Number(parts[1]); return {start:new Date(year, month - 1, 1, 12), end:new Date(year, month, 0, 12)}; }
/** @param {string} id @param {?string} start @param {?string} end @param {string} tz @return {boolean} */
function _LCP_validPeriodDates_(id, start, end, tz) { var dates; if (!/^\d{4}-\d{2}$/.test(id) || !start || !end) return false; dates = _LCP_monthDates_(id); return start === Utilities.formatDate(dates.start, tz, 'yyyy-MM-dd') && end === Utilities.formatDate(dates.end, tz, 'yyyy-MM-dd'); }
/** @param {!Array} values @return {boolean} */
function _LCP_empty_(values) { return values.every(_LCP_emptyValue_); }
/** @param {*} value @return {boolean} */
function _LCP_emptyValue_(value) { return value === '' || value === null; }
/** @param {!Array<number>} rows @return {boolean} */
function _LCP_consecutive_(rows) { return rows.every(function (row, index) { return index === 0 || row === rows[index - 1] + 1; }); }
/** @param {*} value @return {string} */
function _LCP_text_(value) { return _LCP_emptyValue_(value) ? '' : String(value); }
/** @param {*} value @return {?string} */
function _LCP_iso_(value) { return value instanceof Date ? value.toISOString() : _LCP_emptyValue_(value) ? null : String(value); }
/** @param {*} value @return {*} */
function _LCP_primitive_(value) { return value instanceof Date ? value.toISOString() : _LCP_emptyValue_(value) ? null : typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? value : String(value); }
/** @param {*} value @param {string} tz @return {?string} */
function _LCP_date_(value, tz) { return value instanceof Date ? Utilities.formatDate(value, tz, 'yyyy-MM-dd') : _LCP_emptyValue_(value) ? null : String(value).slice(0, 10); }
/** @param {string} id @return {string} */
function _LCP_next_(id) { var parts = id.split('-'), year = Number(parts[0]), month = Number(parts[1]) + 1; if (month === 13) { year += 1; month = 1; } return year + '-' + String(month).padStart(2, '0'); }
/** @param {!Array} left @param {!Array} right @return {boolean} */
function _LCP_same_(left, right) { return left.length === right.length && left.every(function (value, index) { return value === right[index]; }); }
/** @param {!Array} values @return {string} */
function _LCP_fingerprint_(values) { return JSON.stringify(values, function (key, value) { return this[key] instanceof Date ? this[key].toISOString() : value; }); }
/** @return {?Object} */
function _LCP_active_() { try { return SpreadsheetApp.getActiveSpreadsheet(); } catch (error) { return null; } }
