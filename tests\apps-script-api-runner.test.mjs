import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const runner = path.join(root, 'scripts', 'run-apps-script-api.mjs');
const invoke = (args) => {
  const run = spawnSync(process.execPath, [runner, ...args], {cwd:root, encoding:'utf8'});
  return {code:run.status, body:JSON.parse(run.stdout)};
};
const tests = [];
const test = (id, fn) => { try { fn(); tests.push({id,pass:true}); } catch (error) { tests.push({id,pass:false,message:error.message}); } };
test('API-01', () => { const r=invoke(['LC_apiHealthCheck','[]','--dry-run']); assert.equal(r.code,0); assert.equal(r.body.code,'DRY_RUN'); assert.match(r.body.url,/\/v1\/scripts\/AKfy[^/]+:run$/); });
test('API-02', () => { const r=invoke(['--function','LC_runDevStage','--parameters','[{"stage":"periods"}]','--dry-run']); assert.equal(r.body.function,'LC_runDevStage'); assert.deepEqual(r.body.parameters,[{stage:'periods'}]); });
test('API-03', () => { const r=invoke(['bad','[]','--dry-run']); assert.equal(r.code,1); assert.equal(r.body.code,'CONFIG_INVALID'); });
test('API-04', () => { const r=invoke(['LC_apiHealthCheck','{}','--dry-run']); assert.equal(r.code,1); assert.equal(r.body.code,'CONFIG_INVALID'); });
test('API-05', () => { const r=invoke(['LC_apiHealthCheck','[]','--dry-run']); assert.equal(JSON.stringify(r.body).match(/refresh_token|access_token|client_secret/i),null); });
test('API-06', () => { const r=invoke(['LC_apiHealthCheck','[]','--dev-mode','--dry-run']); assert.equal(r.code,0); assert.equal(r.body.devMode,true); });
const result={valid:tests.every((item)=>item.pass),tests};
console.log(JSON.stringify(result,null,2));
if(!result.valid)process.exitCode=1;
