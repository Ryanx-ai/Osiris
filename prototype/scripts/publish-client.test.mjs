import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source = readFileSync(new URL('../src/js/publish.js', import.meta.url), 'utf8');
function harness(responses) {
  const calls = [], tokens = [], progress = [];
  const context = {window:{}, AbortSignal, setTimeout:fn => fn(), fetch:async(url, options) => {
    calls.push({url,...options}); const next = responses.shift(); if (next instanceof Error) throw next; return next;
  }};
  vm.runInNewContext(source, context);
  return {calls,tokens,progress,run:() => context.window.OsirisPublish({getToken:async options => { tokens.push(options); return 'fresh-' + tokens.length; }}, {slug:'audit',html:'same snapshot'}, text => progress.push(text))};
}
const response = (status, body) => ({status,ok:status >= 200 && status < 300,json:async() => body});
test('expired session token refreshes without losing the immutable proposal', async () => {
  const h = harness([response(401,{error:'Expired'}),response(201,{url:'https://www.osirisdeck.com/vertical-institute/audit'})]);
  assert.match((await h.run()).url,/audit$/); assert.equal(h.calls.length,2);
  assert.equal(h.calls[0].body,h.calls[1].body); assert.equal(h.calls[1].headers.Authorization,'Bearer fresh-2');
  assert.ok(h.tokens.every(x => x.skipCache)); assert.equal(h.progress.length,1);
});
test('lost response and non-JSON service failure recover without refreshing the editor', async () => {
  const h = harness([new TypeError('Network'),{status:503,ok:false,json:async()=>{throw new Error('HTML error page');}},response(201,{url:'ready'})]);
  assert.equal((await h.run()).url,'ready'); assert.equal(h.calls.length,3);
  assert.equal(new Set(h.calls.map(x => x.body)).size,1);
});
test('name conflict and forbidden account are not retried', async () => {
  for (const status of [400,403,409,413]) {
    const h = harness([response(status,{error:'Action needed'})]);
    await assert.rejects(h.run(),/Action needed/); assert.equal(h.calls.length,1);
  }
});
test('transient failures stop after three attempts with an actionable message', async () => {
  const h = harness([new TypeError('offline'),new TypeError('offline'),new TypeError('offline')]);
  await assert.rejects(h.run(),/connection was interrupted/); assert.equal(h.calls.length,3);
});
