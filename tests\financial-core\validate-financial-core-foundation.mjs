import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..', '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const errors = [];
const contract = readJson('contracts/financial-core.v1.json');
const fixtures = readJson('tests/fixtures/financial-core/financial-core-foundation.v1.json');
const requiredEntities = ['operation','service_revenue','discount','refund','material_cost','master_compensation','tip_transit','chair_rent','payment_commission','tax','operating_expense','obligation','reserve','accrual_operating_profit','cash_inflow','cash_outflow','cash_balance','owner_withdrawable_amount','plan','actual','forecast','period_state','period_input_completeness','adjustment','allocation','confirmed_adverse_event','opportunity'];
const requiredCases = ['FC-001','FC-002','FC-003','FC-004','FC-005','FC-006','FC-007','FC-008','FC-009','FC-010','FC-011','FC-012','FC-013','FC-014','FC-015','FC-016','FC-017','FC-018','FC-019','FC-020','FC-021','FC-022','FC-023','FC-024','FC-025'];

if (contract.status !== 'iteration_4_readonly_plan' || contract.runtimeStatus !== 'iteration_4_readonly_plan') errors.push('contract status boundary is invalid');
for (const decision of ['FC-01','FC-02','FC-03','FC-04']) if (!contract.approvedPolicyDecisions?.[decision]) errors.push(`missing approved policy decision: ${decision}`);
if (contract.unresolvedPolicies) errors.push('legacy unresolvedPolicies must not remain');
if (contract.runtimePlan?.mode !== 'read_only_formula_plan' || contract.runtimePlan.metrics?.length !== 4 || contract.runtimePlan.writes !== 'forbidden') errors.push('runtime plan boundary is invalid');
for (const entity of requiredEntities) {
  const definition = contract.entities?.[entity];
  if (!definition) errors.push(`missing entity: ${entity}`);
  else for (const field of ['source','requiredFields','recognition','sign','period','kind','reconciliation','blockers']) if (!(field in definition)) errors.push(`${entity} missing ${field}`);
}
for (const policy of ['tax_base','tax_rate','owner_withdrawable_formula','reserve_priority','indirect_cost_allocation','advance_recognition','subscription_recognition','ambiguous_master_pay_base','mixed_chair_rent','retrospective_closed_period_adjustment']) if (!contract.configurationDependentPolicies?.includes(policy)) errors.push(`missing configuration-dependent policy: ${policy}`);
for (const policy of ['tips','material_refund']) if (contract.configurationDependentPolicies?.includes(policy)) errors.push(`resolved policy is still configuration-dependent: ${policy}`);
if (typeof contract.approvedPolicyDecisions?.['FC-04'] !== 'string' || !contract.approvedPolicyDecisions['FC-04'].includes('explicit') || !contract.approvedPolicyDecisions['FC-04'].includes('closed period requires complete')) errors.push('FC-04 completeness policy is invalid');

const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'src/apps-script/SchemaDefinitions.gs'), 'utf8'), context);
const schemas = context.LC_getSchemaDefinitions();
for (const [name, definition] of Object.entries(contract.entities)) {
  const sourceSchemas = definition.source.schema ? [definition.source.schema] : definition.source.schemas || [];
  for (const schema of sourceSchemas) if (!schemas[schema] && !['SHIFTS','SYS_ADJUSTMENTS','SYS_CALC'].includes(schema)) errors.push(`${name} references missing schema: ${schema}`);
}

const caseIds = new Set(fixtures.cases.map((item) => item.id));
for (const id of requiredCases) if (!caseIds.has(id)) errors.push(`missing fixture: ${id}`);
for (const item of fixtures.cases) {
  if (!item.input || !item.expected?.classification || !Object.hasOwn(item.expected, 'accountingPeriod') || !Object.hasOwn(item.expected, 'cashPeriod')) errors.push(`invalid fixture shape: ${item.id}`);
  if (!item.expected.output && !item.expected.unresolved) errors.push(`fixture lacks output or unresolved marker: ${item.id}`);
  if (item.expected.unresolved && item.expected.output?.expectedAmount !== undefined) errors.push(`unresolved fixture has invented amount: ${item.id}`);
}

const result = { valid: errors.length === 0, errors, entityCount: Object.keys(contract.entities).length, fixtureCount: fixtures.cases.length, runtimeImplemented: false };
const reportDirectory = path.join(root, '.dev-reports');
fs.mkdirSync(reportDirectory, { recursive: true });
fs.writeFileSync(path.join(reportDirectory, 'financial-core-foundation.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(result));
process.exitCode = result.valid ? 0 : 1;
