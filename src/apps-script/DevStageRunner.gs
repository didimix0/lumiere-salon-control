/** Executes one approved DEV stage without directly changing a spreadsheet. @param {!Object} request @return {!Object} */
function LC_runDevStage(request) {
  var started = new Date().getTime(), normalized = _LCDSR_request_(request), stage, result;
  if (!normalized.valid) return _LCDSR_result_(normalized.stage, normalized.mode, 'dev_stage_rejected', false, started, normalized.policy, [], normalized.errors, normalized.requestId);
  stage = _LCDSR_stages_()[normalized.stage];
  try {
    result = normalized.mode === 'full_safe_cycle' ? _LCDSR_cycle_(stage) : _LCDSR_single_(stage, normalized.mode);
    return _LCDSR_result_(normalized.stage, normalized.mode, result.status, result.valid, started, stage.policy, result.steps, result.errors, normalized.requestId);
  } catch (error) {
    return _LCDSR_result_(normalized.stage, normalized.mode, 'dev_stage_failed', false, started, stage.policy, [], [{code:'DEV_STAGE_RUNTIME_ERROR', message:_LCDSR_message_(error)}], normalized.requestId);
  }
}
/** @return {!Object} */
function _LCDSR_stages_() {
  return {
    workbook:{policy:'safe_idempotent_write',plan:LC_planWorkbookBootstrap,bootstrap:LC_bootstrapWorkbook,validate:LC_validateWorkbookStructure},
    lookups:{policy:'safe_idempotent_write',plan:null,bootstrap:LC_bootstrapLookups,validate:LC_validateLookupSheet},
    data_validations:{policy:'safe_idempotent_write',plan:LC_planDataValidations,bootstrap:LC_bootstrapDataValidations,validate:LC_validateDataValidations},
    input_sheets:{policy:'safe_idempotent_write',plan:LC_planInputSheetSetup,bootstrap:LC_bootstrapInputSheets,validate:LC_validateInputSheets},
    periods:{policy:'safe_idempotent_write',plan:LC_planPeriodSetup,bootstrap:LC_bootstrapPeriods,validate:LC_validatePeriods},
    financial_core_revenue:{policy:'read_only_formula_plan',plan:LC_planFinancialCoreRevenue,bootstrap:null,validate:LC_validateFinancialCoreRevenue},
    financial_core_formula_candidate:{policy:'read_only_formula_plan',plan:LC_planFinancialCoreFormulaInstallation,bootstrap:null,validate:LC_validateFinancialCoreFormulaInstallation},
    period_completeness_migration_candidate:{policy:'read_only_formula_plan',plan:LC_planPeriodCompletenessMigration,bootstrap:null,validate:LC_validatePeriodCompletenessMigration}
  };
}
/** @param {*} request @return {!Object} */
function _LCDSR_request_(request) {
  var value = request && typeof request === 'object' && !Array.isArray(request) ? request : {}, stages = _LCDSR_stages_(), modes = ['plan','bootstrap','validate','idempotency','full_safe_cycle'], errors = [];
  if (!stages[value.stage]) errors.push({code:'DEV_STAGE_UNKNOWN'});
  if (modes.indexOf(value.mode) < 0 || (stages[value.stage] && stages[value.stage].policy === 'read_only_formula_plan' && ['bootstrap','idempotency','full_safe_cycle'].indexOf(value.mode) >= 0)) errors.push({code:'DEV_STAGE_MODE_FORBIDDEN'});
  return {valid:errors.length === 0, stage:value.stage || null, mode:value.mode || null, requestId:typeof value.requestId === 'string' ? value.requestId : null, policy:stages[value.stage] ? stages[value.stage].policy : 'forbidden_remote', errors:errors};
}
/** @param {!Object} stage @param {string} mode @return {!Object} */
function _LCDSR_single_(stage, mode) {
  var fn = mode === 'plan' ? stage.plan : mode === 'bootstrap' || mode === 'idempotency' ? stage.bootstrap : stage.validate;
  if (!fn) return {valid:true,status:'dev_stage_capability_only',steps:[{name:'plan',status:'not_supported',valid:true,durationMs:0,summary:{planSupported:false},result:{planSupported:false}}],errors:[]};
  var step = _LCDSR_step_(mode === 'idempotency' ? 'idempotency' : mode, fn());
  return {valid:step.valid,status:step.valid ? 'dev_stage_completed' : 'dev_stage_blocked',steps:[step],errors:step.errors};
}
/** @param {!Object} stage @return {!Object} */
function _LCDSR_cycle_(stage) {
  var steps = [], step, initial;
  if (stage.plan) {
    step = _LCDSR_step_('plan', stage.plan()); steps.push(step);
    if (!step.valid || step.blockers.length) return {valid:false,status:'dev_stage_blocked',steps:steps,errors:step.errors.concat(step.blockers)};
  } else {
    initial = _LCDSR_step_('validate', stage.validate()); steps.push(initial);
    if (!initial.valid || initial.blockers.length) return {valid:false,status:'dev_stage_blocked',steps:steps,errors:initial.errors.concat(initial.blockers)};
  }
  step = _LCDSR_step_('bootstrap', stage.bootstrap()); steps.push(step);
  if (!step.valid || step.blockers.length) return {valid:false,status:'dev_stage_blocked',steps:steps,errors:step.errors.concat(step.blockers)};
  step = _LCDSR_step_('validate', stage.validate()); steps.push(step);
  if (!step.valid || step.blockers.length) return {valid:false,status:'dev_stage_failed',steps:steps,errors:step.errors.concat(step.blockers)};
  step = _LCDSR_step_('idempotency', stage.bootstrap()); steps.push(step);
  if (!step.valid || step.blockers.length || !_LCDSR_idempotent_(step.result)) return {valid:false,status:'dev_stage_non_idempotent',steps:steps,errors:step.errors.concat(step.blockers)};
  return {valid:true,status:'dev_stage_completed',steps:steps,errors:[]};
}
/** @param {string} name @param {*} raw @return {!Object} */
function _LCDSR_step_(name, raw) {
  var started = new Date().getTime(), result = _LCDSR_safe_(raw), blockers = _LCDSR_list_(result.blockers), errors = _LCDSR_list_(result.errors), warnings = _LCDSR_list_(result.warnings), valid = result.valid !== false && result.success !== false && !blockers.length && !errors.length;
  return {name:name,status:result.status || (valid ? 'completed' : 'blocked'),valid:valid,durationMs:new Date().getTime() - started,summary:_LCDSR_summary_(result, blockers, warnings, errors),result:result,blockers:blockers,warnings:warnings,errors:errors};
}
/** @param {*} value @return {!Object} */
function _LCDSR_safe_(value) { return JSON.parse(JSON.stringify(value, function (key, item) { if (item instanceof Date) return item.toISOString(); if (item instanceof Error) return {message:_LCDSR_message_(item)}; return item === undefined ? null : item; })); }
/** @param {*} value @return {!Array} */
function _LCDSR_list_(value) { return Array.isArray(value) ? value : []; }
/** @param {!Object} value @param {!Array} blockers @param {!Array} warnings @param {!Array} errors @return {!Object} */
function _LCDSR_summary_(value, blockers, warnings, errors) { return {valid:value.valid !== false && value.success !== false, status:value.status || null, blockerCount:blockers.length, warningCount:warnings.length, errorCount:errors.length, targetCount:value.targetCount || value.declaredTargetCount || value.existingPeriodCount || 0, changedCount:(value.changedSheets || value.populatedKeys || value.createdPeriodIds || []).length, alignedCount:(value.alreadyAligned || value.skippedKeys || []).length, createdPeriodIds:value.createdPeriodIds || [], resolvableTargetCount:value.resolvableTargetCount || 0}; }
/** @param {!Object} result @return {boolean} */
function _LCDSR_idempotent_(result) { var status = result.status || ''; return result.valid !== false && result.success !== false && (status.indexOf('already_aligned') >= 0 || status.indexOf('completed') >= 0 || status.indexOf('aligned') >= 0); }
/** @param {*} error @return {string} */
function _LCDSR_message_(error) { return String(error && error.message || error || 'UNKNOWN_ERROR').replace(/(token|scriptId|deploymentId|credential|password)\s*[=:]\s*[^\s,;]+/ig, '$1=[REDACTED]').replace(/[\r\n]+/g, ' ').slice(0, 300); }
/** @param {?string} stage @param {?string} mode @param {string} status @param {boolean} valid @param {number} started @param {string} policy @param {!Array} steps @param {!Array} errors @param {?string} requestId @return {!Object} */
function _LCDSR_result_(stage, mode, status, valid, started, policy, steps, errors, requestId) { var blockers = [], warnings = []; steps.forEach(function (step) { blockers = blockers.concat(step.blockers || []); warnings = warnings.concat(step.warnings || []); }); return {runnerVersion:'1.0',requestId:requestId,stage:stage,mode:mode,status:status,valid:valid,startedAt:new Date(started).toISOString(),finishedAt:new Date().toISOString(),durationMs:new Date().getTime() - started,policy:policy,steps:steps,blockerCount:blockers.length,warningCount:warnings.length,errorCount:errors.length,blockers:blockers,warnings:warnings,errors:errors}; }
