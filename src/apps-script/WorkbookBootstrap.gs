/**
 * Builds and verifies the physical workbook scaffold from the static registry
 * and schema definitions. It deliberately contains no financial logic.
 */

/** @return {!Object} */
function LC_planWorkbookBootstrap() {
  var spreadsheet = _LC_getActiveSpreadsheet_();
  if (!spreadsheet) return _LC_planWithoutSpreadsheet_();
  return _LC_buildBootstrapPlan_(spreadsheet);
}

/** @return {!Object} */
function LC_bootstrapWorkbook() {
  var spreadsheet = _LC_getActiveSpreadsheet_();
  if (!spreadsheet) return _LC_bootstrapBlocked_([{code: 'NO_ACTIVE_SPREADSHEET'}]);
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return _LC_bootstrapBlocked_([{code: 'BOOTSTRAP_LOCK_UNAVAILABLE'}]);
  var created = [], reused = [], initialized = [], reordered = [], skipped = [], changed = [], originalName = null, reusedSheet = null;
  try {
    var plan = _LC_buildBootstrapPlan_(spreadsheet);
    if (!plan.canApply) return _LC_bootstrapBlocked_(plan.blockers, plan.warnings);
    if (plan.actions.reuseDefaultSheet) {
      reusedSheet = spreadsheet.getSheetByName(plan.actions.reuseDefaultSheet.from);
      originalName = reusedSheet.getName();
      reusedSheet.setName(plan.actions.reuseDefaultSheet.to);
      reused.push(plan.actions.reuseDefaultSheet.to);
      changed.push(plan.actions.reuseDefaultSheet.to);
    }
    plan.actions.createSheets.forEach(function (name) { spreadsheet.insertSheet(name); created.push(name); changed.push(name); });
    _LC_reorderManagedSheets_(spreadsheet, plan.registry);
    reordered = plan.actions.reorderSheets.slice();
    plan.actions.initializeSheets.forEach(function (name) {
      var sheet = spreadsheet.getSheetByName(name), schema = plan.definitionsByName[name];
      _LC_initializeSchemaSheet_(sheet, schema);
      initialized.push(name); changed.push(name);
    });
    skipped = plan.actions.skipSheets.slice();
    var validation = LC_validateWorkbookStructure();
    if (!validation.valid) throw new Error('BOOTSTRAP_STRUCTURE_VALIDATION_FAILED');
    return {success: true, status: created.length || reused.length || initialized.length || reordered.length ? 'workbook_bootstrap_completed' : 'workbook_already_aligned', spreadsheetId: _LC_spreadsheetId_(spreadsheet), spreadsheetUrl: _LC_spreadsheetUrl_(spreadsheet), createdSheets: created, reusedSheets: reused, initializedSheets: initialized, reorderedSheets: reordered, skippedSheets: skipped, warnings: plan.warnings, blockers: [], validation: validation};
  } catch (error) {
    var rollback = _LC_rollbackBootstrap_(spreadsheet, created, reusedSheet, originalName);
    return {success: false, status: 'workbook_bootstrap_failed', spreadsheetId: _LC_spreadsheetId_(spreadsheet), spreadsheetUrl: _LC_spreadsheetUrl_(spreadsheet), createdSheets: created, reusedSheets: reused, initializedSheets: initialized, reorderedSheets: reordered, skippedSheets: skipped, warnings: [], blockers: [{code: 'BOOTSTRAP_RUNTIME_ERROR', message: String(error && error.message || error)}], validation: null, partialChanges: !rollback.complete, potentiallyChangedSheets: changed};
  } finally {
    lock.releaseLock();
  }
}

/** @return {!Object} */
function LC_validateWorkbookStructure() {
  var spreadsheet = _LC_getActiveSpreadsheet_();
  if (!spreadsheet) return {valid: false, spreadsheetId: null, managedSheetCount: 0, expectedManagedSheetCount: 31, errors: [{code: 'NO_ACTIVE_SPREADSHEET'}], warnings: [], schemasValidated: 0};
  var registry = LC_getSheetRegistry(), definitions = LC_getSchemaDefinitions(), sheets = spreadsheet.getSheets(), names = {}, errors = [], warnings = [], managed = 0;
  sheets.forEach(function (sheet) { if (names[sheet.getName()]) errors.push({code: 'DUPLICATE_SHEET_NAME', sheetName: sheet.getName()}); names[sheet.getName()] = sheet; });
  registry.forEach(function (entry, index) {
    var sheet = names[entry.name], schema = definitions[entry.schemaKey];
    if (!sheet) { errors.push({code: 'MISSING_MANAGED_SHEET', sheetName: entry.name}); return; }
    managed += 1;
    if (sheets[index] !== sheet) errors.push({code: 'MANAGED_SHEET_ORDER_MISMATCH', sheetName: entry.name});
    if (!schema || schema.sheetName !== entry.name || schema.headerRow !== entry.headerRow) { errors.push({code: 'SCHEMA_REGISTRY_MISMATCH', sheetName: entry.name}); return; }
    errors = errors.concat(_LC_validateSheetAgainstSchema_(sheet, schema));
  });
  sheets.forEach(function (sheet) { if (!definitions[_LC_schemaKeyForSheetName_(registry, sheet.getName())]) warnings.push({code: 'UNMANAGED_SHEET_PRESERVED', sheetName: sheet.getName()}); });
  return {valid: errors.length === 0, spreadsheetId: _LC_spreadsheetId_(spreadsheet), managedSheetCount: managed, expectedManagedSheetCount: 31, errors: errors, warnings: warnings, schemasValidated: managed};
}

/** @return {?Spreadsheet} */
function _LC_getActiveSpreadsheet_() { try { return SpreadsheetApp.getActiveSpreadsheet(); } catch (error) { return null; } }
/** @return {!Object} */
function _LC_planWithoutSpreadsheet_() { return {valid: false, canApply: false, spreadsheetId: null, registrySheetCount: 31, schemaCount: 31, actions: {reuseDefaultSheet: null, createSheets: [], initializeSheets: [], reorderSheets: [], skipSheets: []}, blockers: [{code: 'NO_ACTIVE_SPREADSHEET'}], warnings: []}; }
/** @param {!Array<!Object>} blockers @param {!Array<!Object>=} warnings @return {!Object} */
function _LC_bootstrapBlocked_(blockers, warnings) { return {success: false, status: 'workbook_bootstrap_blocked', spreadsheetId: null, spreadsheetUrl: null, createdSheets: [], reusedSheets: [], initializedSheets: [], reorderedSheets: [], skippedSheets: [], warnings: warnings || [], blockers: blockers, validation: null}; }
/** @param {!Object} spreadsheet @return {!Object} */
function _LC_buildBootstrapPlan_(spreadsheet) {
  var registry = LC_getSheetRegistry(), definitions = LC_getSchemaDefinitions(), definitionValidation = LC_validateSchemaDefinitions(), blockers = [], warnings = [], names = {}, sheets = spreadsheet.getSheets(), definitionsByName = {};
  registry.forEach(function (entry) { if (names[entry.name]) blockers.push({code: 'REGISTRY_DUPLICATE_SHEET_NAME', sheetName: entry.name}); names[entry.name] = entry; });
  if (registry.length !== 31 || Object.keys(names).length !== 31) blockers.push({code: 'REGISTRY_INVALID'});
  if (Object.keys(definitions).length !== 31 || !definitionValidation.valid || definitionValidation.errors.length || definitionValidation.warnings.length) blockers.push({code: 'SCHEMA_DEFINITIONS_INVALID'});
  if (LC_getImplementedSchemaKeys().join('|') !== registry.map(function (entry) { return entry.schemaKey; }).join('|')) blockers.push({code: 'SCHEMA_REGISTRY_ORDER_MISMATCH'});
  registry.forEach(function (entry) {
    var schema = definitions[entry.schemaKey], representation = schema && _LC_schemaRepresentation_(schema);
    if (!schema || schema.sheetName !== entry.name || schema.headerRow !== entry.headerRow) blockers.push({code: 'SCHEMA_REGISTRY_MISMATCH', sheetName: entry.name});
    if (schema && representation !== 'table' && representation !== 'layout_only') blockers.push({code: 'SCHEMA_REPRESENTATION_INVALID', sheetName: entry.name});
    if (schema && schema.representation === 'table' && (!schema.columns.length || schema.layout.length)) blockers.push({code: 'TABLE_SCHEMA_INVALID', sheetName: entry.name});
    if (schema && representation === 'layout_only' && (!schema.layout.length || schema.columns.length)) blockers.push({code: 'LAYOUT_SCHEMA_INVALID', sheetName: entry.name});
    if (schema) definitionsByName[entry.name] = schema;
  });
  var existing = {}; sheets.forEach(function (sheet) { existing[sheet.getName()] = sheet; });
  var reuse = _LC_canReuseDefaultSheet_(spreadsheet, registry, existing) ? {from: sheets[0].getName(), to: registry[0].name} : null;
  var create = [], initialize = [], skip = [];
  registry.forEach(function (entry) {
    var sheet = existing[entry.name] || (reuse && entry.name === reuse.to ? sheets[0] : null), schema = definitionsByName[entry.name];
    if (!sheet) { create.push(entry.name); initialize.push(entry.name); return; }
    var safety = _LC_isManagedSheetSafe_(sheet, schema);
    if (!safety.safe) blockers.push({code: 'MANAGED_SHEET_CONTENT_CONFLICT', sheetName: entry.name, message: safety.message});
    else if (safety.aligned) skip.push(entry.name); else initialize.push(entry.name);
  });
  sheets.forEach(function (sheet) { if (!names[sheet.getName()] && !(reuse && sheet === sheets[0])) warnings.push({code: 'UNMANAGED_SHEET_PRESERVED', sheetName: sheet.getName()}); });
  var currentManaged = sheets.filter(function (sheet) { return names[sheet.getName()]; }).map(function (sheet) { return sheet.getName(); });
  var expected = registry.map(function (entry) { return entry.name; });
  var reorder = currentManaged.join('|') === expected.join('|') && !reuse && !create.length ? [] : expected;
  return {valid: blockers.length === 0, canApply: blockers.length === 0, spreadsheetId: _LC_spreadsheetId_(spreadsheet), registrySheetCount: registry.length, schemaCount: Object.keys(definitions).length, actions: {reuseDefaultSheet: reuse, createSheets: create, initializeSheets: initialize, reorderSheets: reorder, skipSheets: skip}, blockers: blockers, warnings: warnings, registry: registry, definitionsByName: definitionsByName};
}
/** @param {!Object} spreadsheet @param {!Array<!Object>} registry @param {!Object} existing @return {boolean} */
function _LC_canReuseDefaultSheet_(spreadsheet, registry, existing) {
  if (spreadsheet.getSheets().length !== 1) return false;
  var sheet = spreadsheet.getSheets()[0];
  if (existing[registry[0].name] || _LC_schemaKeyForSheetName_(registry, sheet.getName())) return false;
  return _LC_isSheetEmpty_(sheet) && !_LC_hasSheetArtifacts_(sheet);
}
/** @param {!Object} sheet @param {!Object} schema @return {!Object} */
function _LC_isManagedSheetSafe_(sheet, schema) { if (_LC_isSheetEmpty_(sheet) && !_LC_hasSheetArtifacts_(sheet)) return {safe: true, aligned: false, message: ''}; var errors = _LC_validateSheetAgainstSchema_(sheet, schema); return errors.length ? {safe: false, aligned: false, message: errors[0].code} : {safe: true, aligned: true, message: ''}; }
/** @param {!Object} sheet @return {boolean} */
function _LC_isSheetEmpty_(sheet) { return sheet.getLastRow() === 0 && sheet.getLastColumn() === 0; }
/** @param {!Object} sheet @return {boolean} */
function _LC_hasSheetArtifacts_(sheet) { return !!(sheet.getFilter && sheet.getFilter()) || !!(sheet.getCharts && sheet.getCharts().length) || !!(sheet.getDrawings && sheet.getDrawings().length) || _LC_sheetMergedRanges_(sheet).length > 0 || _LC_sheetProtectionCount_(sheet) > 0; }
/** @param {!Object} sheet @return {number} */
function _LC_sheetProtectionCount_(sheet) { if (!sheet.getProtections || !SpreadsheetApp.ProtectionType) return 0; return sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET).length + sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE).length; }
/** @param {!Object} sheet @return {!Array} */
function _LC_sheetMergedRanges_(sheet) { return sheet.getDataRange && sheet.getDataRange().getMergedRanges ? sheet.getDataRange().getMergedRanges() : []; }
/** @param {!Object} schema @return {?string} */
function _LC_schemaRepresentation_(schema) { if (schema.representation === 'table' || schema.representation === 'layout_only') return schema.representation; if (schema.representation === undefined && Array.isArray(schema.columns) && schema.columns.length) return 'table'; return null; }
/** @param {!Object} sheet @param {!Object} schema */
function _LC_initializeSchemaSheet_(sheet, schema) { if (_LC_schemaRepresentation_(schema) === 'table') _LC_initializeTableSheet_(sheet, schema); else _LC_initializeLayoutSheet_(sheet, schema); }
/** @param {!Object} sheet @param {!Object} schema */
function _LC_initializeTableSheet_(sheet, schema) {
  var columns = schema.columns, row = schema.headerRow, labels = columns.map(function (column) { return column.label; });
  _LC_ensureSheetSize_(sheet, row, columns.length);
  if (!_LC_sameValues_(sheet.getRange(row, 1, 1, columns.length).getValues()[0], labels)) sheet.getRange(row, 1, 1, columns.length).setValues([labels]);
  var notes = columns.map(function (column) { return _LC_columnNote_(column); });
  sheet.getRange(row, 1, 1, columns.length).setNotes([notes]);
  columns.forEach(function (column, index) { sheet.setColumnWidth(index + 1, column.width); });
  sheet.setFrozenRows(row);
  var header = sheet.getRange(row, 1, 1, columns.length); header.setFontWeight('bold').setWrap(true).setVerticalAlignment('middle').setHorizontalAlignment('center').setBorder(false, false, true, false, false, false);
}
/** @param {!Object} column @return {string} */
function _LC_columnNote_(column) { return 'canonical name: ' + column.name + '\ntype: ' + column.type + (column.enumKey ? '\nenumKey: ' + column.enumKey : '') + '\n' + column.note; }
/** @param {!Object} sheet @param {!Object} schema */
function _LC_initializeLayoutSheet_(sheet, schema) {
  schema.layout.forEach(function (entry) {
    _LC_ensureSheetSize_(sheet, entry.startRow + entry.rowSpan - 1, entry.startColumn + entry.columnSpan - 1);
    var range = sheet.getRange(entry.startRow, entry.startColumn, entry.rowSpan, entry.columnSpan), expected = entry.key === 'PAGE_INSTRUCTION' ? entry.purpose : entry.title;
    _LC_ensureLayoutMerge_(sheet, range, entry);
    if (range.getCell(1, 1).getDisplayValue() !== expected) range.getCell(1, 1).setValue(expected);
    range.getCell(1, 1).setNote('key: ' + entry.key + '\nentryType: ' + entry.entryType + '\npurpose: ' + entry.purpose + '\n' + entry.notes);
    range.setWrap(true).setVerticalAlignment('top').setBorder(true, true, true, true, false, false);
    if (entry.key === 'PAGE_HEADER') range.setFontWeight('bold').setFontSize(16); else range.getCell(1, 1).setFontWeight('bold');
  });
}
/** @param {!Object} sheet @param {!Object} range @param {!Object} entry */
function _LC_ensureLayoutMerge_(sheet, range, entry) {
  if (entry.rowSpan === 1 && entry.columnSpan === 1) return;
  var conflicts = range.getMergedRanges();
  if (conflicts.length) { if (conflicts.length === 1 && _LC_sameA1_(conflicts[0], range)) return; throw new Error('LAYOUT_MERGE_CONFLICT:' + entry.key); }
  range.merge();
}
/** @param {!Object} sheet @param {number} rows @param {number} columns */
function _LC_ensureSheetSize_(sheet, rows, columns) { if (sheet.getMaxRows() < rows) sheet.insertRowsAfter(sheet.getMaxRows(), rows - sheet.getMaxRows()); if (sheet.getMaxColumns() < columns) sheet.insertColumnsAfter(sheet.getMaxColumns(), columns - sheet.getMaxColumns()); }
/** @param {!Object} sheet @param {!Object} schema @return {!Array<!Object>} */
function _LC_validateSheetAgainstSchema_(sheet, schema) {
  var errors = [];
  if (_LC_schemaRepresentation_(schema) === 'table') {
    if (sheet.getMaxRows() < schema.headerRow || sheet.getMaxColumns() < schema.columns.length) return [{code: 'TABLE_DIMENSIONS_MISSING', sheetName: sheet.getName()}];
    var actual = sheet.getRange(schema.headerRow, 1, 1, schema.columns.length).getDisplayValues()[0], expected = schema.columns.map(function (column) { return column.label; });
    if (!_LC_sameValues_(actual, expected)) errors.push({code: 'TABLE_HEADERS_MISMATCH', sheetName: sheet.getName()});
    if (sheet.getFrozenRows() < schema.headerRow) errors.push({code: 'TABLE_FROZEN_ROWS_MISMATCH', sheetName: sheet.getName()});
    schema.columns.forEach(function (column, index) { if (Math.abs(sheet.getColumnWidth(index + 1) - column.width) > 3) errors.push({code: 'TABLE_WIDTH_MISMATCH', sheetName: sheet.getName(), column: index + 1}); });
  } else {
    var seen = [];
    schema.layout.forEach(function (entry) {
      var range = sheet.getRange(entry.startRow, entry.startColumn, entry.rowSpan, entry.columnSpan), expected = entry.key === 'PAGE_INSTRUCTION' ? entry.purpose : entry.title;
      if (sheet.getMaxRows() < entry.startRow + entry.rowSpan - 1 || sheet.getMaxColumns() < entry.startColumn + entry.columnSpan - 1) errors.push({code: 'LAYOUT_DIMENSIONS_MISSING', sheetName: sheet.getName(), key: entry.key});
      if (range.getCell(1, 1).getDisplayValue() !== expected) errors.push({code: 'LAYOUT_VALUE_MISMATCH', sheetName: sheet.getName(), key: entry.key});
      if ((entry.rowSpan > 1 || entry.columnSpan > 1) && !(range.getMergedRanges().length === 1 && _LC_sameA1_(range.getMergedRanges()[0], range))) errors.push({code: 'LAYOUT_MERGE_MISMATCH', sheetName: sheet.getName(), key: entry.key});
      seen.forEach(function (other) { if (_LC_rangesOverlap_(entry, other)) errors.push({code: 'LAYOUT_CONTRACT_OVERLAP', sheetName: sheet.getName(), key: entry.key}); }); seen.push(entry);
    });
  }
  return errors;
}
/** @param {!Array} a @param {!Array} b @return {boolean} */
function _LC_sameValues_(a, b) { return a.length === b.length && a.every(function (value, index) { return value === b[index]; }); }
/** @param {!Object} a @param {!Object} b @return {boolean} */
function _LC_sameA1_(a, b) { return a.getA1Notation() === b.getA1Notation(); }
/** @param {!Object} a @param {!Object} b @return {boolean} */
function _LC_rangesOverlap_(a, b) { return a.startRow < b.startRow + b.rowSpan && b.startRow < a.startRow + a.rowSpan && a.startColumn < b.startColumn + b.columnSpan && b.startColumn < a.startColumn + a.columnSpan; }
/** @param {!Object} spreadsheet @param {!Array<!Object>} registry */
function _LC_reorderManagedSheets_(spreadsheet, registry) { registry.forEach(function (entry, index) { spreadsheet.setActiveSheet(spreadsheet.getSheetByName(entry.name)); spreadsheet.moveActiveSheet(index + 1); }); }
/** @param {!Object} spreadsheet @param {!Array<string>} created @param {?Object} reusedSheet @param {?string} originalName @return {!Object} */
function _LC_rollbackBootstrap_(spreadsheet, created, reusedSheet, originalName) { var complete = true; created.slice().reverse().forEach(function (name) { try { var sheet = spreadsheet.getSheetByName(name); if (sheet) spreadsheet.deleteSheet(sheet); } catch (error) { complete = false; } }); if (reusedSheet && originalName) try { reusedSheet.setName(originalName); } catch (error) { complete = false; } return {complete: complete}; }
/** @param {!Array<!Object>} registry @param {string} sheetName @return {?string} */
function _LC_schemaKeyForSheetName_(registry, sheetName) { var entry = registry.filter(function (item) { return item.name === sheetName; })[0]; return entry ? entry.schemaKey : null; }
/** @param {!Object} spreadsheet @return {?string} */
function _LC_spreadsheetId_(spreadsheet) { return spreadsheet && spreadsheet.getId ? spreadsheet.getId() : null; }
/** @param {!Object} spreadsheet @return {?string} */
function _LC_spreadsheetUrl_(spreadsheet) { return spreadsheet && spreadsheet.getUrl ? spreadsheet.getUrl() : null; }


