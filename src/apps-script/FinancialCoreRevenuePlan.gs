/**
 * Creates a read-only Iteration 4 plan for revenue, discounts and refunds.
 * Financial formulas remain a Google Sheets responsibility under ADR-0005.
 * @return {!Object}
 */
function LC_planFinancialCoreRevenue() {
  return _LCFCR_inspect_();
}

/** @return {!Object} */
function LC_validateFinancialCoreRevenue() {
  var plan = _LCFCR_inspect_();
  return {
    valid: plan.valid,
    status: plan.valid ? 'financial_core_revenue_source_aligned' : 'financial_core_revenue_source_blocked',
    sourceSheets: plan.sourceSheets,
    metrics: plan.metrics,
    blockers: plan.blockers,
    warnings: plan.warnings,
    writeEnabled: false
  };
}

/** @return {!Object} */
function _LCFCR_inspect_() {
  var ss = _LCFCR_active_(), keys = ['OPERATIONS', 'REFUNDS', 'SYS_PERIODS'], blockers = [], warnings = [], sources = [];
  keys.forEach(function (key) {
    var schema = LC_getSchemaDefinition(key), sheet, header;
    if (!schema) { blockers.push({code:'FINANCIAL_CORE_SCHEMA_MISSING', schemaKey:key}); return; }
    sheet = ss && ss.getSheetByName(schema.sheetName);
    if (!sheet) { blockers.push({code:'FINANCIAL_CORE_SOURCE_SHEET_MISSING', schemaKey:key, sheetName:schema.sheetName}); return; }
    if (sheet.getMaxColumns() < schema.columns.length) blockers.push({code:'FINANCIAL_CORE_SOURCE_COLUMN_COUNT_MISMATCH', schemaKey:key});
    header = sheet.getRange(schema.headerRow, 1, 1, schema.columns.length).getDisplayValues()[0];
    if (!_LCFCR_same_(header, schema.columns.map(function (column) { return column.label; }))) blockers.push({code:'FINANCIAL_CORE_SOURCE_HEADER_MISMATCH', schemaKey:key});
    sources.push({schemaKey:key, sheetName:schema.sheetName, headerRow:schema.headerRow, columnCount:schema.columns.length});
  });
  if (!ss) blockers.push({code:'FINANCIAL_CORE_SPREADSHEET_UNAVAILABLE'});
  if (!blockers.length && typeof LC_validatePeriods === 'function') {
    var periods = LC_validatePeriods();
    if (!periods.valid) blockers.push({code:'FINANCIAL_CORE_PERIODS_BLOCKED'});
  }
  warnings.push({code:'FINANCIAL_CORE_FORMULAS_NOT_INSTALLED'});
  return {valid:blockers.length === 0, status:blockers.length ? 'financial_core_revenue_plan_blocked' : 'financial_core_revenue_plan_ready', stage:'iteration_4_revenue_discount_refund', policy:'read_only_formula_plan', writeEnabled:false, sourceSheets:sources, metrics:_LCFCR_metrics_(), blockers:blockers, warnings:warnings};
}

/** @return {!Array<!Object>} */
function _LCFCR_metrics_() {
  return [
    {metricCode:'gross_list_service_value', formula:'SUM(quantity * list_price for completed included services)'},
    {metricCode:'recognized_service_revenue_before_refunds', formula:'SUM(charged_amount for completed included services)'},
    {metricCode:'total_service_discounts', formula:'SUM(MAX(quantity * list_price - charged_amount; 0) for completed included services)'},
    {metricCode:'net_service_revenue', formula:'recognized_service_revenue_before_refunds - SUM(refund_amount for included linked refunds in refund period)'}
  ];
}

/** @param {!Array} left @param {!Array} right @return {boolean} */
function _LCFCR_same_(left, right) { return left.length === right.length && left.every(function (value, index) { return value === right[index]; }); }
/** @return {?Object} */
function _LCFCR_active_() { try { return SpreadsheetApp.getActiveSpreadsheet(); } catch (error) { return null; } }
