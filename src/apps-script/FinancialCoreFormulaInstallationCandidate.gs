/**
 * Produces the approval-gated, idempotent Formula Installer candidate for Iteration 4.
 * It is read-only and never writes formulas or calculation records.
 * @return {!Object}
 */
function LC_planFinancialCoreFormulaInstallation() {
  return _LCFCI_plan_();
}

/** @return {!Object} */
function LC_validateFinancialCoreFormulaInstallation() {
  var plan = _LCFCI_plan_();
  return {valid:plan.valid,status:plan.valid ? 'financial_core_formula_candidate_ready' : 'financial_core_formula_candidate_blocked',approvalRequired:true,schemaMigrationRequired:plan.schemaMigrationRequired,metrics:plan.metrics,blockers:plan.blockers,warnings:plan.warnings,writeEnabled:false};
}

/** @return {!Object} */
function _LCFCI_plan_() {
  var periods = LC_getSchemaDefinition('SYS_PERIODS'), calc = LC_getSchemaDefinition('SYS_CALC'), required = ['input_completeness_status','input_completeness_confirmed_at','input_completeness_confirmed_by','input_completeness_source'], names = periods && periods.columns ? periods.columns.map(function (column) { return column.name; }) : [], missing = required.filter(function (name) { return names.indexOf(name) < 0; }), migration = typeof LC_planPeriodCompletenessMigration === 'function' ? LC_planPeriodCompletenessMigration() : null, blockers = [], warnings = [];
  if (!periods || !calc) blockers.push({code:'FINANCIAL_CORE_FORMULA_SCHEMA_UNAVAILABLE'});
  if (missing.length) blockers.push({code:'PERIOD_COMPLETENESS_SCHEMA_MIGRATION_REQUIRED',missingColumns:missing});
  if (migration && migration.status !== 'period_completeness_schema_already_aligned') blockers.push({code:'PERIOD_COMPLETENESS_SCHEMA_MIGRATION_REQUIRED',missingColumns:required});
  warnings.push({code:'FINANCIAL_CORE_FORMULA_INSTALLATION_APPROVAL_REQUIRED'});
  return {valid:blockers.length === 0,status:blockers.length ? 'financial_core_formula_candidate_blocked' : 'financial_core_formula_candidate_ready',stage:'iteration_4_revenue_discount_refund',policy:'approval_gated_idempotent_formula_installation_candidate',writeEnabled:false,approvalRequired:true,approvalTokenProperty:'LC_FINANCIAL_CORE_FORMULA_INSTALL_APPROVAL_TOKEN',schemaMigrationRequired:missing.length > 0 || !!(migration && migration.status !== 'period_completeness_schema_already_aligned'),requiredCompletenessColumns:required,completenessMigration:migration ? {status:migration.status,blockers:migration.blockers,warnings:migration.warnings} : null,metrics:_LCFCI_metrics_(),idempotencyKey:'period_id|metric_code|dimension_type|dimension_id|calculation_rule_version',protectedConditions:['no schema drift','no overwrite of unknown SYS_CALC records','incomplete empty source yields null, not zero','separate approval before any write'],blockers:blockers,warnings:warnings};
}

/** @return {!Array<!Object>} */
function _LCFCI_metrics_() {
  return [
    {metricCode:'gross_list_service_value',formulaRule:'SUM(quantity * list_price for completed included services)'},
    {metricCode:'recognized_service_revenue_before_refunds',formulaRule:'SUM(charged_amount for completed included services)'},
    {metricCode:'total_service_discounts',formulaRule:'SUM(MAX(quantity * list_price - charged_amount; 0) for completed included services)'},
    {metricCode:'total_service_refunds',formulaRule:'SUM(included linked refund_amount in refund period)'},
    {metricCode:'net_service_revenue',formulaRule:'recognized_service_revenue_before_refunds - total_service_refunds'}
  ];
}
