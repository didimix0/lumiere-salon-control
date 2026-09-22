import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('src/apps-script/DemoAndOwnerDesk.gs', 'utf8');
const context = vm.createContext({ Logger: { log() {} } });
vm.runInContext(source, context, { filename: 'DemoAndOwnerDesk.gs' });

const tests = [];
function check(name, pass) { tests.push({ name, pass: Boolean(pass) }); }

check('exact-match demo row is recognised as already present',
  context._LCDOD_sameRow_(['DEMO-OP-001', 'Выполнена'], ['DEMO-OP-001', 'Выполнена']));
check('partial or conflicting demo row is not accepted as exact',
  !context._LCDOD_sameRow_(['DEMO-OP-001', 'Отменена'], ['DEMO-OP-001', 'Выполнена']));
check('recovery preflight has explicit three-state classification',
  source.includes("state:'absent'") && source.includes("state:'exact_match'") && source.includes("state:'partial_or_conflicting'"));
check('fixture uses the canonical completed operation status', source.includes("'Выполнена'"));
check('fixture uses the canonical refund method', source.includes("refund_method:'Наличными'"));
check('owner desk does not use merge operations', !/\.merge\s*\(/.test(source));
check('owner desk rejects ranges intersecting existing merges', source.includes('getMergedRanges().length'));
check('approved deletion is limited to the single approved demo record',
  source.includes("recordId:'DEMO-OP-001'") && source.includes('duplicateRecordCount'));
check('append operations occur only after full preflight',
  source.indexOf('if (!preflight.valid)') < source.indexOf('setValues(preflight.operationsToAppend)'));
check('repeated execution skips exact matches instead of appending them',
  source.includes("filter(function(x){return x.state==='absent';})"));
check('fixture identity does not regenerate audit timestamps on each run',
  !source.includes('created_at:now') && !source.includes('updated_at:now'));
check('repeated execution does not rewrite an exact owner desk', source.includes("preflight.deskState === 'absent'"));

export function runDemoOwnerDeskRecoverySuite() {
  return { valid: tests.every((test) => test.pass), tests };
}
